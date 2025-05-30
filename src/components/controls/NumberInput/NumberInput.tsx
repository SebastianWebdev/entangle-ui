// src/controls/NumberInput/NumberInput.tsx
import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon';
import { useNumberInput, type UseNumberInputOptions } from './useNumberInput';

/**
 * Props specific to NumberInput component
 */
export interface NumberInputBaseProps
  extends Omit<BaseComponent, 'onChange'>,
    UseNumberInputOptions {
  /**
   * Current numeric value
   */
  value: number;

  /**
   * Callback when value changes
   */
  onChange: (value: number) => void;

  /**
   * Unit suffix to display (e.g., "px", "%", "°")
   * Can be a string or a function that formats the value
   */
  unit?: string | ((value: number) => string);

  /**
   * Whether to show increment/decrement buttons on hover
   * @default true
   */
  showStepButtons?: boolean;

  /**
   * Custom validation function
   * Return error message string if invalid, undefined if valid
   */
  validate?: (value: number) => string | undefined;

  /**
   * Format value for display (e.g., add commas, currency symbols)
   * This is separate from unit display
   */
  formatValue?: (value: number) => string;

  /**
   * Parse custom formatted input back to number
   * Used in conjunction with formatValue
   */
  parseValue?: (input: string) => number | null;

  /**
   * Input size using standard library sizing
   * - `sm`: 20px height, compact for toolbars
   * - `md`: 24px height, standard for forms
   * - `lg`: 32px height, prominent inputs
   * @default "md"
   */
  size?: Size;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the input is read-only
   * @default false
   */
  readOnly?: boolean;

  /**
   * Error message displayed when error is true
   */
  errorMessage?: string | undefined;

  /**
   * Placeholder text
   */
  placeholder?: string | undefined;

  /**
   * Input label
   */
  label?: string | undefined;

  /**
   * Helper text displayed below the input
   */
  helperText?: string | undefined;

  /**
   * Whether the input is required
   * @default false
   */
  required?: boolean;

  /**
   * Focus event handler
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Blur event handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Key down event handler
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Props for the NumberInput component with prettified type for better IntelliSense
 */
export type NumberInputProps = Prettify<NumberInputBaseProps>;

interface StyledContainerProps {
  $isHovered: boolean;
  $isDragging: boolean;
  $disabled: boolean;
  $size: Size;
}

const StyledNumberInputContainer = styled.div<StyledContainerProps>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs}px;

  /* Drag cursor when hovering and not disabled */
  ${props =>
    props.$isHovered &&
    !props.$disabled &&
    !props.$isDragging &&
    `
    cursor: ew-resize;
  `}

  /* Different cursor when actively dragging */
  ${props =>
    props.$isDragging &&
    `
    cursor: ew-resize;
    user-select: none;
  `}
`;

const StyledLabel = styled.label<{ $disabled: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.sm}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props =>
    props.$disabled
      ? props.theme.colors.text.disabled
      : props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

interface StyledInputWrapperProps {
  $size: Size;
  $error: boolean;
  $disabled: boolean;
  $focused: boolean;
}

const StyledInputWrapper = styled.div<StyledInputWrapperProps>`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid;
  border-radius: ${props => props.theme.borderRadius.md}px;
  transition: all ${props => props.theme.transitions.normal};
  background: ${props =>
    props.$disabled
      ? props.theme.colors.surface.disabled
      : props.theme.colors.surface.default};

  /* Size variants */
  ${props => {
    const sizes = {
      sm: {
        height: '20px',
        padding: `0 ${props.theme.spacing.sm}px`,
      },
      md: {
        height: '24px',
        padding: `0 ${props.theme.spacing.md}px`,
      },
      lg: {
        height: '32px',
        padding: `0 ${props.theme.spacing.lg}px`,
      },
    };
    const size = sizes[props.$size];
    return `
      height: ${size.height};
      padding: ${size.padding};
    `;
  }}

  /* Border color states */
  border-color: ${props => {
    if (props.$error) return props.theme.colors.border.error;
    if (props.$focused) return props.theme.colors.border.focus;
    return props.theme.colors.border.default;
  }};

  /* Focus ring */
  ${props =>
    props.$focused &&
    !props.$error &&
    `
    box-shadow: 0 0 0 2px ${props.theme.colors.accent.primary}20;
  `}

  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
  `}
  
  /* Hover state */
  &:hover:not(:focus-within) {
    border-color: ${props => {
      if (props.$disabled || props.$error) return 'inherit';
      return props.theme.colors.border.focus;
    }};
  }
`;

