'use client';

import {
  autoUpdate,
  flip,
  offset as offsetMiddleware,
  safePolygon,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cx } from '@/utils/cx';

import { hoverCardContentRecipe } from './HoverCard.css';

import type {
  HoverCardContentProps,
  HoverCardContextValue,
  HoverCardProps,
  HoverCardTriggerProps,
} from './HoverCard.types';

const HoverCardContext =
  /*#__PURE__*/ createContext<HoverCardContextValue | null>(null);

function useHoverCardContext(): HoverCardContextValue {
  const ctx = useContext(HoverCardContext);
  if (!ctx) {
    throw new Error(
      'HoverCard compound components must be used within <HoverCard>'
    );
  }
  return ctx;
}

/**
 * A floating content container anchored to a trigger and shown on hover.
 * Cursor can move from the trigger onto the content without closing
 * (safe-polygon based). Also opens on keyboard focus for accessibility.
 *
 * @example
 * ```tsx
 * <HoverCard>
 *   <HoverCard.Trigger>
 *     <Link>@octocat</Link>
 *   </HoverCard.Trigger>
 *   <HoverCard.Content width={280}>
 *     <UserPreview user={...} />
 *   </HoverCard.Content>
 * </HoverCard>
 * ```
 */
const HoverCardRoot: React.FC<HoverCardProps> = ({
  open: openProp,
  defaultOpen = false,
  placement = 'bottom-start',
  offset = 8,
  openDelay = 400,
  closeDelay = 150,
  portal = true,
  disableSafePolygon = false,
  disabled = false,
  onOpenChange,
  children,
}) => {
  const autoId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const isOpen = disabled ? false : isControlled ? openProp : internalOpen;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (disabled && nextOpen) return;
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [disabled, isControlled, onOpenChange]
  );

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: handleOpenChange,
    placement: placement,
    middleware: [offsetMiddleware(offset), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: !disabled,
    delay: { open: openDelay, close: closeDelay },
    handleClose: disableSafePolygon ? null : safePolygon(),
    move: false,
  });
  const focus = useFocus(context, { enabled: !disabled });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
  ]);

  const contextValue: HoverCardContextValue = useMemo(
    () => ({
      isOpen,
      hoverCardId: autoId,
      portal,
      triggerRef,
      contentRef,
      floatingRefs: refs,
      floatingStyles,
      floatingContext: context,
      getReferenceProps,
      getFloatingProps,
    }),
    [
      isOpen,
      autoId,
      portal,
      refs,
      floatingStyles,
      context,
      getReferenceProps,
      getFloatingProps,
    ]
  );

  return (
    <HoverCardContext.Provider value={contextValue}>
      {children}
    </HoverCardContext.Provider>
  );
};

HoverCardRoot.displayName = 'HoverCard';

const HoverCardTrigger: React.FC<HoverCardTriggerProps> = ({ children }) => {
  const { isOpen, hoverCardId, triggerRef, floatingRefs, getReferenceProps } =
    useHoverCardContext();
  const contentId = `hovercard-${hoverCardId}-content`;

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      floatingRefs.setReference(node);
    },
    [triggerRef, floatingRefs]
  );

  if (!React.isValidElement(children)) return null;

  const referenceProps = getReferenceProps();

  return React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      ref: setRef,
      ...referenceProps,
      'aria-describedby': isOpen ? contentId : undefined,
    }
  );
};

HoverCardTrigger.displayName = 'HoverCard.Trigger';

const HoverCardContent: React.FC<HoverCardContentProps> = ({
  children,
  width,
  maxHeight,
  padding = 'md',
  className,
  style,
  testId,
  ref: externalRef,
  ...rest
}) => {
  const {
    isOpen,
    contentRef,
    portal,
    hoverCardId,
    floatingRefs,
    floatingStyles,
    getFloatingProps,
  } = useHoverCardContext();

  const [visible, setVisible] = useState(false);
  const contentId = `hovercard-${hoverCardId}-content`;

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      floatingRefs.setFloating(node);
      if (typeof externalRef === 'function') {
        externalRef(node);
      } else if (externalRef && typeof externalRef === 'object') {
        externalRef.current = node;
      }
    },
    [contentRef, floatingRefs, externalRef]
  );

  useEffect(() => {
    if (isOpen) {
      const handle = requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => {
        cancelAnimationFrame(handle);
      };
    }
    // Reset enter-animation state on close; gated by the `isOpen` prop, so this
    // is a one-shot transition rather than continuous state synchronization.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(false);
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const dimensionStyles: React.CSSProperties = {};
  if (width != null) {
    dimensionStyles.width =
      typeof width === 'number' ? `${String(width)}px` : width;
  }
  if (maxHeight != null) {
    dimensionStyles.maxHeight =
      typeof maxHeight === 'number' ? `${String(maxHeight)}px` : maxHeight;
    dimensionStyles.overflowY = 'auto';
  }

  const floatingProps = getFloatingProps();

  const element = (
    <div
      ref={setRef}
      role="tooltip"
      id={contentId}
      className={cx(
        hoverCardContentRecipe({
          padding,
          visible: visible || undefined,
        }),
        className
      )}
      style={{
        ...floatingStyles,
        ...dimensionStyles,
        ...style,
      }}
      data-testid={testId}
      {...floatingProps}
      {...rest}
    >
      {children}
    </div>
  );

  if (portal && typeof document !== 'undefined') {
    return createPortal(element, document.body);
  }
  return element;
};

HoverCardContent.displayName = 'HoverCard.Content';

interface HoverCardComponent extends React.FC<HoverCardProps> {
  Trigger: React.FC<HoverCardTriggerProps>;
  Content: React.FC<HoverCardContentProps>;
}

export const HoverCard = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
}) as HoverCardComponent;
