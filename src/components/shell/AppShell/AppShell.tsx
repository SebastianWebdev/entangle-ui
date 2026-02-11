import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { cx } from '@/utils/cx';
import type {
  AppShellProps,
  AppShellSlotProps,
  AppShellToolbarSlotProps,
  AppShellContextValue,
  ToolbarPosition,
} from './AppShell.types';
import {
  viewportLockClass,
  shellRoot,
  menuBarSlot,
  toolbarTopSlot,
  sideToolbarSlot,
  dockSlot,
  statusBarSlot,
} from './AppShell.css';

// --- Context ---

const AppShellContext = /*#__PURE__*/ createContext<AppShellContextValue>({
  isToolbarVisible: () => true,
  setToolbarVisible: () => {},
  topChromeSeparator: 'border',
  sideChromeSeparator: 'border',
});

export const useAppShell = () => useContext(AppShellContext);

// --- Slot Components ---

const MenuBarSlot: React.FC<AppShellSlotProps> = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => (
  <header
    ref={ref as React.Ref<HTMLElement>}
    className={cx(menuBarSlot, className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </header>
);
MenuBarSlot.displayName = 'AppShell.MenuBar';

const ToolbarSlot: React.FC<AppShellToolbarSlotProps> = ({
  children,

  className,
  style,
  testId,
  ref,
  position = 'top',
  ...rest
}) => {
  const { isToolbarVisible, topChromeSeparator, sideChromeSeparator } =
    useAppShell();
  if (!isToolbarVisible(position)) return null;

  switch (position) {
    case 'left':
    case 'right':
      return (
        <aside
          ref={ref as React.Ref<HTMLElement>}
          className={cx(
            sideToolbarSlot({
              side: position,
              separator: sideChromeSeparator,
            }),
            className,
          )}
          style={style}
          data-testid={testId}
          {...rest}
        >
          {children}
        </aside>
      );
    default:
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cx(
            toolbarTopSlot({ separator: topChromeSeparator }),
            className,
          )}
          style={style}
          data-testid={testId}
          {...rest}
        >
          {children}
        </div>
      );
  }
};
ToolbarSlot.displayName = 'AppShell.Toolbar';

const DockSlot: React.FC<AppShellSlotProps> = ({
  children,

  className,
  style,
  testId,
  ref,
  ...rest
}) => (
  <main
    ref={ref as React.Ref<HTMLElement>}
    className={cx(dockSlot, className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </main>
);
DockSlot.displayName = 'AppShell.Dock';

const StatusBarSlot: React.FC<AppShellSlotProps> = ({
  children,

  className,
  style,
  testId,
  ref,
  ...rest
}) => (
  <footer
    ref={ref as React.Ref<HTMLElement>}
    className={cx(statusBarSlot, className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </footer>
);
StatusBarSlot.displayName = 'AppShell.StatusBar';

// --- Root Component ---

const AppShellRoot: React.FC<AppShellProps> = ({
  viewportLock = false,
  topChromeSeparator = 'border',
  sideChromeSeparator = 'border',
  children,

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const [toolbarVisibility, setToolbarVisibility] = useState<
    Record<ToolbarPosition, boolean>
  >({
    top: true,
    left: true,
    right: true,
  });

  const isToolbarVisible = useCallback(
    (position: ToolbarPosition) => toolbarVisibility[position] ?? true,
    [toolbarVisibility],
  );

  const setToolbarVisible = useCallback(
    (position: ToolbarPosition, visible: boolean) => {
      setToolbarVisibility(prev => ({ ...prev, [position]: visible }));
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      isToolbarVisible,
      setToolbarVisible,
      topChromeSeparator,
      sideChromeSeparator,
    }),
    [
      isToolbarVisible,
      setToolbarVisible,
      topChromeSeparator,
      sideChromeSeparator,
    ],
  );

  return (
    <AppShellContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cx(
          shellRoot,
          viewportLock && viewportLockClass,
          className,
        )}
        style={style}
        data-testid={testId}
        role="application"
        {...rest}
      >
        {children}
      </div>
    </AppShellContext.Provider>
  );
};

AppShellRoot.displayName = 'AppShell';

// --- Compound Component ---

export const AppShell = /*#__PURE__*/ Object.assign(AppShellRoot, {
  MenuBar: MenuBarSlot,
  Toolbar: ToolbarSlot,
  Dock: DockSlot,
  StatusBar: StatusBarSlot,
});
