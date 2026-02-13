'use client';

import React from 'react';

// src/controls/NumberInput/useNumberInput.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useKeyboardContext } from '@/context/KeyboardContext';
import { parseNumericInput, isExpression } from '@/utils/mathExpression';

/**
 * Configuration options for NumberInput behavior
 */
export interface UseNumberInputOptions {
  /**
   * Minimum allowed value (hard limit)
   */
  min?: number;

  /**
   * Maximum allowed value (hard limit)
   */
  max?: number;

  /**
   * Soft minimum for drag operations (can be overridden by keyboard)
   */
  softMin?: number;

  /**
   * Soft maximum for drag operations (can be overridden by keyboard)
   */
  softMax?: number;

  /**
   * Step size for increment/decrement operations
   * @default 1
   */
  step?: number;

  /**
   * Step size when Shift is held (precision mode)
   * @default step / 10
   */
  precisionStep?: number;

  /**
   * Step size when Ctrl is held (large steps)
   * @default step * 10
   */
  largeStep?: number;

  /**
   * Number of decimal places to round to
   * @default 2
   */
  precision?: number;

  /**
   * Whether to allow mathematical expressions
   * @default true
   */
  allowExpressions?: boolean;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Drag sensitivity multiplier
   * @default 1
   */
  dragSensitivity?: number;

  /**
   * Custom format function for display
   */
  formatValue?: (value: number) => string;

  /**
   * Custom parse function for input
   */
  parseValue?: (input: string) => number | null;
}

/**
 * Props for useNumberInput hook
 */
export interface UseNumberInputProps extends UseNumberInputOptions {
  /**
   * Current numeric value
   */
  value: number;

  /**
   * Callback when value changes
   */
  onChange: (value: number) => void;
}

/**
 * State returned by useNumberInput hook
 */
export interface UseNumberInputReturn {
  /**
   * Current display value (string representation)
   */
  displayValue: string;

  /**
   * Whether currently in text editing mode
   */
  isEditing: boolean;

  /**
   * Whether currently dragging
   */
  isDragging: boolean;

  /**
   * Whether mouse is hovering over the input
   */
  isHovered: boolean;

  /**
   * Whether input has focus
   */
  isFocused: boolean;

  /**
   * Current error message (if any)
   */
  error: string | undefined;

  /**
   * Whether the current input looks like an expression
   */
  isExpression: boolean;

  /**
   * Increment value by step amount
   */
  increment: () => void;

  /**
   * Decrement value by step amount
   */
  decrement: () => void;

  /**
   * Start dragging operation
   */
  startDrag: (clientX: number) => void;

  /**
   * Update drag operation
   */
  updateDrag: (clientX: number) => void;

  /**
   * End dragging operation
   */
  endDrag: () => void;

  /**
   * Start text editing mode
   */
  startEditing: () => void;

  /**
   * End text editing mode and apply value
   */
  endEditing: () => void;

  /**
   * Cancel text editing mode without applying
   */
  cancelEditing: () => void;

  /**
   * Update the display value (during text editing)
   */
  updateDisplayValue: (value: string) => void;

  /**
   * Handle hover state changes
   */
  setHovered: (hovered: boolean) => void;

  /**
   * Handle focus state changes
   */
  setFocused: (focused: boolean) => void;

  /**
   * Handle keyboard input
   */
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Clamps a value between min and max bounds
 */
function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}

/**
 * Rounds a number to specified decimal places
 */
