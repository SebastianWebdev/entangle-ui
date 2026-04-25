'use client';

import React, {
  createContext,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { FormLabel } from '@/components/form/FormLabel';
import { FormHelperText } from '@/components/form/FormHelperText';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import type { RadioGroupContextValue, RadioGroupProps } from './Radio.types';
import {
  groupContainerStyle,
  groupItemsStyle,
  groupOrientationVar,
  groupSpacingVar,
} from './Radio.css';

export const RadioGroupContext =
  /*#__PURE__*/ createContext<RadioGroupContextValue | null>(null);

const SPACING_SCALE: readonly string[] = [
  '0',
  vars.spacing.xs,
  vars.spacing.sm,
  vars.spacing.md,
  vars.spacing.lg,
  vars.spacing.xl,
  vars.spacing.xxl,
  vars.spacing.xxxl,
];

const resolveSpacing = (spacing: number | string): string => {
  if (typeof spacing === 'string') return spacing;
  const clamped = Math.max(0, Math.min(SPACING_SCALE.length - 1, spacing));
  const index = Math.floor(clamped);
  return SPACING_SCALE[index] ?? vars.spacing.sm;
};

/**
 * Groups multiple Radio components with shared, exclusive selection state.
 *
 * Manages a single `string` value, propagates `name`, `size`, `disabled`,
 * and `error` to children via React Context, and applies `aria-required`
 * for required fields. Supports controlled and uncontrolled modes.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   label="Coordinate space"
 *   value={space}
 *   onChange={setSpace}
 * >
 *   <Radio value="local" label="Local" />
 *   <Radio value="world" label="World" />
 *   <Radio value="parent" label="Parent" />
 * </RadioGroup>
 * ```
 */
export const RadioGroup = /*#__PURE__*/ React.memo<RadioGroupProps>(
  ({
    value: valueProp,
    defaultValue,
    label,
    helperText,
    disabled = false,
    error = false,
    errorMessage,
    required = false,
    orientation = 'vertical',
    spacing = 2,
    name,
    size = 'md',
    onChange,
    children,
    className,
    style,
    testId,
    ref,
    id: idProp,
    ...rest
  }) => {
    const autoId = useId();
    const groupId = idProp ?? autoId;
    const labelId = `${groupId}-label`;
    const helperId = `${groupId}-helper`;

    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultValue
    );
    const isControlled = valueProp !== undefined;
    const currentValue = isControlled ? valueProp : internalValue;

    const handleChange = useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }
        onChange?.(nextValue);
      },
      [isControlled, onChange]
    );

    const contextValue = useMemo<RadioGroupContextValue>(
      () => ({
        value: currentValue,
        name,
        size,
        disabled,
        error,
        onChange: handleChange,
      }),
      [currentValue, name, size, disabled, error, handleChange]
    );

    const showHelperText = error && errorMessage ? errorMessage : helperText;

    const flexDirection = orientation === 'horizontal' ? 'row' : 'column';

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={showHelperText ? helperId : undefined}
        aria-required={required || undefined}
        aria-invalid={error || undefined}
        aria-disabled={disabled || undefined}
        aria-orientation={orientation}
        className={cx(groupContainerStyle, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {label && (
          <FormLabel id={labelId} required={required} disabled={disabled}>
            {label}
          </FormLabel>
        )}
        <RadioGroupContext.Provider value={contextValue}>
          <div
            className={groupItemsStyle}
            style={assignInlineVars({
              [groupOrientationVar]: flexDirection,
              [groupSpacingVar]: resolveSpacing(spacing),
            })}
          >
            {children}
          </div>
        </RadioGroupContext.Provider>
        {showHelperText && (
          <FormHelperText id={helperId} error={error}>
            {showHelperText}
          </FormHelperText>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
