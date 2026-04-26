import type React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { LiteralUnion, Prettify } from '@/types/utilities';

export type KbdSize = Size;

export type KbdVariant = 'solid' | 'outline' | 'ghost';

/**
 * Standard keys recognized for OS-aware rendering.
 * Arbitrary strings are also accepted and rendered verbatim.
 */
export type KbdKey = LiteralUnion<
  | 'Ctrl'
  | 'Cmd'
  | 'Meta'
  | 'Alt'
  | 'Option'
  | 'Shift'
  | 'Enter'
  | 'Return'
  | 'Tab'
  | 'Esc'
  | 'Escape'
  | 'Space'
  | 'Backspace'
  | 'Delete'
  | 'Up'
  | 'Down'
  | 'Left'
  | 'Right'
  | 'Plus'
  | 'Minus'
  | 'Comma'
  | 'Period'
  | 'Slash'
>;

export interface KbdBaseProps extends BaseComponent<HTMLSpanElement> {
  /**
   * Shortcut content.
   *
   * Strings such as "Ctrl+S" are split on "+". Arrays such as
   * `['Ctrl', 'S']` render as separate keycaps. Any other React node renders
   * as one keycap.
   */
  children: React.ReactNode;

  /**
   * Size.
   * - `sm`: 16px height
   * - `md`: 20px height
   * - `lg`: 24px height
   * @default "md"
   */
  size?: KbdSize;

  /**
   * Visual variant.
   * @default "outline"
   */
  variant?: KbdVariant;

  /**
   * Render OS-specific glyphs.
   * @default true
   */
  glyphs?: boolean;

  /**
   * Override platform detection.
   * @default "auto"
   */
  platform?: 'auto' | 'mac' | 'windows' | 'linux';

  /**
   * Separator between keys when multiple keys are rendered.
   * Set to `null` for adjacent keycaps.
   * @default "+"
   */
  separator?: React.ReactNode;
}

export type KbdProps = Prettify<KbdBaseProps>;
