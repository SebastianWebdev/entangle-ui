import React, { useCallback } from 'react';
import { EyeDropperIcon } from '@/components/Icons/EyeDropperIcon';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';
import { eyeDropperRecipe } from './ColorPicker.css';

// ---------- EyeDropper API types (not yet in TypeScript lib) ----------

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperAPI {
  open(): Promise<EyeDropperResult>;
}

// ---------- Component types ----------

interface EyeDropperBaseProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'onChange'
> {
  /** Callback when a color is picked */
  onColorPick?: (color: string) => void;
  /** Button size @default "md" */
  size?: Size;
  /** Whether disabled @default false */
  disabled?: boolean;
}

type EyeDropperProps = Prettify<EyeDropperBaseProps>;

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

  return (
    <button
      type="button"
      className={eyeDropperRecipe({ size, disabled })}
      disabled={disabled}
      onClick={handleClick}
      data-testid={testId}
      aria-label="Pick color from screen"
      {...rest}
    >
      <EyeDropperIcon size="sm" />
    </button>
  );
};

EyeDropper.displayName = 'EyeDropper';

export { EyeDropper };
export type { EyeDropperProps };
