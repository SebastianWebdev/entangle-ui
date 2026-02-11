'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
  KeyboardEvent,
} from 'react';
import { cx } from '@/utils/cx';
import type {
  ToolbarProps,
  ToolbarButtonProps,
  ToolbarToggleProps,
  ToolbarGroupProps,
  ToolbarSeparatorProps,
  ToolbarSpacerProps,
  ToolbarContextValue,
} from './Toolbar.types';
import {
  toolbarRoot,
  toolbarButton,
  toolbarGroup,
  toolbarSeparator,
  toolbarSpacer,
} from './Toolbar.css';

const ToolbarContext = /*#__PURE__*/ createContext<ToolbarContextValue>({
  orientation: 'horizontal',
  size: 'md',
});

const useToolbar = () => useContext(ToolbarContext);

// --- Roving tabindex helper ---

const FOCUSABLE_ITEM_SELECTOR =
  'button:not(:disabled), [role="button"]:not([aria-disabled="true"])';

function focusableItems(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_ITEM_SELECTOR)
  );
}

// --- Sub-components ---

const ToolbarButton = /*#__PURE__*/ React.memo<ToolbarButtonProps>(
  ({
    onClick,
    icon,
    children,
    tooltip,
    $variant = 'default',
    disabled = false,

    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const { size } = useToolbar();

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cx(
          toolbarButton({ size, variant: $variant, active: false }),
          className
        )}
        style={style}
        data-testid={testId}
        ref={ref}
        title={tooltip}
        type="button"
        tabIndex={-1}
        {...rest}
      >
        {icon}
        {!icon && children}
      </button>
    );
  }
);

ToolbarButton.displayName = 'Toolbar.Button';

const ToolbarToggle = /*#__PURE__*/ React.memo<ToolbarToggleProps>(
  ({
    pressed,
    onPressedChange,
    icon,
    children,
    tooltip,
    disabled = false,

    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const { size } = useToolbar();

    return (
      <button
        onClick={() => onPressedChange(!pressed)}
        disabled={disabled}
        className={cx(
          toolbarButton({ size, variant: 'default', active: pressed }),
          className
        )}
        style={style}
        data-testid={testId}
        ref={ref}
        title={tooltip}
        type="button"
        tabIndex={-1}
        aria-pressed={pressed}
        {...rest}
      >
        {icon}
        {!icon && children}
      </button>
    );
  }
);

ToolbarToggle.displayName = 'Toolbar.Toggle';

const ToolbarGroupComp = /*#__PURE__*/ React.memo<ToolbarGroupProps>(
  ({ children, className, style, testId, ref, ...rest }) => {
    const { orientation } = useToolbar();

    return (
      <div
        className={cx(toolbarGroup({ orientation }), className)}
        style={style}
        data-testid={testId}
        ref={ref}
        role="group"
        {...rest}
      >
        {children}
      </div>
    );
  }
);

ToolbarGroupComp.displayName = 'Toolbar.Group';

const ToolbarSeparatorComp = /*#__PURE__*/ React.memo<ToolbarSeparatorProps>(
  ({ className, style, testId, ref, ...rest }) => {
    const { orientation } = useToolbar();
    return (
      <div
        className={cx(toolbarSeparator({ orientation }), className)}
        style={style}
        data-testid={testId}
        ref={ref}
        role="separator"
        aria-orientation={
          orientation === 'horizontal' ? 'vertical' : 'horizontal'
        }
        {...rest}
      />
    );
  }
);

ToolbarSeparatorComp.displayName = 'Toolbar.Separator';

const ToolbarSpacerComp = /*#__PURE__*/ React.memo<ToolbarSpacerProps>(
  ({ className, style, testId, ref, ...rest }) => {
    return (
      <div
        className={cx(toolbarSpacer, className)}
        style={style}
        data-testid={testId}
        ref={ref}
        {...rest}
      />
    );
  }
);

ToolbarSpacerComp.displayName = 'Toolbar.Spacer';

// --- Root Component ---

const ToolbarRoot: React.FC<ToolbarProps> = ({
  $orientation = 'horizontal',
  $size = 'md',
  children,

  className,
  style,
  testId,
  ref: externalRef,
  ...rest
}) => {
  const internalRef = useRef<HTMLDivElement>(null);

  const setToolbarRef = useMemo(
    () => (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef && typeof externalRef === 'object') {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }
    },
    [externalRef]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const container = internalRef.current;
      if (!container) return;

      const items = focusableItems(container);
      if (items.length === 0) return;

      const current = document.activeElement as HTMLElement;
      const currentIndex = items.indexOf(current);

      const nextKey =
        $orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const prevKey = $orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

      if (e.key === nextKey) {
        e.preventDefault();
        const next = currentIndex + 1 < items.length ? currentIndex + 1 : 0;
        items[next]?.focus();
      } else if (e.key === prevKey) {
        e.preventDefault();
        const prev =
          currentIndex - 1 >= 0 ? currentIndex - 1 : items.length - 1;
        items[prev]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      }
    },
    [$orientation]
  );

  const handleFocus = useCallback(() => {
    const container = internalRef.current;
    if (!container) return;

    // If focus lands on the toolbar container itself, move to first button
    if (document.activeElement === container) {
      const items = focusableItems(container);
      items[0]?.focus();
    }
  }, []);

  const toolbarContextValue = useMemo(
    () => ({ orientation: $orientation, size: $size }),
    [$orientation, $size]
  );

  return (
    <ToolbarContext.Provider value={toolbarContextValue}>
      <div
        ref={setToolbarRef}
        className={cx(toolbarRoot({ orientation: $orientation }), className)}
        style={style}
        data-testid={testId}
        role="toolbar"
        aria-orientation={$orientation}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...rest}
      >
        {children}
      </div>
    </ToolbarContext.Provider>
  );
};

ToolbarRoot.displayName = 'Toolbar';

// --- Compound Component ---

export const Toolbar = /*#__PURE__*/ Object.assign(ToolbarRoot, {
  Button: ToolbarButton,
  Toggle: ToolbarToggle,
  Group: ToolbarGroupComp,
  Separator: ToolbarSeparatorComp,
  Spacer: ToolbarSpacerComp,
});
