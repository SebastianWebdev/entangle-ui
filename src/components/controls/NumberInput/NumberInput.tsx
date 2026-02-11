'use client';

// src/controls/NumberInput/NumberInput.tsx
import React, { useRef, useEffect } from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';
import { inputWrapperRecipe } from '@/components/form/InputWrapper.css';
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon';
import { useNumberInput, type UseNumberInputOptions } from './useNumberInput';
import { cx } from '@/utils/cx';
import {
  numberInputContainerStyle,
  containerHoveredStyle,
  containerDraggingStyle,
  labelRecipe,
  stepButtonRecipe,
  stepButtonIconLeftStyle,
  stepButtonIconRightStyle,
  inputRecipe,
  valueDisplayRecipe,
  unitLabelStyle,
  helperTextRecipe,
} from './NumberInput.css';

/**
 * Props specific to NumberInput component
 */
export interface NumberInputBaseProps
  extends Omit<BaseComponent, 'onChange'>, UseNumberInputOptions {
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
    <div
      ref={containerRef}
      className={cx(
        numberInputContainerStyle,
        isHovered && !disabled && !isDragging && containerHoveredStyle,
        isDragging && containerDraggingStyle,
        className
      )}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      data-testid={testId}
    >
      {label && (
        <label htmlFor={inputId} className={labelRecipe({ disabled })}>
          {label}
          {required && <span style={{ color: 'var(--accent-error)' }}> *</span>}
        </label>
      )}

      <div
        className={inputWrapperRecipe({
          size,
          error: effectiveError,
          disabled,
          focused,
        })}
      >
        {/* Decrement button */}
        {showStepButtons && (
          <button
            type="button"
            className={stepButtonRecipe({
              position: 'left',
              size,
              visible: shouldShowStepButtons,
            })}
            onClick={handleDecrementClick}
            disabled={disabled}
            tabIndex={-1}
            aria-label="Decrement value"
          >
            <span className={stepButtonIconLeftStyle}>
              <ChevronDownIcon size={size === 'sm' ? 'sm' : 'md'} />
            </span>
          </button>
        )}

        {/* Input field - hidden when not editing */}
        <input
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
          className={inputRecipe({ size })}
          style={{
            opacity: isEditing ? 1 : 0,
            pointerEvents: isEditing ? 'auto' : 'none',
          }}
        />

        {/* Value display - shown when not editing */}
        {!isEditing && (
          <div
            className={valueDisplayRecipe({
              size,
              hasStepButtons: shouldShowStepButtons,
            })}
          >
            <span>{formattedValue}</span>
            {unitDisplay && (
              <span className={unitLabelStyle}>{unitDisplay}</span>
            )}
          </div>
        )}

        {/* Increment button */}
        {showStepButtons && (
          <button
            type="button"
            className={stepButtonRecipe({
              position: 'right',
              size,
              visible: shouldShowStepButtons,
            })}
            onClick={handleIncrementClick}
            disabled={disabled}
            tabIndex={-1}
            aria-label="Increment value"
          >
            <span className={stepButtonIconRightStyle}>
              <ChevronDownIcon size={size === 'sm' ? 'sm' : 'md'} />
            </span>
          </button>
        )}
      </div>

      {(helperText ?? (effectiveError && effectiveErrorMessage)) && (
        <div className={helperTextRecipe({ error: effectiveError })}>
          {effectiveError && effectiveErrorMessage
            ? effectiveErrorMessage
            : helperText}
        </div>
      )}
    </div>
  );
};

NumberInput.displayName = 'NumberInput';
