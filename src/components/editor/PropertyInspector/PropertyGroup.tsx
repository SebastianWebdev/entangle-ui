import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import { vars } from '@/theme/contract.css';
import type { PropertyGroupProps } from './PropertyInspector.types';
import {
  groupRoot,
  groupDivider,
  groupTitle,
  groupLine,
  indentVar,
} from './PropertyGroup.css';

// --- Component ---

export const PropertyGroup: React.FC<PropertyGroupProps> = ({
  title,
  children,
  indent = 0,
  disabled = false,

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  return (
    <div
      ref={ref}
      className={cx(groupRoot, className)}
      style={{
        ...style,
        ...assignInlineVars({
          [indentVar]: `calc(${indent} * ${vars.spacing.xl})`,
        }),
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      data-testid={testId}
      {...rest}
    >
      {title != null && (
        <div className={groupDivider}>
          <span className={groupLine} />
          <span className={groupTitle}>{title}</span>
          <span className={groupLine} />
        </div>
      )}
      {children}
    </div>
  );
};

PropertyGroup.displayName = 'PropertyGroup';
