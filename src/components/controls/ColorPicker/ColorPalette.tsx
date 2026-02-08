import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { Collapsible } from '@/components/primitives/Collapsible';
import type { PaletteColor } from './palettes';

interface ColorPaletteProps {
  palette: PaletteColor[];
  currentColor: string;
  onSelect: (color: string) => void;
  /** Title displayed in the collapsible header @default "Palette" */
  title?: string;
  /** Whether the palette starts expanded @default false */
  defaultExpanded?: boolean;
}

const StyledPaletteContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs}px;
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.surface.hover};
    border-radius: 2px;
  }
`;

const StyledPaletteRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;
`;

const StyledRowLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  color: ${props => props.theme.colors.text.muted};
  width: 18px;
  flex-shrink: 0;
  text-align: center;
  overflow: hidden;
  user-select: none;
`;

interface StyledShadeProps {
  $selected: boolean;
}

const StyledShade = styled.button<StyledShadeProps>`
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

  /* Layout */
  flex: 1;
  aspect-ratio: 1;
  min-width: 0;
  border-radius: 1px;
  transition:
    transform ${props => props.theme.transitions.fast},
    border-color ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.3);
    z-index: 1;
    position: relative;
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

const StyledShadeColor = styled.span`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
`;

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  palette,
  currentColor,
  onSelect,
  title = 'Palette',
  defaultExpanded = false,
}) => {
  const handleSelect = useCallback(
    (color: string) => {
      onSelect(color);
    },
    [onSelect]
  );

  const normalizedCurrent = currentColor.toLowerCase();

  return (
    <Collapsible trigger={title} defaultOpen={defaultExpanded} size="sm">
      <StyledPaletteContainer role="radiogroup" aria-label="Color palette">
        {palette.map(color => (
          <StyledPaletteRow key={color.name}>
            <StyledRowLabel>{color.name.slice(0, 2)}</StyledRowLabel>
            {color.shades.map(shade => (
              <StyledShade
                key={shade.color}
                type="button"
                role="radio"
                aria-checked={shade.color.toLowerCase() === normalizedCurrent}
                aria-label={`${color.name} ${shade.label}`}
                title={`${color.name} ${shade.label} (${shade.color})`}
                $selected={shade.color.toLowerCase() === normalizedCurrent}
                onClick={() => handleSelect(shade.color)}
              >
                <StyledShadeColor style={{ background: shade.color }} />
              </StyledShade>
            ))}
          </StyledPaletteRow>
        ))}
      </StyledPaletteContainer>
    </Collapsible>
  );
};

ColorPalette.displayName = 'ColorPalette';

export type { ColorPaletteProps };
