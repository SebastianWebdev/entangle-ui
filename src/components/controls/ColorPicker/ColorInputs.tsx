import React, { useCallback, useState } from 'react';
import { hsvToRgb, hsvToHsl, rgbToHex, rgbToHsv, hslToHsv } from './colorUtils';
import { EyeDropper } from './EyeDropper';
import type { ColorHSVA } from './colorUtils';
import type { ColorInputMode } from './ColorPicker.types';
import {
  inputsRowStyle,
  modeToggleStyle,
  smallInputStyle,
  inputLabelStyle,
  inputColStyle,
} from './ColorPicker.css';

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
      <div className={inputsRowStyle}>
        {inputModes.length > 1 && (
          <button type="button" className={modeToggleStyle} onClick={cycleMode}>
            {mode.toUpperCase()}
          </button>
        )}

        {mode === 'hex' && (
          <div className={inputColStyle}>
            <input
              className={smallInputStyle}
              defaultValue={hex}
              key={hex}
              maxLength={6}
              onChange={handleHexChange}
              onBlur={handleHexBlur}
              aria-label="Hex color"
            />
            <span className={inputLabelStyle}>HEX</span>
          </div>
        )}

        {mode === 'rgb' && (
          <>
            <div className={inputColStyle}>
              <input
                className={smallInputStyle}
                type="number"
                min={0}
                max={255}
                value={r}
                onChange={e => handleRgbChange('r', e.target.value)}
                aria-label="Red"
              />
              <span className={inputLabelStyle}>R</span>
            </div>
            <div className={inputColStyle}>
              <input
                className={smallInputStyle}
                type="number"
                min={0}
                max={255}
                value={g}
                onChange={e => handleRgbChange('g', e.target.value)}
                aria-label="Green"
              />
              <span className={inputLabelStyle}>G</span>
            </div>
            <div className={inputColStyle}>
              <input
                className={smallInputStyle}
                type="number"
                min={0}
                max={255}
                value={b}
                onChange={e => handleRgbChange('b', e.target.value)}
                aria-label="Blue"
              />
              <span className={inputLabelStyle}>B</span>
            </div>
          </>
        )}

        {mode === 'hsl' && (
          <>
            <div className={inputColStyle}>
              <input
                className={smallInputStyle}
                type="number"
                min={0}
                max={360}
                value={hsl.h}
                onChange={e => handleHslChange('h', e.target.value)}
                aria-label="Hue"
              />
              <span className={inputLabelStyle}>H</span>
            </div>
            <div className={inputColStyle}>
              <input
                className={smallInputStyle}
                type="number"
                min={0}
                max={100}
                value={hsl.s}
                onChange={e => handleHslChange('s', e.target.value)}
                aria-label="Saturation"
              />
              <span className={inputLabelStyle}>S</span>
            </div>
            <div className={inputColStyle}>
              <input
                className={smallInputStyle}
                type="number"
                min={0}
                max={100}
                value={hsl.l}
                onChange={e => handleHslChange('l', e.target.value)}
                aria-label="Lightness"
              />
              <span className={inputLabelStyle}>L</span>
            </div>
          </>
        )}

        {showAlpha && (
          <div className={inputColStyle}>
            <input
              className={smallInputStyle}
              type="number"
              min={0}
              max={100}
              value={Math.round(hsva.a * 100)}
              onChange={e => handleAlphaChange(e.target.value)}
              aria-label="Alpha"
            />
            <span className={inputLabelStyle}>A</span>
          </div>
        )}

        {showEyeDropper && (
          <EyeDropper
            onColorPick={onSetFromString}
            size="sm"
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

ColorInputs.displayName = 'ColorInputs';
