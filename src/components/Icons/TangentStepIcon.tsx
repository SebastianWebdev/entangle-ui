'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

export const TangentStepIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <g strokeWidth="2.25">
        <polyline points="3,18 3,12 12,12 12,6 21,6" />
      </g>
    </Icon>
  );
});

TangentStepIcon.displayName = 'TangentStepIcon';
