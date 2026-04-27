import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

/**
 * Semantic intent of an alert.
 *
 * - `info`     — neutral information (default)
 * - `success`  — positive confirmation
 * - `warning`  — caution / attention required
 * - `error`    — destructive / blocking issue
 * - `neutral`  — passive status banner without coloring
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';

/**
 * Visual treatment of an alert.
 *
 * - `subtle`   — tinted background (default; recommended for inline alerts)
 * - `solid`    — filled accent background; high attention, use sparingly
 * - `outline`  — bordered, transparent background; low visual weight
 */
export type AlertAppearance = 'subtle' | 'solid' | 'outline';

export interface AlertBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'title'
> {
  /**
   * Semantic intent. Drives color and the default icon.
   * @default "info"
   */
  variant?: AlertVariant;

  /**
   * Visual treatment.
   * @default "subtle"
   */
  appearance?: AlertAppearance;

  /**
   * Show an icon at the start.
   *
   * - `true` (default) renders the variant's default icon
   * - `false` hides the icon column entirely
   * - any `ReactNode` overrides the default icon
   *
   * Default-icon mapping: info → `InfoIcon`, success → `CheckIcon`,
   * warning → `WarningIcon`, error → `ErrorIcon`, neutral → none.
   * @default true
   */
  icon?: React.ReactNode | false;

  /**
   * When provided, renders a close button in the top-right corner
   * and calls this handler when it's clicked.
   */
  onClose?: () => void;

  /**
   * Optional title — convenience prop equivalent to wrapping with `<Alert.Title>`.
   * If both `title` and `<Alert.Title>` children are used, both render
   * (don't do this; pick one).
   */
  title?: React.ReactNode;

  /**
   * Children — typically `Alert.Title` / `Alert.Description` / `Alert.Actions`.
   * Plain string content is also fine (treated as description).
   */
  children?: React.ReactNode;
}

export type AlertProps = Prettify<AlertBaseProps>;

export interface AlertTitleBaseProps extends BaseComponent<HTMLDivElement> {
  children: React.ReactNode;
}

export type AlertTitleProps = Prettify<AlertTitleBaseProps>;

export interface AlertDescriptionBaseProps extends BaseComponent<HTMLDivElement> {
  children: React.ReactNode;
}

export type AlertDescriptionProps = Prettify<AlertDescriptionBaseProps>;

export interface AlertActionsBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Horizontal alignment of action buttons.
   * @default "left"
   */
  align?: 'left' | 'right' | 'space-between';

  children: React.ReactNode;
}

export type AlertActionsProps = Prettify<AlertActionsBaseProps>;
