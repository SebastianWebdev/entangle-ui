'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { SearchIcon } from '@/components/Icons/SearchIcon';
import { Kbd } from '@/components/primitives/Kbd';
import { useDebouncedValue } from '@/hooks/useDebounced';
import { cx } from '@/utils/cx';

import {
  emptyStyle,
  groupHeaderStyle,
  inputStyle,
  inputWrapperStyle,
  itemDescriptionStyle,
  itemIconStyle,
  itemLabelStyle,
  itemSelectedStyle,
  itemShortcutStyle,
  itemStyle,
  itemTextStyle,
  listStyle,
  overlayStyle,
  panelStyle,
  searchIconStyle,
} from './CommandPalette.css';
import { fuzzyFilter } from './fuzzySearch';
import { useRecentItems } from './useRecentItems';

import type { CommandItem, CommandPaletteProps } from './CommandPalette.types';

const DEFAULT_GROUP = 'default';
const RECENT_GROUP = '__recent__';

interface ResolvedRow {
  type: 'header' | 'item';
  group: string;
  groupLabel: string;
  item?: CommandItem;
  index?: number; // index into the flat selectable items list
}

function getItemSearchStrings(item: CommandItem): string[] {
  const out = [item.label];
  if (item.description) out.push(item.description);
  if (item.keywords) out.push(...item.keywords);
  return out;
}

