// @flow
import * as React from 'react';
import Frame from './components/Frame';

const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?\/?.*?\/videos\/(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{36})$/i;

type Props = {
  url: string,
  matches: string[],
};

export default class PeerTube extends React.Component<Props> {
  static ENABLED = [URL_REGEX];

  render() {
    const { matches } = this.props;
    const url = matches[0];

    return (
      <Frame
        src={`${url}`}
        title={`PeerTube (${url})`}
      />
    );
  }
}
