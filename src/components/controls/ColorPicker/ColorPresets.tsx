import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import type { ColorPreset } from './ColorPicker.types';

interface ColorPresetsProps {
  presets: ColorPreset[];
  currentColor: string;
  onSelect: (color: string) => void;
}

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
  overflow: hidden;
  padding: 4px;
`;

interface StyledPresetProps {
  $selected: boolean;
}

const StyledPreset = styled.button<StyledPresetProps>`
  /* Reset */
  margin: 0;
  padding: 0;
  border: ${props =>
    props.$selected
      ? `2px solid ${props.theme.colors.text.primary}`
      : '1px solid transparent'};
  font-family: inherit;
  outline: none;
  cursor: pointer;
  background: transparent;

  /* Size */
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  transition:
    transform ${props => props.theme.transitions.fast},
    border-color ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.15);
    z-index: 1;
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

const StyledPresetColor = styled.span`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
`;

export const ColorPresets: React.FC<ColorPresetsProps> = ({
  presets,
  currentColor,
  onSelect,
}) => {
  const handleClick = useCallback(
    (color: string) => {
      onSelect(color);
    },
    [onSelect]
  );

  const normalizedCurrent = currentColor.toLowerCase();

  return (
    <StyledGrid role="radiogroup" aria-label="Color presets">
      {presets.map((preset, i) => (
        <StyledPreset
          key={`${preset.color}-${i}`}
          type="button"
          role="radio"
          aria-checked={preset.color.toLowerCase() === normalizedCurrent}
          aria-label={preset.label ?? preset.color}
          title={preset.label ?? preset.color}
          $selected={preset.color.toLowerCase() === normalizedCurrent}
          onClick={() => handleClick(preset.color)}
        >
          <StyledPresetColor style={{ background: preset.color }} />
        </StyledPreset>
      ))}
    </StyledGrid>
  );
};

ColorPresets.displayName = 'ColorPresets';
