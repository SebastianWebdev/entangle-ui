import React, { createContext, useContext, useMemo } from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type { Theme } from '@/theme';
import type {
  StatusBarProps,
  StatusBarSectionProps,
  StatusBarItemProps,
  StatusBarContextValue,
  StatusBarVariant,
  StatusBarSize,
  StatusBarSectionSide,
} from './StatusBar.types';

const StatusBarContext = /*#__PURE__*/ createContext<StatusBarContextValue>({
  size: 'sm',
});

const useStatusBar = () => useContext(StatusBarContext);

// --- Styled Components ---

const StyledStatusBar = styled.div<{
  $variant: StatusBarVariant;
  $size: StatusBarSize;
  $css?: StatusBarProps['css'];
}>`
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: ${({ $size, theme }) =>
    $size === 'sm' ? `${theme.shell.statusBar.height}px` : '26px'};
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'error':
        return theme.colors.accent.error;
      case 'accent':
        return theme.shell.statusBar.bg;
      default:
        return theme.shell.statusBar.bg;
    }
  }};
  color: ${({ theme }) => theme.shell.statusBar.text};
  font-size: ${({ theme }) => theme.typography.fontSize.md}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledSection = styled.div<{
  $side: StatusBarSectionSide;
  $css?: StatusBarSectionProps['css'];
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  flex: ${({ $side }) => ($side === 'left' ? '1 1 auto' : '0 0 auto')};
  justify-content: ${({ $side }) =>
    $side === 'left' ? 'flex-start' : 'flex-end'};
  overflow: hidden;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const itemStyles = (props: { theme: Theme }) => `
  display: inline-flex;
  align-items: center;
  gap: ${props.theme.spacing.sm}px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  padding: 0 ${props.theme.spacing.sm}px;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
  position: relative;
`;

const StyledItemButton = styled.button<{ $css?: StatusBarItemProps['css'] }>`
  ${props => itemStyles(props)}
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.whiteOverlay};
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: -1px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    &:hover {
      background: transparent;
    }
  }

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledItemSpan = styled.span<{ $css?: StatusBarItemProps['css'] }>`
  ${props => itemStyles(props)}

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledBadge = styled.span<{ $dot: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ $dot }) => ($dot ? '6px' : '14px')};
  height: ${({ $dot }) => ($dot ? '6px' : '14px')};
  border-radius: ${({ $dot }) => ($dot ? '50%' : '7px')};
  background: ${({ theme }) => theme.colors.accent.warning};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxs}px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  padding: ${({ $dot }) => ($dot ? '0' : '0 3px')};
  line-height: 1;
`;

// --- Sub-components ---

const StatusBarSection = /*#__PURE__*/ React.memo<StatusBarSectionProps>(
  ({
    $side = 'left',
    children,
    className,
    style,
    testId,
    css,
    ref,
    ...rest
  }) => {
    return (
      <StyledSection
        ref={ref}
        $side={$side}
        className={className}
        style={style}
        data-testid={testId}
        $css={css}
        {...rest}
      >
        {children}
      </StyledSection>
    );
  }
);

StatusBarSection.displayName = 'StatusBar.Section';

const StatusBarItem = /*#__PURE__*/ React.memo<StatusBarItemProps>(
  ({
    onClick,
    icon,
    children,
    title,
    badge,
    disabled = false,
    className,
    style,
    testId,
    css,
    ref,
    ...rest
  }) => {
    useStatusBar();

    const content = (
      <>
        {icon}
        {children && <span>{children}</span>}
        {badge !== undefined && badge !== false && (
          <StyledBadge $dot={badge === true}>
            {typeof badge === 'number' ? badge : null}
          </StyledBadge>
        )}
      </>
    );

    if (onClick) {
      return (
        <StyledItemButton
          onClick={onClick}
          title={title}
          disabled={disabled}
          className={className}
          style={style}
          data-testid={testId}
          $css={css}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          {...rest}
        >
          {content}
        </StyledItemButton>
      );
    }

    return (
      <StyledItemSpan
        title={title}
        className={className}
        style={style}
        data-testid={testId}
        $css={css}
        ref={ref as React.Ref<HTMLSpanElement>}
        {...rest}
      >
        {content}
      </StyledItemSpan>
    );
  }
);

StatusBarItem.displayName = 'StatusBar.Item';

// --- Root Component ---

const StatusBarRoot: React.FC<StatusBarProps> = ({
  $size = 'sm',
  $variant = 'default',
  children,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  const contextValue = useMemo(() => ({ size: $size }), [$size]);

  return (
    <StatusBarContext.Provider value={contextValue}>
      <StyledStatusBar
        ref={ref}
        $variant={$variant}
        $size={$size}
        className={className}
        style={style}
        data-testid={testId}
        $css={css}
        role="status"
        aria-live="polite"
        {...rest}
      >
        {children}
      </StyledStatusBar>
    </StatusBarContext.Provider>
  );
};

StatusBarRoot.displayName = 'StatusBar';

// --- Compound Component ---

export const StatusBar = /*#__PURE__*/ Object.assign(StatusBarRoot, {
  Section: StatusBarSection,
  Item: StatusBarItem,
});
