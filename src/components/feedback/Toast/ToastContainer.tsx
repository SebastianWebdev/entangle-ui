import React from 'react';
import styled from '@emotion/styled';
import type { ToastInternalData, ToastPosition } from './Toast.types';
import { ToastItem } from './ToastItem';

// --- Position style map ---

const POSITION_STYLES: Record<ToastPosition, React.CSSProperties> = {
  'top-right': { top: 16, right: 16 },
  'top-left': { top: 16, left: 16 },
  'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
};

// --- Styled container ---

interface StyledContainerProps {
  $gap: number;
  $zIndex: number;
  $isBottom: boolean;
}

const StyledContainer = styled.div<StyledContainerProps>`
  position: fixed;
  display: flex;
  flex-direction: ${props => (props.$isBottom ? 'column-reverse' : 'column')};
  gap: ${props => props.$gap}px;
  z-index: ${props => props.$zIndex};
  pointer-events: none;
`;

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

  return (
    <StyledContainer
      $gap={gap}
      $zIndex={zIndex}
      $isBottom={isBottom}
      style={positionStyle}
      aria-label="Notifications"
      role="region"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </StyledContainer>
  );
};

ToastContainer.displayName = 'ToastContainer';
