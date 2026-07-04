import type {
  TextAlign,
  TextColor,
  TextElement,
  TextLineHeight,
  TextSize,
  TextVariant,
  TextWeight,
} from '@/components/primitives/Text';
import type { Prettify } from '@/types/utilities';
import type React from 'react';

/**
 * How a pointer starts an edit session.
 *
 * Keyboard activation (Enter / F2 while the display is focused) always works,
 * independent of this setting.
 * - `single`: a single click on the text starts editing.
 * - `double`: a double click starts editing; single clicks are left free for
 *   selection or row activation (the file/node-rename convention).
 */
export type EditableTextActivationMode = 'single' | 'double';

/**
 * Why an edit session ended.
 * - `commit`: the draft was accepted (Enter, or blur with `submitOnBlur`).
 * - `cancel`: the draft was discarded (Escape, or blur without `submitOnBlur`).
 */
export type EditableTextEndReason = 'commit' | 'cancel';

/**
 * Every user-facing string EditableText renders. Override any subset via the
 * `labels` prop; the rest fall back to {@link DEFAULT_EDITABLE_TEXT_LABELS}.
 */
export interface EditableTextLabels {
  /**
   * Accessible name for the edit field while editing, and the fallback
   * accessible name for the display element when the value is empty (and no
   * `placeholder` is set). An explicit `aria-label` prop still wins.
   * @default 'Edit text'
   */
  editLabel: string;
}

/**
 * Imperative handle exposed through `ref`. Lets an external control (e.g. a
 * toolbar "Rename" button) drive the edit session and focus.
 */
export interface EditableTextHandle {
  /** Enter edit mode programmatically (no-op when disabled or read-only). */
  edit: () => void;
  /** Leave edit mode, committing the current draft. */
  commit: () => void;
  /** Leave edit mode, discarding the current draft. */
  cancel: () => void;
  /** Focus the edit field while editing, otherwise the display element. */
  focus: () => void;
  /** Whether an edit session is currently active. */
  isEditing: () => boolean;
  /** The root DOM element for the current state (display element or input). */
  getElement: () => HTMLElement | null;
}

export interface EditableTextBaseProps {
  /**
   * The committed text value (controlled).
   */
  value?: string;

  /**
   * Initial committed value (uncontrolled).
   */
  defaultValue?: string;

  /**
   * Called with the new value when an edit is committed. Fires on commit only
   * (Enter / blur), not on every keystroke.
   */
  onChange?: (value: string) => void;

  /**
   * Placeholder shown when the value is empty, both in the display and the edit
   * field. Rendered in the muted placeholder color.
   */
  placeholder?: string;

  /**
   * HTML element rendered for the display (idle) state.
   * @default 'span'
   */
  as?: TextElement;

  /**
   * Semantic typography variant, matching `Text`.
   * @default 'body'
   */
  variant?: TextVariant;

  /** Text size, matching `Text`. Overrides the variant size. */
  size?: TextSize;

  /** Text weight, matching `Text`. Overrides the variant weight. */
  weight?: TextWeight;

  /**
   * Text color, matching `Text`.
   * @default 'primary'
   */
  color?: TextColor;

  /** Line height, matching `Text`. */
  lineHeight?: TextLineHeight;

  /** Text alignment, matching `Text`. */
  align?: TextAlign;

  /** Truncate the display text with an ellipsis on overflow. */
  truncate?: boolean;

  /** Use the monospace font family (also implied by `variant="code"`). */
  mono?: boolean;

  /**
   * How a pointer starts an edit session.
   * @default 'single'
   */
  activationMode?: EditableTextActivationMode;

  /**
   * Disable the field entirely — no editing, no hover affordance, not
   * focusable.
   * @default false
   */
  disabled?: boolean;

  /**
   * Render the value but do not allow editing. Still selectable/focusable.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Select the whole value when an edit session starts.
   * @default true
   */
  selectOnEdit?: boolean;

  /**
   * Commit the draft when the edit field loses focus. When `false`, blurring
   * discards the draft instead.
   * @default true
   */
  submitOnBlur?: boolean;

  /** Maximum number of characters accepted by the edit field. */
  maxLength?: number;

  /**
   * String overrides for localization. Pass a stable reference (memoize it) —
   * it is low-frequency config.
   */
  labels?: Partial<EditableTextLabels>;

  /**
   * Explicit accessible name. Wins over the value/placeholder-derived name and
   * over `labels.editLabel`.
   */
  'aria-label'?: string;

  /** Called when an edit session starts. */
  onEditStart?: () => void;

  /** Called when an edit session ends, with the reason. */
  onEditEnd?: (reason: EditableTextEndReason) => void;

  /** Key-down handler forwarded to the edit field (runs after built-ins). */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;

  /** Additional CSS class name applied to the current root element. */
  className?: string;

  /** Inline styles applied to the current root element. */
  style?: React.CSSProperties;

  /** Test identifier for automated testing. */
  testId?: string;

  /** Imperative handle — see {@link EditableTextHandle}. */
  ref?: React.Ref<EditableTextHandle>;
}

/**
 * Props for the EditableText component with a prettified type for better
 * IntelliSense.
 */
export type EditableTextProps = Prettify<EditableTextBaseProps>;
