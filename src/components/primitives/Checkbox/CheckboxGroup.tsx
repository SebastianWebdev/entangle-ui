import React, { createContext, useCallback, useId, useState } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { FormLabel } from '@/components/form';
import { FormHelperText } from '@/components/form';
import { cx } from '@/utils/cx';
import type {
  CheckboxGroupProps,
  CheckboxGroupContextValue,
} from './Checkbox.types';
import {
  groupContainerStyle,
  groupItemsStyle,
  groupDirectionVar,
  groupGapVar,
} from './Checkbox.css';

export const CheckboxGroupContext =
  /*#__PURE__*/ createContext<CheckboxGroupContextValue | null>(null);

/**
 * Groups multiple Checkbox components with shared state management.
 *
 * Manages a `string[]` value, propagates `disabled` and `size` to children
 * via React Context. Supports controlled and uncontrolled modes.
 *
 * @example
 * ```tsx
 * <CheckboxGroup
 *   label="Render passes"
 *   value={selected}
 *   onChange={setSelected}
 * >
 *   <Checkbox value="diffuse" label="Diffuse" />
 *   <Checkbox value="specular" label="Specular" />
 *   <Checkbox value="shadow" label="Shadow" />
 * </CheckboxGroup>
 * ```
 */
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value: valueProp,
  defaultValue = [],
  label,
  direction = 'column',
  gap = 2,
  disabled = false,
  size = 'md',
  helperText,
  error = false,
  errorMessage,
  required = false,
  children,
  onChange,
  className,
  style,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  css: _css,
  testId,
  ref,
  id: idProp,
  ...rest
}) => {
  const autoId = useId();
  const groupId = idProp ?? autoId;
  const labelId = `${groupId}-label`;
  const helperId = `${groupId}-helper`;

  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const isControlled = valueProp !== undefined;
  const currentValue = isControlled ? valueProp : internalValue;

  const toggleValue = useCallback(
    (itemValue: string) => {
      const nextValue = currentValue.includes(itemValue)
        ? currentValue.filter(v => v !== itemValue)
        : [...currentValue, itemValue];

      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [currentValue, isControlled, onChange]
  );

  const contextValue: CheckboxGroupContextValue = {
    groupValue: currentValue,
    toggleValue,
    disabled,
    size,
  };

  const showHelperText = error && errorMessage ? errorMessage : helperText;

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={showHelperText ? helperId : undefined}
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
      <CheckboxGroupContext.Provider value={contextValue}>
        <div
          className={groupItemsStyle}
          style={assignInlineVars({
            [groupDirectionVar]: direction,
            [groupGapVar]: `${8 * gap}px`,
          })}
        >
          {children}
        </div>
      </CheckboxGroupContext.Provider>
      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </div>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';
