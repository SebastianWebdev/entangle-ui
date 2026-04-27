'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { AlertTitleProps } from './Alert.types';
import { alertTitleStyle } from './Alert.css';

/**
 * Title slot for an `Alert`. Renders a single line of emphasized text above
 * the description.
 *
 * Equivalent to passing `title` directly on `<Alert>`. Use this form when you
 * want richer content (links, inline elements) inside the title.
 *
 * @example
 * ```tsx
 * <Alert variant="warning">
 *   <Alert.Title>Read-only mode</Alert.Title>
 *   <Alert.Description>Switch to edit to change this file.</Alert.Description>
 * </Alert>
 * ```
 */
export const AlertTitle = /*#__PURE__*/ React.memo<AlertTitleProps>(
  ({ children, className, style, testId, ref, ...rest }) => {
    return (
      <div
        ref={ref}
        className={cx(alertTitleStyle, className)}
        style={style}
        data-testid={testId}
        data-alert-title=""
        {...rest}
      >
        {children}
      </div>
    );
  }
);

AlertTitle.displayName = 'AlertTitle';
