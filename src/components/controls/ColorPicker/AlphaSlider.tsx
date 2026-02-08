import React, { useCallback, useRef } from 'react';
import styled from '@emotion/styled';

interface AlphaSliderProps {
  alpha: number;
  color: string;
  onChange: (alpha: number) => void;
  onChangeComplete?: () => void;
}

const StyledTrack = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  cursor: pointer;
  user-select: none;
  touch-action: none;

  /* Checkerboard for transparency */
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0px;
`;

const StyledGradient = styled.div`
  position: absolute;
  inset: 0;
  border-radius: inherit;
`;

const StyledThumb = styled.div`
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: ${props => props.theme.shadows.sm};
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

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
    <StyledTrack
      ref={trackRef}
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
      <StyledGradient
        style={{
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />
      <StyledThumb style={{ left: thumbPosition }} />
    </StyledTrack>
  );
};

AlphaSlider.displayName = 'AlphaSlider';
