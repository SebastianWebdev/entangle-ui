import React, { createContext, useContext } from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type { Theme } from '@/theme';
import type {
  PanelSurfaceBodyProps,
  PanelSurfaceContextValue,
  PanelSurfaceFooterProps,
  PanelSurfaceHeaderProps,
  PanelSurfaceProps,
  PanelSurfaceSize,
} from './PanelSurface.types';

const PanelSurfaceContext = createContext<PanelSurfaceContextValue>({
  size: 'md',
});

const usePanelSurface = () => useContext(PanelSurfaceContext);

interface HeaderSizeConfig {
  minHeight: number;
  paddingKey: keyof Theme['spacing'];
  fontKey: keyof Theme['typography']['fontSize'];
}

const HEADER_SIZE_MAP: Record<PanelSurfaceSize, HeaderSizeConfig> = {
  sm: { minHeight: 24, paddingKey: 'sm', fontKey: 'xs' },
  md: { minHeight: 28, paddingKey: 'md', fontKey: 'sm' },
  lg: { minHeight: 32, paddingKey: 'lg', fontKey: 'md' },
};

interface StyledRootProps {
  $bordered: boolean;
  $background?: string;
  $css?: PanelSurfaceProps['css'];
}

const StyledRoot = styled.div<StyledRootProps>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: ${({ $background, theme }) =>
    $background ?? theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: ${({ $bordered, theme }) =>
    $bordered ? `1px solid ${theme.colors.border.default}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;

  ${({ $css, theme }) => processCss($css, theme)}
`;

interface StyledHeaderProps {
  $size: PanelSurfaceSize;
  $css?: PanelSurfaceHeaderProps['css'];
}

const StyledHeader = styled.div<StyledHeaderProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: ${({ $size }) => HEADER_SIZE_MAP[$size].minHeight}px;
  padding: 0 ${({ $size, theme }) => theme.spacing[HEADER_SIZE_MAP[$size].paddingKey]}px;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ $size, theme }) =>
    theme.typography.fontSize[HEADER_SIZE_MAP[$size].fontKey]}px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  flex-shrink: 0;
  user-select: none;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const StyledHeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

interface StyledBodyProps {
  $scroll: boolean;
  $padding: string;
  $css?: PanelSurfaceBodyProps['css'];
}

const StyledBody = styled.div<StyledBodyProps>`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: ${({ $scroll }) => ($scroll ? 'auto' : 'hidden')};
  padding: ${({ $padding }) => $padding};

  ${({ $css, theme }) => processCss($css, theme)}
`;

interface StyledFooterProps {
  $size: PanelSurfaceSize;
  $css?: PanelSurfaceFooterProps['css'];
}

const StyledFooter = styled.div<StyledFooterProps>`
  display: flex;
  align-items: center;
  min-height: ${({ $size }) => HEADER_SIZE_MAP[$size].minHeight}px;
  padding: 0 ${({ $size, theme }) => theme.spacing[HEADER_SIZE_MAP[$size].paddingKey]}px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ $size, theme }) =>
    theme.typography.fontSize[HEADER_SIZE_MAP[$size].fontKey]}px;
  flex-shrink: 0;

  ${({ $css, theme }) => processCss($css, theme)}
`;

const PanelSurfaceHeader: React.FC<PanelSurfaceHeaderProps> = ({
  children,
  actions,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  const { size } = usePanelSurface();

  return (
    <StyledHeader
      ref={ref}
      className={className}
      style={style}
      data-testid={testId}
      $size={size}
      $css={css}
      {...rest}
    >
      <span>{children}</span>
      {actions ? <StyledHeaderActions>{actions}</StyledHeaderActions> : null}
    </StyledHeader>
  );
};

PanelSurfaceHeader.displayName = 'PanelSurface.Header';

const PanelSurfaceBody: React.FC<PanelSurfaceBodyProps> = ({
  children,
  scroll = false,
  padding = 0,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  const resolvedPadding =
    typeof padding === 'number' ? `${padding}px` : String(padding);

  return (
    <StyledBody
      ref={ref}
      className={className}
      style={style}
      data-testid={testId}
      $scroll={scroll}
      $padding={resolvedPadding}
      $css={css}
      {...rest}
    >
      {children}
    </StyledBody>
  );
};

PanelSurfaceBody.displayName = 'PanelSurface.Body';

const PanelSurfaceFooter: React.FC<PanelSurfaceFooterProps> = ({
  children,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  const { size } = usePanelSurface();

  return (
    <StyledFooter
      ref={ref}
      className={className}
      style={style}
      data-testid={testId}
      $size={size}
      $css={css}
      {...rest}
    >
      {children}
    </StyledFooter>
  );
};

PanelSurfaceFooter.displayName = 'PanelSurface.Footer';

const PanelSurfaceRoot: React.FC<PanelSurfaceProps> = ({
  children,
  size = 'md',
  bordered = true,
  background,
  className,
  style,
  testId,
  css,
  ref,
  ...rest
}) => {
  return (
    <PanelSurfaceContext.Provider value={{ size }}>
      <StyledRoot
        ref={ref}
        className={className}
        style={style}
        data-testid={testId}
        $bordered={bordered}
        $background={background}
        $css={css}
        {...rest}
      >
        {children}
      </StyledRoot>
    </PanelSurfaceContext.Provider>
  );
};

PanelSurfaceRoot.displayName = 'PanelSurface';

export const PanelSurface = Object.assign(PanelSurfaceRoot, {
  Header: PanelSurfaceHeader,
  Body: PanelSurfaceBody,
  Footer: PanelSurfaceFooter,
});
