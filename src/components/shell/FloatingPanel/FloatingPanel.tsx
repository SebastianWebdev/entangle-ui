import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useId,
} from 'react';
import styled from '@emotion/styled';
import type {
  FloatingPanelProps,
  FloatingManagerProps,
  FloatingManagerContextValue,
  Position,
  FloatingPanelSize,
} from './FloatingPanel.types';

// --- FloatingManager Context ---

const FloatingManagerContext =
  createContext<FloatingManagerContextValue | null>(null);

const useFloatingManager = () => useContext(FloatingManagerContext);

export const FloatingManager: React.FC<FloatingManagerProps> = ({
  baseZIndex = 100,
  children,
}) => {
  const stackRef = useRef<string[]>([]);
  const [, forceUpdate] = useState(0);

  const register = useCallback((id: string) => {
    if (!stackRef.current.includes(id)) {
      stackRef.current = [...stackRef.current, id];
      forceUpdate(c => c + 1);
    }
  }, []);

  const unregister = useCallback((id: string) => {
    stackRef.current = stackRef.current.filter(s => s !== id);
    forceUpdate(c => c + 1);
  }, []);

  const bringToFront = useCallback((id: string) => {
    const filtered = stackRef.current.filter(s => s !== id);
    stackRef.current = [...filtered, id];
    forceUpdate(c => c + 1);
  }, []);

  const getZIndex = useCallback(
    (id: string) => {
      const index = stackRef.current.indexOf(id);
      return baseZIndex + (index >= 0 ? index : 0);
    },
    [baseZIndex]
  );

  return (
    <FloatingManagerContext.Provider
      value={{ bringToFront, getZIndex, register, unregister }}
    >
      {children}
    </FloatingManagerContext.Provider>
  );
};

FloatingManager.displayName = 'FloatingManager';

// --- Styled Components ---

const StyledPanel = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.border.focus};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  cursor: grab;
  user-select: none;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
`;

const StyledTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

const StyledHeaderButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  font-size: 12px;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const StyledBody = styled.div<{ $collapsed: boolean }>`
  overflow: auto;
  transition: max-height ${({ theme }) => theme.transitions.normal};
  ${({ $collapsed }) =>
    $collapsed ? 'max-height: 0; overflow: hidden;' : 'max-height: 9999px;'}
`;

const StyledResizeHandle = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  cursor: se-resize;

  &::after {
    content: '';
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 6px;
    height: 6px;
    border-right: 2px solid ${({ theme }) => theme.colors.text.muted};
    border-bottom: 2px solid ${({ theme }) => theme.colors.text.muted};
  }
`;

// --- FloatingPanel Component ---

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title,
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
  const [internalSize, setInternalSize] = useState<FloatingPanelSize>(defaultSize);
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

  // FloatingManager registration
  useEffect(() => {
    manager?.register(id);
    return () => manager?.unregister(id);
  }, [id, manager]);

  const handleFocus = useCallback(() => {
    manager?.bringToFront(id);
  }, [id, manager]);

  const zIndex = manager?.getZIndex(id) ?? 100;

  // --- Drag ---
  const panelRef = useRef<HTMLDivElement>(null);
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
        // Constrain to viewport
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

  return (
    <StyledPanel
      ref={panelRef}
      className={className}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      onFocus={handleFocus}
      onPointerDown={handleFocus}
      style={{
        left: pos.x,
        top: pos.y,
        width: currentSize.width,
        zIndex,
      }}
    >
      <StyledHeader onPointerDown={handleDragStart} data-testid="panel-header">
        <StyledTitle>{title}</StyledTitle>
        <StyledHeaderActions>
          <StyledHeaderButton
            role="button"
            tabIndex={0}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? '▼' : '▲'}
          </StyledHeaderButton>
          {closable && onClose && (
            <StyledHeaderButton
              role="button"
              tabIndex={0}
              onClick={onClose}
              aria-label="Close panel"
            >
              ✕
            </StyledHeaderButton>
          )}
        </StyledHeaderActions>
      </StyledHeader>
      <StyledBody $collapsed={isCollapsed}>{children}</StyledBody>
      {resizable && !isCollapsed && (
        <StyledResizeHandle
          onPointerDown={handleResizeStart}
          data-testid="resize-handle"
        />
      )}
    </StyledPanel>
  );
};

FloatingPanel.displayName = 'FloatingPanel';
