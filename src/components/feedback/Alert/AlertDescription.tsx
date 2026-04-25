'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { AlertDescriptionProps } from './Alert.types';
import { alertDescriptionStyle } from './Alert.css';

/**
 * Body text slot for an `Alert`. Most one-line alerts can pass a string as
 * children to `<Alert>` directly; reach for this when you need to compose
 * multiple paragraphs or inline elements.
 *
 * @example
 * ```tsx
 * <Alert variant="info">
 *   <Alert.Title>Heads up</Alert.Title>
 *   <Alert.Description>
 *     This editor is read-only. Open the file in edit mode to make changes.
 *   </Alert.Description>
 * </Alert>
 * ```
 */
export const AlertDescription = /*#__PURE__*/ React.memo<AlertDescriptionProps>(
  ({ children, className, style, testId, ref, ...rest }) => {
    return (
      <div
        ref={ref}
        className={cx(alertDescriptionStyle, className)}
        style={style}
        data-testid={testId}
        data-alert-description=""
        {...rest}
      >
        {children}
      </div>
    );
  }
);

AlertDescription.displayName = 'AlertDescription';
