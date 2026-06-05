import type { AngleInputLabels } from './angleInputLabels';
import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type AngleInputSize = Size;

/**
 * Where the numeric input sits relative to the dial.
 */
export type AngleInputPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface AngleInputBaseProps extends Omit<
  BaseComponent,
  'onChange' | 'value' | 'defaultValue'
> {
  /**
   * Current angle in degrees (controlled).
   */
  value?: number;

  /**
   * Initial angle in degrees (uncontrolled).
   * @default 0
   */
  defaultValue?: number;

  /**
   * Fired continuously while the angle changes — on every drag step, arrow-key
   * press, and typed value.
   */
  onChange?: (angle: number) => void;

  /**
   * Fired once when an edit is committed: drag end, numeric-input blur, or when
   * focus leaves the dial after keyboard editing. Use this for undo-system
   * integration; `onChange` is the live channel.
   */
  onChangeComplete?: (angle: number) => void;

  /**
   * Control size. Sets the dial diameter and the numeric input density.
   * @default 'md'
   */
  size?: AngleInputSize;

  /**
   * Explicit dial diameter in pixels. Overrides the `size` preset.
   */
  diameter?: number;

  /**
   * Whether the control is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the control is read-only — focusable and announced, but not
   * editable.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Show the numeric input next to the dial.
   * @default true
   */
  showInput?: boolean;

  /**
   * Where the numeric input sits relative to the dial.
   * @default 'right'
   */
  inputPlacement?: AngleInputPlacement;

  /**
   * Step in degrees for arrow keys and the numeric input. Hold <kbd>Shift</kbd>
   * for `largeStep`.
   * @default 1
   */
  step?: number;

  /**
   * Step in degrees for <kbd>PageUp</kbd>/<kbd>PageDown</kbd> and
   * <kbd>Shift</kbd>+arrow.
   * @default 15
   */
  largeStep?: number;

  /**
   * Snap increment in degrees applied while <kbd>Shift</kbd> is held during a
   * drag. `0` disables snapping.
   * @default 15
   */
  snap?: number;

  /**
   * Minimum allowed angle in degrees.
   * @default 0
   */
  min?: number;

  /**
   * Maximum allowed angle in degrees. When the range is a full turn
   * (`max - min === 360`) the value wraps; otherwise it clamps.
   * @default 360
   */
  max?: number;

  /**
   * Optional caption rendered above the control.
   */
  label?: string;

  /**
   * Localizable strings, merged over {@link DEFAULT_ANGLE_INPUT_LABELS}. Pass a
   * stable reference (memoize if built inline).
   */
  labels?: Partial<AngleInputLabels>;
}

export type AngleInputProps = Prettify<AngleInputBaseProps>;
