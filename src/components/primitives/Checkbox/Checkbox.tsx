import React, { useCallback, useId, useContext, useState } from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import { FormHelperText } from '@/components/form';
import type {
  CheckboxProps,
  CheckboxSize,
  CheckboxVariant,
} from './Checkbox.types';
import { CheckboxGroupContext } from './CheckboxGroup';
import type { Theme } from '@/theme';

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

const FONT_SIZE_MAP: Record<
  CheckboxSize,
  keyof Theme['typography']['fontSize']
> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

// --- Styled components ---

const StyledCheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface StyledCheckboxLabelProps {
  $labelPosition: 'left' | 'right';
  $disabled: boolean;
  $size: CheckboxSize;
}

const StyledCheckboxLabel = styled.label<StyledCheckboxLabelProps>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm}px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  flex-direction: ${props =>
    props.$labelPosition === 'left' ? 'row-reverse' : 'row'};
  font-size: ${props =>
    props.theme.typography.fontSize[FONT_SIZE_MAP[props.$size]]}px;
  color: ${props =>
    props.$disabled
      ? props.theme.colors.text.disabled
      : props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  user-select: none;
`;

interface StyledCheckboxBoxProps {
  $size: CheckboxSize;
  $variant: CheckboxVariant;
  $checked: boolean;
  $indeterminate: boolean;
  $disabled: boolean;
  $error: boolean;
  $css?: CheckboxProps['css'];
}

const StyledCheckboxBox = styled.button<StyledCheckboxBoxProps>`
  /* Reset */
  padding: 0;
  margin: 0;
  border: none;
  font: inherit;
  outline: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  /* Sizing */
  width: ${props => BOX_SIZES[props.$size]}px;
  height: ${props => BOX_SIZES[props.$size]}px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  transition: all ${props => props.theme.transitions.fast};

  /* Variant + State styles */
  ${props => {
    const { colors } = props.theme;
    const isActive = props.$checked || props.$indeterminate;

    if (props.$disabled) {
      return `
        opacity: 0.5;
        background: ${isActive ? colors.accent.primary : props.$variant === 'filled' ? colors.surface.default : 'transparent'};
        border: 1px solid ${isActive ? colors.accent.primary : colors.border.default};
      `;
    }

    if (props.$error) {
      return `
        background: ${isActive ? colors.accent.error : 'transparent'};
        border: 1px solid ${colors.accent.error};
        &:hover {
          border-color: ${colors.accent.error};
          background: ${isActive ? colors.accent.error : 'transparent'};
        }
      `;
    }

    if (isActive) {
      return `
        background: ${colors.accent.primary};
        border: 1px solid ${colors.accent.primary};
        &:hover {
          background: ${colors.accent.secondary};
          border-color: ${colors.accent.secondary};
        }
      `;
    }

    if (props.$variant === 'filled') {
      return `
        background: ${colors.surface.default};
        border: 1px solid ${colors.border.default};
        &:hover {
          border-color: ${colors.border.focus};
        }
      `;
    }

    return `
      background: transparent;
      border: 1px solid ${colors.border.default};
      &:hover {
        border-color: ${colors.border.focus};
      }
    `;
  }}

  /* Focus visible */
  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

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
  css,
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

  const checkboxBox = (
    <StyledCheckboxBox
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
      $size={size}
      $variant={variant}
      $checked={resolvedChecked}
      $indeterminate={indeterminate}
      $disabled={disabled}
      $error={error}
      $css={css}
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
    </StyledCheckboxBox>
  );

  if (!label && !showHelperText) {
    return checkboxBox;
  }

  return (
    <StyledCheckboxContainer className={className} style={style}>
      <StyledCheckboxLabel
        $labelPosition={labelPosition}
        $disabled={disabled}
        $size={size}
      >
        {checkboxBox}
        {label && <span>{label}</span>}
      </StyledCheckboxLabel>
      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </StyledCheckboxContainer>
  );
};

Checkbox.displayName = 'Checkbox';
