import React from 'react';
import styled from '@emotion/styled';
import type { ColorSwatchProps, ColorPickerSize } from './ColorPicker.types';

const SWATCH_SIZE_MAP: Record<ColorPickerSize, number> = {
  sm: 20,
  md: 24,
  lg: 32,
};

interface StyledSwatchProps {
  $size: number;
  $shape: 'square' | 'circle';
  $disabled: boolean;
}

const StyledSwatch = styled.button<StyledSwatchProps>`
  /* Reset */
  margin: 0;
  padding: 0;
  border: 1px solid ${props => props.theme.colors.border.default};
  font-family: inherit;
  outline: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};

  /* Size */
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  flex-shrink: 0;

  /* Shape */
  border-radius: ${props =>
    props.$shape === 'circle' ? '50%' : `${props.theme.borderRadius.sm}px`};

  /* Checkerboard for alpha */
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0px;

  /* Disabled */
  opacity: ${props => (props.$disabled ? 0.5 : 1)};

  /* Transition */
  transition: border-color ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.border.focus};
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

const StyledSwatchColor = styled.span`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
`;

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = 'md',
  shape = 'square',
  disabled = false,
  onClick,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const pixelSize = SWATCH_SIZE_MAP[size];

  return (
    <StyledSwatch
      ref={ref}
      type="button"
      $size={pixelSize}
      $shape={shape}
      $disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={style}
      data-testid={testId}
      aria-label={rest['aria-label'] ?? `Color: ${color}`}
      {...rest}
    >
      <StyledSwatchColor style={{ background: color }} />
    </StyledSwatch>
  );
};

ColorSwatch.displayName = 'ColorSwatch';
