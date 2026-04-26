'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cx } from '@/utils/cx';
import type {
  SegmentedControlContextValue,
  SegmentedControlOrientation,
  SegmentedControlProps,
  SegmentedControlVariant,
} from './SegmentedControl.types';
import {
  segmentedControlRecipe,
  segmentedIndicatorRecipe,
} from './SegmentedControl.css';

// --- Context ---

const SegmentedControlContext =
  /*#__PURE__*/ createContext<SegmentedControlContextValue | null>(null);

export function useSegmentedControlContext(): SegmentedControlContextValue {
  const ctx = useContext(SegmentedControlContext);
  if (!ctx) {
    throw new Error(
      'SegmentedControlItem must be used within <SegmentedControl>'
    );
  }
  return ctx;
}

// --- Indicator geometry helpers ---

interface IndicatorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function computeIndicatorRect(
  itemEl: HTMLElement,
  variant: SegmentedControlVariant,
  orientation: SegmentedControlOrientation
): IndicatorRect {
  // Use offsetLeft/offsetTop (padding-box-relative) so the indicator
  // aligns with the absolutely-positioned reference frame inside the root.
  const x = itemEl.offsetLeft;
  const y = itemEl.offsetTop;
  const width = itemEl.offsetWidth;
  const height = itemEl.offsetHeight;

  if (variant === 'outline') {
    if (orientation === 'horizontal') {
      // 2px bar at the bottom of the item
      return {
        x,
        y: y + height - 2,
        width,
        height: 2,
      };
    }
    // vertical: 2px bar at the left of the item
    return {
      x,
      y,
      width: 2,
      height,
    };
  }

  // subtle / solid: full-segment background
  return { x, y, width, height };
}

// --- Use isomorphic layout effect for SSR safety ---

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// --- Component ---

/**
 * SegmentedControl — toolbar-density mutually exclusive selector.
 *
 * Use when you have 2-5 mutually exclusive states without separate panels
 * (viewport mode, list/grid toggle, alignment). For content panels use Tabs;
 * for form-style selection use RadioGroup.
 *
 * Compound API: pair `SegmentedControl` with `SegmentedControlItem`.
 *
 * @example
 * ```tsx
 * <SegmentedControl defaultValue="day">
 *   <SegmentedControlItem value="day">Day</SegmentedControlItem>
 *   <SegmentedControlItem value="week">Week</SegmentedControlItem>
 *   <SegmentedControlItem value="month">Month</SegmentedControlItem>
 * </SegmentedControl>
 * ```
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value: valueProp,
  defaultValue,
  size = 'md',
  orientation = 'horizontal',
  variant = 'subtle',
  fullWidth = false,
  disabled = false,
  onChange,
  children,
  className,
  style,
  testId,
  ref,
  'aria-label': ariaLabel = 'Segmented control',
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = valueProp !== undefined;
  const activeValue = isControlled ? valueProp : internalValue;

  const setActiveValue = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      if (next !== activeValue) {
        onChange?.(next);
      }
    },
    [isControlled, onChange, activeValue]
  );

  // --- Item registry for sliding indicator ---

  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  const registerItem = useCallback(
    (itemValue: string, node: HTMLButtonElement | null) => {
      if (node) {
        itemsRef.current.set(itemValue, node);
      } else {
        itemsRef.current.delete(itemValue);
      }
    },
    []
  );

  // --- Sliding indicator state ---

  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const [hasMeasured, setHasMeasured] = useState(false);

  const updateIndicator = useCallback(() => {
    if (!activeValue) {
      setIndicator(null);
      return;
    }
    const item = itemsRef.current.get(activeValue);
    if (!item) {
      setIndicator(null);
      return;
    }
    setIndicator(computeIndicatorRect(item, variant, orientation));
  }, [activeValue, variant, orientation]);

  useIsomorphicLayoutEffect(() => {
    updateIndicator();
    // After first measure flip the flag so the indicator can transition on
    // subsequent updates instead of animating from (0,0).
    if (!hasMeasured) {
      setHasMeasured(true);
    }
  }, [
    updateIndicator,
    activeValue,
    variant,
    orientation,
    size,
    fullWidth,
    children,
    hasMeasured,
  ]);

  // Roving-tabindex fallback: when no item matches activeValue, the group
  // is otherwise unreachable via Tab. Promote the first non-disabled item
  // to tabIndex=0 so users can enter the group with the keyboard.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        '[data-segmented-item="true"]:not([data-disabled="true"])'
      )
    );
    const hasSelected = items.some(
      el => el.getAttribute('aria-pressed') === 'true'
    );
    if (!hasSelected && items[0]) {
      items[0].tabIndex = 0;
    }
  }, [activeValue, children]);

  // Re-measure on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = rootRef.current;
    if (!root) return;

    if (typeof ResizeObserver === 'undefined') {
      const onResize = () => updateIndicator();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    const ro = new ResizeObserver(() => updateIndicator());
    ro.observe(root);
    itemsRef.current.forEach(node => ro.observe(node));
    return () => ro.disconnect();
  }, [updateIndicator]);

  // --- Keyboard navigation (roving) ---

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const root = rootRef.current;
      if (!root) return;

      const isHorizontal = orientation === 'horizontal';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      const isNavKey =
        e.key === nextKey ||
        e.key === prevKey ||
        e.key === 'Home' ||
        e.key === 'End';
      if (!isNavKey) return;

      const items = Array.from(
        root.querySelectorAll<HTMLButtonElement>(
          '[data-segmented-item="true"]:not([data-disabled="true"])'
        )
      );
      if (items.length === 0) return;

      const current = e.target as HTMLButtonElement;
      const currentIndex = items.indexOf(current);

      let nextIndex: number;
      switch (e.key) {
        case nextKey:
          nextIndex =
            currentIndex === -1 || currentIndex === items.length - 1
              ? 0
              : currentIndex + 1;
          break;
        case prevKey:
          nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const target = items[nextIndex];
      if (target) {
        target.focus();
        const nextValue = target.dataset['value'];
        if (nextValue) {
          setActiveValue(nextValue);
        }
      }
    },
    [orientation, setActiveValue]
  );

  // --- Context value ---

  const contextValue = useMemo<SegmentedControlContextValue>(
    () => ({
      value: activeValue,
      size,
      variant,
      orientation,
      disabled,
      fullWidth,
      onChange: setActiveValue,
      registerItem,
    }),
    [
      activeValue,
      size,
      variant,
      orientation,
      disabled,
      fullWidth,
      setActiveValue,
      registerItem,
    ]
  );

  const indicatorClass = segmentedIndicatorRecipe({ variant, orientation });

  return (
    <SegmentedControlContext.Provider value={contextValue}>
      <div
        ref={setRootRef}
        role="group"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-orientation={orientation}
        className={cx(
          segmentedControlRecipe({ orientation, variant, fullWidth }),
          className
        )}
        style={style}
        data-testid={testId}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {indicator && (
          <span
            aria-hidden="true"
            className={indicatorClass}
            style={{
              transform: `translate(${indicator.x}px, ${indicator.y}px)`,
              width: `${indicator.width}px`,
              height: `${indicator.height}px`,
              opacity: hasMeasured ? 1 : 0,
            }}
          />
        )}
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
};

SegmentedControl.displayName = 'SegmentedControl';
