import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

export const TangentMirroredIcon: React.FC<
  Omit<IconProps, 'children'>
> = props => {
  return (
    <Icon {...props}>
      <g strokeWidth="2.25">
        <line x1="3" y1="18" x2="21" y2="6" />
      </g>
      <circle cx="6" cy="16.5" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="18" cy="7.5" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </Icon>
  );
};
