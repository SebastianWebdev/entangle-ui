import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { processCss } from '@/utils/styledUtils';
import type {
  DialogContextValue,
  DialogProps,
  DialogSize,
} from './Dialog.types';

// --- Context ---

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(
      'Dialog sub-components must be used within a <Dialog> component'
    );
  }
  return ctx;
}

// --- Size map ---

const DIALOG_SIZE_MAP: Record<DialogSize, string> = {
  sm: '360px',
  md: '480px',
  lg: '640px',
  xl: '800px',
  fullscreen: 'calc(100vw - 48px)',
};

// --- Focusable elements selector ---

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// --- Animations ---

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const overlayFadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const panelFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const panelFadeOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
`;

// --- Styled components ---

const StyledOverlay = styled.div<{
  $closing: boolean;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 1100;
  animation: ${props => (props.$closing ? overlayFadeOut : overlayFadeIn)} 150ms
    ease-out forwards;
`;

const StyledDialogPanel = styled.div<{
  $size: DialogSize;
  $closing: boolean;
  $css?: DialogProps['css'];
}>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1100;
  width: ${props => DIALOG_SIZE_MAP[props.$size]};
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  box-shadow: ${props => props.theme.shadows.lg};
  font-family: ${props => props.theme.typography.fontFamily.sans};
  outline: none;
  animation: ${props => (props.$closing ? panelFadeOut : panelFadeIn)} 200ms
    ease-out forwards;

  ${props => processCss(props.$css, props.theme)}
`;

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
  css,
  testId,
  id,
  ref,
  ...rest
}) => {
  const autoId = useId();
  const titleId = `dialog-title-${autoId}`;
  const descriptionId = `dialog-desc-${autoId}`;

  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mountedRef = useRef(false);

  // Keep ref in sync with state
  mountedRef.current = mounted;

  // Track open/close for mount/unmount with animation
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setClosing(false);
      setMounted(true);
      return undefined;
    } else if (mountedRef.current) {
      setClosing(true);
      const timer = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 200); // Match panel animation duration
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  // Initial focus
  useEffect(() => {
    if (!open || !mounted) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const panel = panelRef.current;
        if (panel) {
          const firstFocusable = panel.querySelector(
            FOCUSABLE_SELECTOR
          ) as HTMLElement;
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            panel.focus();
          }
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [open, mounted, initialFocusRef]);

  // Return focus on close
  useEffect(() => {
    if (!open && !mounted && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open, mounted]);

  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!trapFocus || e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [trapFocus]
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
        <StyledOverlay
          $closing={closing}
          onClick={handleOverlayClick}
          data-testid={testId ? `${testId}-overlay` : undefined}
        />
      )}
      <StyledDialogPanel
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
        $size={size}
        $closing={closing}
        $css={css}
        className={className}
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
      </StyledDialogPanel>
    </DialogContext.Provider>
  );

  if (portal) {
    return createPortal(dialogContent, document.body);
  }

  return dialogContent;
};

Dialog.displayName = 'Dialog';
