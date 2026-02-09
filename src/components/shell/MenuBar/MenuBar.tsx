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
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type {
  MenuBarProps,
  MenuBarMenuProps,
  MenuBarItemProps,
  MenuBarSubProps,
  MenuBarSeparatorProps,
  MenuBarContextValue,
  MenuBarSize,
} from './MenuBar.types';

// --- Context ---

const MenuBarContext = createContext<MenuBarContextValue>({
  size: 'md',
  menuOffset: 2,
  openMenuId: null,
  setOpenMenuId: () => {},
  registerMenu: () => {},
  unregisterMenu: () => {},
  menuIds: [],
});

const useMenuBar = () => useContext(MenuBarContext);

// --- Styled Components ---

const StyledMenuBar = styled.div<{
  $size: MenuBarSize;
  $css?: MenuBarProps['css'];
}>`
  display: flex;
  align-items: center;
  height: ${({ $size, theme }) =>
    $size === 'sm' ? '24px' : `${theme.shell.menuBar.height}px`};
  background: ${({ theme }) => theme.shell.menuBar.bg};
  color: ${({ theme }) => theme.shell.menuBar.text};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  padding: 0 ${({ theme }) => theme.spacing.sm}px;
  user-select: none;
  flex-shrink: 0;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledMenuContainer = styled.div<{ $css?: MenuBarMenuProps['css'] }>`
  position: relative;
  height: 100%;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledTrigger = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.shell.menuBar.activeBg : 'transparent'};
  color: inherit;
  font: inherit;
  cursor: pointer;
  white-space: nowrap;
  position: relative;

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.shell.menuBar.activeBg : theme.shell.menuBar.hoverBg};
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: -1px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const StyledDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xs}px 0;
  z-index: 1000;
`;

const StyledItem = styled.button<{
  $css?: MenuBarItemProps['css'];
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm}px
    ${({ theme }) => theme.spacing.lg}px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font: inherit;
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  cursor: pointer;
  white-space: nowrap;
  gap: ${({ theme }) => theme.spacing.md}px;
  text-align: left;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surface.hover};
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: -1px;
    background: ${({ theme }) => theme.colors.surface.hover};
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledShortcut = styled.span`
  margin-left: auto;
  color: ${({ theme }) => theme.shell.menuBar.shortcutText};
  font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
`;

const StyledSeparator = styled.div<{ $css?: MenuBarSeparatorProps['css'] }>`
  height: 1px;
  margin: ${({ theme }) => theme.spacing.xs}px 0;
  background: ${({ theme }) => theme.colors.border.default};

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledSubTrigger = styled(StyledItem)`
  justify-content: space-between;
`;

const StyledSubDropdown = styled.div`
  position: absolute;
  top: -${({ theme }) => theme.spacing.xs}px;
  left: 100%;
  min-width: 180px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xs}px 0;
  z-index: 1001;
`;

const StyledSubContainer = styled.div<{ $css?: MenuBarSubProps['css'] }>`
  position: relative;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const ChevronRight = () => (
  <span style={{ fontSize: '8px', lineHeight: 1 }}>&#x25B6;</span>
);

// --- Sub-components ---

const MenuBarItem: React.FC<MenuBarItemProps> = ({
  onClick,
  shortcut,
  disabled = false,
  icon,
  children,
  className,
  style,
  testId,
  css,
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
    <StyledItem
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
      ref={ref}
      type="button"
      tabIndex={-1}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      {shortcut && <StyledShortcut>{shortcut}</StyledShortcut>}
    </StyledItem>
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
  css,
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
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <StyledSubContainer
      ref={ref}
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...rest}
    >
      <StyledSubTrigger
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={open}
        disabled={disabled}
        type="button"
        tabIndex={-1}
        $css={css}
      >
        <span>{label}</span>
        <ChevronRight />
      </StyledSubTrigger>
      {open && <StyledSubDropdown role="menu">{children}</StyledSubDropdown>}
    </StyledSubContainer>
  );
};

MenuBarSub.displayName = 'MenuBar.Sub';

const MenuBarSeparator: React.FC<MenuBarSeparatorProps> = ({
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  return (
    <StyledSeparator
      role="separator"
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
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
  css,
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
            '[role="menuitem"]:not(:disabled)'
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
          '[role="menuitem"]:not(:disabled)'
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
    <StyledMenuContainer
      ref={ref}
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
      {...rest}
    >
      <StyledTrigger
        ref={triggerRef}
        $active={isOpen}
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
      </StyledTrigger>
      {isOpen && (
        <StyledDropdown
          ref={dropdownRef}
          role="menu"
          aria-label={label}
          onKeyDown={handleDropdownKeyDown}
          style={{ top: `calc(100% + ${menuOffset}px)` }}
        >
          {children}
        </StyledDropdown>
      )}
    </StyledMenuContainer>
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
  css,
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
          // Get the menu id from the trigger's parent — let the hover handler do its job
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

  return (
    <MenuBarContext.Provider
      value={{
        size: $size,
        menuOffset: safeMenuOffset,
        openMenuId,
        setOpenMenuId,
        registerMenu,
        unregisterMenu,
        menuIds: menuIdsRef.current,
      }}
    >
      <StyledMenuBar
        ref={setBarRef}
        $size={$size}
        className={className}
        style={style}
        data-testid={testId}
        $css={css}
        role="menubar"
        onKeyDown={handleBarKeyDown}
        tabIndex={0}
        {...rest}
      >
        {children}
      </StyledMenuBar>
    </MenuBarContext.Provider>
  );
};

MenuBarRoot.displayName = 'MenuBar';

// --- Compound Component ---

export const MenuBar = Object.assign(MenuBarRoot, {
  Menu: MenuBarMenu,
  Item: MenuBarItem,
  Sub: MenuBarSub,
  Separator: MenuBarSeparator,
});
