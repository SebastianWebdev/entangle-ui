import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { EyeDropperIcon } from '@/components/Icons/EyeDropperIcon';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

// ---------- EyeDropper API types (not yet in TypeScript lib) ----------

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperAPI {
  open(): Promise<EyeDropperResult>;
}

// ---------- Component types ----------

interface EyeDropperBaseProps
  extends Omit<BaseComponent<HTMLButtonElement>, 'onChange'> {
  /** Callback when a color is picked */
  onColorPick?: (color: string) => void;
  /** Button size @default "md" */
  size?: Size;
  /** Whether disabled @default false */
  disabled?: boolean;
}

type EyeDropperProps = Prettify<EyeDropperBaseProps>;

// ---------- Size map ----------

const SIZE_MAP: Record<Size, number> = {
  sm: 20,
  md: 24,
  lg: 28,
};

// ---------- Styled components ----------

const StyledButton = styled.button<{ $size: number; $disabled: boolean }>`
  margin: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  background: transparent;
  outline: none;
  cursor: pointer;

  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  color: ${({ theme }) => theme.colors.text.muted};
  transition:
    background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }

  ${({ $disabled }) =>
    $disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;

// ---------- Component ----------

/**
 * EyeDropper button that opens the native browser EyeDropper API
 * to sample a color from anywhere on the screen.
 *
 * Renders nothing if the EyeDropper API is not available in the browser.
 *
 * @example
 * ```tsx
 * <EyeDropper onColorPick={(hex) => setColor(hex)} />
 * ```
 */
const EyeDropper: React.FC<EyeDropperProps> = ({
  onColorPick,
  size = 'md',
  disabled = false,
  testId,
  css: cssProp,
  ...rest
}) => {
  const isAvailable = typeof window !== 'undefined' && 'EyeDropper' in window;

  const handleClick = useCallback(() => {
    if (!isAvailable) return;

    const dropper = new (
      window as unknown as { EyeDropper: new () => EyeDropperAPI }
    ).EyeDropper();

    void dropper.open().then(
      result => {
        onColorPick?.(result.sRGBHex);
      },
      () => {
        // User cancelled the eye dropper -- silently ignore
      }
    );
  }, [isAvailable, onColorPick]);

  if (!isAvailable) {
    return null;
  }

  const pixelSize = SIZE_MAP[size];

  return (
    <StyledButton
      type="button"
      $size={pixelSize}
      $disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      data-testid={testId}
      style={
        typeof cssProp === 'function'
          ? undefined
          : (cssProp as React.CSSProperties)
      }
      aria-label="Pick color from screen"
      {...rest}
    >
      <EyeDropperIcon size="sm" />
    </StyledButton>
  );
};

EyeDropper.displayName = 'EyeDropper';

export { EyeDropper };
export type { EyeDropperProps };
