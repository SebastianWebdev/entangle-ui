'use client';

import React, { useCallback, useContext, useId, useState } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { FormHelperText } from '@/components/form/FormHelperText';
import { cx } from '@/utils/cx';
import type { RadioProps, RadioSize } from './Radio.types';
import { RadioGroupContext } from './RadioGroup';
import {
  innerSizeVar,
  outerSizeVar,
  radioContainerStyle,
  radioDotRecipe,
  radioLabelRecipe,
  radioLabelTextStyle,
  radioOuterRecipe,
  visuallyHiddenInputStyle,
} from './Radio.css';

const OUTER_SIZES: Record<RadioSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

const INNER_SIZES: Record<RadioSize, number> = {
  sm: 6,
  md: 7,
  lg: 8,
};

/**
 * Radio component for mutually exclusive selection in property panels,
 * settings, and form interfaces.
 *
 * Works standalone (controlled or uncontrolled) or as a child of `RadioGroup`,
 * which manages exclusive selection across siblings via context. When inside
 * a `RadioGroup`, the group's `value`, `name`, `size`, `disabled`, and `error`
 * override the corresponding props on individual radios.
 *
 * @example
 * ```tsx
 * <Radio value="local" label="Local" />
 *
 * <RadioGroup value={space} onChange={setSpace} label="Coordinate space">
 *   <Radio value="local" label="Local" />
 *   <Radio value="world" label="World" />
 *   <Radio value="parent" label="Parent" />
 * </RadioGroup>
 * ```
 */
export const Radio = /*#__PURE__*/ React.memo<RadioProps>(
  ({
    value,
    checked: checkedProp,
    defaultChecked = false,
    label,
    labelPosition = 'right',
    size: sizeProp,
    disabled: disabledProp,
    helperText,
    error: errorProp,
    errorMessage,
    name: nameProp,
    onChange,
    className,
    style,
    testId,
    ref,
    id: idProp,
    ...rest
  }) => {
    const groupContext = useContext(RadioGroupContext);
    const autoId = useId();
    const radioId = idProp ?? autoId;
    const helperId = `${radioId}-helper`;

    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = checkedProp !== undefined;
    const isGrouped = groupContext !== null;

    // Group context overrides individual props when present
    const size: RadioSize = isGrouped ? groupContext.size : (sizeProp ?? 'md');
    const disabled = isGrouped
      ? groupContext.disabled
      : (disabledProp ?? false);
    const error = isGrouped ? groupContext.error : (errorProp ?? false);
    const name = isGrouped ? groupContext.name : nameProp;

    let resolvedChecked: boolean;
    if (isGrouped) {
      resolvedChecked = groupContext.value === value;
    } else if (isControlled) {
      resolvedChecked = checkedProp;
    } else {
      resolvedChecked = internalChecked;
    }

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (isGrouped) {
          groupContext.onChange(value, event);
          return;
        }

        if (!isControlled) {
          setInternalChecked(true);
        }

        onChange?.(value, event);
      },
      [disabled, isGrouped, groupContext, value, isControlled, onChange]
    );

    const showHelperText =
      !isGrouped && error && errorMessage
        ? errorMessage
        : !isGrouped
          ? helperText
          : undefined;

    const outerInlineVars = assignInlineVars({
      [outerSizeVar]: `${OUTER_SIZES[size]}px`,
      [innerSizeVar]: `${INNER_SIZES[size]}px`,
    });

    const labelNode = (
      <label
        className={radioLabelRecipe({
          labelPosition,
          size,
          disabled: disabled || undefined,
        })}
      >
        <input
          ref={ref}
          type="radio"
          role="radio"
          id={radioId}
          name={name}
          value={value}
          checked={resolvedChecked}
          disabled={disabled}
          aria-checked={resolvedChecked}
          aria-disabled={disabled || undefined}
          aria-invalid={error || undefined}
          aria-describedby={showHelperText ? helperId : undefined}
          onChange={handleChange}
          className={visuallyHiddenInputStyle}
          data-testid={testId}
          {...rest}
        />
        <span
          aria-hidden="true"
          className={radioOuterRecipe({
            checked: resolvedChecked || undefined,
            disabled: disabled || undefined,
            error: error || undefined,
          })}
          style={outerInlineVars}
        >
          <span
            className={radioDotRecipe({
              checked: resolvedChecked || undefined,
              error: error || undefined,
            })}
          />
        </span>
        {label && <span className={radioLabelTextStyle}>{label}</span>}
      </label>
    );

    if (!showHelperText) {
      if (className || style) {
        return (
          <div className={cx(radioContainerStyle, className)} style={style}>
            {labelNode}
          </div>
        );
      }
      return labelNode;
    }

    return (
      <div className={cx(radioContainerStyle, className)} style={style}>
        {labelNode}
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      </div>
    );
  }
);

Radio.displayName = 'Radio';
