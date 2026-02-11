import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import type { DialogContextValue, DialogProps } from './Dialog.types';
import { overlayRecipe, dialogPanelRecipe } from './Dialog.css';
import { useDialogAnimation } from './useDialogAnimation';
import { useFocusTrap } from './useFocusTrap';
import { cx } from '@/utils/cx';

// --- Context ---

const DialogContext = /*#__PURE__*/ createContext<DialogContextValue | null>(
  null
);

export function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(
      'Dialog sub-components must be used within a <Dialog> component'
    );
  }
  return ctx;
}

// --- Component ---

/**
 * Dialog component for modal overlays in editor interfaces.
 *
 * Renders an accessible modal dialog with overlay, focus trap,
 * and keyboard support. Compound component pattern: use with
 * DialogHeader, DialogBody, DialogFooter, and DialogClose.
 *
 * @example
 * ```tsx
 * <Dialog open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
 *   <DialogHeader>Confirm Action</DialogHeader>
 *   <DialogBody>Are you sure?</DialogBody>
 *   <DialogFooter align="right">
 *     <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="filled">Confirm</Button>
 *   </DialogFooter>
 * </Dialog>
 * ```
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  size = 'md',
  title,
  description,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showOverlay = true,
  trapFocus = true,
  initialFocusRef,
  portal = true,
  children,
  className,
  style,
  testId,
  id,
  ref,
  ...rest
}) => {
  const autoId = useId();
  const titleId = `dialog-title-${autoId}`;
  const descriptionId = `dialog-desc-${autoId}`;
  const panelRef = useRef<HTMLDivElement>(null);

  const { mounted, closing } = useDialogAnimation({
    open,
    panelRef,
    initialFocusRef,
  });

  const handleFocusTrap = useFocusTrap({
    containerRef: panelRef,
    enabled: trapFocus,
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Escape handler — inline instead of global document listener
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      // Focus trap
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

  const contextValue: DialogContextValue = {
    onClose,
    titleId,
    descriptionId,
  };

  const dialogContent = (
    <DialogContext.Provider value={contextValue}>
      {showOverlay && (
        <div
          className={overlayRecipe({ closing })}
          onClick={handleOverlayClick}
          data-testid={testId ? `${testId}-overlay` : undefined}
        />
      )}
      <div
        ref={(node: HTMLDivElement | null) => {
          (panelRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cx(dialogPanelRecipe({ size, closing }), className)}
        style={style}
        id={id}
        data-testid={testId}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {/* Hidden elements for ARIA references when using title/description props */}
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
    </DialogContext.Provider>
  );

  if (portal) {
    return createPortal(dialogContent, document.body);
  }

  return dialogContent;
};

Dialog.displayName = 'Dialog';
