'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import { vars } from '@/theme/contract.css';
import { IconButton } from '@/components/primitives/IconButton';
import { CloseIcon } from '@/components/Icons/CloseIcon';
import { InfoIcon } from '@/components/Icons/InfoIcon';
import { CheckIcon } from '@/components/Icons/CheckIcon';
import { WarningIcon } from '@/components/Icons/WarningIcon';
import { ErrorIcon } from '@/components/Icons/ErrorIcon';
import type { AlertProps, AlertVariant } from './Alert.types';
import {
  alertCloseButtonSolidStyle,
  alertCloseColumnStyle,
  alertColorVar,
  alertContentStyle,
  alertIconSolidStyle,
  alertIconStyle,
  alertRecipe,
} from './Alert.css';
import { AlertTitle } from './AlertTitle';
import { AlertDescription } from './AlertDescription';
import { AlertActions } from './AlertActions';

const VARIANT_COLOR: Record<AlertVariant, string> = {
  info: vars.colors.accent.primary,
  success: vars.colors.accent.success,
  warning: vars.colors.accent.warning,
  error: vars.colors.accent.error,
  neutral: vars.colors.text.muted,
};

const VARIANT_ROLE: Record<AlertVariant, { role: string; ariaLabel?: string }> =
  {
    info: { role: 'status' },
    success: { role: 'status' },
    warning: { role: 'alert' },
    error: { role: 'alert' },
    neutral: { role: 'region', ariaLabel: 'Notice' },
  };

const VARIANT_DEFAULT_ICON: Record<AlertVariant, React.ReactNode> = {
  info: <InfoIcon size="md" decorative />,
  success: <CheckIcon size="md" decorative />,
  warning: <WarningIcon size="md" decorative />,
  error: <ErrorIcon size="md" decorative />,
  neutral: null,
};

/**
 * Persistent inline alert / callout.
 *
 * Use for non-transient status messages tied to the surrounding UI — read-only
 * notices, expired credentials, unsaved-changes banners, etc. For transient
 * confirmations like "File saved", reach for `useToast` instead.
 *
 * Compound API: pair with `<Alert.Title>`, `<Alert.Description>`, and
 * `<Alert.Actions>` for richer layouts. The same components are also
 * available as standalone named exports (`AlertTitle`, `AlertDescription`,
 * `AlertActions`).
 *
 * Accessibility: roles are derived from the variant — `alert` for
 * `error`/`warning`, `status` for `info`/`success`, `region` for `neutral`.
 * The component never auto-focuses; inline alerts shouldn't grab focus.
 *
 * @example
 * ```tsx
 * <Alert variant="warning" title="Read-only mode">
 *   Switch to edit mode to make changes.
 * </Alert>
 *
 * <Alert variant="error" onClose={() => setOpen(false)}>
 *   <Alert.Title>Couldn't reach the server</Alert.Title>
 *   <Alert.Description>The request timed out.</Alert.Description>
 *   <Alert.Actions align="right">
 *     <Button onClick={retry}>Retry</Button>
 *   </Alert.Actions>
 * </Alert>
 * ```
 */
const AlertImpl = /*#__PURE__*/ React.memo<AlertProps>(
  ({
    variant = 'info',
    appearance = 'subtle',
    icon = true,
    onClose,
    title,
    children,
    className,
    style,
    testId,
    'aria-label': ariaLabelProp,
    ref,
    ...rest
  }) => {
    const isSolid = appearance === 'solid';
    const { role, ariaLabel: defaultAriaLabel } = VARIANT_ROLE[variant];

    const resolvedIcon: React.ReactNode =
      icon === false
        ? null
        : icon === true
          ? VARIANT_DEFAULT_ICON[variant]
          : icon;

    const inlineVars = assignInlineVars({
      [alertColorVar]: VARIANT_COLOR[variant],
    });

    return (
      <div
        ref={ref}
        role={role}
        aria-label={ariaLabelProp ?? defaultAriaLabel}
        className={cx(alertRecipe({ variant, appearance }), className)}
        style={{ ...inlineVars, ...style }}
        data-testid={testId}
        data-variant={variant}
        data-appearance={appearance}
        {...rest}
      >
        {resolvedIcon ? (
          <div
            className={cx(alertIconStyle, isSolid && alertIconSolidStyle)}
            data-alert-icon=""
            aria-hidden="true"
          >
            {resolvedIcon}
          </div>
        ) : null}

        <div className={alertContentStyle}>
          {title !== undefined && title !== null ? (
            <AlertTitle>{title}</AlertTitle>
          ) : null}
          {typeof children === 'string' ? (
            <AlertDescription>{children}</AlertDescription>
          ) : (
            children
          )}
        </div>

        {onClose ? (
          <div className={alertCloseColumnStyle}>
            <IconButton
              type="button"
              aria-label="Close alert"
              variant="ghost"
              size="sm"
              radius="sm"
              onClick={onClose}
              className={isSolid ? alertCloseButtonSolidStyle : undefined}
            >
              <CloseIcon size="sm" decorative />
            </IconButton>
          </div>
        ) : null}
      </div>
    );
  }
);

AlertImpl.displayName = 'Alert';

/**
 * Public API: `Alert` with attached compound members.
 *
 * `React.memo` returns an exotic component that doesn't accept arbitrary
 * static fields with proper typing — we expose the compound members through
 * a typed wrapper.
 */
type AlertCompound = typeof AlertImpl & {
  Title: typeof AlertTitle;
  Description: typeof AlertDescription;
  Actions: typeof AlertActions;
};

export const Alert = AlertImpl as AlertCompound;
Alert.Title = AlertTitle;
Alert.Description = AlertDescription;
Alert.Actions = AlertActions;