/**
 * Search-driven command list shown as a centred floating dialog. Type to
 * fuzzy-filter, ArrowUp/ArrowDown to navigate, Enter to select, Escape to
 * close. Recent selections are tracked in localStorage when `recentKey` is
 * set. The component does not bind a global hotkey — wire `useHotkey` in
 * the consumer.
 *
 * @example
 * ```tsx
 * useHotkey('Mod+K', () => { setOpen(true); });
 *
 * <CommandPalette
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   items={[
 *     { id: 'open', label: 'Open File', shortcut: 'Cmd+O', group: 'File' },
 *     { id: 'save', label: 'Save', shortcut: 'Cmd+S', group: 'File' },
 *   ]}
 *   onSelect={(item) => runCommand(item.id)}
 *   recentKey="myapp:command-palette"
 * />
 * ```
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  items,
  onSelect,
  placeholder = 'Type a command or search...',
  emptyState,
  recentLabel = 'Recent',
  recentKey,
  maxRecent = 5,
  debounceMs = 150,
  renderItem,
  portal = true,
  maxHeight = 400,
  width = 640,
  className,
  style,
  testId,
  id,
  ...rest
}) => {
  const autoId = useId();
  const inputId = id ?? `command-palette-${autoId}`;
  const listboxId = `${inputId}-listbox`;

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query, debounceMs);

  const { recentIds, pushRecent } = useRecentItems({
    storageKey: recentKey,
    maxRecent,
  });

  // Reset state on each open transition. This reacts to the `open` prop
  // toggling rather than synchronizing continuous state, so the one-shot
  // setState in the effect is intentional.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  // Focus the input on open.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => {
        clearTimeout(t);
      };
    }
    return undefined;
  }, [open]);

  // Resolve groups + filtering.
  const { rows, selectableItems } = useMemo(() => {
    const groupOrder: string[] = [];
    const groupMap = new Map<string, CommandItem[]>();

    if (debouncedQuery === '' && recentIds.length > 0) {
      const byId = new Map(items.map(it => [it.id, it]));
      const recent: CommandItem[] = [];
      for (const id of recentIds) {
        const it = byId.get(id);
        if (it && !it.disabled) recent.push(it);
      }
      if (recent.length > 0) {
        groupOrder.push(RECENT_GROUP);
        groupMap.set(RECENT_GROUP, recent);
      }
    }

    const filtered = fuzzyFilter(debouncedQuery, items, getItemSearchStrings);
    const filteredItems = filtered.map(r => r.item);

    for (const item of filteredItems) {
      const g = item.group ?? DEFAULT_GROUP;
      if (!groupMap.has(g)) {
        groupOrder.push(g);
        groupMap.set(g, []);
      }
      groupMap.get(g)?.push(item);
    }

    const rows: ResolvedRow[] = [];
    const flat: CommandItem[] = [];
    let nextIndex = 0;

    for (const groupKey of groupOrder) {
      const list = groupMap.get(groupKey);
      if (!list || list.length === 0) continue;
      const groupLabel =
        groupKey === RECENT_GROUP
          ? recentLabel
          : groupKey === DEFAULT_GROUP
            ? ''
            : groupKey;
      if (groupLabel) {
        rows.push({
          type: 'header',
          group: groupKey,
          groupLabel,
        });
      }
      for (const item of list) {
        const index = nextIndex++;
        rows.push({
          type: 'item',
          group: groupKey,
          groupLabel,
          item,
          index,
        });
        flat.push(item);
      }
    }

    return { rows, selectableItems: flat };
  }, [items, debouncedQuery, recentIds, recentLabel]);

  // Clamp the active index during render when the result list shrinks. This is
  // React's documented adjust-state-during-render pattern — it avoids an extra
  // commit, and the guards make it self-terminating.
  if (selectableItems.length === 0) {
    if (activeIndex !== 0) setActiveIndex(0);
  } else if (activeIndex >= selectableItems.length) {
    setActiveIndex(selectableItems.length - 1);
  }

  const moveActive = useCallback(
    (delta: number) => {
      setActiveIndex(prev => {
        const len = selectableItems.length;
        if (len === 0) return 0;
        let next = prev + delta;
        if (next < 0) next = len - 1;
        if (next >= len) next = 0;
        return next;
      });
    },
    [selectableItems.length]
  );

  const runSelect = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return;
      pushRecent(item.id);
      if (item.onSelect) {
        item.onSelect();
      } else {
        onSelect?.(item);
      }
      onClose();
    },
    [onClose, onSelect, pushRecent]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveActive(1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveActive(-1);
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(Math.max(0, selectableItems.length - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = selectableItems[activeIndex];
        if (item) runSelect(item);
      }
    },
    [activeIndex, moveActive, onClose, runSelect, selectableItems]
  );

  // Scroll active item into view when it changes.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(
      `[data-row-index="${String(activeIndex)}"]`
    );
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, open]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!open) return null;

  const widthCss = typeof width === 'number' ? `${String(width)}px` : width;
  const activeId =
    activeIndex < selectableItems.length
      ? `${listboxId}-item-${String(activeIndex)}`
      : undefined;

  const content = (
    <>
      <div
        className={overlayStyle}
        data-testid={testId ? `${testId}-overlay` : undefined}
        onClick={handleOverlayClick}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cx(panelStyle, className)}
        style={{ width: widthCss, ...style }}
        data-testid={testId}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div className={inputWrapperStyle}>
          <span className={searchIconStyle} aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            className={inputStyle}
            placeholder={placeholder}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            data-testid={testId ? `${testId}-input` : undefined}
          />
        </div>

        {selectableItems.length === 0 ? (
          <div
            className={emptyStyle}
            data-testid={testId ? `${testId}-empty` : undefined}
          >
            {emptyState ?? `No matches for "${debouncedQuery}"`}
          </div>
        ) : (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className={listStyle}
            style={{ maxHeight }}
          >
            {rows.map((row, rowIndex) => {
              if (row.type === 'header') {
                return (
                  <li
                    key={`hdr-${row.group}-${String(rowIndex)}`}
                    role="presentation"
                    className={groupHeaderStyle}
                  >
                    {row.groupLabel}
                  </li>
                );
              }
              const item = row.item;
              const itemIndex = row.index;
              if (!item || itemIndex === undefined) return null;
              const isSelected = itemIndex === activeIndex;
              const itemDomId = `${listboxId}-item-${String(itemIndex)}`;
              return (
                <li
                  key={`${row.group}-${item.id}`}
                  id={itemDomId}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={item.disabled ? true : undefined}
                  className={cx(itemStyle, isSelected && itemSelectedStyle)}
                  data-disabled={item.disabled ? 'true' : undefined}
                  data-row-index={itemIndex}
                  data-testid={testId ? `${testId}-item-${item.id}` : undefined}
                  onMouseEnter={() => {
                    if (!item.disabled) setActiveIndex(itemIndex);
                  }}
                  onClick={() => {
                    runSelect(item);
                  }}
                >
                  {renderItem ? (
                    renderItem(item, {
                      selected: isSelected,
                      query: debouncedQuery,
                    })
                  ) : (
                    <DefaultItemContent item={item} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );

  if (portal && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};

CommandPalette.displayName = 'CommandPalette';

const DefaultItemContent: React.FC<{ item: CommandItem }> = ({ item }) => (
  <>
    {item.icon && <span className={itemIconStyle}>{item.icon}</span>}
    <span className={itemTextStyle}>
      <span className={itemLabelStyle}>{item.label}</span>
      {item.description && (
        <span className={itemDescriptionStyle}>{item.description}</span>
      )}
    </span>
    {item.shortcut && (
      <span className={itemShortcutStyle}>
        <Kbd size="sm">{item.shortcut}</Kbd>
      </span>
    )}
  </>
);
