// src/components/controls/Slider/Slider.tsx
import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';
import { useModifierKeys } from '@/hooks/useKeyboard';
import { FormLabel, FormHelperText, InputWrapper } from '@/components/form';

/**
 * Props specific to Slider component
 */
export interface SliderBaseProps extends Omit<BaseComponent, 'onChange'> {
  /**
   * Current numeric value
   */
  value: number;
  
  /**
   * Callback when value changes
   */
  onChange: (value: number) => void;
  
  /**
   * Minimum allowed value
   * @default 0
   */
  min?: number;
  
  /**
   * Maximum allowed value
   * @default 100
   */
  max?: number;
  
  /**
   * Step size for value increments
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
   */
  precision?: number;
  
  /**
   * Slider size using standard library sizing
   * - `sm`: Compact for toolbars
   * - `md`: Standard for forms
   * - `lg`: Prominent sliders
   * @default "md"
   */
  size?: Size;
  
  /**
   * Whether the slider is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the slider is read-only
   * @default false
   */
  readOnly?: boolean;
  
  /**
   * Slider label
   */
  label?: string;
  
  /**
   * Helper text displayed below the slider
   */
  helperText?: string;
  
  /**
   * Error message displayed when error is true
   */
  errorMessage?: string;
  
  /**
   * Whether the slider has an error state
   * @default false
   */
  error?: boolean;
  
  /**
   * Whether the slider is required
   * @default false
   */
  required?: boolean;
  
  /**
   * Unit suffix to display (e.g., "px", "%", "°")
   */
  unit?: string;
  
  /**
   * Format value for display
   */
  formatValue?: (value: number) => string;
  
  /**
   * Show value tooltip while dragging
   * @default true
   */
  showTooltip?: boolean;
  
  /**
   * Show tick marks along the track
   * @default false
   */
  showTicks?: boolean;
  
  /**
   * Number of tick marks to show (when showTicks is true)
   * @default 5
   */
  tickCount?: number;
  
  /**
   * Focus event handler
   */
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  
  /**
   * Blur event handler
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  
  /**
   * Key down event handler
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
}

/**
 * Props for the Slider component with prettified type for better IntelliSense
 */
export type SliderProps = Prettify<SliderBaseProps>;

interface StyledSliderContainerProps {
  $size: Size;
  $disabled: boolean;
}

const StyledSliderContainer = styled.div<StyledSliderContainerProps>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs}px;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
`;


const StyledSliderWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 0px 0;
  width: 100%;
`;

interface StyledTrackProps {
  $size: Size;
  $error: boolean;
}

const StyledTrack = styled.div<StyledTrackProps>`
  position: relative;
  flex: 1;
  background: ${props => props.$error ? props.theme.colors.accent.error : props.theme.colors.surface.default};
  border: 1px solid ${props => props.$error ? props.theme.colors.border.error : props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.sm}px;
  overflow: hidden;
  
  ${props => {
    const sizes = {
      sm: '4px',
      md: '6px', 
      lg: '8px',
    };
    return `height: ${sizes[props.$size]};`;
  }}
  
  &:hover {
    border-color: ${props => props.$error ? props.theme.colors.border.error : props.theme.colors.border.focus};
  }
`;

interface StyledFillProps {
  $percentage: number;
  $error: boolean;
  $isDragging: boolean;
}

const StyledFill = styled.div<StyledFillProps>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${props => props.$percentage}%;
  background: ${props => props.$error ? props.theme.colors.accent.error : props.theme.colors.accent.primary};
  transition: ${props => props.$isDragging ? 'none' : 'width 0.1s ease-out'};
`;

interface StyledThumbProps {
  $size: Size;
  $percentage: number;
  $isDragging: boolean;
  $error: boolean;
}

const StyledThumb = styled.div<StyledThumbProps>`
  position: absolute;
  top: 50%;
  left: ${props => props.$percentage}%;
  transform: translate(-50%, -50%);
  background: ${props => props.$error ? props.theme.colors.accent.error : props.theme.colors.accent.primary};
  border: 2px solid ${props => props.theme.colors.background.primary};
  border-radius: 50%;
  cursor: grab;
  transition: ${props => props.$isDragging ? 'none' : `all ${props.theme.transitions.fast}`};
  box-shadow: ${props => props.theme.shadows.sm};
  
  ${props => {
    const sizes = {
      sm: '12px',
      md: '16px',
      lg: '20px', 
    };
    return `
      width: ${sizes[props.$size]};
      height: ${sizes[props.$size]};
    `;
  }}
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  ${props => props.$isDragging && `
    cursor: grabbing;
    transform: translate(-50%, -50%) scale(1.15);
    box-shadow: ${props.theme.shadows.lg};
  `}
