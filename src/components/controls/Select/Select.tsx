import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import { FormLabel } from '@/components/form';
import { FormHelperText } from '@/components/form';
import { ScrollArea } from '@/components/layout/ScrollArea';
import type { Theme } from '@/theme';
import type {
  SelectOptionItem,
  SelectOptionGroup,
  SelectProps,
  SelectSize,
  SelectVariant,
} from './Select.types';

// --- Helpers ---

function isOptionGroup<T extends string>(
  item: SelectOptionItem<T> | SelectOptionGroup<T>
): item is SelectOptionGroup<T> {
  return 'options' in item && Array.isArray(item.options);
}

function flattenOptions<T extends string>(
  items: Array<SelectOptionItem<T> | SelectOptionGroup<T>>
): SelectOptionItem<T>[] {
  const result: SelectOptionItem<T>[] = [];
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
  option: SelectOptionItem<T>,
  query: string
): boolean {
  const label = (option.label ?? option.value).toLowerCase();
  return label.includes(query.toLowerCase());
}

// --- Size maps ---

const TRIGGER_SIZES: Record<
  SelectSize,
  {
    height: number;
    paddingKey: keyof Theme['spacing'];
    fontKey: keyof Theme['typography']['fontSize'];
    chevronSize: number;
  }
> = {
  sm: { height: 20, paddingKey: 'sm', fontKey: 'xs', chevronSize: 10 },
  md: { height: 24, paddingKey: 'md', fontKey: 'xs', chevronSize: 12 },
  lg: { height: 32, paddingKey: 'xl', fontKey: 'sm', chevronSize: 14 },
};

// --- Styled components ---

const StyledSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

interface StyledTriggerProps {
  $size: SelectSize;
  $variant: SelectVariant;
  $open: boolean;
  $disabled: boolean;
  $error: boolean;
  $hasValue: boolean;
  $css?: SelectProps['css'];
}

const StyledTrigger = styled.button<StyledTriggerProps>`
  /* Reset */
  margin: 0;
  font-family: inherit;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  outline: none;

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  border-radius: ${props => props.theme.borderRadius.md}px;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  /* Sizing */
  height: ${props => TRIGGER_SIZES[props.$size].height}px;
  padding: 0
    ${props => props.theme.spacing[TRIGGER_SIZES[props.$size].paddingKey]}px;
  font-size: ${props =>
    props.theme.typography.fontSize[TRIGGER_SIZES[props.$size].fontKey]}px;
  gap: ${props => props.theme.spacing.sm}px;

  /* Variant styles */
  ${props => {
    const { colors } = props.theme;

    const borderColor = props.$error
      ? colors.accent.error
      : props.$open
        ? colors.border.focus
        : colors.border.default;

    switch (props.$variant) {
      case 'ghost':
        return `
          background: transparent;
          border: 1px solid transparent;
          color: ${props.$hasValue ? colors.text.primary : colors.text.muted};
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
          }
        `;
      case 'filled':
        return `
          background: ${colors.surface.default};
          border: 1px solid ${borderColor};
          color: ${props.$hasValue ? colors.text.primary : colors.text.muted};
          &:hover:not(:disabled) {
            border-color: ${colors.border.focus};
          }
        `;
      default:
        return `
          background: transparent;
          border: 1px solid ${borderColor};
          color: ${props.$hasValue ? colors.text.primary : colors.text.muted};
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
            border-color: ${props.$error ? colors.accent.error : 'transparent'};
          }
        `;
    }
  }}

  /* Open state */
  ${props => props.$open && `box-shadow: ${props.theme.shadows.focus};`}

  /* Disabled */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Focus visible */
  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

const StyledTriggerContent = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
`;

interface StyledChevronProps {
  $open: boolean;
  $size: number;
}

const StyledChevron = styled.span<StyledChevronProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform ${props => props.theme.transitions.fast};
  transform: ${props => (props.$open ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: ${props => props.theme.colors.text.muted};

  svg {
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
  }
`;

const StyledClearButton = styled.span`
  /* Reset */
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.muted};
  flex-shrink: 0;

  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

interface StyledDropdownProps {
  $maxHeight: number;
}

const StyledDropdown = styled.div<StyledDropdownProps>`
  position: fixed;
  z-index: ${props => props.theme.zIndex.dropdown};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md}px;
  box-shadow: ${props => props.theme.shadows.lg};
  overflow: hidden;
  font-family: ${props => props.theme.typography.fontFamily.sans};
  animation: selectDropdownIn ${props => props.theme.transitions.fast} forwards;

  @keyframes selectDropdownIn {
    from {
      opacity: 0;
      transform: scaleY(0.96);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }
`;

const StyledSearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm}px
    ${props => props.theme.spacing.md}px;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
`;

const StyledOptionsList = styled(ScrollArea)`
  width: 100%;
