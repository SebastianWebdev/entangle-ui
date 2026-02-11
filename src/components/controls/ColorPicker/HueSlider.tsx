'use client';

import React, { useCallback, useRef } from 'react';
import { hueTrackStyle, hueThumbStyle } from './ColorPicker.css';

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
  onChangeComplete?: () => void;
}

export const HueSlider: React.FC<HueSliderProps> = ({
  hue,
  onChange,
  onChangeComplete,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const getHue = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const h = Math.round((x / rect.width) * 360);
      onChange(h);
    },
    [onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      getHue(e.clientX);
    },
    [getHue]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons === 0) return;
      getHue(e.clientX);
    },
    [getHue]
  );

  const handlePointerUp = useCallback(() => {
    onChangeComplete?.();
  }, [onChangeComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 1 : 5;
      let newHue = hue;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newHue = Math.min(360, hue + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newHue = Math.max(0, hue - step);
          break;
        default:
          return;
      }

      e.preventDefault();
      onChange(newHue);
    },
    [hue, onChange]
  );

  const thumbPosition = `${(hue / 360) * 100}%`;

  return (
    <div
      ref={trackRef}
      className={hueTrackStyle}
      role="slider"
      tabIndex={0}
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={hue}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <div
        className={hueThumbStyle}
        style={{
          left: thumbPosition,
          backgroundColor: `hsl(${hue}, 100%, 50%)`,
        }}
      />
    </div>
  );
};

HueSlider.displayName = 'HueSlider';
