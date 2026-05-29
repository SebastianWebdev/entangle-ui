'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useId,
  useMemo,
} from 'react';

import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon';
import { ChevronUpIcon } from '@/components/Icons/ChevronUpIcon';
import { CloseIcon } from '@/components/Icons/CloseIcon';
import { ScrollArea } from '@/components/layout/ScrollArea';
import { useLatest } from '@/hooks/useLatest';
import { useMergedRef } from '@/hooks/useMergedRef';
import { cx } from '@/utils/cx';

import {
  posXVar,
  posYVar,
  panelWidthVar,
  panelHeightVar,
  panelZIndexVar,
  panel,
  header,
  title,
  headerActions,
  headerButton,
  collapsibleVisible,
  collapsibleHidden,
  resizeHandle,
} from './FloatingPanel.css';

import type {
  FloatingPanelProps,
  FloatingManagerProps,
  FloatingManagerContextValue,
  Position,
  FloatingPanelSize,
} from './FloatingPanel.types';

// --- FloatingManager Context ---

const FloatingManagerContext =
  /*#__PURE__*/ createContext<FloatingManagerContextValue | null>(null);

const useFloatingManager = () => useContext(FloatingManagerContext);

export const FloatingManager: React.FC<FloatingManagerProps> = ({
  baseZIndex = 100,
  children,
}) => {
  const stackRef = useRef<string[]>([]);
  const [revision, setRevision] = useState(0);

  const register = useCallback((id: string) => {
    if (!stackRef.current.includes(id)) {
      stackRef.current = [...stackRef.current, id];
      setRevision(c => c + 1);
    }
  }, []);

  const unregister = useCallback((id: string) => {
    stackRef.current = stackRef.current.filter(s => s !== id);
    setRevision(c => c + 1);
  }, []);

  const bringToFront = useCallback((id: string) => {
    const stack = stackRef.current;
    if (stack[stack.length - 1] === id) return; // already on top
    stackRef.current = [...stack.filter(s => s !== id), id];
    setRevision(c => c + 1);
  }, []);

  const getZIndex = useCallback(
    (id: string) => {
      const index = stackRef.current.indexOf(id);
      return baseZIndex + (index >= 0 ? index : 0);
    },
    [baseZIndex]
  );

  const contextValue = useMemo<FloatingManagerContextValue>(
    () => ({ bringToFront, getZIndex, register, unregister }),
    // `revision` is bumped whenever the panel stack changes; it intentionally
    // busts this memo so consumers re-render and re-read z-indices from the
    // (otherwise stable) getZIndex, even though it is not read in the factory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revision, bringToFront, getZIndex, register, unregister]
  );

  return (
    <FloatingManagerContext.Provider value={contextValue}>
      {children}
    </FloatingManagerContext.Provider>
  );
};

FloatingManager.displayName = 'FloatingManager';

