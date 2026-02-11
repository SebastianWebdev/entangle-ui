import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useId,
  KeyboardEvent,
  useMemo,
} from 'react';
import { cx } from '@/utils/cx';
import type {
  MenuBarProps,
  MenuBarMenuProps,
  MenuBarItemProps,
  MenuBarSubProps,
  MenuBarSeparatorProps,
  MenuBarContextValue,
} from './MenuBar.types';
import {
  menuBarRoot,
  menuContainer,
  trigger,
  dropdown,
  menuItem,
  shortcut,
  separator,
  subTrigger,
  subDropdown,
  subContainer,
} from './MenuBar.css';

// --- Context ---

const MenuBarContext = /*#__PURE__*/ createContext<MenuBarContextValue>({
  size: 'md',
  menuOffset: 2,
  openMenuId: null,
  setOpenMenuId: () => {},
  registerMenu: () => {},
  unregisterMenu: () => {},
  menuIds: [],
});

const useMenuBar = () => useContext(MenuBarContext);

const SUBMENU_CLOSE_DELAY = 150;

const MENU_ITEM_SELECTOR = '[role="menuitem"]:not(:disabled)';

const ChevronRight = () => (
  <span
    style={{
      fontSize: '8px',
      lineHeight: 1,
    }}
  >
    &#x25B6;
  </span>
);

// --- Sub-components ---

const MenuBarItem: React.FC<MenuBarItemProps> = ({
  onClick,
  shortcut: shortcutText,
  disabled = false,
  icon,
  children,

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { setOpenMenuId } = useMenuBar();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
      setOpenMenuId(null);
    }
  }, [onClick, setOpenMenuId]);

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={cx(menuItem, className)}
      style={style}
      data-testid={testId}
      ref={ref}
      type="button"
      tabIndex={-1}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      {shortcutText && <span className={shortcut}>{shortcutText}</span>}
    </button>
  );
};

MenuBarItem.displayName = 'MenuBar.Item';

const MenuBarSub: React.FC<MenuBarSubProps> = ({
  label,
  children,
  disabled = false,

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (!disabled) setOpen(true);
  }, [disabled]);

  const handleLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), SUBMENU_CLOSE_DELAY);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cx(subContainer, className)}
      style={style}
      data-testid={testId}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...rest}
    >
      <button
        className={subTrigger}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={open}
        disabled={disabled}
        type="button"
        tabIndex={-1}
      >
        <span>{label}</span>
        <ChevronRight />
      </button>
      {open && <div className={subDropdown} role="menu">{children}</div>}
    </div>
  );
};

MenuBarSub.displayName = 'MenuBar.Sub';

