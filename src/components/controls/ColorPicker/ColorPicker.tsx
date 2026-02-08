import React from 'react';
import styled from '@emotion/styled';
import { Popover } from '@/components/primitives/Popover/Popover';
import { PopoverTrigger } from '@/components/primitives/Popover/PopoverTrigger';
import { PopoverContent } from '@/components/primitives/Popover/PopoverContent';
import { ColorSwatch } from './ColorSwatch';
import { ColorArea } from './ColorArea';
import { HueSlider } from './HueSlider';
import { AlphaSlider } from './AlphaSlider';
import { ColorInputs } from './ColorInputs';
import { ColorPresets } from './ColorPresets';
import { ColorPalette } from './ColorPalette';
import {
  MATERIAL_PALETTE,
  TAILWIND_PALETTE,
  PASTEL_PALETTE,
  EARTH_PALETTE,
  NEON_PALETTE,
  MONOCHROME_PALETTE,
  SKIN_TONES_PALETTE,
  VINTAGE_PALETTE,
} from './palettes';
import { useColor } from './useColor';
import type { ColorPickerProps } from './ColorPicker.types';
import type { Palette, PaletteColor } from './palettes';

// --- Styled ---

const StyledPickerBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg}px;
`;

const StyledTriggerRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm}px;
`;

const StyledLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  color: ${props => props.theme.colors.text.secondary};
`;

// --- Component ---

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  defaultValue = '#007acc',
  format = 'hex',
  showAlpha = false,
  inputModes = ['hex', 'rgb', 'hsl'],
  defaultInputMode = 'hex',
  presets,
  showEyeDropper = false,
  palette,
  size = 'md',
  swatchShape = 'square',
  label,
  disabled = false,
  inline = false,
  pickerWidth = 240,
  onChange,
  onChangeComplete,
  className,
  style,
  testId,
  ...rest
}) => {
  const colorState = useColor({
    value,
    defaultValue,
    format,
    onChange,
    onChangeComplete,
  });

  const PALETTE_MAP: Record<string, Palette> = {
    material: MATERIAL_PALETTE,
    tailwind: TAILWIND_PALETTE,
    pastel: PASTEL_PALETTE,
    earth: EARTH_PALETTE,
    neon: NEON_PALETTE,
    monochrome: MONOCHROME_PALETTE,
    'skin-tones': SKIN_TONES_PALETTE,
    vintage: VINTAGE_PALETTE,
  };

  const resolvedPalette: { colors: PaletteColor[]; title: string } | undefined =
    (() => {
      if (!palette) return undefined;
      if (typeof palette === 'string') {
        const found = PALETTE_MAP[palette];
        return found ? { colors: found.colors, title: found.name } : undefined;
      }
      if (Array.isArray(palette)) {
        return { colors: palette, title: 'Palette' };
      }
      return { colors: palette.colors, title: palette.name };
    })();

  const pickerBody = (
    <StyledPickerBody data-testid={testId ? `${testId}-panel` : undefined}>
      <ColorArea
        hue={colorState.hsva.h}
        saturation={colorState.hsva.s}
        value={colorState.hsva.v}
        onChange={colorState.setSaturationValue}
        onChangeComplete={colorState.commitChange}
      />
      <HueSlider
        hue={colorState.hsva.h}
        onChange={colorState.setHue}
        onChangeComplete={colorState.commitChange}
      />
      {showAlpha && (
        <AlphaSlider
          alpha={colorState.hsva.a}
          color={colorState.hexString}
          onChange={colorState.setAlpha}
          onChangeComplete={colorState.commitChange}
        />
      )}
      <ColorInputs
        hsva={colorState.hsva}
        inputModes={inputModes}
        defaultInputMode={defaultInputMode}
        showAlpha={showAlpha}
        showEyeDropper={showEyeDropper}
        disabled={disabled}
        onSetFromString={colorState.setFromString}
        onSetAlpha={colorState.setAlpha}
        onSetHue={colorState.setHue}
        onSetSaturationValue={colorState.setSaturationValue}
      />
      {presets && presets.length > 0 && (
        <ColorPresets
          presets={presets}
          currentColor={colorState.hexString}
          onSelect={colorState.setFromString}
        />
      )}
      {resolvedPalette && (
        <ColorPalette
          palette={resolvedPalette.colors}
          currentColor={colorState.hexString}
          onSelect={colorState.setFromString}
          title={resolvedPalette.title}
        />
      )}
    </StyledPickerBody>
  );

  if (inline) {
    return (
      <div
        className={className}
        style={{ ...style, width: pickerWidth }}
        data-testid={testId}
        {...rest}
      >
        {pickerBody}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <StyledTriggerRow
          className={className}
          style={style}
          data-testid={testId}
          {...rest}
        >
          <ColorSwatch
            color={colorState.hexString}
            size={size}
            shape={swatchShape}
            disabled={disabled}
            testId={testId ? `${testId}-swatch` : undefined}
          />
          {label && <StyledLabel>{label}</StyledLabel>}
        </StyledTriggerRow>
      </PopoverTrigger>
      <PopoverContent width={pickerWidth} padding="md">
        {pickerBody}
      </PopoverContent>
    </Popover>
  );
};

ColorPicker.displayName = 'ColorPicker';