`;

interface StyledOptionItemProps {
  $highlighted: boolean;
  $selected: boolean;
  $disabled: boolean;
}

const StyledOptionItem = styled.div<StyledOptionItemProps>`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.sm}px
    ${props => props.theme.spacing.md}px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  color: ${props =>
    props.$disabled
      ? props.theme.colors.text.disabled
      : props.theme.colors.text.primary};
  background: ${props => {
    if (props.$highlighted) return props.theme.colors.surface.hover;
    if (props.$selected) return props.theme.colors.surface.active;
    return 'transparent';
  }};
  gap: ${props => props.theme.spacing.sm}px;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  transition: background ${props => props.theme.transitions.fast};

  &:hover {
    ${props =>
      !props.$disabled && `background: ${props.theme.colors.surface.hover};`}
  }
`;

const StyledGroupLabel = styled.div`
  padding: ${props => props.theme.spacing.sm}px
    ${props => props.theme.spacing.md}px;
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  color: ${props => props.theme.colors.text.muted};
  text-transform: uppercase;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const StyledEmptyMessage = styled.div`
  padding: ${props => props.theme.spacing.md}px;
  text-align: center;
  color: ${props => props.theme.colors.text.muted};
  font-size: ${props => props.theme.typography.fontSize.xs}px;
`;

const StyledCheckmark = styled.span`
  margin-left: auto;
  flex-shrink: 0;
  color: ${props => props.theme.colors.accent.primary};
  display: flex;
  align-items: center;
`;

// --- Chevron icon ---

const ChevronDownIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 4.5L6 7.5L9 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Component ---

/**
 * Select component for choosing single values from a dropdown list.
 *
 * Supports searchable mode, grouped options, keyboard navigation,
 * clearable state, and multiple visual variants.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Blend Mode"
 *   options={[
 *     { value: 'normal', label: 'Normal' },
 *     { value: 'multiply', label: 'Multiply' },
 *     { value: 'screen', label: 'Screen' },
 *   ]}
 *   value={blendMode}
 *   onChange={setBlendMode}
 * />
 * ```
 */
