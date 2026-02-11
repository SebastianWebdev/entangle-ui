'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { cx } from '@/utils/cx';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type {
  PanelSurfaceBodyProps,
  PanelSurfaceContextValue,
  PanelSurfaceFooterProps,
  PanelSurfaceHeaderProps,
  PanelSurfaceProps,
} from './PanelSurface.types';
import {
  rootStyle,
  rootBordered,
  rootNoBorder,
  backgroundVar,
  headerRecipe,
  headerActions,
  bodyStyle,
  bodyScrollable,
  bodyHidden,
  footerRecipe,
} from './PanelSurface.css';
import { vars } from '@/theme/contract.css';

const PanelSurfaceContext =
  /*#__PURE__*/ createContext<PanelSurfaceContextValue>({
    size: 'md',
  });

const usePanelSurface = () => useContext(PanelSurfaceContext);

const PanelSurfaceHeader: React.FC<PanelSurfaceHeaderProps> = ({
  children,
  actions,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { size } = usePanelSurface();

  return (
    <div
      ref={ref}
      className={cx(headerRecipe({ size }), className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <span>{children}</span>
      {actions ? <div className={headerActions}>{actions}</div> : null}
    </div>
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
  ref,
  ...rest
}) => {
  const resolvedPadding =
    typeof padding === 'number' ? `${padding}px` : String(padding);

  const mergedStyle: React.CSSProperties = {
    padding: resolvedPadding,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cx(bodyStyle, scroll ? bodyScrollable : bodyHidden, className)}
      style={mergedStyle}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

PanelSurfaceBody.displayName = 'PanelSurface.Body';

const PanelSurfaceFooter: React.FC<PanelSurfaceFooterProps> = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { size } = usePanelSurface();

  return (
    <div
      ref={ref}
      className={cx(footerRecipe({ size }), className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
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
  ref,
  ...rest
}) => {
  const contextValue = useMemo(() => ({ size }), [size]);

  const mergedStyle: React.CSSProperties = {
    ...assignInlineVars({
      [backgroundVar]: background ?? vars.colors.background.secondary,
    }),
    ...style,
  };

  return (
    <PanelSurfaceContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cx(
          rootStyle,
          bordered ? rootBordered : rootNoBorder,
          className
        )}
        style={mergedStyle}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    </PanelSurfaceContext.Provider>
  );
};

PanelSurfaceRoot.displayName = 'PanelSurface';

export const PanelSurface = /*#__PURE__*/ Object.assign(PanelSurfaceRoot, {
  Header: PanelSurfaceHeader,
  Body: PanelSurfaceBody,
  Footer: PanelSurfaceFooter,
});
