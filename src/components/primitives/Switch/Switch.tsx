'use client';

import React, { useCallback, useId, useState } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { FormHelperText } from '@/components/form';
import type { Prettify } from '@/types/utilities';
import type { Size } from '@/types/common';
import { cx } from '@/utils/cx';
import {
  switchContainerStyle,
  switchRowRecipe,
  trackRecipe,
  trackWidthVar,
  trackHeightVar,
  thumbRecipe,
  thumbDiameterVar,
  thumbTranslateVar,
  labelTextStyle,
} from './Switch.css';

// --- Types ---

export type SwitchSize = Size;

export interface SwitchBaseProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'css'
> {
  /**
   * Whether the switch is on (controlled)
   */
  checked?: boolean;

  /**
   * Default on/off state (uncontrolled)
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * Switch label text
   */
  label?: string;

  /**
   * Position of the label relative to the switch
   * @default "right"
   */
  labelPosition?: 'left' | 'right';

  /**
   * Switch size
   * - `sm`: 28x14px track, compact toolbars
   * - `md`: 34x18px track, standard for panels
   * - `lg`: 42x22px track, prominent settings
   * @default "md"
   */
  size?: SwitchSize;

  /**
   * Whether the switch is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Helper text displayed below the switch
   */
  helperText?: string;

  /**
   * Error state
   * @default false
   */
  error?: boolean;

  /**
   * Error message displayed when error is true
   */
  errorMessage?: string;

  /**
   * Name attribute for form submission
   */
  name?: string;

  /**
   * Change event handler
   * @param checked - The new on/off state
   */
  onChange?: (checked: boolean) => void;

  /**
   * Test identifier for automated testing
   */
  testId?: string;

  ref?: React.Ref<HTMLButtonElement>;
}

export type SwitchProps = Prettify<SwitchBaseProps>;

// --- Size maps ---

interface SizeConfig {
  trackW: number;
  trackH: number;
  thumbDiameter: number;
  offset: number;
}

const SIZE_MAP: Record<SwitchSize, SizeConfig> = {
  sm: { trackW: 28, trackH: 14, thumbDiameter: 10, offset: 2 },
  md: { trackW: 34, trackH: 18, thumbDiameter: 14, offset: 2 },
  lg: { trackW: 42, trackH: 22, thumbDiameter: 18, offset: 2 },
};

/**
 * Switch component for boolean on/off states in editor toolbars,
 * settings panels, and property inspectors.
 *
 * More space-efficient than Checkbox for toggle options like
 * "Show Grid", "Snap to Grid", "Auto-Save".
 *
 * @example
 * ```tsx
 * <Switch label="Show Grid" />
 * <Switch checked={value} onChange={setValue} label="Auto-save" />
 * ```
 */
export const Switch: React.FC<SwitchProps> = ({
  checked: checkedProp,
  defaultChecked = false,
  label,
  labelPosition = 'right',
  size = 'md',
  disabled = false,
  helperText,
  error = false,
  errorMessage,
  name,
  onChange,
  className,
  style,
  testId,
  ref,
  id: idProp,
  ...rest
}) => {
  const autoId = useId();
  const switchId = idProp ?? autoId;
  const helperId = `${switchId}-helper`;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checkedProp !== undefined;
  const resolvedChecked = isControlled ? checkedProp : internalChecked;

  const handleClick = useCallback(() => {
    if (disabled) return;

    const newChecked = !resolvedChecked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  }, [disabled, resolvedChecked, isControlled, onChange]);

  const showHelperText = error && errorMessage ? errorMessage : helperText;

  const config = SIZE_MAP[size];
  const translateX = config.trackW - config.thumbDiameter - config.offset * 2;

  const trackInlineVars = assignInlineVars({
    [trackWidthVar]: `${config.trackW}px`,
    [trackHeightVar]: `${config.trackH}px`,
  });

  const thumbInlineVars = assignInlineVars({
    [thumbDiameterVar]: `${config.thumbDiameter}px`,
    [thumbTranslateVar]: `${translateX}px`,
  });

  const thumbStyle: React.CSSProperties = !resolvedChecked
    ? { transform: `translateX(${config.offset}px)` }
    : {};

  const track = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={resolvedChecked}
      aria-disabled={disabled || undefined}
      aria-describedby={showHelperText ? helperId : undefined}
      disabled={disabled}
      onClick={handleClick}
      className={trackRecipe({
        checked: resolvedChecked || undefined,
        disabled: disabled || undefined,
        error: error || undefined,
      })}
      style={trackInlineVars}
      data-testid={testId}
      {...rest}
    >
      <span
        className={thumbRecipe({
          checked: resolvedChecked || undefined,
        })}
        style={{ ...thumbInlineVars, ...thumbStyle }}
      />
      {name && (
        <input type="hidden" name={name} value={resolvedChecked ? 'on' : ''} />
      )}
    </button>
  );

  if (!label && !showHelperText) {
    return track;
  }

  return (
    <div className={cx(switchContainerStyle, className)} style={style}>
      <label
        className={switchRowRecipe({
          size,
          disabled: disabled || undefined,
        })}
      >
        {labelPosition === 'left' && label && (
          <span className={labelTextStyle}>{label}</span>
        )}
        {track}
        {labelPosition === 'right' && label && (
          <span className={labelTextStyle}>{label}</span>
        )}
      </label>
      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </div>
  );
};

Switch.displayName = 'Switch';
