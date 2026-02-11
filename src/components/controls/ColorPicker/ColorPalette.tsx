import React, { useCallback } from 'react';
import { Collapsible } from '@/components/primitives/Collapsible';
import type { PaletteColor } from './palettes';
import {
  paletteContainerStyle,
  paletteRowStyle,
  paletteRowLabelStyle,
  paletteShadeRecipe,
  paletteShadeColorStyle,
} from './ColorPicker.css';

interface ColorPaletteProps {
  palette: PaletteColor[];
  currentColor: string;
  onSelect: (color: string) => void;
  /** Title displayed in the collapsible header @default "Palette" */
  title?: string;
  /** Whether the palette starts expanded @default false */
  defaultExpanded?: boolean;
}

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
      <div
        className={paletteContainerStyle}
        role="radiogroup"
        aria-label="Color palette"
      >
        {palette.map(color => (
          <div className={paletteRowStyle} key={color.name}>
            <span className={paletteRowLabelStyle}>
              {color.name.slice(0, 2)}
            </span>
            {color.shades.map(shade => (
              <button
                key={shade.color}
                type="button"
                role="radio"
                aria-checked={shade.color.toLowerCase() === normalizedCurrent}
                aria-label={`${color.name} ${shade.label}`}
                title={`${color.name} ${shade.label} (${shade.color})`}
                className={paletteShadeRecipe({
                  selected: shade.color.toLowerCase() === normalizedCurrent,
                })}
                onClick={() => handleSelect(shade.color)}
              >
                <span
                  className={paletteShadeColorStyle}
                  style={{ background: shade.color }}
                />
              </button>
            ))}
          </div>
        ))}
      </div>
    </Collapsible>
  );
};

ColorPalette.displayName = 'ColorPalette';

export type { ColorPaletteProps };
