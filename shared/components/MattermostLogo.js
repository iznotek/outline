// @flow
import * as React from 'react';

type Props = {
  size?: number,
  fill?: string,
  className?: string,
};

function MattermostLogo({ size = 34, fill = '#FFF', className }: Props) {
  return (
  <svg
    fill={fill}
    width={size}
    height={size}
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    className={className}>
    <g transform="matrix(0.99998928,0,0,0.99998928,-0.01497322,0.02529433)">
       <g stroke="none" strokeWidth="1" fillRule="evenodd">
        <path
          d="m 396.9,47.7 2.6,53.1 c 43,47.5 60,114.8 38.6,178.1 C 406.1,373.3 300.7,423 202.7,389.8 104.7,356.6 51.1,253.1 83,158.7 104.5,95.2 159.2,52 222.5,40.5 L 256.7,0.1 C 150,-2.8 49.3,63.4 13.3,169.9 -31,300.6 39.1,442.5 169.9,486.7 300.7,530.9 442.5,460.9 486.8,330.1 522.7,223.9 483.1,110.3 396.9,47.7 Z"
          />
        </g>
        <path
          d="m 335.6,204.3 -1.8,-74.2 -1.5,-42.7 -1,-37 c 0,0 0.2,-17.8 -0.4,-22 -0.1,-0.9 -0.4,-1.6 -0.7,-2.2 0,-0.1 -0.1,-0.2 -0.1,-0.3 0,-0.1 -0.1,-0.2 -0.1,-0.2 -0.7,-1.2 -1.8,-2.1 -3.1,-2.6 -1.4,-0.5 -2.9,-0.4 -4.2,0.2 0,0 -0.1,0 -0.1,0 -0.2,0.1 -0.3,0.1 -0.4,0.2 -0.6,0.3 -1.2,0.7 -1.8,1.3 -3,3 -13.7,17.2 -13.7,17.2 l -23.2,28.8 -27.1,33 -46.5,57.8 c 0,0 -21.3,26.6 -16.6,59.4 4.7,32.8 29.1,48.7 48,55.1 18.9,6.4 48,8.5 71.6,-14.7 23.5,-23 22.7,-57.1 22.7,-57.1 z"
          />
      </g>
    </svg>
  );
}

export default MattermostLogo;
