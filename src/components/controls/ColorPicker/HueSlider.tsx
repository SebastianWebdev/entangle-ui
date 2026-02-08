import React, { useCallback, useRef } from 'react';
import styled from '@emotion/styled';

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
  onChangeComplete?: () => void;
}

const StyledTrack = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  background: linear-gradient(
    to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  );
  cursor: pointer;
  user-select: none;
  touch-action: none;
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
    <StyledTrack
      ref={trackRef}
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
      <StyledThumb
        style={{
          left: thumbPosition,
          backgroundColor: `hsl(${hue}, 100%, 50%)`,
        }}
      />
    </StyledTrack>
  );
};

HueSlider.displayName = 'HueSlider';
