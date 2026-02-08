import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

export const TangentAutoIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <g strokeWidth="2.25">
        <path d="M3 18 C7.5 18, 9 6, 12 6 C15 6, 16.5 18, 21 18" />
      </g>
    </Icon>
  );
};
