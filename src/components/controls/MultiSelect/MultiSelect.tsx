'use client';

import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { FormHelperText } from '@/components/form/FormHelperText';
import { FormLabel } from '@/components/form/FormLabel';
import { CheckIcon } from '@/components/Icons/CheckIcon';
import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon';
import { CloseIcon } from '@/components/Icons/CloseIcon';
import { ScrollArea } from '@/components/layout/ScrollArea';
import { useControlledState } from '@/hooks/useControlledState';
import { useListboxNav } from '@/hooks/useListboxNav';
import { useMergedRef } from '@/hooks/useMergedRef';
import { cx } from '@/utils/cx';

import {
  checkboxRecipe,
  chevronRecipe,
  chipLabelStyle,
  chipRecipe,
  chipRemoveStyle,
  clearButtonStyle,
  containerStyle,
  dropdownStyle,
  emptyMessageStyle,
  groupLabelStyle,
  moreBadgeStyle,
  optionItemRecipe,
  optionsListStyle,
  placeholderStyle,
  searchInputStyle,
  triggerContentStyle,
  triggerRecipe,
} from './MultiSelect.css';

import type {
  MultiSelectOption,
  MultiSelectOptionGroup,
  MultiSelectProps,
  MultiSelectSize,
} from './MultiSelect.types';

function isOptionGroup<T extends string>(
  item: MultiSelectOption<T> | MultiSelectOptionGroup<T>
): item is MultiSelectOptionGroup<T> {
  return 'options' in item && Array.isArray(item.options);
}

function flattenOptions<T extends string>(
  items: Array<MultiSelectOption<T> | MultiSelectOptionGroup<T>>
): MultiSelectOption<T>[] {
  const result: MultiSelectOption<T>[] = [];
  for (const item of items) {
    if (isOptionGroup(item)) {
      result.push(...item.options);
    } else {
      result.push(item);
    }
  }
  return result;
}

function defaultFilter<T extends string>(
  option: MultiSelectOption<T>,
  query: string
): boolean {
  const label = (option.label ?? option.value).toLowerCase();
  return label.includes(query.toLowerCase());
}

const CHEVRON_SIZES: Record<MultiSelectSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

/**
 * Multi-value select that lets the user pick several options from a dropdown.
 * Selected values are rendered as inline chips inside the trigger; the rest
 * collapse into a "+N more" badge.
 *
 * Supports searchable mode, grouped options, controlled and uncontrolled
 * modes, keyboard navigation, an optional `max` cap, and a clear-all button.
 *
 * @example
 * ```tsx
 * <MultiSelect
 *   label="Tags"
 *   options={[
 *     { value: 'react', label: 'React' },
 *     { value: 'vue', label: 'Vue' },
 *     { value: 'svelte', label: 'Svelte' },
 *   ]}
 *   value={tags}
 *   onChange={setTags}
 * />
 * ```
 */