const MenuBarSeparator: React.FC<MenuBarSeparatorProps> = ({

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  return (
    <div
      role="separator"
      className={cx(separator, className)}
      style={style}
      data-testid={testId}
      ref={ref}
      {...rest}
    />
  );
};

MenuBarSeparator.displayName = 'MenuBar.Separator';

// --- MenuBarMenu (top-level dropdown trigger) ---

const MenuBarMenu: React.FC<MenuBarMenuProps> = ({
  label,
  children,
  disabled = false,

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const menuId = useId();
  const {
    openMenuId,
    setOpenMenuId,
    registerMenu,
    unregisterMenu,
    menuOffset,
  } = useMenuBar();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = openMenuId === menuId;

  useEffect(() => {
    registerMenu(menuId);
    return () => unregisterMenu(menuId);
  }, [menuId, registerMenu, unregisterMenu]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    setOpenMenuId(isOpen ? null : menuId);
  }, [disabled, isOpen, menuId, setOpenMenuId]);

  const handleMouseEnter = useCallback(() => {
    // Open on hover only when another menu is already open
    if (openMenuId !== null && openMenuId !== menuId && !disabled) {
      setOpenMenuId(menuId);
    }
  }, [openMenuId, menuId, disabled, setOpenMenuId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpenMenuId(menuId);
        // Focus first item in dropdown after open
        setTimeout(() => {
          const firstItem = dropdownRef.current?.querySelector(
            MENU_ITEM_SELECTOR
          ) as HTMLElement | null;
          firstItem?.focus();
        }, 0);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpenMenuId(null);
        triggerRef.current?.focus();
      }
    },
    [menuId, setOpenMenuId]
  );

  const handleDropdownKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(
        dropdownRef.current?.querySelectorAll<HTMLElement>(
          MENU_ITEM_SELECTOR
        ) ?? []
      );
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = currentIndex + 1 < items.length ? currentIndex + 1 : 0;
        items[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev =
          currentIndex - 1 >= 0 ? currentIndex - 1 : items.length - 1;
        items[prev]?.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpenMenuId(null);
        triggerRef.current?.focus();
      }
    },
    [setOpenMenuId]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, setOpenMenuId]);

  return (
    <div
      ref={ref}
      className={cx(menuContainer, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <button
        ref={triggerRef}
        className={trigger({ active: isOpen })}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        type="button"
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={-1}
      >
        {label}
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className={dropdown}
          role="menu"
          aria-label={label}
          onKeyDown={handleDropdownKeyDown}
          style={{ top: `calc(100% + ${menuOffset}px)` }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

MenuBarMenu.displayName = 'MenuBar.Menu';

// --- Root Component ---

const MenuBarRoot: React.FC<MenuBarProps> = ({
  $size = 'md',
  menuOffset = 2,
  children,

  className,
  style,
  testId,
  ref: externalRef,
  ...rest
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuIdsRef = useRef<string[]>([]);
  const safeMenuOffset = Math.max(0, menuOffset);
  const [, forceUpdate] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const setBarRef = useMemo(
    () => (node: HTMLDivElement | null) => {
      barRef.current = node;
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef && typeof externalRef === 'object') {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }
    },
    [externalRef]
  );

  const registerMenu = useCallback((id: string) => {
    if (!menuIdsRef.current.includes(id)) {
      menuIdsRef.current = [...menuIdsRef.current, id];
      forceUpdate(c => c + 1);
    }
  }, []);

  const unregisterMenu = useCallback((id: string) => {
    menuIdsRef.current = menuIdsRef.current.filter(m => m !== id);
    forceUpdate(c => c + 1);
  }, []);

  const handleBarKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!barRef.current) return;

      const triggers = Array.from(
        barRef.current.querySelectorAll<HTMLElement>(
          ':scope > div > [role="menuitem"]'
        )
      );
      const currentIndex = triggers.indexOf(
        document.activeElement as HTMLElement
      );

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = currentIndex + 1 < triggers.length ? currentIndex + 1 : 0;
        triggers[next]?.focus();
        // If menu is open, switch to next menu
        if (openMenuId !== null) {
          triggers[next]?.click();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev =
          currentIndex - 1 >= 0 ? currentIndex - 1 : triggers.length - 1;
        triggers[prev]?.focus();
        if (openMenuId !== null) {
          triggers[prev]?.click();
        }
      }
    },
    [openMenuId]
  );

  const contextValue = useMemo(
    () => ({
      size: $size,
      menuOffset: safeMenuOffset,
      openMenuId,
      setOpenMenuId,
      registerMenu,
      unregisterMenu,
      menuIds: menuIdsRef.current,
    }),
    [
      $size,
      safeMenuOffset,
      openMenuId,
      setOpenMenuId,
      registerMenu,
      unregisterMenu,
    ]
  );

  return (
    <MenuBarContext.Provider value={contextValue}>
      <div
        ref={setBarRef}
        className={cx(menuBarRoot({ size: $size }), className)}
        style={style}
        data-testid={testId}
        role="menubar"
        onKeyDown={handleBarKeyDown}
        tabIndex={0}
        {...rest}
      >
        {children}
      </div>
    </MenuBarContext.Provider>
  );
};

MenuBarRoot.displayName = 'MenuBar';

// --- Compound Component ---

export const MenuBar = /*#__PURE__*/ Object.assign(MenuBarRoot, {
  Menu: MenuBarMenu,
  Item: MenuBarItem,
  Sub: MenuBarSub,
  Separator: MenuBarSeparator,
});
