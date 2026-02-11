import React, { useCallback, useId, useState } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { CollapsibleProps, CollapsibleSize } from './Collapsible.types';
import { cx } from '@/utils/cx';
import {
  collapsibleRootStyle,
  triggerRecipe,
  triggerHeightVar,
  triggerPaddingVar,
  triggerFontSizeVar,
  chevronRecipe,
  chevronSizeVar,
  contentWrapperRecipe,
  contentInnerStyle,
  contentBodyStyle,
  contentPaddingVVar,
  contentPaddingHVar,
} from './Collapsible.css';
import { vars } from '@/theme/contract.css';

// --- Size maps ---

interface TriggerSizeConfig {
  height: string;
  padding: string;
  fontSize: string;
  chevronSize: number;
}

const TRIGGER_SIZE_MAP: Record<CollapsibleSize, TriggerSizeConfig> = {
  sm: {
    height: '24px',
    padding: vars.spacing.md,
    fontSize: vars.typography.fontSize.xs,
    chevronSize: 10,
  },
  md: {
    height: '28px',
    padding: vars.spacing.md,
    fontSize: vars.typography.fontSize.sm,
    chevronSize: 12,
  },
  lg: {
    height: '32px',
    padding: vars.spacing.lg,
    fontSize: vars.typography.fontSize.md,
    chevronSize: 14,
  },
};

interface ContentSizeConfig {
  paddingV: string;
  paddingH: string;
}

const CONTENT_SIZE_MAP: Record<CollapsibleSize, ContentSizeConfig> = {
  sm: { paddingV: vars.spacing.sm, paddingH: vars.spacing.md },
  md: { paddingV: vars.spacing.md, paddingH: vars.spacing.lg },
  lg: { paddingV: vars.spacing.lg, paddingH: vars.spacing.xl },
};

// --- Chevron icon ---

const ChevronRightIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.5 3L7.5 6L4.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Component ---

export const Collapsible: React.FC<CollapsibleProps> = ({
  trigger,
  open: openProp,
  defaultOpen = false,
  size = 'sm',
  indicator,
  disabled = false,
  keepMounted = false,
  onChange,
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const autoId = useId();
  const triggerId = `collapsible-${autoId}-trigger`;
  const contentId = `collapsible-${autoId}-content`;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const resolvedOpen = isControlled ? openProp : internalOpen;

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const nextOpen = !resolvedOpen;

    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onChange?.(nextOpen);
  }, [disabled, resolvedOpen, isControlled, onChange]);

  const showIndicator = indicator !== null;
  const sizeConfig = TRIGGER_SIZE_MAP[size];
  const contentConfig = CONTENT_SIZE_MAP[size];

  const triggerInlineVars = assignInlineVars({
    [triggerHeightVar]: sizeConfig.height,
    [triggerPaddingVar]: sizeConfig.padding,
    [triggerFontSizeVar]: sizeConfig.fontSize,
  });

  const contentInlineVars = assignInlineVars({
    [contentPaddingVVar]: contentConfig.paddingV,
    [contentPaddingHVar]: contentConfig.paddingH,
  });

  return (
    <div
      ref={ref}
      className={cx(collapsibleRootStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <button
        type="button"
        id={triggerId}
        aria-expanded={resolvedOpen}
        aria-controls={contentId}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
        className={triggerRecipe({
          disabled: disabled || undefined,
        })}
        style={triggerInlineVars}
      >
        {showIndicator && (
          <span
            className={chevronRecipe({
              open: resolvedOpen || undefined,
            })}
            style={assignInlineVars({
              [chevronSizeVar]: `${sizeConfig.chevronSize}px`,
            })}
          >
            {indicator ?? <ChevronRightIcon size={sizeConfig.chevronSize} />}
          </span>
        )}
        <span>{trigger}</span>
      </button>

      {(resolvedOpen || keepMounted) && (
        <div
          className={contentWrapperRecipe({
            open: resolvedOpen || undefined,
          })}
          role="region"
          id={contentId}
          aria-labelledby={triggerId}
          hidden={!resolvedOpen || undefined}
        >
          <div className={contentInnerStyle}>
            <div className={contentBodyStyle} style={contentInlineVars}>
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Collapsible.displayName = 'Collapsible';
