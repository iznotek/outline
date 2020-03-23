// @flow
import Sequelize from 'sequelize';
import Router from 'koa-router';
import auth from '../middlewares/authentication';
import addHours from 'date-fns/add_hours';
import { stripSubdomain } from '../../shared/utils/domains';
import { mattermostAuth } from '../../shared/utils/routeHelpers';
import {
  Authentication,
  Collection,
  Integration,
  User,
  Event,
  Team,
} from '../models';
import * as Mattermost from '../mattermost';
import { capitalize, toLower } from 'lodash';

const Op = Sequelize.Op;
const router = new Router();

// start the oauth process and redirect user to Mattermost
router.get('mattermost', async ctx => {
  const state = Math.random()
    .toString(36)
    .substring(7);

  ctx.cookies.set('state', state, {
    httpOnly: false,
    expires: addHours(new Date(), 1),
    domain: stripSubdomain(ctx.request.hostname),
  });
  ctx.redirect(mattermostAuth(state));
});

// signin callback from Mattermost
router.get('mattermost.callback', auth({ required: false }), async ctx => {
  const { code, error, state } = ctx.request.query;
  ctx.assertPresent(code || error, 'code is required');
  ctx.assertPresent(state, 'state is required');

  if (state !== ctx.cookies.get('state')) {
    ctx.redirect('/?notice=auth-error&error=state_mismatch');
    return;
  }
  if (error) {
    ctx.redirect(`/?notice=auth-error&error=${error}`);
    return;
  }

  const data = await Mattermost.oauthAccess(code);

  if( !data.team ) {
    data.team = {};
    data.team.name = capitalize(user.name);
    data.team.domain = toLower(user.name);
  }

  const [team, isFirstUser] = await Team.findOrCreate({
    where: {
      mattermostId: data.team.id,
    },
    defaults: {
      name: data.team.name,
      avatarUrl: data.team.image_88 || undefined,
    },
  });

  try {
    const [user, isFirstSignin] = await User.findOrCreate({
      where: {
        [Op.or]: [
          {
            service: 'mattermost',
            serviceId: data.user.id,
          },
          {
            service: { [Op.eq]: null },
            email: data.user.email,
          },
        ],
        teamId: team.id,
      },
      defaults: {
        service: 'mattermost',
        serviceId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        isAdmin: isFirstUser,
        avatarUrl: data.user.image_192 || undefined,
      },
    });

    // update the user with fresh details if they just accepted an invite
    if (!user.serviceId || !user.service) {
      await user.update({
        service: 'mattermost',
        serviceId: data.user.id,
        avatarUrl: data.user.image_192,
      });
    }

    // update email address if it's changed in Mattermost
    if (!isFirstSignin && data.user.email !== user.email) {
      await user.update({ email: data.user.email });
    }

    if (isFirstUser) {
      await team.provisionFirstCollection(user.id);
      await team.provisionSubdomain(data.team.domain);
    }

    if (isFirstSignin) {
      await Event.create({
        name: 'users.create',
        actorId: user.id,
        userId: user.id,
        teamId: team.id,
        data: {
          name: user.name,
          service: 'mattermost',
        },
        ip: ctx.request.ip,
      });
    }

    // set cookies on response and redirect to team subdomain
    ctx.signIn(user, team, 'mattermost', isFirstSignin);
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      const exists = await User.findOne({
        where: {
          service: 'email',
          email: data.user.email,
          teamId: team.id,
        },
      });

      if (exists) {
        ctx.redirect(`${team.url}?notice=email-auth-required`);
      } else {
        ctx.redirect(`${team.url}?notice=auth-error`);
      }

      return;
    }

    throw err;
  }
});

router.get('mattermost.commands', auth({ required: false }), async ctx => {
  const { code, state, error } = ctx.request.query;
  const user = ctx.state.user;
  ctx.assertPresent(code || error, 'code is required');

  if (error) {
    ctx.redirect(`/settings/integrations/mattermost?error=${error}`);
    return;
  }

  // this code block accounts for the root domain being unable to
  // access authentcation for subdomains. We must forward to the appropriate
  // subdomain to complete the oauth flow
  if (!user) {
    if (state) {
      try {
        const team = await Team.findByPk(state);
        return ctx.redirect(
          `${team.url}/auth${ctx.request.path}?${ctx.request.querystring}`
        );
      } catch (err) {
        return ctx.redirect(
          `/settings/integrations/mattermost?error=unauthenticated`
        );
      }
    } else {
      return ctx.redirect(`/settings/integrations/mattermost?error=unauthenticated`);
    }
  }

  const endpoint = `${process.env.URL || ''}/auth/mattermost.commands`;
  const data = await Mattermost.oauthAccess(code, endpoint);

  const authentication = await Authentication.create({
    service: 'mattermost',
    userId: user.id,
    teamId: user.teamId,
    token: data.access_token,
    scopes: data.scope.split(','),
  });

  await Integration.create({
    service: 'mattermost',
    type: 'command',
    userId: user.id,
    teamId: user.teamId,
    authenticationId: authentication.id,
  });

  ctx.redirect('/settings/integrations/mattermost');
});

router.get('mattermost.post', auth({ required: false }), async ctx => {
  const { code, error, state } = ctx.request.query;
  const user = ctx.state.user;
  ctx.assertPresent(code || error, 'code is required');

  const collectionId = state;
  ctx.assertUuid(collectionId, 'collectionId must be an uuid');

  if (error) {
    ctx.redirect(`/settings/integrations/mattermost?error=${error}`);
    return;
  }

  // this code block accounts for the root domain being unable to
  // access authentcation for subdomains. We must forward to the
  // appropriate subdomain to complete the oauth flow
  if (!user) {
    try {
      const collection = await Collection.findByPk(state);
      const team = await Team.findByPk(collection.teamId);
      return ctx.redirect(
        `${team.url}/auth${ctx.request.path}?${ctx.request.querystring}`
      );
    } catch (err) {
      return ctx.redirect(`/settings/integrations/mattermost?error=unauthenticated`);
    }
  }

  const endpoint = `${process.env.URL || ''}/auth/mattermost.post`;
  const data = await Mattermost.oauthAccess(code, endpoint);

  const authentication = await Authentication.create({
    service: 'mattermost',
    userId: user.id,
    teamId: user.teamId,
    token: data.access_token,
    scopes: data.scope.split(','),
  });

  await Integration.create({
    service: 'mattermost',
    type: 'post',
    userId: user.id,
    teamId: user.teamId,
    authenticationId: authentication.id,
    collectionId,
    events: [],
    settings: {
      url: data.incoming_webhook.url,
      channel: data.incoming_webhook.channel,
      channelId: data.incoming_webhook.channel_id,
    },
  });

  ctx.redirect('/settings/integrations/mattermost');
});

export default router;
