// @flow
import * as React from 'react';
import Frame from './components/Frame';

const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?\/?.*?\/videos\/(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{36})$/i;
const allowedDomainsEnv = process.env.PEERTUBE_ALLOWED_DOMAINS;

type Props = {
  url: string,
  matches: string[],
};

export default class PeerTube extends React.Component<Props> {
  static ENABLED = [URL_REGEX];

  render() {
    const { matches } = this.props;
    const url = matches[0];
    const normalizedUrl = url.replace('watch', 'embed');

    const allowedDomains = allowedDomainsEnv && allowedDomainsEnv.split(',');
    if (allowedDomains) {
      if (allowedDomains.findIndex(domain => normalizedUrl.includes(domain)) < 0) {
        return null;
      }
    }

    return (
      <Frame
        src={`${normalizedUrl}`}
        title={`PeerTube (${normalizedUrl})`}
      />
    );
  }
}
