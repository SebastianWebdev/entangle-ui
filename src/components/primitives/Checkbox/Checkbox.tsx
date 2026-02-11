import React, { useCallback, useId, useContext, useState } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { FormHelperText } from '@/components/form';
import type {
  CheckboxProps,
  CheckboxSize,
} from './Checkbox.types';
import { CheckboxGroupContext } from './CheckboxGroup';
import { cx } from '@/utils/cx';
import {
  checkboxContainerStyle,
  checkboxLabelRecipe,
  checkboxBoxRecipe,
  boxSizeVar,
} from './Checkbox.css';

// --- Size maps ---

const BOX_SIZES: Record<CheckboxSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

const ICON_SIZES: Record<CheckboxSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

/**
 * Checkbox component for boolean selection in settings panels,
 * property inspectors, and form interfaces.
 *
 * Supports controlled/uncontrolled modes, indeterminate state,
 * label positioning, sizes, variants, and error states.
 *
 * @example
 * ```tsx
 * <Checkbox label="Enable shadows" />
 * <Checkbox checked={value} onChange={setValue} label="Auto-save" />
 * <Checkbox indeterminate label="Select all" />
 * ```
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked: checkedProp,
  defaultChecked = false,
  indeterminate = false,
  label,
  labelPosition = 'right',
  size: sizeProp = 'md',
  variant = 'default',
  disabled: disabledProp = false,
  required = false,
  error = false,
  helperText,
  errorMessage,
  value,
  name,
  onChange,
  className,
  style,
  testId,
  ref,
  id: idProp,
  ...rest
}) => {
  const groupContext = useContext(CheckboxGroupContext);
  const autoId = useId();
  const checkboxId = idProp ?? autoId;
  const helperId = `${checkboxId}-helper`;

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  // Resolve group context
  const disabled = disabledProp || (groupContext?.disabled ?? false);
  const size = sizeProp ?? groupContext?.size ?? 'md';

  // Determine checked state for group integration
  const isGrouped = groupContext !== null && value !== undefined;
  const isControlled = checkedProp !== undefined;

  let resolvedChecked: boolean;
  if (isGrouped) {
    resolvedChecked = groupContext.groupValue.includes(value);
  } else if (isControlled) {
    resolvedChecked = checkedProp;
  } else {
    resolvedChecked = internalChecked;
  }

  const handleClick = useCallback(() => {
    if (disabled) return;

    const newChecked = !resolvedChecked;

    if (isGrouped && value) {
      groupContext.toggleValue(value);
    }

    if (!isControlled && !isGrouped) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  }, [
    disabled,
    resolvedChecked,
    isGrouped,
    value,
    groupContext,
    isControlled,
    onChange,
  ]);

  const iconSize = ICON_SIZES[size];
  const showHelperText = error && errorMessage ? errorMessage : helperText;

  const ariaChecked: 'true' | 'false' | 'mixed' = indeterminate
    ? 'mixed'
    : resolvedChecked
      ? 'true'
      : 'false';

  const isActive = resolvedChecked || indeterminate;

  const boxInlineVars = assignInlineVars({
    [boxSizeVar]: `${BOX_SIZES[size]}px`,
  });

  const checkboxBox = (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={ariaChecked}
      aria-disabled={disabled || undefined}
      aria-required={required || undefined}
      aria-invalid={error || undefined}
      aria-describedby={showHelperText ? helperId : undefined}
      disabled={disabled}
      onClick={handleClick}
      className={checkboxBoxRecipe({
        active: isActive || undefined,
        variant,
        disabled: disabled || undefined,
        error: error || undefined,
      })}
      style={boxInlineVars}
      data-testid={testId}
      {...rest}
    >
      {indeterminate ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <line
            x1="2"
            y1="6"
            x2="10"
            y2="6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          style={{
            opacity: resolvedChecked ? 1 : 0,
            transform: resolvedChecked ? 'scale(1)' : 'scale(0)',
            transition: 'opacity 150ms ease-out, transform 150ms ease-out',
          }}
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {name && (
        <input
          type="hidden"
          name={name}
          value={resolvedChecked ? (value ?? 'on') : ''}
        />
      )}
    </button>
  );

  if (!label && !showHelperText) {
    return checkboxBox;
  }

  return (
    <div className={cx(checkboxContainerStyle, className)} style={style}>
      <label
        className={checkboxLabelRecipe({
          labelPosition,
          disabled: disabled || undefined,
          size,
        })}
      >
        {checkboxBox}
        {label && <span>{label}</span>}
      </label>
      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </div>
  );
};

Checkbox.displayName = 'Checkbox';
