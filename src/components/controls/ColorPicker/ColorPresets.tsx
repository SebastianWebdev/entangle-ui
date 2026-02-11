import React, { useCallback } from 'react';
import type { ColorPreset } from './ColorPicker.types';
import {
  presetsGridStyle,
  presetButtonRecipe,
  presetColorStyle,
} from './ColorPicker.css';

interface ColorPresetsProps {
  presets: ColorPreset[];
  currentColor: string;
  onSelect: (color: string) => void;
}

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
    <div
      className={presetsGridStyle}
      role="radiogroup"
      aria-label="Color presets"
    >
      {presets.map((preset, i) => (
        <button
          key={`${preset.color}-${i}`}
          type="button"
          role="radio"
          aria-checked={preset.color.toLowerCase() === normalizedCurrent}
          aria-label={preset.label ?? preset.color}
          title={preset.label ?? preset.color}
          className={presetButtonRecipe({
            selected: preset.color.toLowerCase() === normalizedCurrent,
          })}
          onClick={() => handleClick(preset.color)}
        >
          <span
            className={presetColorStyle}
            style={{ background: preset.color }}
          />
        </button>
      ))}
    </div>
  );
};

ColorPresets.displayName = 'ColorPresets';
