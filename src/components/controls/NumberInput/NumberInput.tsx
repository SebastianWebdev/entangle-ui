// src/controls/NumberInput/NumberInput.tsx
import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import type { Prettify } from '@/types/utilities';
import { Input, type InputProps } from '@/components/primitives/Input/Input';
import { useNumberInput, type UseNumberInputOptions  } from './useNumberInput';

/**
 * Props specific to NumberInput component
 */
export interface NumberInputBaseProps extends 
  Omit<InputProps, 'value' | 'onChange' | 'type' | 'startIcon' | 'endIcon'>,
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
}

/**
 * Props for the NumberInput component with prettified type for better IntelliSense
 */
export type NumberInputProps = NumberInputBaseProps;

interface StyledContainerProps {
  $isHovered: boolean;
  $isDragging: boolean;
  $disabled: boolean;
}

const StyledNumberInputContainer = styled.div<StyledContainerProps>`
  position: relative;
  
  /* Drag cursor when hovering and not disabled */
  ${props => props.$isHovered && !props.$disabled && !props.$isDragging && `
    cursor: ew-resize;
  `}
  
  /* Different cursor when actively dragging */
  ${props => props.$isDragging && `
    cursor: ew-resize;
    user-select: none;
  `}
`;

const StyledInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

interface StyledStepButtonProps {
  $position: 'left' | 'right';
  $size: NonNullable<InputProps['size']>;
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
  ${props => props.$position === 'left' ? 'left: 1px;' : 'right: 1px;'}
  
  /* Size variants */
  ${props => {
    const sizes = {
      sm: { width: '20px' },
      md: { width: '24px' },
      lg: { width: '28px' },
    };
    const size = sizes[props.$size];
    return `
      width: ${size.width};
    `;
  }}
  
  /* Visibility */
  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
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
  
  /* Icon styling - simple triangles */
  &::before {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    
    ${props => props.$position === 'left' ? `
      border-width: 4px 6px 4px 0;
      border-color: transparent ${props.theme.colors.text.muted} transparent transparent;
    ` : `
      border-width: 4px 0 4px 6px;
      border-color: transparent transparent transparent ${props.theme.colors.text.muted};
    `}
  }
  
  &:hover::before {
    ${props => props.$position === 'left' ? `
      border-right-color: ${props.theme.colors.text.primary};
    ` : `
      border-left-color: ${props.theme.colors.text.primary};
    `}
  }
`;

const StyledUnitLabel = styled.span<{ $size: NonNullable<InputProps['size']> }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${props => props.theme.colors.text.muted};
  font-size: ${props => {
    const fontSize = {
      sm: props.theme.typography.fontSize.xs,
      md: props.theme.typography.fontSize.sm,
      lg: props.theme.typography.fontSize.md,
    };
    return fontSize[props.$size];
  }}px;
  line-height: 1;
  white-space: nowrap;
`;

const StyledInput = styled(Input)<{ $hasUnit: boolean; $hasStepButtons: boolean }>`
  /* Add padding for step buttons and unit */
  input {
    text-align: center;
    
    ${props => props.$hasStepButtons && `
      padding-left: ${props.size === 'sm' ? '24px' : props.size === 'md' ? '28px' : '32px'};
      padding-right: ${props.$hasUnit ? 
        (props.size === 'sm' ? '48px' : props.size === 'md' ? '52px' : '56px') : 
        (props.size === 'sm' ? '24px' : props.size === 'md' ? '28px' : '32px')
      };
    `}
    
    ${props => !props.$hasStepButtons && props.$hasUnit && `
      padding-right: 40px;
    `}
  }
`;

/**
 * A specialized number input component with Blender-like functionality.
 * 
 * Features:
 * - Drag left/right to change values with mouse
 * - Click triangle buttons to increment/decrement
 * - Keyboard input with mathematical expression support
 * - Modifier keys: Ctrl (large steps), Shift (precision), Minus (negate)
 * - Soft and hard value limits
 * - Unit display support
 * - Expression evaluation (pi, sqrt, sin, etc.)
 * - Custom validation and formatting
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
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(({
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
  className,
  'data-testid': testId,
  ...inputProps
}, forwardedRef) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Combine refs
  React.useImperativeHandle(forwardedRef, () => inputRef.current!);
  
  // Use the NumberInput hook for all logic
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
    setFocused,
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
  const effectiveError = errorMessage || externalError || internalError;

  // Mouse event handlers for dragging
  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled || readOnly || isEditing) return;
    
    // Only start drag on left mouse button
    if (event.button !== 0) return;
    
    // Don't start drag if clicking on step buttons
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON') return;
    
    event.preventDefault();
    startDrag(event.clientX);
  };

  // Global mouse move and up handlers for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      updateDrag(event.clientX);
    };

    const handleMouseUp = () => {
      endDrag();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateDrag, endDrag]);

  // Input event handlers
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateDisplayValue(event.target.value);
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (!isEditing) {
      startEditing();
    }
    inputProps.onFocus?.(event);
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    endEditing();
    inputProps.onBlur?.(event);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(event);
    inputProps.onKeyDown?.(event);
  };

  // Container event handlers
  const handleContainerMouseEnter = () => {
    if (!disabled && !readOnly) {
      setHovered(true);
    }
  };

  const handleContainerMouseLeave = () => {
    setHovered(false);
  };

  // Step button handlers
  const handleIncrementClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    increment();
    inputRef.current?.focus();
  };

  const handleDecrementClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    decrement();
    inputRef.current?.focus();
  };

  // Show step buttons when appropriate
  const shouldShowStepButtons = showStepButtons && isHovered && !isEditing && !disabled && !readOnly;
  
  // Format unit display
  const unitDisplay = typeof unit === 'function' ? unit(value) : unit;

  return (
    <StyledNumberInputContainer
      ref={containerRef}
      className={className}
      $isHovered={isHovered}
      $isDragging={isDragging}
      $disabled={disabled}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
      onMouseDown={handleMouseDown}
      data-testid={testId}
    >
      <StyledInputWrapper>
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
          />
        )}
        
        {/* Main input field */}
        <StyledInput
          {...inputProps}
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          size={size}
          errorMessage={effectiveError}
          disabled={disabled}
          readOnly={readOnly && !isEditing}
          type="text"
          $hasUnit={!!unitDisplay}
          $hasStepButtons={shouldShowStepButtons}
        />
        
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
          />
        )}
        
        {/* Unit label */}
        {unitDisplay && (
          <StyledUnitLabel $size={size}>
            {unitDisplay}
          </StyledUnitLabel>
        )}
      </StyledInputWrapper>
    </StyledNumberInputContainer>
  );
});

NumberInput.displayName = 'NumberInput';
