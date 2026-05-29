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

import { fuzzyScore } from '@/components/feedback/CommandPalette/fuzzySearch';
import { Spinner } from '@/components/feedback/Spinner';
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
  checkmarkStyle,
  chevronButtonStyle,
  chevronIconRecipe,
  clearButtonStyle,
  containerStyle,
  createRowStyle,
  dropdownStyle,
  emptyMessageStyle,
  inputStyle,
  inputWrapperRecipe,
  optionDescriptionStyle,
  optionItemRecipe,
  optionLabelStyle,
  optionsListStyle,
} from './Combobox.css';

import type {
  ComboboxOption,
  ComboboxProps,
  ComboboxSize,
} from './Combobox.types';

const CHEVRON_SIZES: Record<ComboboxSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

const CREATE_ROW_VALUE = '__combobox_create__';

interface FilteredEntry<T extends string> {
  option: ComboboxOption<T>;
  score: number;
}

function defaultFilter<T extends string>(
  option: ComboboxOption<T>,
  query: string
): number {
  const haystack = `${option.label ?? option.value} ${option.description ?? ''}`;
  return fuzzyScore(query, haystack);
}

function applyFilter<T extends string>(
  options: ComboboxOption<T>[],
  query: string,
  custom?: (option: ComboboxOption<T>, query: string) => boolean | number
): ComboboxOption<T>[] {
  if (!query) return options;

  const scored: FilteredEntry<T>[] = [];
  for (const option of options) {
    let score: number;
    if (custom) {
      const result = custom(option, query);
      if (typeof result === 'boolean') {
        score = result ? 1 : 0;
      } else {
        score = result;
      }
    } else {
      score = defaultFilter(option, query);
    }
    if (score > 0) scored.push({ option, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map(entry => entry.option);
}

/**
 * Single-value select with an editable input. Filters the option list as the
 * user types (built-in fuzzy matcher, configurable via `filterFn`), supports
 * controlled and uncontrolled modes, optional `freeSolo` typing, optional
 * `creatable` mode for adding new entries, and an `loading` state for async
 * data sources.
 *
 * @example
 * ```tsx
 * <Combobox
 *   label="Framework"
 *   options={[
 *     { value: 'react', label: 'React' },
 *     { value: 'vue', label: 'Vue' },
 *   ]}
 *   value={framework}
 *   onChange={setFramework}
 * />
 * ```
 */
export function Combobox<T extends string = string>({
  value,
  defaultValue,
  options,
  placeholder,
  filterFn,
  emptyMessage = 'No results found',
  loading = false,
  loadingMessage = 'Loading...',
  freeSolo = false,
  creatable = false,
  createLabel,
  openOnFocus = false,
  size = 'md',
  variant = 'default',
  label,
  helperText,
  error = false,
  errorMessage,
  disabled = false,
  required = false,
  readOnly = false,
  clearable = false,
  maxDropdownHeight = 240,
  minDropdownWidth,
  name,
  onChange,
  onInputChange,
  onCreate,
  onOpenChange,
  className,
  style,
  testId,
  ref,
  id: idProp,
  ...rest
}: ComboboxProps<T>) {
  const autoId = useId();
  const fieldId = idProp ?? autoId;
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;
  const listboxId = `${fieldId}-listbox`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const setInputRef = useMergedRef(inputRef, ref);

  const [selected, setSelected] = useControlledState<T | null>({
    value,
    defaultValue,
    onChange,
    fallback: null,
  });

  const labelOf = useCallback(
    (val: T | null): string => {
      if (val === null) return '';
      const found = options.find(o => o.value === val);
      return found?.label ?? String(val);
    },
    [options]
  );

  const [query, setQuery] = useState<string>(() => labelOf(selected));
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<React.CSSProperties>({});
  const isEditingRef = useRef(false);

  // Sync the query with the selected label when it changes externally and the
  // user is not actively typing.
  useEffect(() => {
    if (!isEditingRef.current) {
      setQuery(labelOf(selected));
    }
  }, [labelOf, selected]);

  const effectiveCreatable = creatable;
  const effectiveFreeSolo = freeSolo || creatable;

  const filteredOptions = useMemo(
    () =>
      applyFilter(
        options,
        // When the user hasn't typed yet (query equals the selected label) we
        // show the full list so the dropdown serves as a browseable menu.
        isEditingRef.current ? query : '',
        filterFn
      ),
    [filterFn, options, query]
  );

  const hasExactMatch = useMemo(() => {
    if (!query) return false;
    const q = query.toLowerCase();
    return options.some(o => (o.label ?? o.value).toLowerCase() === q);
  }, [options, query]);

  const showCreateRow =
    effectiveCreatable && query.length > 0 && !hasExactMatch && !loading;

  // The list passed to useListboxNav. The "create" row is appended at the
  // end as a synthetic option so the same navigation works.
  const navItems = useMemo<ComboboxOption<T>[]>(() => {
    const list = [...filteredOptions];
    if (showCreateRow) {
      list.push({
        value: CREATE_ROW_VALUE as T,
        label: query,
      });
    }
    return list;
  }, [filteredOptions, query, showCreateRow]);

  const open = useCallback(() => {
    if (disabled || readOnly) return;
    if (isOpen) return;
    setIsOpen(true);
    onOpenChange?.(true);
  }, [disabled, readOnly, isOpen, onOpenChange]);

  const close = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    onOpenChange?.(false);
  }, [isOpen, onOpenChange]);

  const commitOption = useCallback(
    (opt: ComboboxOption<T>) => {
      if (opt.disabled) return;
      if (opt.value === (CREATE_ROW_VALUE as T)) {
        const created = query;
        if (onCreate) onCreate(created);
        else setSelected(created as T);
      } else {
        setSelected(opt.value);
      }
      isEditingRef.current = false;
      setQuery(
        opt.value === (CREATE_ROW_VALUE as T)
          ? query
          : (opt.label ?? String(opt.value))
      );
      close();
    },
    [close, onCreate, query, setSelected]
  );

  const listbox = useListboxNav<ComboboxOption<T>>({
    items: navItems,
    isItemDisabled: opt => Boolean(opt.disabled),
    onSelect: commitOption,
    onEscape: close,
  });

  const updateDropdownPosition = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
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
  }, [isOpen, updateDropdownPosition]);

  // Outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [close, isOpen]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      isEditingRef.current = true;
      setQuery(next);
      onInputChange?.(next);
      if (!isOpen) open();
      // Clearing the input clears the selection.
      if (next === '' && selected !== null) {
        setSelected(null);
      }
    },
    [isOpen, onInputChange, open, selected, setSelected]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!isOpen) {
          event.preventDefault();
          open();
          return;
        }
      }

      if (event.key === 'Enter') {
        // freeSolo / creatable take precedence when no suggestion is active.
        if (effectiveFreeSolo && listbox.activeIndex < 0 && query.length > 0) {
          event.preventDefault();
          if (effectiveCreatable && !hasExactMatch) {
            if (onCreate) onCreate(query);
            else setSelected(query as T);
          } else {
            setSelected(query as T);
          }
          isEditingRef.current = false;
          close();
          return;
        }
      }

      if (event.key === 'Tab' && isOpen) {
        // Commit the active suggestion if any, otherwise close.
        if (listbox.activeIndex >= 0) {
          listbox.selectActive();
        } else {
          close();
        }
        return;
      }

      listbox.handleKeyDown(event);
    },
    [
      close,
      disabled,
      effectiveCreatable,
      effectiveFreeSolo,
      hasExactMatch,
      isOpen,
      listbox,
      onCreate,
      open,
      query,
      readOnly,
      setSelected,
    ]
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    if (openOnFocus) open();
  }, [open, openOnFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    isEditingRef.current = false;
    // Restore the last selected label unless freeSolo allowed the typed value.
    if (!effectiveFreeSolo) {
      setQuery(labelOf(selected));
    }
  }, [effectiveFreeSolo, labelOf, selected]);

  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setSelected(null);
      setQuery('');
      isEditingRef.current = false;
      inputRef.current?.focus();
    },
    [setSelected]
  );

  const handleToggleClick = useCallback(() => {
    if (disabled || readOnly) return;
    if (isOpen) close();
    else open();
    inputRef.current?.focus();
  }, [close, disabled, isOpen, open, readOnly]);

  const showHelperText = error && errorMessage ? errorMessage : helperText;
  const chevronSize = CHEVRON_SIZES[size];

  const renderOptions = () => {
    if (loading) {
      return (
        <div className={emptyMessageStyle}>
          <Spinner size="xs" /> {loadingMessage}
        </div>
      );
    }
    if (navItems.length === 0) {
      return <div className={emptyMessageStyle}>{emptyMessage}</div>;
    }
    return navItems.map((opt, idx) => {
      const isCreate = opt.value === (CREATE_ROW_VALUE as T);
      const isSelected = !isCreate && opt.value === selected;
      const isActive = idx === listbox.activeIndex;
      const isDisabled = opt.disabled ?? false;
      return (
        <div
          key={isCreate ? `create-${query}` : `${opt.value}-${String(idx)}`}
          role="option"
          aria-selected={isSelected}
          aria-disabled={isDisabled || undefined}
          id={`${listboxId}-${String(idx)}`}
          className={cx(
            optionItemRecipe({
              active: isActive,
              selected: isSelected,
              disabled: isDisabled,
            }),
            isCreate && createRowStyle
          )}
          onClick={() => {
            commitOption(opt);
          }}
          onMouseEnter={() => {
            if (!isDisabled) listbox.setActiveIndex(idx);
          }}
        >
          {opt.icon && <span>{opt.icon}</span>}
          <span className={optionLabelStyle}>
            {isCreate
              ? (createLabel?.(query) ?? <>Create &quot;{query}&quot;</>)
              : (opt.label ?? opt.value)}
          </span>
          {opt.description && !isCreate && (
            <span className={optionDescriptionStyle}>{opt.description}</span>
          )}
          {isSelected && (
            <span className={checkmarkStyle}>
              <CheckIcon size={10} decorative />
            </span>
          )}
        </div>
      );
    });
  };

  const formValue = selected ?? '';
  const displayValue = focused || isOpen ? query : labelOf(selected);

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

      <div
        ref={wrapperRef}
        className={inputWrapperRecipe({
          size,
          variant,
          focused,
          error,
          disabled,
        })}
      >
        <input
          ref={setInputRef}
          id={fieldId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && listbox.activeIndex >= 0
              ? `${listboxId}-${String(listbox.activeIndex)}`
              : undefined
          }
          aria-labelledby={label ? labelId : undefined}
          aria-required={required || undefined}
          aria-invalid={error || undefined}
          aria-describedby={showHelperText ? helperId : undefined}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          value={displayValue}
          className={inputStyle}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid={testId}
          {...rest}
        />

        {clearable && selected !== null && !disabled && !readOnly && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear selection"
            className={clearButtonStyle}
            onMouseDown={handleClear}
          >
            <CloseIcon size="sm" decorative />
          </button>
        )}

        <button
          type="button"
          tabIndex={-1}
          aria-label={isOpen ? 'Close suggestions' : 'Open suggestions'}
          className={chevronButtonStyle}
          onMouseDown={e => {
            e.preventDefault();
          }}
          onClick={handleToggleClick}
          disabled={disabled}
        >
          <span className={chevronIconRecipe({ open: isOpen })}>
            <ChevronDownIcon size={chevronSize} decorative />
          </span>
        </button>
      </div>

      {name && <input type="hidden" name={name} value={formValue} />}

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            id={listboxId}
            aria-labelledby={label ? labelId : undefined}
            className={dropdownStyle}
            style={dropdownPos}
            tabIndex={-1}
          >
            <ScrollArea
              className={optionsListStyle}
              maxHeight={maxDropdownHeight}
              scrollbarWidth={4}
              scrollbarVisibility="auto"
              hideDelay={600}
            >
              {renderOptions()}
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

Combobox.displayName = 'Combobox';
