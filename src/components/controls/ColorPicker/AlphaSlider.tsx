import React, { useCallback, useRef } from 'react';
import {
  alphaTrackStyle,
  alphaGradientStyle,
  alphaThumbStyle,
} from './ColorPicker.css';

interface AlphaSliderProps {
  alpha: number;
  color: string;
  onChange: (alpha: number) => void;
  onChangeComplete?: () => void;
}

export const AlphaSlider: React.FC<AlphaSliderProps> = ({
  alpha,
  color,
  onChange,
  onChangeComplete,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const getAlpha = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const a = Number((x / rect.width).toFixed(2));
      onChange(a);
    },
    [onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      getAlpha(e.clientX);
    },
    [getAlpha]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons === 0) return;
      getAlpha(e.clientX);
    },
    [getAlpha]
  );

  const handlePointerUp = useCallback(() => {
    onChangeComplete?.();
  }, [onChangeComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 0.01 : 0.05;
      let newAlpha = alpha;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newAlpha = Math.min(1, alpha + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newAlpha = Math.max(0, alpha - step);
          break;
        default:
          return;
      }

      e.preventDefault();
      onChange(Number(newAlpha.toFixed(2)));
    },
    [alpha, onChange]
  );

  const thumbPosition = `${alpha * 100}%`;

  return (
    <div
      ref={trackRef}
      className={alphaTrackStyle}
      role="slider"
      tabIndex={0}
      aria-label="Opacity"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(alpha * 100)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <div
        className={alphaGradientStyle}
        style={{
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />
      <div className={alphaThumbStyle} style={{ left: thumbPosition }} />
    </div>
  );
};

AlphaSlider.displayName = 'AlphaSlider';
