'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

export const TangentFreeIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <g strokeWidth="2.25">
        <line x1="4.5" y1="19.5" x2="12" y2="12" />
        <line x1="12" y1="12" x2="21" y2="7.5" />
      </g>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </Icon>
  );
});

TangentFreeIcon.displayName = 'TangentFreeIcon';