interface StyledStepButtonProps {
  $position: 'left' | 'right';
  $size: Size;
  $visible: boolean;
}

const StyledStepButton = styled.button<StyledStepButtonProps>`
  position: absolute;
  top: 1px;
  bottom: 1px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1;

  /* Position */
  ${props => (props.$position === 'left' ? 'left: 1px;' : 'right: 1px;')}

  /* Size variants */
  ${props => {
    const sizes = {
      sm: { width: '18px' },
      md: { width: '22px' },
      lg: { width: '28px' },
    };
    const size = sizes[props.$size];
    return `
      width: ${size.width};
    `;
  }}
  
  /* Visibility */
  opacity: ${props => (props.$visible ? 1 : 0)};
  pointer-events: ${props => (props.$visible ? 'auto' : 'none')};
  transition: opacity ${props => props.theme.transitions.fast};

  /* Hover state */
  &:hover {
    background: ${props => props.theme.colors.surface.hover};
    border-radius: ${props => props.theme.borderRadius.sm}px;
  }

  /* Active state */
  &:active {
    background: ${props => props.theme.colors.surface.active};
  }

  /* Icon rotation */
  svg {
    ${props =>
      props.$position === 'left'
        ? 'transform: rotate(90deg);'
        : 'transform: rotate(-90deg);'}
    color: ${props => props.theme.colors.text.muted};
    transition: color ${props => props.theme.transitions.fast};
  }

  &:hover svg {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const StyledInput = styled.input<{
  $size: Size;
  $hasStepButtons: boolean;
  $hasUnit: boolean;
}>`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  color: ${props => props.theme.colors.text.primary};
  text-align: center;

  ${props => {
    const fontSize = {
      sm: props.theme.typography.fontSize.xs,
      md: props.theme.typography.fontSize.sm,
      lg: props.theme.typography.fontSize.md,
    };
    return `font-size: ${fontSize[props.$size]}px;`;
  }}

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }

  &:disabled {
    cursor: not-allowed;
  }

  /* Remove number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

const StyledValueDisplay = styled.div<{
  $size: Size;
  $hasStepButtons: boolean;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.colors.text.primary};

  ${props => {
    const fontSize = {
      sm: props.theme.typography.fontSize.xs,
      md: props.theme.typography.fontSize.sm,
      lg: props.theme.typography.fontSize.md,
    };
    return `font-size: ${fontSize[props.$size]}px;`;
  }}

  /* Adjust for step buttons */
  ${props =>
    props.$hasStepButtons &&
    `
    max-width: calc(100% - ${props.$size === 'sm' ? '40px' : props.$size === 'md' ? '48px' : '60px'});
  `}
`;

const StyledUnitLabel = styled.span`
  color: ${props => props.theme.colors.text.muted};
  white-space: nowrap;
`;

const StyledHelperText = styled.div<{ $error: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  line-height: ${props => props.theme.typography.lineHeight.tight};
  color: ${props =>
    props.$error
      ? props.theme.colors.accent.error
      : props.theme.colors.text.muted};
`;

