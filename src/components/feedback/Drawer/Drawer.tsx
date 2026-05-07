'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMergedRef } from '@/hooks/useMergedRef';
import { cx } from '@/utils/cx';
import {
  DRAWER_SIZE_MAP,
  drawerBodyStyle,
  drawerCloseButtonStyle,
  drawerDescriptionStyle,
  drawerFooterRecipe,
  drawerHeaderContentStyle,
  drawerHeaderStyle,
  drawerPanelRecipe,
  drawerTitleStyle,
  overlayRecipe,
} from './Drawer.css';
import type {
  DrawerBodyProps,
  DrawerCloseButtonProps,
  DrawerContextValue,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerProps,
  DrawerSize,
} from './Drawer.types';
import { useDrawerAnimation } from './useDrawerAnimation';

const DrawerContext = /*#__PURE__*/ createContext<DrawerContextValue | null>(
  null
);

function useDrawerContext(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error('Drawer sub-components must be used within <Drawer>');
  }
  return ctx;
}

function resolveSize(
  size: DrawerSize,
  anchor: 'left' | 'right' | 'top' | 'bottom'
) {
  const isHorizontal = anchor === 'left' || anchor === 'right';
  const dimension = isHorizontal ? 'width' : 'height';
  let value: string;
  if (typeof size === 'number') {
    value = `${String(size)}px`;
  } else {
    value = DRAWER_SIZE_MAP[size] ?? size;
  }
  return {
    [dimension]: value,
    maxWidth: '100vw',
    maxHeight: '100vh',
  } as React.CSSProperties;
}

/**
 * Anchored sliding panel for secondary navigation, filters, or detail views.
 * Modal mode renders an overlay backdrop and traps focus; non-modal mode
 * leaves the rest of the page interactive.
 *
 * @example
 * ```tsx
 * <Drawer open={isOpen} onClose={close} anchor="right" size="md">
 *   <Drawer.Header>Filters</Drawer.Header>
 *   <Drawer.Body>...</Drawer.Body>
 *   <Drawer.Footer>
 *     <Button onClick={close}>Cancel</Button>
 *     <Button variant="filled">Apply</Button>
 *   </Drawer.Footer>
 * </Drawer>
 * ```
 */
const DrawerRoot: React.FC<DrawerProps> = ({
  open,
  onClose,
  anchor = 'right',
  size = 'md',
  modal = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  trapFocus,
  initialFocusRef,
  portal = true,
  title,
  description,
  className,
  style,
  testId,
  id,
  children,
  ref,
  ...rest
}) => {
  const autoId = useId();
  const titleId = `drawer-title-${autoId}`;
  const descriptionId = `drawer-desc-${autoId}`;
  const panelRef = useRef<HTMLDivElement>(null);

  const shouldTrapFocus = trapFocus ?? modal;

  const { mounted, closing } = useDrawerAnimation({
    open,
    panelRef,
    initialFocusRef,
    shouldFocus: shouldTrapFocus,
  });

  const handleFocusTrap = useFocusTrap({
    containerRef: panelRef,
    enabled: shouldTrapFocus,
  });

  const setPanelRef = useMergedRef<HTMLDivElement>(panelRef, ref);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      handleFocusTrap(e);
    },
    [closeOnEscape, onClose, handleFocusTrap]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  if (!mounted) return null;

  const contextValue: DrawerContextValue = {
    onClose,
    titleId,
    descriptionId,
  };

  const sizeStyle = resolveSize(size, anchor);

  const drawerContent = (
    <DrawerContext.Provider value={contextValue}>
      {modal && (
        <div
          className={overlayRecipe({ closing })}
          onClick={handleOverlayClick}
          data-testid={testId ? `${testId}-overlay` : undefined}
        />
      )}
      <div
        ref={setPanelRef}
        role="dialog"
        aria-modal={modal ? 'true' : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cx(
          drawerPanelRecipe({ anchor, state: closing ? 'closing' : 'open' }),
          className
        )}
        style={{ ...sizeStyle, ...style }}
        id={id}
        data-testid={testId}
        data-anchor={anchor}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {title && (
          <span id={titleId} style={{ display: 'none' }}>
            {title}
          </span>
        )}
        {description && (
          <span id={descriptionId} style={{ display: 'none' }}>
            {description}
          </span>
        )}
        {children}
      </div>
    </DrawerContext.Provider>
  );

  if (portal && typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }
  return drawerContent;
};

DrawerRoot.displayName = 'Drawer';

const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  children,
  showClose = true,
  description,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { onClose, titleId, descriptionId } = useDrawerContext();
  return (
    <div
      ref={ref}
      className={cx(drawerHeaderStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <div className={drawerHeaderContentStyle}>
        <div id={titleId} className={drawerTitleStyle}>
          {children}
        </div>
        {description && (
          <div id={descriptionId} className={drawerDescriptionStyle}>
            {description}
          </div>
        )}
      </div>
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawer"
          className={drawerCloseButtonStyle}
          data-testid={testId ? `${testId}-close` : undefined}
        >
          <CloseSvg />
        </button>
      )}
    </div>
  );
};

DrawerHeader.displayName = 'Drawer.Header';

const DrawerBody: React.FC<DrawerBodyProps> = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => (
  <div
    ref={ref}
    className={cx(drawerBodyStyle, className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </div>
);

DrawerBody.displayName = 'Drawer.Body';

const DrawerFooter: React.FC<DrawerFooterProps> = ({
  children,
  align = 'right',
  className,
  style,
  testId,
  ref,
  ...rest
}) => (
  <div
    ref={ref}
    className={cx(drawerFooterRecipe({ align }), className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </div>
);

DrawerFooter.displayName = 'Drawer.Footer';

const DrawerCloseButton: React.FC<DrawerCloseButtonProps> = ({
  children,
  className,
  style,
  testId,
  'aria-label': ariaLabel = 'Close drawer',
  ref,
  ...rest
}) => {
  const { onClose } = useDrawerContext();
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      aria-label={ariaLabel}
      className={cx(drawerCloseButtonStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {children ?? <CloseSvg />}
    </button>
  );
};

DrawerCloseButton.displayName = 'Drawer.CloseButton';

function CloseSvg() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 1L11 11M11 1L1 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface DrawerComponent extends React.FC<DrawerProps> {
  Header: React.FC<DrawerHeaderProps>;
  Body: React.FC<DrawerBodyProps>;
  Footer: React.FC<DrawerFooterProps>;
  CloseButton: React.FC<DrawerCloseButtonProps>;
}

export const Drawer = Object.assign(DrawerRoot, {
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  CloseButton: DrawerCloseButton,
}) as DrawerComponent;
