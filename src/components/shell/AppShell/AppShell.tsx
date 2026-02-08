import React, { createContext, useContext, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { Global, css, useTheme } from '@emotion/react';
import type {
  AppShellProps,
  AppShellSlotProps,
  AppShellToolbarSlotProps,
  AppShellContextValue,
  ToolbarPosition,
} from './AppShell.types';

// --- Context ---

const AppShellContext = createContext<AppShellContextValue>({
  isToolbarVisible: () => true,
  setToolbarVisible: () => {},
});

export const useAppShell = () => useContext(AppShellContext);

// --- Styled Components ---

const StyledAppShell = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    'menubar menubar menubar'
    'toolbar-top toolbar-top toolbar-top'
    'toolbar-left dock toolbar-right'
    'statusbar statusbar statusbar';
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
`;

const StyledMenuBarSlot = styled.header`
  grid-area: menubar;
`;

const StyledToolbarTopSlot = styled.div`
  grid-area: toolbar-top;
`;

const StyledToolbarLeftSlot = styled.aside`
  grid-area: toolbar-left;
`;

const StyledToolbarRightSlot = styled.aside`
  grid-area: toolbar-right;
`;

const StyledDockSlot = styled.main`
  grid-area: dock;
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
`;

const StyledStatusBarSlot = styled.footer`
  grid-area: statusbar;
`;

// --- Slot Components ---

const MenuBarSlot: React.FC<AppShellSlotProps> = ({ children, className }) => (
  <StyledMenuBarSlot className={className}>{children}</StyledMenuBarSlot>
);
MenuBarSlot.displayName = 'AppShell.MenuBar';

const ToolbarSlot: React.FC<AppShellToolbarSlotProps> = ({
  children,
  className,
  position = 'top',
}) => {
  const { isToolbarVisible } = useAppShell();
  if (!isToolbarVisible(position)) return null;

  switch (position) {
    case 'left':
      return (
        <StyledToolbarLeftSlot className={className}>
          {children}
        </StyledToolbarLeftSlot>
      );
    case 'right':
      return (
        <StyledToolbarRightSlot className={className}>
          {children}
        </StyledToolbarRightSlot>
      );
    default:
      return (
        <StyledToolbarTopSlot className={className}>
          {children}
        </StyledToolbarTopSlot>
      );
  }
};
ToolbarSlot.displayName = 'AppShell.Toolbar';

const DockSlot: React.FC<AppShellSlotProps> = ({ children, className }) => (
  <StyledDockSlot className={className}>{children}</StyledDockSlot>
);
DockSlot.displayName = 'AppShell.Dock';

const StatusBarSlot: React.FC<AppShellSlotProps> = ({
  children,
  className,
}) => (
  <StyledStatusBarSlot className={className}>{children}</StyledStatusBarSlot>
);
StatusBarSlot.displayName = 'AppShell.StatusBar';

// --- Viewport Lock Styles ---

const ViewportLockStyles: React.FC = () => {
  const theme = useTheme();
  return (
    <Global
      styles={css`
        html,
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
          background: ${theme.colors.background.primary};
        }
      `}
    />
  );
};

// --- Root Component ---

const AppShellRoot: React.FC<AppShellProps> = ({
  viewportLock = false,
  children,
  className,
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
    [toolbarVisibility]
  );

  const setToolbarVisible = useCallback(
    (position: ToolbarPosition, visible: boolean) => {
      setToolbarVisibility(prev => ({ ...prev, [position]: visible }));
    },
    []
  );

  return (
    <AppShellContext.Provider value={{ isToolbarVisible, setToolbarVisible }}>
      {viewportLock && <ViewportLockStyles />}
      <StyledAppShell className={className} role="application">
        {children}
      </StyledAppShell>
    </AppShellContext.Provider>
  );
};

AppShellRoot.displayName = 'AppShell';

// --- Compound Component ---

export const AppShell = Object.assign(AppShellRoot, {
  MenuBar: MenuBarSlot,
  Toolbar: ToolbarSlot,
  Dock: DockSlot,
  StatusBar: StatusBarSlot,
});
