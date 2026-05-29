'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

export const TangentLinearIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <g strokeWidth="2.25">
        <line x1="3" y1="19.5" x2="21" y2="4.5" />
      </g>
    </Icon>
  );
});

TangentLinearIcon.displayName = 'TangentLinearIcon';