function roundToPrecision(value: number, precision?: number): number {
  if (precision === undefined) return value;
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

/**
 * Default formatter for display values
 */
function defaultFormatValue(value: number, precision?: number): string {
  if (precision !== undefined) {
    return value.toFixed(precision);
  }
  // Remove trailing zeros and unnecessary decimal point
  return value.toString();
}

/**
 * Hook for managing NumberInput state and interactions.
 *
 * Provides Blender-like number input functionality including:
 * - Drag to change values
 * - Keyboard input with expression evaluation
 * - Modifier key support (Ctrl, Shift)
 * - Soft and hard limits
 * - Precision control
 *
 * @param props Configuration options
 * @returns Object with state and actions
 */
export function useNumberInput({
  value,
  onChange,
  min,
  max,
  softMin,
  softMax,
  step = 1,
  precisionStep,
  largeStep,
  precision,
  allowExpressions = true,
  disabled = false,
  dragSensitivity = 1,
  formatValue,
  parseValue,
}: UseNumberInputProps): UseNumberInputReturn {
  // Calculate default step sizes if not provided
  const effectivePrecisionStep = precisionStep ?? step / 10;
  const effectiveLargeStep = largeStep ?? step * 10;
  const effectivePrecision = precision ?? 2;

  // State
  const [displayValue, setDisplayValue] = useState(() =>
    formatValue
      ? formatValue(value)
      : defaultFormatValue(value, effectivePrecision)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Refs for drag state
  const dragStartX = useRef(0);
  const dragStartValue = useRef(0);
  const accumulatedDelta = useRef(0);

  // Keyboard state
  const { modifiers } = useKeyboardContext();

  // Update display value when external value changes (but not during editing)
  useEffect(() => {
    if (!isEditing && !isDragging) {
      const formatted = formatValue
        ? formatValue(value)
        : defaultFormatValue(value, effectivePrecision);
      setDisplayValue(formatted);
      setError(undefined);
    }
  }, [value, effectivePrecision, isEditing, isDragging, formatValue]);

  /**
   * Gets the appropriate step size based on modifier keys
   */
  const getStepSize = useCallback((): number => {
    if (modifiers.shift) return effectivePrecisionStep;
    if (modifiers.control || modifiers.meta) return effectiveLargeStep;
    return step;
  }, [
    modifiers.shift,
    modifiers.control,
    modifiers.meta,
    effectivePrecisionStep,
    effectiveLargeStep,
    step,
  ]);

  /**
   * Applies a new value with proper bounds checking and rounding
   */
  const applyValue = useCallback(
    (newValue: number, useSoftLimits = false): void => {
      if (disabled) return;

      // Apply rounding
      const rounded = roundToPrecision(newValue, effectivePrecision);

      // Apply limits
      const minLimit = useSoftLimits && softMin !== undefined ? softMin : min;
      const maxLimit = useSoftLimits && softMax !== undefined ? softMax : max;
      const clamped = clamp(rounded, minLimit, maxLimit);

      if (clamped !== value) {
        onChange(clamped);
      }
    },
    [disabled, effectivePrecision, min, max, softMin, softMax, value, onChange]
  );

  /**
   * Parses and applies text input value
   */
  const parseAndApplyInput = useCallback((): boolean => {
    try {
      // Try custom parser first
      if (parseValue) {
        const parsed = parseValue(displayValue);
        if (parsed !== null && !isNaN(parsed)) {
          applyValue(parsed);
          setError(undefined);
          return true;
        }
      }

      // Try expression evaluation if allowed
      if (allowExpressions) {
        const result = parseNumericInput(displayValue);
        if (result.success && result.value !== undefined) {
          applyValue(result.value);
          setError(undefined);
          return true;
        } else {
          setError(result.error ?? 'Invalid expression');
          return false;
        }
      }

      // Fall back to simple number parsing
      const numValue = parseFloat(displayValue);
      if (!isNaN(numValue)) {
        applyValue(numValue);
        setError(undefined);
        return true;
      }

      setError('Invalid number');
      return false;
    } catch (err) {
      setError('Invalid input');
      console.error('Error parsing input:', err);
      return false;
    }
  }, [displayValue, parseValue, allowExpressions, applyValue]);

  // Actions
  const increment = useCallback(() => {
    if (disabled) return;
    const currentStep = getStepSize();
    applyValue(value + currentStep);
  }, [disabled, getStepSize, value, applyValue]);

  const decrement = useCallback(() => {
    if (disabled) return;
    const currentStep = getStepSize();
    applyValue(value - currentStep);
  }, [disabled, getStepSize, value, applyValue]);

  const startDrag = useCallback(
    (clientX: number) => {
      if (disabled) return;
      setIsDragging(true);
      dragStartX.current = clientX;
      dragStartValue.current = value;
      accumulatedDelta.current = 0;
      document.body.style.cursor = 'ew-resize';
    },
    [disabled, value]
  );

  const updateDrag = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled) return;

      const deltaX = clientX - dragStartX.current;
      const currentStep = getStepSize();
      const sensitivity = dragSensitivity;

      // Accumulate fractional changes for smooth dragging
      const pixelsPerStep = 5; // Pixels needed to trigger one step
      const totalDelta = (deltaX * sensitivity) / pixelsPerStep;

      // Only update if we've moved enough for at least one step
      const steps = Math.floor(totalDelta);
      if (steps !== Math.floor(accumulatedDelta.current)) {
        accumulatedDelta.current = totalDelta;
        const newValue = dragStartValue.current + steps * currentStep;

        // Use soft limits for dragging
        applyValue(newValue, true);

        // Update display to show current value
        const formatted = formatValue
          ? formatValue(newValue)
          : defaultFormatValue(newValue, effectivePrecision);
        setDisplayValue(formatted);
      }
    },
    [
      isDragging,
      disabled,
      getStepSize,
      dragSensitivity,
      applyValue,
      formatValue,
      effectivePrecision,
    ]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    // Refresh display value to ensure it matches the current value
    const formatted = formatValue
      ? formatValue(value)
      : defaultFormatValue(value, effectivePrecision);
    setDisplayValue(formatted);
  }, [value, formatValue, effectivePrecision]);

  const startEditing = useCallback(() => {
    if (disabled) return;
    setIsEditing(true);
    setError(undefined);
    // Place cursor at end of input
    setTimeout(() => {
      const input = document.activeElement as HTMLInputElement;
      if (input) {
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }, 0);
  }, [disabled]);

  const endEditing = useCallback(() => {
    if (parseAndApplyInput()) {
      setIsEditing(false);
    }
    // If parsing failed, stay in editing mode to show error
  }, [parseAndApplyInput]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    const formatted = formatValue
      ? formatValue(value)
      : defaultFormatValue(value, effectivePrecision);
    setDisplayValue(formatted);
    setError(undefined);
  }, [value, effectivePrecision, formatValue]);

  const updateDisplayValue = useCallback(
    (newValue: string) => {
      setDisplayValue(newValue);
      // Clear error when user starts typing
      if (error) {
        setError(undefined);
      }
    },
    [error]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          if (isEditing) {
            endEditing();
          } else {
            startEditing();
          }
          break;

        case 'Escape':
          event.preventDefault();
          if (isEditing) {
            cancelEditing();
          }
          break;

        case 'ArrowUp':
          if (!isEditing) {
            event.preventDefault();
            increment();
          }
          break;

        case 'ArrowDown':
          if (!isEditing) {
            event.preventDefault();
            decrement();
          }
          break;

        case '-':
          // Only negate when not editing and minus is pressed alone (not in the middle of text)
          if (!isEditing) {
            event.preventDefault();
            applyValue(-value);
          }
          break;
      }
    },
    [
      disabled,
      isEditing,
      endEditing,
      startEditing,
      cancelEditing,
      increment,
      decrement,
      value,
      applyValue,
    ]
  );

  // Determine if current input looks like an expression
  const isExpressionValue = allowExpressions && isExpression(displayValue);

  return {
    // State
    displayValue,
    isEditing,
    isDragging,
    isHovered,
    isFocused,
    error,
    isExpression: isExpressionValue,

    // Actions
    increment,
    decrement,
    startDrag,
    updateDrag,
    endDrag,
    startEditing,
    endEditing,
    cancelEditing,
    updateDisplayValue,
    setHovered: setIsHovered,
    setFocused: setIsFocused,
    handleKeyDown,
  };
}
