import React, { useCallback, useRef } from 'react';
import { hsvToRgb, rgbToHex } from './colorUtils';
import {
  colorAreaStyle,
  saturationGradientStyle,
  valueGradientStyle,
  colorAreaThumbStyle,
} from './ColorPicker.css';

interface ColorAreaProps {
  hue: number;
  saturation: number;
  value: number;
  onChange: (s: number, v: number) => void;
  onChangeComplete?: () => void;
}

export const ColorArea: React.FC<ColorAreaProps> = ({
  hue,
  saturation,
  value,
  onChange,
  onChangeComplete,
}) => {
  const areaRef = useRef<HTMLDivElement>(null);

  const getSV = useCallback(
    (clientX: number, clientY: number) => {
      const rect = areaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

      const s = Math.round((x / rect.width) * 100);
      const v = Math.round((1 - y / rect.height) * 100);
      onChange(s, v);
    },
    [onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      getSV(e.clientX, e.clientY);
    },
    [getSV]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons === 0) return;
      getSV(e.clientX, e.clientY);
    },
    [getSV]
  );

  const handlePointerUp = useCallback(() => {
    onChangeComplete?.();
  }, [onChangeComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 1 : 5;
      let newS = saturation;
      let newV = value;

      switch (e.key) {
        case 'ArrowRight':
          newS = Math.min(100, saturation + step);
          break;
        case 'ArrowLeft':
          newS = Math.max(0, saturation - step);
          break;
        case 'ArrowUp':
          newV = Math.min(100, value + step);
          break;
        case 'ArrowDown':
          newV = Math.max(0, value - step);
          break;
        default:
          return;
      }

      e.preventDefault();
      onChange(newS, newV);
    },
    [saturation, value, onChange]
  );

  const { r, g, b } = hsvToRgb(hue, 100, 100);
  const hueColor = rgbToHex(r, g, b);
  const thumbX = `${saturation}%`;
  const thumbY = `${100 - value}%`;

  return (
    <div
      ref={areaRef}
      className={colorAreaStyle}
      role="slider"
      tabIndex={0}
      aria-label="Color saturation and brightness"
      aria-valuetext={`Saturation ${saturation}%, Brightness ${value}%`}
      style={{ backgroundColor: hueColor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <div className={saturationGradientStyle} />
      <div className={valueGradientStyle} />
      <div className={colorAreaThumbStyle} style={{ left: thumbX, top: thumbY }} />
    </div>
  );
};

ColorArea.displayName = 'ColorArea';
