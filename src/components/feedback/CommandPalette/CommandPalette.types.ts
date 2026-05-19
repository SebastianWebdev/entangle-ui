import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export interface CommandItem {
  /** Stable unique identifier — used for keys and the recent list. */
  id: string;
  /** Visible label. */
  label: string;
  /** Optional secondary description. */
  description?: string;
  /** Group name for sectioning the list. Items without a group go into "default". */
  group?: string;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Keyboard shortcut to display (e.g. "Cmd+S"). */
  shortcut?: string;
  /** Extra strings used by the fuzzy matcher in addition to label/description. */
  keywords?: string[];
  /** When true, the item is rendered but cannot be selected. */
  disabled?: boolean;
  /** Callback fired when this item is chosen. Falls back to top-level `onSelect`. */
  onSelect?: () => void;
}

export interface CommandPaletteRenderItemState {
  selected: boolean;
  query: string;
}

export interface CommandPaletteBaseProps extends Omit<
  BaseComponent,
  'onSelect'
> {
  /** Whether the palette is open. */
  open: boolean;
  /** Called when the palette requests close (Escape, overlay, after select). */
  onClose: () => void;
  /** All commands. The component filters them as the user types. */
  items: readonly CommandItem[];
  /** Default handler invoked when an item without its own `onSelect` is chosen. */
  onSelect?: (item: CommandItem) => void;
  /** Placeholder text for the search input. @default "Type a command or search..." */
  placeholder?: string;
  /** Custom node when no items match the current query. */
  emptyState?: React.ReactNode;
  /** Localised label for the recent items group header. @default "Recent" */
  recentLabel?: string;
  /** localStorage key for tracking recently selected items. Recent tracking is off when omitted. */
  recentKey?: string;
  /** Maximum number of recent items to track. @default 5 */
  maxRecent?: number;
  /** Debounce in ms applied to the search query. @default 150 */
  debounceMs?: number;
  /** Custom renderer for each item — replaces the default row layout. */
  renderItem?: (
    item: CommandItem,
    state: CommandPaletteRenderItemState
  ) => React.ReactNode;
  /** Render in a portal. @default true */
  portal?: boolean;
  /** Maximum height of the results list in px. @default 400 */
  maxHeight?: number;
  /** Width in px or any CSS value. @default 640 */
  width?: number | string;
}

export type CommandPaletteProps = Prettify<CommandPaletteBaseProps>;