export function MultiSelect<T extends string = string>({
  value,
  defaultValue,
  options,
  placeholder = 'Select...',
  searchable = false,
  searchPlaceholder = 'Search...',
  filterFn,
  emptyMessage = 'No results found',
  max,
  maxInlineChips = 3,
  size = 'md',
  variant = 'default',
  label,
  helperText,
  error = false,
  errorMessage,
  disabled = false,
  required = false,
  clearable = false,
  maxDropdownHeight = 240,
  minDropdownWidth,
  closeOnSelect = false,
  name,
  onChange,
  onOpenChange,
  className,
  style,
  testId,
  ref,
  id: idProp,
  ...rest
}: MultiSelectProps<T>) {
  const autoId = useId();
  const fieldId = idProp ?? autoId;
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;
  const listboxId = `${fieldId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const setTriggerRef = useMergedRef(triggerRef, ref);

  const [selected, setSelected] = useControlledState<T[]>({
    value,
    defaultValue,
    onChange,
    fallback: [],
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPos, setDropdownPos] = useState<React.CSSProperties>({});

  const allOptions = useMemo(() => flattenOptions(options), [options]);

  // Defer the query that drives filtering so the search input stays
  // responsive while a large option list re-filters. The immediate
  // `searchQuery` still drives the input value.
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filter = filterFn ?? defaultFilter;
  const filteredOptions = useMemo(() => {
    if (!searchable || !deferredSearchQuery) return allOptions;
    return allOptions.filter(opt => filter(opt, deferredSearchQuery));
  }, [allOptions, searchable, deferredSearchQuery, filter]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleValue = useCallback(
    (val: T, isDisabled: boolean) => {
      if (isDisabled) return;
      const isSelected = selectedSet.has(val);
      if (isSelected) {
        setSelected(selected.filter(v => v !== val));
      } else {
        if (typeof max === 'number' && selected.length >= max) return;
        setSelected([...selected, val]);
      }
    },
    [max, selected, selectedSet, setSelected]
  );

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery('');
    onOpenChange?.(true);
  }, [disabled, onOpenChange]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    onOpenChange?.(false);
    triggerRef.current?.focus();
  }, [onOpenChange]);

  const listbox = useListboxNav({
    items: filteredOptions,
    isItemDisabled: opt => Boolean(opt.disabled),
    onSelect: opt => {
      toggleValue(opt.value, Boolean(opt.disabled));
      if (closeOnSelect) close();
    },
    onEscape: close,
  });

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove =
      spaceBelow < maxDropdownHeight + 8 && rect.top > spaceBelow;

    const dropdownW =
      minDropdownWidth !== undefined
        ? Math.max(rect.width, minDropdownWidth)
        : rect.width;

    setDropdownPos({
      left: rect.left,
      width: dropdownW,
      ...(openAbove
        ? {
            bottom: window.innerHeight - rect.top + 4,
            transformOrigin: 'bottom',
          }
        : { top: rect.bottom + 4, transformOrigin: 'top' }),
    });
  }, [maxDropdownHeight, minDropdownWidth]);

  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();
    if (searchable) {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
    }
  }, [isOpen, updateDropdownPosition, searchable]);

  // Outside click handling
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, close]);

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) open();
          break;
      }
    },
    [disabled, isOpen, open]
  );

  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      listbox.handleKeyDown(e);
    },
    [listbox]
  );

  const removeValue = useCallback(
    (val: T) => {
      setSelected(selected.filter(v => v !== val));
    },
    [selected, setSelected]
  );

  const handleClearAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelected([]);
    },
    [setSelected]
  );

  const showHelperText = error && errorMessage ? errorMessage : helperText;
  const chevronSize = CHEVRON_SIZES[size];

  const selectedOptions = useMemo(
    () =>
      selected
        .map(v => allOptions.find(o => o.value === v))
        .filter((o): o is MultiSelectOption<T> => Boolean(o)),
    [allOptions, selected]
  );

  const isEmpty = selected.length === 0;
  const visibleChips =
    maxInlineChips === Infinity
      ? selectedOptions
      : selectedOptions.slice(0, maxInlineChips);
  const overflowCount = selectedOptions.length - visibleChips.length;

  // Render options
  const renderOptionsList = () => {
    if (filteredOptions.length === 0) {
      return <div className={emptyMessageStyle}>{emptyMessage}</div>;
    }

    const hasGroups = options.some(isOptionGroup);
    // Mirror the deferred query used by `filteredOptions` so the grouped /
    // flat switch stays consistent with the list being rendered.
    if (hasGroups && !deferredSearchQuery) {
      let flatIndex = 0;
      return options.map((item, groupIdx) => {
        if (isOptionGroup(item)) {
          const groupOptions = item.options;
          const startIdx = flatIndex;
          flatIndex += groupOptions.length;
          return (
            <div
              key={`group-${String(groupIdx)}`}
              role="group"
              aria-label={item.label}
            >
              <div className={groupLabelStyle}>{item.label}</div>
              {groupOptions.map((opt, optIdx) =>
                renderOptionItem(opt, startIdx + optIdx)
              )}
            </div>
          );
        }
        const idx = flatIndex;
        flatIndex += 1;
        return renderOptionItem(item, idx);
      });
    }

    return filteredOptions.map((opt, idx) => renderOptionItem(opt, idx));
  };

  const renderOptionItem = (opt: MultiSelectOption<T>, index: number) => {
    const isSelected = selectedSet.has(opt.value);
    const isActive = index === listbox.activeIndex;
    const isDisabled = opt.disabled ?? false;
    const reachedMax =
      typeof max === 'number' && !isSelected && selected.length >= max;
    const interactiveDisabled = isDisabled || reachedMax;

    const selectOption = () => {
      if (!interactiveDisabled) {
        toggleValue(opt.value, false);
        if (closeOnSelect) close();
      }
    };

    return (
      <div
        key={opt.value}
        role="option"
        tabIndex={-1}
        aria-selected={isSelected}
        aria-disabled={interactiveDisabled || undefined}
        id={`${listboxId}-${opt.value}`}
        className={optionItemRecipe({
          active: isActive,
          selected: isSelected,
          disabled: interactiveDisabled,
        })}
        onClick={selectOption}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectOption();
          }
        }}
        onMouseEnter={() => {
          if (!interactiveDisabled) listbox.setActiveIndex(index);
        }}
      >
        <span
          className={checkboxRecipe({ selected: isSelected })}
          aria-hidden="true"
        >
          {isSelected && <CheckIcon size={10} decorative />}
        </span>
        {opt.icon && <span>{opt.icon}</span>}
        <span>{opt.label ?? opt.value}</span>
      </div>
    );
  };

  const formValue = selected.join(',');

  return (
    <div className={cx(containerStyle, className)} style={style}>
      {label && (
        <FormLabel
          id={labelId}
          htmlFor={fieldId}
          required={required}
          disabled={disabled}
        >
          {label}
        </FormLabel>
      )}

      <button
        ref={setTriggerRef}
        id={fieldId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-required={required || undefined}
        aria-invalid={error || undefined}
        aria-describedby={showHelperText ? helperId : undefined}
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            close();
          } else {
            open();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={triggerRecipe({
          size,
          variant,
          open: isOpen,
          disabled,
          error,
          empty: isEmpty,
        })}
        data-testid={testId}
        {...rest}
      >
        <span className={triggerContentStyle}>
          {isEmpty ? (
            <span className={placeholderStyle}>{placeholder}</span>
          ) : (
            <>
              {visibleChips.map(opt => (
                <span
                  key={opt.value}
                  className={chipRecipe({ size })}
                  data-testid={
                    testId ? `${testId}-chip-${opt.value}` : undefined
                  }
                >
                  {opt.icon && <span>{opt.icon}</span>}
                  <span className={chipLabelStyle}>
                    {opt.label ?? opt.value}
                  </span>
                  {!disabled && (
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={`Remove ${opt.label ?? opt.value}`}
                      className={chipRemoveStyle}
                      onClick={e => {
                        e.stopPropagation();
                        removeValue(opt.value);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          removeValue(opt.value);
                        }
                      }}
                    >
                      <CloseIcon size="sm" decorative />
                    </span>
                  )}
                </span>
              ))}
              {overflowCount > 0 && (
                <span className={moreBadgeStyle}>+{overflowCount} more</span>
              )}
            </>
          )}
        </span>

        {clearable && !isEmpty && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear selection"
            className={clearButtonStyle}
            onClick={handleClearAll}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setSelected([]);
              }
            }}
          >
            <CloseIcon size="sm" decorative />
          </span>
        )}

        <span className={chevronRecipe({ open: isOpen })}>
          <ChevronDownIcon size={chevronSize} decorative />
        </span>
      </button>

      {name && <input type="hidden" name={name} value={formValue} />}

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            id={listboxId}
            aria-multiselectable="true"
            aria-labelledby={label ? labelId : undefined}
            className={dropdownStyle}
            style={dropdownPos}
            onKeyDown={handleDropdownKeyDown}
            tabIndex={-1}
          >
            {searchable && (
              <input
                ref={searchRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={handleDropdownKeyDown}
                className={searchInputStyle}
                aria-label="Search options"
              />
            )}
            <ScrollArea
              className={optionsListStyle}
              maxHeight={maxDropdownHeight - (searchable ? 32 : 0)}
              scrollbarWidth={4}
              scrollbarVisibility="auto"
              hideDelay={600}
            >
              {renderOptionsList()}
            </ScrollArea>
          </div>,
          document.body
        )}

      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </div>
  );
}

MultiSelect.displayName = 'MultiSelect';