export function Select<T extends string = string>({
  value: valueProp,
  defaultValue,
  options,
  placeholder = 'Select...',
  searchable = false,
  searchPlaceholder = 'Search...',
  filterFn,
  emptyMessage = 'No results found',
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
  name,
  onChange,
  onOpenChange,
  className,
  style,
  css,
  testId,
  ref,
  id: idProp,
  ...rest
}: SelectProps<T>) {
  const autoId = useId();
  const selectId = idProp ?? autoId;
  const labelId = `${selectId}-label`;
  const helperId = `${selectId}-helper`;
  const listboxId = `${selectId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<T | null>(
    defaultValue ?? null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const isControlled = valueProp !== undefined;
  const currentValue = isControlled ? valueProp : internalValue;

  // Flatten all options for navigation
  const allOptions = useMemo(() => flattenOptions(options), [options]);

  // Filter options when searchable
  const filter = filterFn ?? defaultFilter;
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return allOptions;
    return allOptions.filter(opt => filter(opt, searchQuery));
  }, [allOptions, searchable, searchQuery, filter]);

  // Find selected option
  const selectedOption = useMemo(
    () => allOptions.find(o => o.value === currentValue) ?? null,
    [allOptions, currentValue]
  );

  // Position dropdown
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

    setDropdownStyle({
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

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery('');
    setHighlightedIndex(-1);
    onOpenChange?.(true);
    // Position is calculated in useEffect after render
  }, [disabled, onOpenChange]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
    onOpenChange?.(false);
    triggerRef.current?.focus();
  }, [onOpenChange]);

  const selectValue = useCallback(
    (val: T | null) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      onChange?.(val);
      close();
    },
    [isControlled, onChange, close]
  );

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      if (searchable) {
        // Focus search input after portal renders
        requestAnimationFrame(() => {
          searchRef.current?.focus();
        });
      }
    }
  }, [isOpen, updateDropdownPosition, searchable]);

  // Close on outside click
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
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, close]);

  // Get navigable options (non-disabled)
  const navigableIndices = useMemo(
    () =>
      filteredOptions
        .map((opt, i) => (opt.disabled ? -1 : i))
        .filter(i => i !== -1),
    [filteredOptions]
  );

  const navigateHighlight = useCallback(
    (direction: 'next' | 'prev' | 'first' | 'last') => {
      if (navigableIndices.length === 0) return;

      let nextIndex: number;
      const currentNavIdx = navigableIndices.indexOf(highlightedIndex);

      switch (direction) {
        case 'first':
          nextIndex = navigableIndices[0] ?? 0;
          break;
        case 'last':
          nextIndex = navigableIndices[navigableIndices.length - 1] ?? 0;
          break;
        case 'next':
          if (
            currentNavIdx === -1 ||
            currentNavIdx >= navigableIndices.length - 1
          ) {
            nextIndex = navigableIndices[0] ?? 0;
          } else {
            nextIndex = navigableIndices[currentNavIdx + 1] ?? 0;
          }
          break;
        case 'prev':
          if (currentNavIdx <= 0) {
            nextIndex = navigableIndices[navigableIndices.length - 1] ?? 0;
          } else {
            nextIndex = navigableIndices[currentNavIdx - 1] ?? 0;
          }
          break;
      }

      setHighlightedIndex(nextIndex);
    },
    [navigableIndices, highlightedIndex]
  );

  // Keyboard handling for trigger
  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            open();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            open();
          }
          break;
      }
    },
    [disabled, isOpen, open]
  );

  // Keyboard handling for dropdown
  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          navigateHighlight('next');
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateHighlight('prev');
          break;
        case 'Home':
          e.preventDefault();
          navigateHighlight('first');
          break;
        case 'End':
          e.preventDefault();
          navigateHighlight('last');
          break;
        case 'Enter':
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredOptions.length
          ) {
            const opt = filteredOptions[highlightedIndex];
            if (opt && !opt.disabled) {
              selectValue(opt.value);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [navigateHighlight, highlightedIndex, filteredOptions, selectValue, close]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectValue(null);
    },
    [selectValue]
  );

  const showHelperText = error && errorMessage ? errorMessage : helperText;
  const sizeConfig = TRIGGER_SIZES[size];

  // Assign ref
  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    },
    [ref]
  );

  // Render options list
  const renderOptions = () => {
    if (filteredOptions.length === 0) {
      return <StyledEmptyMessage>{emptyMessage}</StyledEmptyMessage>;
    }

    // If options are grouped, render with group headers
    const hasGroups = options.some(isOptionGroup);

    if (hasGroups && !searchQuery) {
      let flatIndex = 0;
      return options.map((item, groupIdx) => {
        if (isOptionGroup(item)) {
          const groupOptions = item.options;
          const startIdx = flatIndex;
          flatIndex += groupOptions.length;

          return (
            <div key={`group-${groupIdx}`} role="group" aria-label={item.label}>
              <StyledGroupLabel>{item.label}</StyledGroupLabel>
              {groupOptions.map((opt, optIdx) => {
                const idx = startIdx + optIdx;
                return renderOptionItem(opt, idx);
              })}
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

  const renderOptionItem = (opt: SelectOptionItem<T>, index: number) => {
    const isSelected = opt.value === currentValue;
    const isHighlighted = index === highlightedIndex;

    return (
      <StyledOptionItem
        key={opt.value}
        role="option"
        aria-selected={isSelected}
        aria-disabled={opt.disabled ?? undefined}
        $highlighted={isHighlighted}
        $selected={isSelected}
        $disabled={opt.disabled ?? false}
        onClick={() => {
          if (!opt.disabled) {
            selectValue(opt.value);
          }
        }}
        onMouseEnter={() => {
          if (!opt.disabled) {
            setHighlightedIndex(index);
          }
        }}
      >
        {opt.icon && <span>{opt.icon}</span>}
        <span>{opt.label ?? opt.value}</span>
        {isSelected && (
          <StyledCheckmark>
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </StyledCheckmark>
        )}
      </StyledOptionItem>
    );
  };

  return (
    <StyledSelectContainer className={className} style={style}>
      {label && (
        <FormLabel
          id={labelId}
          htmlFor={selectId}
          required={required}
          disabled={disabled}
        >
          {label}
        </FormLabel>
      )}

      <StyledTrigger
        ref={setTriggerRef}
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
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        $size={size}
        $variant={variant}
        $open={isOpen}
        $disabled={disabled}
        $error={error}
        $hasValue={currentValue !== null}
        $css={css}
        data-testid={testId}
        {...rest}
      >
        <StyledTriggerContent>
          {selectedOption ? (
            <>
              {selectedOption.icon && <span>{selectedOption.icon}</span>}
              <span>{selectedOption.label ?? selectedOption.value}</span>
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </StyledTriggerContent>

        {clearable && currentValue !== null && (
          <StyledClearButton
            role="button"
            onClick={handleClear}
            aria-label="Clear selection"
            tabIndex={-1}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L7 7M7 1L1 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </StyledClearButton>
        )}

        <StyledChevron $open={isOpen} $size={sizeConfig.chevronSize}>
          <ChevronDownIcon size={sizeConfig.chevronSize} />
        </StyledChevron>
      </StyledTrigger>

      {name && <input type="hidden" name={name} value={currentValue ?? ''} />}

      {isOpen &&
        createPortal(
          <StyledDropdown
            ref={dropdownRef}
            role="listbox"
            id={listboxId}
            aria-labelledby={label ? labelId : undefined}
            $maxHeight={maxDropdownHeight}
            style={dropdownStyle}
            onKeyDown={handleDropdownKeyDown}
            tabIndex={-1}
          >
            {searchable && (
              <StyledSearchInput
                ref={searchRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleDropdownKeyDown}
                aria-label="Search options"
              />
            )}
            <StyledOptionsList
              maxHeight={maxDropdownHeight - (searchable ? 32 : 0)}
              scrollbarWidth={4}
              scrollbarVisibility="auto"
              hideDelay={600}
            >
              {renderOptions()}
            </StyledOptionsList>
          </StyledDropdown>,
          document.body
        )}

      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </StyledSelectContainer>
  );
}

Select.displayName = 'Select';