// --- FloatingPanel Component ---

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title: panelTitle,
  position: controlledPosition,
  defaultPosition = { x: 100, y: 100 },
  onPositionChange,
  size: controlledSize,
  defaultSize = { width: 280, height: 200 },
  onSizeChange,
  minWidth = 150,
  minHeight = 100,
  maxWidth = Infinity,
  maxHeight = Infinity,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  onClose,
  closable = true,
  resizable = true,
  children,

  className,
  panelId,
  style,
  testId,
  ref: externalRef,
  ...rest
}) => {
  const generatedId = useId();
  const id = panelId ?? generatedId;
  const manager = useFloatingManager();

  // Position state
  const [internalPosition, setInternalPosition] =
    useState<Position>(defaultPosition);
  const pos = controlledPosition ?? internalPosition;
  const setPos = useCallback(
    (p: Position) => {
      if (!controlledPosition) setInternalPosition(p);
      onPositionChange?.(p);
    },
    [controlledPosition, onPositionChange]
  );

  // Size state
  const [internalSize, setInternalSize] =
    useState<FloatingPanelSize>(defaultSize);
  const currentSize = controlledSize ?? internalSize;
  const setSize = useCallback(
    (s: FloatingPanelSize) => {
      if (!controlledSize) setInternalSize(s);
      onSizeChange?.(s);
    },
    [controlledSize, onSizeChange]
  );

  // Collapsed state
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const toggleCollapse = useCallback(() => {
    const next = !isCollapsed;
    if (controlledCollapsed === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }, [isCollapsed, controlledCollapsed, onCollapsedChange]);

  // FloatingManager registration -- use stable id, run once. Latest manager via
  // useLatest so the register/unregister effect and handlers read it without
  // writing a ref during render.
  const managerRef = useLatest(manager);

  useEffect(() => {
    managerRef.current?.register(id);
    // Reading the latest manager from the ref at cleanup is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => managerRef.current?.unregister(id);
    // Register/unregister exactly once per id. managerRef is a stable useLatest
    // ref read at both register and unregister time; the manager is read via
    // the ref because the manager context value changes on every panel
    // registration and must not re-trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBringToFront = useCallback(() => {
    managerRef.current?.bringToFront(id);
  }, [id, managerRef]);

  const zIndex = manager?.getZIndex(id) ?? 100;

  // --- Drag ---
  const panelRef = useRef<HTMLDivElement>(null);
  const setPanelRef = useMergedRef<HTMLDivElement>(panelRef, externalRef);
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      dragOffsetRef.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };

      const handleDragMove = (me: PointerEvent) => {
        const newX = me.clientX - dragOffsetRef.current.x;
        const newY = me.clientY - dragOffsetRef.current.y;
        const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 50));
        const clampedY = Math.max(0, Math.min(newY, window.innerHeight - 30));
        setPos({ x: clampedX, y: clampedY });
      };

      const handleDragEnd = () => {
        target.removeEventListener('pointermove', handleDragMove);
        target.removeEventListener('pointerup', handleDragEnd);
      };

      target.addEventListener('pointermove', handleDragMove);
      target.addEventListener('pointerup', handleDragEnd);
    },
    [pos, setPos]
  );

  // --- Resize (bottom-right corner only) ---
  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = currentSize.width;
      const startH = currentSize.height;

      const handleResizeMove = (me: PointerEvent) => {
        const dx = me.clientX - startX;
        const dy = me.clientY - startY;
        const newW = Math.min(maxWidth, Math.max(minWidth, startW + dx));
        const newH = Math.min(maxHeight, Math.max(minHeight, startH + dy));
        setSize({ width: newW, height: newH });
      };

      const handleResizeEnd = () => {
        target.removeEventListener('pointermove', handleResizeMove);
        target.removeEventListener('pointerup', handleResizeEnd);
      };

      target.addEventListener('pointermove', handleResizeMove);
      target.addEventListener('pointerup', handleResizeEnd);
    },
    [currentSize, minWidth, minHeight, maxWidth, maxHeight, setSize]
  );

  const inlineVars = assignInlineVars({
    [posXVar]: `${pos.x}px`,
    [posYVar]: `${pos.y}px`,
    [panelWidthVar]: `${currentSize.width}px`,
    [panelHeightVar]: isCollapsed ? 'auto' : `${currentSize.height}px`,
    [panelZIndexVar]: String(zIndex),
  });

  return (
    <div
      ref={setPanelRef}
      className={cx(panel, className)}
      data-testid={testId}
      role="dialog"
      aria-modal="false"
      aria-label={panelTitle}
      tabIndex={-1}
      onPointerDown={handleBringToFront}
      style={{
        ...style,
        ...inlineVars,
      }}
      {...rest}
    >
      <div
        className={header}
        onPointerDown={handleDragStart}
        data-testid="panel-header"
      >
        <span className={title}>{panelTitle}</span>
        <div className={headerActions}>
          <span
            className={headerButton}
            role="button"
            tabIndex={0}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? (
              <ChevronDownIcon size="sm" color="secondary" decorative />
            ) : (
              <ChevronUpIcon size="sm" color="secondary" decorative />
            )}
          </span>
          {closable && onClose && (
            <span
              className={headerButton}
              role="button"
              tabIndex={0}
              onClick={onClose}
              aria-label="Close panel"
            >
              <CloseIcon size="sm" color="secondary" decorative />
            </span>
          )}
        </div>
      </div>
      <div className={isCollapsed ? collapsibleHidden : collapsibleVisible}>
        <ScrollArea
          direction="both"
          scrollbarVisibility="auto"
          scrollbarWidth={5}
          autoFill
        >
          {children}
        </ScrollArea>
      </div>
      {resizable && !isCollapsed && (
        <div
          className={resizeHandle}
          onPointerDown={handleResizeStart}
          data-testid="resize-handle"
        />
      )}
    </div>
  );
};

FloatingPanel.displayName = 'FloatingPanel';