`;

interface StyledTicksProps {
  $tickCount: number;
  $size: Size;
}

const StyledTicks = styled.div<StyledTicksProps>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 0;
    right: 0;
    height: 1px;
    background: ${props => props.theme.colors.border.default};
  }
`;

const StyledTick = styled.div`
  width: 1px;
  height: 4px;
  background: ${props => props.theme.colors.text.muted};
  margin-top: 2px;
`;

interface StyledTooltipProps {
  $percentage: number;
  $visible: boolean;
}

const StyledTooltip = styled.div<StyledTooltipProps>`
  position: absolute;
  bottom: calc(100% + 8px);
  left: ${props => props.$percentage}%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.sm}px;
  padding: 4px 8px;
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateX(-50%) ${props => props.$visible ? 'translateY(0)' : 'translateY(4px)'};
  transition: all ${props => props.theme.transitions.fast};
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid ${props => props.theme.colors.border.default};
  }
`;


/**
 * Clamps a value between min and max bounds
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
 * A professional slider component with drag interaction and keyboard support.
 * 
 * Features:
 * - Smooth drag interaction with visual feedback
 * - Keyboard navigation with arrow keys
 * - Modifier key support: Ctrl (large steps), Shift (precision)
 * - Optional tick marks and value tooltip
 * - Comprehensive theming and size variants
 * - Accessible with proper ARIA attributes
 * 
 * @example
 * ```tsx
 * // Basic slider
 * <Slider 
 *   value={opacity}
 *   onChange={setOpacity}
 *   min={0}
 *   max={1}
 *   step={0.1}
 *   unit="%"
 * />
 * 
 * // Slider with ticks and custom formatting
 * <Slider
 *   value={rotation}
 *   onChange={setRotation}
 *   min={0}
 *   max={360}
 *   step={15}
 *   unit="°"
 *   showTicks
 *   tickCount={8}
 *   formatValue={(v) => `${v}°`}
 * />
 * 
 * // Precision slider for fine control
 * <Slider
 *   value={scale}
 *   onChange={setScale}
 *   min={0.1}
 *   max={5}
 *   step={0.1}
 *   precisionStep={0.01}
 *   largeStep={1}
 *   precision={2}
 * />
 * ```
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  precisionStep,
  largeStep,
  precision = 2,
  size = 'md',
  disabled = false,
  readOnly = false,
  label,
  helperText,
  errorMessage,
  error = false,
  required = false,
  unit,
  formatValue,
  showTooltip = true,
  showTicks = false,
  tickCount = 5,
  className,
  testId,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startValue: number } | null>(null);
  
  const modifiers = useModifierKeys();
  console.log('Modifiers:', modifiers);
  
  // Calculate derived values
  const effectivePrecisionStep = precisionStep ?? step / 10;
  const effectiveLargeStep = largeStep ?? step * 10;
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedValue = clamp(value, min, max);
  
  const getStepSize = useCallback((): number => {
    if (modifiers.shift) return effectivePrecisionStep;
    if (modifiers.ctrl || modifiers.meta) return effectiveLargeStep;
    return step;
  }, [modifiers.shift, modifiers.ctrl, modifiers.meta, effectivePrecisionStep, effectiveLargeStep, step]);
  
  // Format display value with consistent precision to prevent tooltip size changes
  const displayValue = formatValue 
    ? formatValue(clampedValue)
    : unit 
    ? `${precision !== undefined ? clampedValue.toFixed(precision) : clampedValue}${unit}`
    : precision !== undefined ? clampedValue.toFixed(precision) : clampedValue.toString();


  /**
   * Applies a new value with proper bounds checking and rounding
   */
  const applyValue = useCallback((newValue: number): void => {
    if (disabled || readOnly) return;
    
    if (newValue === value) return;
    
    const rounded = roundToPrecision(newValue, precision);
    const clamped = clamp(rounded, min, max);
    
    if (clamped !== value) {
      onChange(clamped);
    }
  }, [disabled, readOnly, precision, min, max, value, onChange]);

  /**
   * Converts mouse position to value
   */
  const positionToValue = useCallback((clientX: number): number => {
    if (!trackRef.current) return value;
    
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = clamp((clientX - rect.left) / rect.width, 0, 1);
    const newValue = min + percentage * (max - min);
    
    // Używamy aktualnego kroku (zależnego od modyfikatorów klawiszy)
    const currentStep = getStepSize();
    
    // Snap to step increments
    const steps = Math.round((newValue - min) / currentStep);
    return min + steps * currentStep;
  }, [min, max, value, getStepSize]);

  /**
   * Handle mouse down on track or thumb
   */
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled || readOnly) return;
    
    event.preventDefault();
    setIsDragging(true);
    setShowTooltipState(showTooltip);
    
    // Używamy aktualnego kroku (zależnego od modyfikatorów klawiszy)
    const newValue = positionToValue(event.clientX);
    applyValue(newValue);
    
    dragStartRef.current = {
      startX: event.clientX,
      startValue: newValue,
    };
  }, [disabled, readOnly, positionToValue, applyValue, showTooltip]);

  /**
   * Handle global mouse move during drag
   */
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    // Używamy requestAnimationFrame dla płynniejszego działania
    requestAnimationFrame(() => {
      // Używamy aktualnego kroku (zależnego od modyfikatorów klawiszy)
      const newValue = positionToValue(event.clientX);
      applyValue(newValue);
    });
  }, [isDragging, positionToValue, applyValue]);

  /**
   * Handle global mouse up to end drag
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setShowTooltipState(false);
    dragStartRef.current = null;
  }, []);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (disabled || readOnly) return;
    
    const currentStep = getStepSize();
    let handled = true;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        applyValue(value + currentStep);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        applyValue(value - currentStep);
        break;
      case 'Home':
        applyValue(min);
        break;
      case 'End':
        applyValue(max);
        break;
      case 'PageUp':
        applyValue(value + effectiveLargeStep);
        break;
      case 'PageDown':
        applyValue(value - effectiveLargeStep);
        break;
      default:
        handled = false;
    }
    
    if (handled) {
      event.preventDefault();
    }
    
    onKeyDown?.(event);
  }, [
    disabled, 
    readOnly, 
    getStepSize, 
    applyValue, 
    value, 
    min, 
    max, 
    effectiveLargeStep, 
    onKeyDown
  ]);

  /**
   * Handle focus events
   */
  const handleFocus = useCallback((event: React.FocusEvent<HTMLElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  }, [onFocus]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  }, [onBlur]);

  // Global mouse events for dragging
  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate tick marks
  const ticks = showTicks ? Array.from({ length: tickCount }, (_, i) => i) : [];

  const sliderId = React.useId();

  return (
    <StyledSliderContainer
      className={className}
      $size={size}
      $disabled={disabled}
      data-testid={testId}
      {...props}
    >
      {label && (
        <FormLabel 
          htmlFor={sliderId} 
          disabled={disabled}
          required={required}
        >
          {label}
        </FormLabel>
      )}
      
      <InputWrapper
        size={size}
        error={error}
        disabled={disabled}
        focused={isFocused}
        css={{ border:'none', background: 'transparent', padding: 0, height: 5 }}
      >
        <StyledSliderWrapper
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          aria-valuetext={displayValue}
          aria-disabled={disabled}
          aria-readonly={readOnly}
          aria-required={required}
          aria-invalid={error}
          aria-labelledby={label ? sliderId : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          
        >
        <StyledTrack ref={trackRef} $size={size} $error={error}>
          <StyledFill $percentage={percentage} $error={error} $isDragging={isDragging} />
        </StyledTrack>
        
        <StyledThumb
          $size={size}
          $percentage={percentage}
          $isDragging={isDragging}
          $error={error}
        />
        
        {showTicks && (
          <StyledTicks $tickCount={tickCount} $size={size}>
            {ticks.map(i => (
              <StyledTick key={i} />
            ))}
          </StyledTicks>
        )}
        
        {showTooltip && (
          <StyledTooltip
            $percentage={percentage}
            $visible={showTooltipState}
          >
            {displayValue}
          </StyledTooltip>
        )}
        </StyledSliderWrapper>
      </InputWrapper>
      
      {(helperText || (error && errorMessage)) && (
        <FormHelperText error={error}>
          {error && errorMessage ? errorMessage : helperText}
        </FormHelperText>
      )}
    </StyledSliderContainer>
  );
};