/**
 * A specialized number input component with Blender-like functionality.
 *
 * Features:
 * - Drag left/right to change values with mouse
 * - Click chevron buttons to increment/decrement
 * - Keyboard input with mathematical expression support
 * - Modifier keys: Ctrl (large steps), Shift (precision), Minus (negate)
 * - Soft and hard value limits
 * - Unit display support
 * - Expression evaluation (pi, sqrt, sin, etc.)
 * - Custom validation and formatting
 * - Centered value and unit display
 *
 * @example
 * ```tsx
 * // Basic number input
 * <NumberInput
 *   value={rotation}
 *   onChange={setRotation}
 *   unit="°"
 *   step={1}
 * />
 *
 * // With limits and precision
 * <NumberInput
 *   value={opacity}
 *   onChange={setOpacity}
 *   min={0}
 *   max={1}
 *   step={0.1}
 *   precision={2}
 *   unit="%"
 * />
 *
 * // With custom validation
 * <NumberInput
 *   value={dimension}
 *   onChange={setDimension}
 *   validate={(v) => v <= 0 ? "Must be positive" : undefined}
 *   placeholder="Enter value or expression"
 * />
 * ```
 */
export const NumberInput = ({
  // Value props
  value,
  onChange,

  // NumberInput specific props
  unit,
  showStepButtons = true,
  validate,
  formatValue,
  parseValue,

  // UseNumberInput options
  min,
  max,
  softMin,
  softMax,
  step,
  precisionStep,
  largeStep,
  precision,
  allowExpressions = true,
  dragSensitivity = 1,

  // Input props
  size = 'md',
  disabled = false,
  readOnly = false,
  errorMessage,
  placeholder,
  label,
  helperText,
  required = false,
  className,
  testId,
  onFocus,
  onBlur,
  onKeyDown,
  ref,
  ...props
}: NumberInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);

  // Track mouse state for distinguishing click vs drag
  const mouseDownRef = useRef<{
    x: number;
    time: number;
    hasMoved: boolean;
  } | null>(null);
  const dragThreshold = 3; // pixels
  const clickTimeThreshold = 200; // milliseconds

  // Combine refs
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [
    inputRef,
  ]);

  const {
    displayValue,
    isEditing,
    isDragging,
    isHovered,
    error: internalError,
    increment,
    decrement,
    startDrag,
    updateDrag,
    endDrag,
    startEditing,
    endEditing,
    updateDisplayValue,
    setHovered,
    handleKeyDown,
  } = useNumberInput({
    value,
    onChange,
    ...(min !== undefined && { min }),
    ...(max !== undefined && { max }),
    ...(softMin !== undefined && { softMin }),
    ...(softMax !== undefined && { softMax }),
    ...(step !== undefined && { step }),
    ...(precisionStep !== undefined && { precisionStep }),
    ...(largeStep !== undefined && { largeStep }),
    ...(precision !== undefined && { precision }),
    ...(allowExpressions !== undefined && { allowExpressions }),
    disabled: disabled || readOnly,
    ...(dragSensitivity !== undefined && { dragSensitivity }),
    ...(formatValue !== undefined && { formatValue }),
    ...(parseValue !== undefined && { parseValue }),
  });

  // External validation
  const externalError = validate ? validate(value) : undefined;
  const effectiveError = !!errorMessage || !!externalError || !!internalError;
  const effectiveErrorMessage = errorMessage ?? externalError ?? internalError;

  // Mouse event handlers for dragging vs clicking
  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled || readOnly) return;

    // Only handle left mouse button
    if (event.button !== 0) return;

    // Don't handle if clicking on step buttons
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) return;

    // Record mouse down state
    mouseDownRef.current = {
      x: event.clientX,
      time: Date.now(),
      hasMoved: false,
    };

    event.preventDefault();
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!mouseDownRef.current || disabled || readOnly) return;

    const deltaX = Math.abs(event.clientX - mouseDownRef.current.x);

    // If we've moved beyond threshold and not already dragging, start drag
    if (
      deltaX > dragThreshold &&
      !mouseDownRef.current.hasMoved &&
      !isDragging
    ) {
      mouseDownRef.current.hasMoved = true;
      startDrag(mouseDownRef.current.x);
    }
  };

  const handleMouseUp = () => {
    if (!mouseDownRef.current || disabled || readOnly) return;

    const timeDelta = Date.now() - mouseDownRef.current.time;
    const wasClick =
      !mouseDownRef.current.hasMoved && timeDelta < clickTimeThreshold;

    // If it was a click (not drag), start editing
    if (wasClick && !isEditing) {
      startEditing();
      // Focus the input after a short delay to ensure it's visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }

    mouseDownRef.current = null;
  };

  // Global mouse move and up handlers for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (event: MouseEvent) => {
      updateDrag(event.clientX);
    };

    const handleGlobalMouseUp = () => {
      endDrag();
      mouseDownRef.current = null;
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, updateDrag, endDrag]);

  // Input event handlers
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateDisplayValue(event.target.value);
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    endEditing();
    onBlur?.(event);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(event);
    onKeyDown?.(event);
  };

  // Container event handlers
  const handleContainerMouseEnter = () => {
    if (!disabled && !readOnly) {
      setHovered(true);
    }
  };

  const handleContainerMouseLeave = () => {
    setHovered(false);
    // Reset mouse state if leaving container
    mouseDownRef.current = null;
  };

  // Step button handlers
  const handleIncrementClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    increment();
    // Don't focus input after step button click
  };

  const handleDecrementClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    decrement();
    // Don't focus input after step button click
  };

  // Show step buttons when appropriate
  const shouldShowStepButtons =
    showStepButtons && isHovered && !isEditing && !disabled && !readOnly;

  // Format unit display
  const unitDisplay = typeof unit === 'function' ? unit(value) : unit;

  // Format display value
  const formattedValue = formatValue ? formatValue(value) : displayValue;

  const inputId = React.useId();

  return (
    <StyledNumberInputContainer
      ref={containerRef}
      className={className}
      $isHovered={isHovered}
      $isDragging={isDragging}
      $disabled={disabled}
      $size={size}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      data-testid={testId}
    >
      {label && (
        <StyledLabel htmlFor={inputId} $disabled={disabled}>
          {label}
          {required && <span style={{ color: 'var(--accent-error)' }}> *</span>}
        </StyledLabel>
      )}

      <StyledInputWrapper
        $size={size}
        $error={effectiveError}
        $disabled={disabled}
        $focused={focused}
      >
        {/* Decrement button */}
        {showStepButtons && (
          <StyledStepButton
            type="button"
            $position="left"
            $size={size}
            $visible={shouldShowStepButtons}
            onClick={handleDecrementClick}
            disabled={disabled}
            tabIndex={-1}
            aria-label="Decrement value"
          >
            <ChevronDownIcon size={size === 'sm' ? 'sm' : 'md'} />
          </StyledStepButton>
        )}

        {/* Input field - hidden when not editing */}
        <StyledInput
          {...props}
          ref={inputRef}
          id={inputId}
          type="text"
          value={isEditing ? displayValue : ''}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={isEditing ? placeholder : ''}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          $size={size}
          $hasStepButtons={shouldShowStepButtons}
          $hasUnit={!!unitDisplay}
          style={{
            opacity: isEditing ? 1 : 0,
            pointerEvents: isEditing ? 'auto' : 'none',
          }}
        />

        {/* Value display - shown when not editing */}
        {!isEditing && (
          <StyledValueDisplay
            $size={size}
            $hasStepButtons={shouldShowStepButtons}
          >
            <span>{formattedValue}</span>
            {unitDisplay && <StyledUnitLabel>{unitDisplay}</StyledUnitLabel>}
          </StyledValueDisplay>
        )}

        {/* Increment button */}
        {showStepButtons && (
          <StyledStepButton
            type="button"
            $position="right"
            $size={size}
            $visible={shouldShowStepButtons}
            onClick={handleIncrementClick}
            disabled={disabled}
            tabIndex={-1}
            aria-label="Increment value"
          >
            <ChevronDownIcon size={size === 'sm' ? 'sm' : 'md'} />
          </StyledStepButton>
        )}
      </StyledInputWrapper>

      {(helperText ?? (effectiveError && effectiveErrorMessage)) && (
        <StyledHelperText $error={effectiveError}>
          {effectiveError && effectiveErrorMessage
            ? effectiveErrorMessage
            : helperText}
        </StyledHelperText>
      )}
    </StyledNumberInputContainer>
  );
};

NumberInput.displayName = 'NumberInput';
