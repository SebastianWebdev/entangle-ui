import React, { createContext, useCallback, useId, useState } from 'react';
import styled from '@emotion/styled';
import { FormLabel } from '@/components/form';
import { FormHelperText } from '@/components/form';
import { processCss } from '@/utils/styledUtils';
import type {
  CheckboxGroupProps,
  CheckboxGroupContextValue,
} from './Checkbox.types';

export const CheckboxGroupContext =
  createContext<CheckboxGroupContextValue | null>(null);

interface StyledGroupProps {
  $direction: 'row' | 'column';
  $gap: number;
  $css?: CheckboxGroupProps['css'];
}

const StyledGroupContainer = styled.div<{ $css?: CheckboxGroupProps['css'] }>`
  display: flex;
  flex-direction: column;

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

const StyledGroupItems = styled.div<StyledGroupProps>`
  display: flex;
  flex-direction: ${props => props.$direction};
  gap: ${props => props.theme.spacing.md * props.$gap}px;
`;

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
  css,
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
    <StyledGroupContainer
      ref={ref}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={showHelperText ? helperId : undefined}
      className={className}
      style={style}
      $css={css}
      data-testid={testId}
      {...rest}
    >
      {label && (
        <FormLabel id={labelId} required={required} disabled={disabled}>
          {label}
        </FormLabel>
      )}
      <CheckboxGroupContext.Provider value={contextValue}>
        <StyledGroupItems $direction={direction} $gap={gap}>
          {children}
        </StyledGroupItems>
      </CheckboxGroupContext.Provider>
      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </StyledGroupContainer>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';
