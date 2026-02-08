import React, { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { hsvToRgb, hsvToHsl, rgbToHex, rgbToHsv, hslToHsv } from './colorUtils';
import { EyeDropper } from './EyeDropper';
import type { ColorHSVA } from './colorUtils';
import type { ColorInputMode } from './ColorPicker.types';

interface ColorInputsProps {
  hsva: ColorHSVA;
  inputModes: ColorInputMode[];
  defaultInputMode: ColorInputMode;
  showAlpha: boolean;
  showEyeDropper?: boolean;
  disabled?: boolean;
  onSetFromString: (color: string) => void;
  onSetAlpha: (a: number) => void;
  onSetHue: (h: number) => void;
  onSetSaturationValue: (s: number, v: number) => void;
}

const StyledInputsRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md}px;
`;

const StyledModeToggle = styled.button`
  /* Reset */
  margin: 0;
  padding: 2px 6px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: transparent;
  font-family: inherit;
  outline: none;
  cursor: pointer;

  flex-shrink: 0;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  color: ${props => props.theme.colors.text.muted};
  transition:
    background ${props => props.theme.transitions.fast},
    color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surface.hover};
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

const StyledSmallInput = styled.input`
  /* Reset */
  margin: 0;
  border: 1px solid ${props => props.theme.colors.border.default};
  outline: none;
  font-family: inherit;

  background: ${props => props.theme.colors.surface.default};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  padding: 2px 4px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  width: 100%;
  min-width: 0;
  text-align: center;

  &:focus {
    border-color: ${props => props.theme.colors.border.focus};
  }
`;

const StyledLabel = styled.span`
  font-size: 9px;
  color: ${props => props.theme.colors.text.disabled};
  text-align: center;
  display: block;
  margin-top: 1px;
`;

const StyledInputCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

export const ColorInputs: React.FC<ColorInputsProps> = ({
  hsva,
  inputModes,
  defaultInputMode,
  showAlpha,
  showEyeDropper = false,
  disabled = false,
  onSetFromString,
  onSetAlpha,
  onSetHue,
  onSetSaturationValue,
}) => {
  const [mode, setMode] = useState<ColorInputMode>(defaultInputMode);

  const cycleMode = useCallback(() => {
    const idx = inputModes.indexOf(mode);
    const next = inputModes[(idx + 1) % inputModes.length];
    if (next) setMode(next);
  }, [mode, inputModes]);

  const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
  const hex = rgbToHex(r, g, b).replace('#', '');
  const hsl = hsvToHsl(hsva.h, hsva.s, hsva.v);

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace('#', '');
      if (/^[0-9a-fA-F]{6}$/.test(val)) {
        onSetFromString(`#${val}`);
      }
    },
    [onSetFromString]
  );

  const handleHexBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.replace('#', '');
      if (/^[0-9a-fA-F]{3}$/.test(val) || /^[0-9a-fA-F]{6}$/.test(val)) {
        onSetFromString(`#${val}`);
      }
    },
    [onSetFromString]
  );

  const handleRgbChange = useCallback(
    (channel: 'r' | 'g' | 'b', val: string) => {
      const num = Math.max(0, Math.min(255, parseInt(val, 10)));
      if (isNaN(num)) return;
      const newR = channel === 'r' ? num : r;
      const newG = channel === 'g' ? num : g;
      const newB = channel === 'b' ? num : b;
      const newHsv = rgbToHsv(newR, newG, newB);
      onSetHue(newHsv.h);
      onSetSaturationValue(newHsv.s, newHsv.v);
    },
    [r, g, b, onSetHue, onSetSaturationValue]
  );

  const handleHslChange = useCallback(
    (channel: 'h' | 's' | 'l', val: string) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) return;
      const newH = channel === 'h' ? Math.max(0, Math.min(360, num)) : hsl.h;
      const newS = channel === 's' ? Math.max(0, Math.min(100, num)) : hsl.s;
      const newL = channel === 'l' ? Math.max(0, Math.min(100, num)) : hsl.l;
      const newHsv = hslToHsv(newH, newS, newL);
      onSetHue(newHsv.h);
      onSetSaturationValue(newHsv.s, newHsv.v);
    },
    [hsl.h, hsl.s, hsl.l, onSetHue, onSetSaturationValue]
  );

  const handleAlphaChange = useCallback(
    (val: string) => {
      const num = Math.max(0, Math.min(100, parseInt(val, 10)));
      if (isNaN(num)) return;
      onSetAlpha(num / 100);
    },
    [onSetAlpha]
  );

  return (
    <div>
      <StyledInputsRow>
        {inputModes.length > 1 && (
          <StyledModeToggle type="button" onClick={cycleMode}>
            {mode.toUpperCase()}
          </StyledModeToggle>
        )}

        {mode === 'hex' && (
          <StyledInputCol>
            <StyledSmallInput
              defaultValue={hex}
              key={hex}
              maxLength={6}
              onChange={handleHexChange}
              onBlur={handleHexBlur}
              aria-label="Hex color"
            />
            <StyledLabel>HEX</StyledLabel>
          </StyledInputCol>
        )}

        {mode === 'rgb' && (
          <>
            <StyledInputCol>
              <StyledSmallInput
                type="number"
                min={0}
                max={255}
                value={r}
                onChange={e => handleRgbChange('r', e.target.value)}
                aria-label="Red"
              />
              <StyledLabel>R</StyledLabel>
            </StyledInputCol>
            <StyledInputCol>
              <StyledSmallInput
                type="number"
                min={0}
                max={255}
                value={g}
                onChange={e => handleRgbChange('g', e.target.value)}
                aria-label="Green"
              />
              <StyledLabel>G</StyledLabel>
            </StyledInputCol>
            <StyledInputCol>
              <StyledSmallInput
                type="number"
                min={0}
                max={255}
                value={b}
                onChange={e => handleRgbChange('b', e.target.value)}
                aria-label="Blue"
              />
              <StyledLabel>B</StyledLabel>
            </StyledInputCol>
          </>
        )}

        {mode === 'hsl' && (
          <>
            <StyledInputCol>
              <StyledSmallInput
                type="number"
                min={0}
                max={360}
                value={hsl.h}
                onChange={e => handleHslChange('h', e.target.value)}
                aria-label="Hue"
              />
              <StyledLabel>H</StyledLabel>
            </StyledInputCol>
            <StyledInputCol>
              <StyledSmallInput
                type="number"
                min={0}
                max={100}
                value={hsl.s}
                onChange={e => handleHslChange('s', e.target.value)}
                aria-label="Saturation"
              />
              <StyledLabel>S</StyledLabel>
            </StyledInputCol>
            <StyledInputCol>
              <StyledSmallInput
                type="number"
                min={0}
                max={100}
                value={hsl.l}
                onChange={e => handleHslChange('l', e.target.value)}
                aria-label="Lightness"
              />
              <StyledLabel>L</StyledLabel>
            </StyledInputCol>
          </>
        )}

        {showAlpha && (
          <StyledInputCol>
            <StyledSmallInput
              type="number"
              min={0}
              max={100}
              value={Math.round(hsva.a * 100)}
              onChange={e => handleAlphaChange(e.target.value)}
              aria-label="Alpha"
            />
            <StyledLabel>A</StyledLabel>
          </StyledInputCol>
        )}

        {showEyeDropper && (
          <EyeDropper
            onColorPick={onSetFromString}
            size="sm"
            disabled={disabled}
          />
        )}
      </StyledInputsRow>
    </div>
  );
};

ColorInputs.displayName = 'ColorInputs';
