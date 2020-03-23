// @flow
import fetch from 'isomorphic-fetch';
import querystring from 'querystring';
import { InvalidRequestError } from './errors';

const MATTERMOST_API_URL = process.env.MATTERMOST_SERVER_URL + '/api/' + process.env.MATTERMOST_API_VERSION;

export async function post(endpoint: string, body: Object) {
  let data;

  const token = body.token;
  try {
    const response = await fetch(`${MATTERMOST_API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    data = await response.json();
  } catch (err) {
    throw new InvalidRequestError(err.message);
  }

  return data;
}

export async function get(endpoint: string, body: Object) {
  let data;

  const token = body.token;
  try {
    const response = await fetch(`${MATTERMOST_API_URL}/${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    data = await response.json();
  } catch (err) {
    throw new InvalidRequestError(err.message);
  }

  return data;
}

export async function request(endpoint: string, body: Object) {
  let data;
  try {
    const response = await fetch(
      `${process.env.MATTERMOST_SERVER_URL}/${endpoint}?${querystring.stringify(body)}`,{
      method: 'POST',
    });
    data = await response.json();
  } catch (err) {
    throw new InvalidRequestError(err.message);
  }

  let user = await get('users/me', {token: data.access_token});
  data.user = user;
  data.user.name = user.username;

  if( process.env.MATTERMOST_TEAM_NAME ) {
    let teams = await get(`/users/${user.id}/teams`, {token: data.access_token});
    let team = teams.find(team => team.name == process.env.MATTERMOST_TEAM_NAME);
    if ( !team ) {
      throw new InvalidRequestError("You are not a member of the mattermost team used in this wiki");
    }
    data.team = team;
    data.team.domain = team.name;
  } 
  else if( process.env.MATTERMOST_SERVER_NAME ) {
    data.team = {}
    data.team.name = process.env.MATTERMOST_SERVER_NAME;
    data.team.domain = data.team.name;
  }
  else {
    throw new InvalidRequestError("Please set at least one of env vars MATTERMOST_SERVER_NAME (shared all teams) or MATTERMOST_TEAM_NAME (specified team user restriction).");
  }
  return data;
}

export async function oauthAccess(
  code: string,
  redirect_uri: string = `${process.env.URL || ''}/auth/mattermost.callback`
) {
  return request('oauth/access_token', {
    grant_type: 'authorization_code',
    client_id: process.env.MATTERMOST_KEY,
    client_secret: process.env.MATTERMOST_SECRET,
    redirect_uri,
    code,
  });
}



  // let user_image = await get(`/users/${user.id}/image`, {token: data.access_token});
  // console.log(user_image);
  // let user_asset = await uploadImage( user_image, 'users/' + user.id + '.png' );
  // data.user.image_192 = user_asset.url;

  // let team_image = await get(`/teams/${team.id}/image`, {token: data.access_token});
  // console.log(team_image);
  // let team_asset = await uploadImage( team_image, 'teams/' + team.id + '.png' );
  // data.team.image_88 = team_asset.url;

  // console.log(data);

// export async function request(endpoint: string, body: Object) {
//   let data;
//   try {
//     const response = await fetch(
//       `${MATTERMOST_API_URL}/${endpoint}?${querystring.stringify(body)}`
//     );
//     data = await response.json();
//   } catch (err) {
//     throw new InvalidRequestError(err.message);
//   }
//   if (!data.ok) throw new InvalidRequestError(data.error);

//   return data;
// }

// export const dataUrlToBlob = (dataURL: string) => {
//   var blobBin = atob(dataURL.split(',')[1]);
//   var array = [];
//   for (var i = 0; i < blobBin.length; i++) {
//     array.push(blobBin.charCodeAt(i));
//   }
//   const file = new Blob([new Uint8Array(array)], { type: 'image/png' });
//   return file;
// };

// export async function uploadImage( blob: Blob, file: string ) {
//   let attachment;
//   try {
//       attachment = await uploadFile(blob, {
//         name: user,
//         public: true,
//     });
//   } catch (err) {
//     throw new InvalidRequestError(err.message);
//   }
//   return attachment;
// };

// export async function uploadFile ( file: File | Blob, options?: Options = { name: '' } ) {
//   const name = file instanceof File ? file.name : options.name;
//   const response = await client.post('/users.s3Upload', {
//     public: options.public,
//     documentId: options.documentId,
//     contentType: file.type,
//     size: file.size,
//     name,
//   });

//   invariant(response, 'Response should be available');

//   const data = response.data;
//   const asset = data.asset;
//   const formData = new FormData();

//   for (const key in data.form) {
//     formData.append(key, data.form[key]);
//   }

//   // $FlowFixMe
//   if (file.blob) {
//     // $FlowFixMe
//     formData.append('file', file.file);
//   } else {
//     formData.append('file', file);
//   }

//   await fetch(data.uploadUrl, {
//     method: 'post',
//     body: formData,
//   });

//   return asset;
// };

// router.post('users.s3Upload', auth(), async ctx => {
//   let { user, public, name, filename, documentId, contentType, kind, size } = ctx.body;

//   // backwards compatability
//   name = name || filename;
//   contentType = contentType || kind;

//   const { user } = ;
//   const s3Key = uuid.v4();
//   const key = `uploads/${user.id}/${s3Key}/${name}`;
//   const acl =
//     public === undefined
//       ? AWS_S3_ACL
//       : public ? 'public-read' : 'private';
//   const credential = makeCredential();
//   const longDate = format(new Date(), 'YYYYMMDDTHHmmss\\Z');
//   const policy = makePolicy(credential, longDate, acl);
//   const endpoint = publicS3Endpoint();
//   const url = `${endpoint}/${key}`;

//   const attachment = await Attachment.create({
//     key,
//     acl,
//     size,
//     url,
//     contentType,
//     documentId,
//     teamId: user.teamId,
//     userId: user.id,
//   });

//   await Event.create({
//     name: 'user.s3Upload',
//     data: { name },
//     teamId: user.teamId,
//     userId: user.id,
//     ip: ctx.request.ip,
//   });

//   ctx.body = {
//     data: {
//       maxUploadSize: process.env.AWS_S3_UPLOAD_MAX_SIZE,
//       uploadUrl: endpoint,
//       form: {
//         'Cache-Control': 'max-age=31557600',
//         'Content-Type': contentType,
//         acl,
//         key,
//         policy,
//         'x-amz-algorithm': 'AWS4-HMAC-SHA256',
//         'x-amz-credential': credential,
//         'x-amz-date': longDate,
//         'x-amz-signature': getSignature(policy),
//       },
//       asset: {
//         contentType,
//         name,
//         url: attachment.redirectUrl,
//         size,
//       },
//     },
//   };
// });