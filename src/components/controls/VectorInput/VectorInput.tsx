import React, { useState, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import type { Theme } from '@/theme';
import type { VectorInputProps, VectorInputSize } from './VectorInput.types';
import { NumberInput } from '@/components/controls/NumberInput';
import { FormLabel } from '@/components/form/FormLabel';
import { FormHelperText } from '@/components/form/FormHelperText';

// --- Label presets ---

const LABEL_PRESETS: Record<string, string[]> = {
  xyz: ['X', 'Y', 'Z', 'W'],
  rgba: ['R', 'G', 'B', 'A'],
  uvw: ['U', 'V', 'W'],
};

// --- Color presets ---

const SPATIAL_COLORS = ['#EF4444', '#22C55E', '#3B82F6', '#A855F7'];
const COLOR_COLORS = ['#EF4444', '#22C55E', '#3B82F6', '#FFFFFF'];

function getAxisColor(
  colorPreset: string,
  axisColors: string[] | undefined,
  axisIndex: number
): string | null {
  if (colorPreset === 'custom' && axisColors) {
    return axisColors[axisIndex] ?? null;
  }
  if (colorPreset === 'spatial') {
    return SPATIAL_COLORS[axisIndex] ?? null;
  }
  if (colorPreset === 'color') {
    return COLOR_COLORS[axisIndex] ?? null;
  }
  // 'none' — will be resolved via theme in styled component
  return null;
}

function getAxisLabels(
  labelPreset: string,
  axisLabels: string[] | undefined,
  dimension: number
): string[] {
  if (labelPreset === 'custom' && axisLabels) {
    return axisLabels;
  }
  const preset = LABEL_PRESETS[labelPreset];
  if (preset) {
    return preset.slice(0, dimension);
  }
  return Array.from({ length: dimension }, (_, i) => String(i));
}

// --- Styled components ---

const StyledVectorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface StyledVectorRowProps {
  $direction: 'row' | 'column';
  $gap: number;
}

const StyledVectorRow = styled.div<StyledVectorRowProps>`
  display: flex;
  flex-direction: ${props => props.$direction};
  gap: ${props => props.$gap}px;
  align-items: ${props => (props.$direction === 'row' ? 'center' : 'stretch')};
`;

interface StyledAxisInputProps {
  $direction: 'row' | 'column';
}

const StyledAxisInput = styled.div<StyledAxisInputProps>`
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0;
`;

interface StyledAxisLabelProps {
  $color: string | null;
  $size: VectorInputSize;
}

const axisLabelSizes: Record<
  VectorInputSize,
  { width: string; fontSizeKey: keyof Theme['typography']['fontSize'] }
> = {
  sm: { width: '16px', fontSizeKey: 'xs' },
  md: { width: '18px', fontSizeKey: 'xs' },
  lg: { width: '22px', fontSizeKey: 'sm' },
};

const StyledAxisLabel = styled.div<StyledAxisLabelProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => axisLabelSizes[props.$size].width};
  min-width: ${props => axisLabelSizes[props.$size].width};
  height: ${props => axisLabelSizes[props.$size].width};
  font-size: ${props =>
    props.theme.typography.fontSize[axisLabelSizes[props.$size].fontSizeKey]}px;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$color ?? props.theme.colors.text.secondary};
  background: ${props =>
    props.$color
      ? `${props.$color}33`
      : `${props.theme.colors.text.secondary}33`};
  border-radius: ${props => props.theme.borderRadius.sm}px;
  user-select: none;
  flex-shrink: 0;
  margin-right: ${props => props.theme.spacing.xs}px;
