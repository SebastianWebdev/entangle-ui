import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import styled from '@emotion/styled';
import { Global, css, useTheme } from '@emotion/react';
import { processCss } from '@/utils/styledUtils';
import type {
  AppShellProps,
  AppShellSlotProps,
  AppShellToolbarSlotProps,
  AppShellContextValue,
  AppShellSideChromeSeparator,
  AppShellTopChromeSeparator,
  ToolbarPosition,
} from './AppShell.types';

// --- Context ---

const AppShellContext = createContext<AppShellContextValue>({
  isToolbarVisible: () => true,
  setToolbarVisible: () => {},
  topChromeSeparator: 'border',
  sideChromeSeparator: 'border',
});

export const useAppShell = () => useContext(AppShellContext);

// --- Styled Components ---

interface StyledAppShellProps {
  $css?: AppShellProps['css'];
}

const StyledAppShell = styled.div<StyledAppShellProps>`
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

  ${({ $css, theme }) => processCss($css, theme)}
`;

interface StyledSlotProps {
  $css?: AppShellSlotProps['css'];
}

const StyledMenuBarSlot = styled.header<StyledSlotProps>`
  grid-area: menubar;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledToolbarTopSlot = styled.div<{
  $topChromeSeparator: AppShellTopChromeSeparator;
  $css?: AppShellToolbarSlotProps['css'];
}>`
  grid-area: toolbar-top;
  border-bottom: ${({ $topChromeSeparator, theme }) =>
    $topChromeSeparator === 'border' || $topChromeSeparator === 'both'
      ? `1px solid ${theme.colors.border.default}`
      : 'none'};
  box-shadow: ${({ $topChromeSeparator, theme }) =>
    $topChromeSeparator === 'shadow' || $topChromeSeparator === 'both'
      ? theme.shadows.separatorBottom
      : 'none'};
  z-index: ${({ theme }) => theme.zIndex.base};

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledSideToolbarSlot = styled.aside<{
  $side: 'left' | 'right';
  $sideChromeSeparator: AppShellSideChromeSeparator;
  $css?: AppShellToolbarSlotProps['css'];
}>`
  grid-area: ${({ $side }) => `toolbar-${$side}`};
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-right: ${({ $side, $sideChromeSeparator, theme }) =>
    $side === 'left' &&
    ($sideChromeSeparator === 'border' || $sideChromeSeparator === 'both')
      ? `1px solid ${theme.colors.border.default}`
      : 'none'};
  border-left: ${({ $side, $sideChromeSeparator, theme }) =>
    $side === 'right' &&
    ($sideChromeSeparator === 'border' || $sideChromeSeparator === 'both')
      ? `1px solid ${theme.colors.border.default}`
      : 'none'};
  box-shadow: ${({ $side, $sideChromeSeparator, theme }) => {
    if ($sideChromeSeparator !== 'shadow' && $sideChromeSeparator !== 'both')
      return 'none';
    return $side === 'left'
      ? theme.shadows.separatorRight
      : theme.shadows.separatorLeft;
  }};
  z-index: ${({ theme }) => theme.zIndex.base};

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledDockSlot = styled.main<StyledSlotProps>`
  grid-area: dock;
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledStatusBarSlot = styled.footer<StyledSlotProps>`
  grid-area: statusbar;

  ${({ $css, theme }) => processCss($css, theme)}
`;

// --- Slot Components ---

const MenuBarSlot: React.FC<AppShellSlotProps> = ({
  children,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => (
  <StyledMenuBarSlot
    ref={ref as React.Ref<HTMLElement>}
    className={className}
    style={style}
    data-testid={testId}
    $css={css}
    {...rest}
  >
    {children}
  </StyledMenuBarSlot>
);
MenuBarSlot.displayName = 'AppShell.MenuBar';

const ToolbarSlot: React.FC<AppShellToolbarSlotProps> = ({
  children,
  className,
  style,
  testId,
  css,
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
        <StyledSideToolbarSlot
          ref={ref as React.Ref<HTMLElement>}
          className={className}
          style={style}
          data-testid={testId}
          $side={position}
          $sideChromeSeparator={sideChromeSeparator}
          $css={css}
          {...rest}
        >
          {children}
        </StyledSideToolbarSlot>
      );
    default:
      return (
        <StyledToolbarTopSlot
          ref={ref as React.Ref<HTMLDivElement>}
          className={className}
          style={style}
          data-testid={testId}
          $topChromeSeparator={topChromeSeparator}
          $css={css}
          {...rest}
        >
          {children}
        </StyledToolbarTopSlot>
      );
  }
};
ToolbarSlot.displayName = 'AppShell.Toolbar';

const DockSlot: React.FC<AppShellSlotProps> = ({
  children,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => (
  <StyledDockSlot
    ref={ref as React.Ref<HTMLElement>}
    className={className}
    style={style}
    data-testid={testId}
    $css={css}
    {...rest}
  >
    {children}
  </StyledDockSlot>
);
DockSlot.displayName = 'AppShell.Dock';

const StatusBarSlot: React.FC<AppShellSlotProps> = ({
  children,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => (
  <StyledStatusBarSlot
    ref={ref as React.Ref<HTMLElement>}
    className={className}
    style={style}
    data-testid={testId}
    $css={css}
    {...rest}
  >
    {children}
  </StyledStatusBarSlot>
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
  topChromeSeparator = 'border',
  sideChromeSeparator = 'border',
  children,
  className,
  style,
  testId,
  css,
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
    [toolbarVisibility]
  );

  const setToolbarVisible = useCallback(
    (position: ToolbarPosition, visible: boolean) => {
      setToolbarVisibility(prev => ({ ...prev, [position]: visible }));
    },
    []
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
    ]
  );

  return (
    <AppShellContext.Provider value={contextValue}>
      {viewportLock && <ViewportLockStyles />}
      <StyledAppShell
        ref={ref}
        className={className}
        style={style}
        data-testid={testId}
        $css={css}
        role="application"
        {...rest}
      >
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
