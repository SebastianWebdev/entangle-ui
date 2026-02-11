'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import type { ToastInternalData, ToastPosition } from './Toast.types';
import { ToastItem } from './ToastItem';
import {
  gapVar,
  zIndexVar,
  container,
  containerReverse,
  containerNormal,
} from './ToastContainer.css';

// --- Position style map ---

const POSITION_STYLES: Record<ToastPosition, React.CSSProperties> = {
  'top-right': { top: 16, right: 16 },
  'top-left': { top: 16, left: 16 },
  'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
};

// --- Props ---

interface ToastContainerProps {
  toasts: ToastInternalData[];
  position: ToastPosition;
  gap: number;
  zIndex: number;
  onDismiss: (id: string) => void;
}

/**
 * ToastContainer positions toast items at the specified screen edge.
 * Bottom positions use column-reverse so the newest toast appears at the bottom.
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position,
  gap,
  zIndex,
  onDismiss,
}) => {
  const isBottom = position.startsWith('bottom');
  const positionStyle = POSITION_STYLES[position];

  const inlineVars = assignInlineVars({
    [gapVar]: `${gap}px`,
    [zIndexVar]: String(zIndex),
  });

  return (
    <div
      className={cx(container, isBottom ? containerReverse : containerNormal)}
      style={{
        ...positionStyle,
        ...inlineVars,
      }}
      aria-label="Notifications"
      role="region"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';