`;

interface StyledLinkButtonProps {
  $active: boolean;
  $size: VectorInputSize;
}

const linkButtonSizes: Record<VectorInputSize, string> = {
  sm: '20px',
  md: '24px',
  lg: '32px',
};

const StyledLinkButton = styled.button<StyledLinkButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => linkButtonSizes[props.$size]};
  height: ${props => linkButtonSizes[props.$size]};
  min-width: ${props => linkButtonSizes[props.$size]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.sm}px;
  background: ${props =>
    props.$active ? `${props.theme.colors.accent.primary}22` : 'transparent'};
  color: ${props =>
    props.$active
      ? props.theme.colors.accent.primary
      : props.theme.colors.text.muted};
  cursor: pointer;
  padding: 0;
  margin-left: ${props => props.theme.spacing.xs}px;
  transition: all ${props => props.theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.surface.hover};
    color: ${props =>
      props.$active
        ? props.theme.colors.accent.primary
        : props.theme.colors.text.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// SVG icons for link/unlink
const LinkIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M6.5 9.5L9.5 6.5M5.5 7.5L4.146 8.854a2 2 0 002.708 2.708L8.5 10.5M7.5 5.5l1.646-1.646a2 2 0 012.708 2.708L10.5 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UnlinkIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M5.5 7.5L4.146 8.854a2 2 0 002.708 2.708L8.5 10.5M7.5 5.5l1.646-1.646a2 2 0 012.708 2.708L10.5 8.5M4 4l8 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * A grouped numeric input for Vec2, Vec3, and Vec4 vectors.
 *
 * Used for position, rotation, scale, color channels, UV coordinates,
 * bounding box extents, and more. Composes NumberInput with per-axis labels,
 * optional color coding, and linked/unlinked proportional editing.
 *
 * @example
 * ```tsx
 * <VectorInput
 *   label="Position"
 *   value={[0, 0, 0]}
 *   onChange={(val) => setPosition(val)}
 *   unit="px"
 * />
 * ```
 */
export const VectorInput = ({
  value: controlledValue,
  defaultValue,
  dimension = 3,
  labelPreset = 'xyz',
  axisLabels: customAxisLabels,
  colorPreset = 'spatial',
  axisColors: customAxisColors,
  min,
  max,
  step,
  precisionStep,
  largeStep,
  precision,
  unit,
  size = 'md',
  label,
  helperText,
  error = false,
  errorMessage,
  disabled = false,
  showLink = false,
  defaultLinked = false,
  linked: controlledLinked,
  onLinkedChange,
  direction = 'row',
  gap = 2,
  onChange,
  onChangeComplete,
  className,
  testId,
  ...rest
}: VectorInputProps) => {
  // Internal value state (uncontrolled mode)
  const [internalValue, setInternalValue] = useState<number[]>(
    () => defaultValue ?? Array.from({ length: dimension }, () => 0)
  );
  const currentValue = controlledValue ?? internalValue;

  // Internal linked state (uncontrolled mode)
  const [internalLinked, setInternalLinked] = useState(defaultLinked);
  const isLinked = controlledLinked ?? internalLinked;

  // Ref to track value before linked changes for proportional math
  const prevValueRef = useRef<number[]>(currentValue);

  // Keep prevValueRef up to date when value changes externally
  React.useEffect(() => {
    prevValueRef.current = currentValue;
  }, [currentValue]);

  // Handle link toggle
  const handleLinkToggle = useCallback(() => {
    const newLinked = !isLinked;
    if (controlledLinked === undefined) {
      setInternalLinked(newLinked);
    }
    onLinkedChange?.(newLinked);
  }, [isLinked, controlledLinked, onLinkedChange]);

  // Handle axis value change
  const handleAxisChange = useCallback(
    (axisIndex: number, newAxisValue: number) => {
      const prevVector = prevValueRef.current;
      let nextValue: number[];

      if (isLinked) {
        const oldAxisValue = prevVector[axisIndex] ?? 0;
        if (oldAxisValue !== 0) {
          // Proportional scaling
          const ratio = newAxisValue / oldAxisValue;
          nextValue = prevVector.map((v, i) =>
            i === axisIndex ? newAxisValue : v * ratio
          );
        } else {
          // Additive delta when old value is 0
          const delta = newAxisValue - oldAxisValue;
          nextValue = prevVector.map((v, i) =>
            i === axisIndex ? newAxisValue : v + delta
          );
        }
      } else {
        nextValue = currentValue.map((v, i) =>
          i === axisIndex ? newAxisValue : v
        );
      }

      prevValueRef.current = nextValue;

      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue, axisIndex);
    },
    [isLinked, currentValue, controlledValue, onChange]
  );

  // Handle commit (blur/Enter on any NumberInput)
  const handleCommit = useCallback(() => {
    onChangeComplete?.(prevValueRef.current);
  }, [onChangeComplete]);

  // Resolve labels
  const labels = getAxisLabels(labelPreset, customAxisLabels, dimension);

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  return (
    <StyledVectorContainer
      className={className}
      data-testid={testId}
      role="group"
      aria-label={label ?? 'Vector input'}
      {...rest}
    >
      {label && <FormLabel disabled={disabled}>{label}</FormLabel>}

      <StyledVectorRow $direction={direction} $gap={gap}>
        {Array.from({ length: dimension }, (_, i) => {
          const axisLabel = labels[i] ?? String(i);
          const axisValue = currentValue[i] ?? 0;
          const axisColor = getAxisColor(colorPreset, customAxisColors, i);

          return (
            <StyledAxisInput key={i} $direction={direction}>
              <StyledAxisLabel $color={axisColor} $size={size}>
                {axisLabel}
              </StyledAxisLabel>
              <NumberInput
                value={axisValue}
                onChange={(val: number) => handleAxisChange(i, val)}
                onBlur={handleCommit}
                min={min}
                max={max}
                step={step}
                precisionStep={precisionStep}
                largeStep={largeStep}
                precision={precision}
                unit={unit}
                size={size}
                disabled={disabled}
                showStepButtons={false}
                aria-label={`${axisLabel} axis`}
              />
            </StyledAxisInput>
          );
        })}

        {showLink && (
          <StyledLinkButton
            type="button"
            $active={isLinked}
            $size={size}
            onClick={handleLinkToggle}
            disabled={disabled}
            aria-pressed={isLinked}
            aria-label={isLinked ? 'Unlink axes' : 'Link axes'}
            title={isLinked ? 'Unlink axes' : 'Link axes'}
          >
            {isLinked ? (
              <LinkIcon size={iconSize} />
            ) : (
              <UnlinkIcon size={iconSize} />
            )}
          </StyledLinkButton>
        )}
      </StyledVectorRow>

      {(error && errorMessage) || helperText ? (
        <FormHelperText error={error && !!errorMessage}>
          {error && errorMessage ? errorMessage : helperText}
        </FormHelperText>
      ) : null}
    </StyledVectorContainer>
  );
};

VectorInput.displayName = 'VectorInput';
