import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';
import type { ColorFormat as ColorFormatBase } from './colorUtils';
import type { PaletteColor } from './palettes';

export type ColorFormat = ColorFormatBase;

export type ColorPickerSize = Size;

export type ColorInputMode = 'hex' | 'rgb' | 'hsl';

export interface ColorPreset {
  color: string;
  label?: string;
}

export type { PaletteColor, PaletteShade } from './palettes';

export interface ColorPickerBaseProps
  extends Omit<BaseComponent, 'onChange' | 'value' | 'defaultValue'> {
  /**
   * Current color value (controlled).
   * Accepts any valid CSS color string.
   */
  value?: string;

  /**
   * Default color value (uncontrolled)
   * @default "#007acc"
   */
  defaultValue?: string;

  /**
   * Output format for onChange
   * @default "hex"
   */
  format?: ColorFormat;

  /**
   * Whether to show the alpha channel control
   * @default false
   */
  showAlpha?: boolean;

  /**
   * Available input modes
   * @default ['hex', 'rgb', 'hsl']
   */
  inputModes?: ColorInputMode[];

  /**
   * Default input mode
   * @default "hex"
   */
  defaultInputMode?: ColorInputMode;

  /**
   * Preset color palette
   */
  presets?: ColorPreset[];

  /**
   * Swatch trigger size
   * @default "md"
   */
  size?: ColorPickerSize;

  /**
   * Shape of the swatch trigger
   * @default "square"
   */
  swatchShape?: 'square' | 'circle';

  /**
   * Label displayed next to the swatch
   */
  label?: string;

  /**
   * Whether the picker is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the component is inline (no popover)
   * @default false
   */
  inline?: boolean;

  /**
   * Width of the picker panel in pixels
   * @default 240
   */
  pickerWidth?: number;

  /**
   * Callback when color changes (continuous)
   */
  onChange?: (color: string) => void;

  /**
   * Callback when color change is committed (drag end)
   */
  onChangeComplete?: (color: string) => void;

  /**
   * Whether to show the EyeDropper button (Chromium-only).
   * Hidden automatically if browser doesn't support the EyeDropper API.
   * @default false
   */
  showEyeDropper?: boolean;

  /**
   * Built-in color palette or custom palette data.
   * - `'material'` — Material Design colors (19 hues × 10 shades)
   * - `'tailwind'` — Tailwind CSS colors (22 hues × 11 shades)
   * - `PaletteColor[]` — custom palette data
   */
  palette?: 'material' | 'tailwind' | PaletteColor[];
}

export type ColorPickerProps = Prettify<ColorPickerBaseProps>;

export interface ColorSwatchProps extends BaseComponent<HTMLButtonElement> {
  color: string;
  size?: ColorPickerSize;
  shape?: 'square' | 'circle';
  disabled?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
}

export type ColorSwatchPublicProps = Prettify<ColorSwatchProps>;
