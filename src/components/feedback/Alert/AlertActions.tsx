'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { AlertActionsProps } from './Alert.types';
import { alertActionsRecipe } from './Alert.css';

/**
 * Action-button row for an `Alert`. Lays out children with a horizontal gap
 * and configurable alignment. Renders only when actions are needed — for
 * dismissible alerts the close button in the top-right is usually enough.
 *
 * @example
 * ```tsx
 * <Alert variant="error">
 *   <Alert.Title>Couldn't reach the server</Alert.Title>
 *   <Alert.Description>The request timed out after 30 seconds.</Alert.Description>
 *   <Alert.Actions align="right">
 *     <Button variant="filled" onClick={retry}>Retry</Button>
 *     <Button onClick={dismiss}>Dismiss</Button>
 *   </Alert.Actions>
 * </Alert>
 * ```
 */
export const AlertActions = /*#__PURE__*/ React.memo<AlertActionsProps>(
  ({ children, align = 'left', className, style, testId, ref, ...rest }) => {
    return (
      <div
        ref={ref}
        className={cx(alertActionsRecipe({ align }), className)}
        style={style}
        data-testid={testId}
        data-alert-actions=""
        {...rest}
      >
        {children}
      </div>
    );
  }
);

AlertActions.displayName = 'AlertActions';
