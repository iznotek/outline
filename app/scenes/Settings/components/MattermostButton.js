// @flow
import * as React from 'react';
import styled from 'styled-components';
import { mattermostAuth } from 'shared/utils/routeHelpers';
import MattermostLogo from 'shared/components/MattermostLogo';
import Button from 'components/Button';

type Props = {
  scopes?: string[],
  redirectUri: string,
  state: string,
  label?: string,
};

function MattermostButton({ state, scopes, redirectUri, label }: Props) {
  const handleClick = () =>
    (window.location.href = mattermostAuth(state, scopes, redirectUri));

  return (
    <Button
      onClick={handleClick}
      icon={<SpacedMattermostLogo size={24} fill="#000" />}
      neutral
    >
      {label ? (
        label
      ) : (
        <span>
          Add to <strong>Mattermost</strong>
        </span>
      )}
    </Button>
  );
}

const SpacedMattermostLogo = styled(MattermostLogo)`
  padding-right: 4px;
`;

export default MattermostButton;
