import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
  KeyboardEvent,
} from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type {
  ToolbarProps,
  ToolbarButtonProps,
  ToolbarToggleProps,
  ToolbarGroupProps,
  ToolbarSeparatorProps,
  ToolbarSpacerProps,
  ToolbarContextValue,
  ToolbarOrientation,
  ToolbarSize,
} from './Toolbar.types';

const ToolbarContext = createContext<ToolbarContextValue>({
  orientation: 'horizontal',
  size: 'md',
});

const useToolbar = () => useContext(ToolbarContext);

// --- Styled Components ---

const StyledToolbar = styled.div<{
  $orientation: ToolbarOrientation;
  $size: ToolbarSize;
  $css?: ToolbarProps['css'];
}>`
  display: flex;
  box-sizing: border-box;
  align-items: center;
  flex-direction: ${({ $orientation }) =>
    $orientation === 'vertical' ? 'column' : 'row'};
  min-width: 0;
  min-height: 0;
  ${({ $orientation }) => $orientation === 'vertical' && 'height: 100%;'}
  background: ${({ theme }) => theme.shell.toolbar.bg};
  padding: ${({ theme }) => theme.spacing.xs}px;
  gap: ${({ theme }) => theme.spacing.xs}px;
  flex-shrink: 0;
  user-select: none;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const itemSize = (size: ToolbarSize) => (size === 'sm' ? 24 : 32);

const StyledButton = styled.button<{
  $variant: string;
  $active?: boolean;
  $size: ToolbarSize;
  $css?: ToolbarButtonProps['css'];
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => itemSize($size)}px;
  height: ${({ $size }) => itemSize($size)}px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: ${({ $variant, $active, theme }) => {
    if ($active) return theme.colors.accent.primary;
    if ($variant === 'filled') return theme.colors.surface.active;
    return 'transparent';
  }};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  font-size: ${({ $size }) => ($size === 'sm' ? 14 : 16)}px;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.accent.secondary : theme.colors.surface.hover};
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: -1px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledGroup = styled.div<{
  $orientation: ToolbarOrientation;
  $css?: ToolbarGroupProps['css'];
}>`
  display: flex;
  flex-direction: ${({ $orientation }) =>
    $orientation === 'vertical' ? 'column' : 'row'};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledSeparator = styled.div<{
  $orientation: ToolbarOrientation;
  $css?: ToolbarSeparatorProps['css'];
}>`
  background: ${({ theme }) => theme.shell.toolbar.separator};
  flex-shrink: 0;
  ${({ $orientation }) =>
    $orientation === 'vertical'
      ? `width: 80%; height: 1px; margin: 2px auto;`
      : `width: 1px; height: 16px; margin: 0 2px;`}

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledSpacer = styled.div<{ $css?: ToolbarSpacerProps['css'] }>`
  flex: 1 1 auto;

  ${({ $css, theme }) => processCss($css, theme)}
`;

// --- Roving tabindex helper ---

function focusableItems(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [role="button"]:not([aria-disabled="true"])'
    )
  );
}

// --- Sub-components ---

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  icon,
  children,
  tooltip,
  $variant = 'default',
  disabled = false,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  const { size } = useToolbar();

  return (
    <StyledButton
      onClick={onClick}
      $variant={$variant}
      $size={size}
      disabled={disabled}
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
      ref={ref}
      title={tooltip}
      type="button"
      tabIndex={-1}
      {...rest}
    >
      {icon}
      {!icon && children}
    </StyledButton>
  );
};

ToolbarButton.displayName = 'Toolbar.Button';

const ToolbarToggle: React.FC<ToolbarToggleProps> = ({
  pressed,
  onPressedChange,
  icon,
  children,
  tooltip,
  disabled = false,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  const { size } = useToolbar();

  return (
    <StyledButton
      onClick={() => onPressedChange(!pressed)}
      $variant="default"
      $active={pressed}
      $size={size}
      disabled={disabled}
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
      ref={ref}
      title={tooltip}
      type="button"
      tabIndex={-1}
      aria-pressed={pressed}
      {...rest}
    >
      {icon}
      {!icon && children}
    </StyledButton>
  );
};

ToolbarToggle.displayName = 'Toolbar.Toggle';

const ToolbarGroup: React.FC<ToolbarGroupProps> = ({
  children,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  const { orientation } = useToolbar();

  return (
    <StyledGroup
      $orientation={orientation}
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
      ref={ref}
      role="group"
      {...rest}
    >
      {children}
    </StyledGroup>
  );
};

ToolbarGroup.displayName = 'Toolbar.Group';

const ToolbarSeparator: React.FC<ToolbarSeparatorProps> = ({
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  const { orientation } = useToolbar();
  return (
    <StyledSeparator
      $orientation={orientation}
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
      ref={ref}
      role="separator"
      aria-orientation={
        orientation === 'horizontal' ? 'vertical' : 'horizontal'
      }
      {...rest}
    />
  );
};

ToolbarSeparator.displayName = 'Toolbar.Separator';

const ToolbarSpacer: React.FC<ToolbarSpacerProps> = ({
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  return (
    <StyledSpacer
      className={className}
      style={style}
      data-testid={testId}
      $css={css}
      ref={ref}
      {...rest}
    />
  );
};

ToolbarSpacer.displayName = 'Toolbar.Spacer';

// --- Root Component ---

const ToolbarRoot: React.FC<ToolbarProps> = ({
  $orientation = 'horizontal',
  $size = 'md',
  children,
  className,
  style,
  testId,
  css,
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
        (
          externalRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
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

  return (
    <ToolbarContext.Provider value={{ orientation: $orientation, size: $size }}>
      <StyledToolbar
        ref={setToolbarRef}
        $orientation={$orientation}
        $size={$size}
        className={className}
        style={style}
        data-testid={testId}
        $css={css}
        role="toolbar"
        aria-orientation={$orientation}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...rest}
      >
        {children}
      </StyledToolbar>
    </ToolbarContext.Provider>
  );
};

ToolbarRoot.displayName = 'Toolbar';

// --- Compound Component ---

export const Toolbar = Object.assign(ToolbarRoot, {
  Button: ToolbarButton,
  Toggle: ToolbarToggle,
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
  Spacer: ToolbarSpacer,
});
