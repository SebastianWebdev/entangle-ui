import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import type { ToastInternalData, ToastSeverity } from './Toast.types';
import type { Theme } from '@/theme';

// --- Severity color map ---

const SEVERITY_COLOR_MAP: Record<
  ToastSeverity,
  keyof Theme['colors']['accent']
> = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

// --- Severity icons (inline SVGs) ---

const SeverityIcon: React.FC<{ severity: ToastSeverity; color: string }> = ({
  severity,
  color,
}) => {
  const size = 16;
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    'aria-hidden': true as const,
  };

  switch (severity) {
    case 'info':
      return (
        <svg {...commonProps}>
          <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
          <line
            x1="8"
            y1="7"
            x2="8"
            y2="11"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="5" r="0.75" fill={color} />
        </svg>
      );
    case 'success':
      return (
        <svg {...commonProps}>
          <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
          <path
            d="M5 8L7 10L11 6"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg {...commonProps}>
          <path
            d="M8 2L14.5 13H1.5L8 2Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="6"
            x2="8"
            y2="9"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11" r="0.75" fill={color} />
        </svg>
      );
    case 'error':
      return (
        <svg {...commonProps}>
          <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
          <line
            x1="5.5"
            y1="5.5"
            x2="10.5"
            y2="10.5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="10.5"
            y1="5.5"
            x2="5.5"
            y2="10.5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};

// --- Animations ---

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const progressShrink = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

// --- Styled components ---

interface StyledToastProps {
  $severity: ToastSeverity;
}

const StyledToast = styled.div<StyledToastProps>`
  width: 360px;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-left: 3px solid
    ${props => props.theme.colors.accent[SEVERITY_COLOR_MAP[props.$severity]]};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.md}px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  animation: ${slideIn} ${props => props.theme.transitions.normal} forwards;
`;

const StyledContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md}px;
`;

const StyledIconWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-top: 1px;
`;

const StyledTextContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm}px;
  line-height: ${props => props.theme.typography.lineHeight.normal};
`;

const StyledMessage = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  line-height: ${props => props.theme.typography.lineHeight.normal};
  margin-top: ${props => props.theme.spacing.xs}px;
`;

const StyledCloseButton = styled.button`
  /* Reset */
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  outline: none;

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  color: ${props => props.theme.colors.text.muted};
  transition:
    color ${props => props.theme.transitions.fast},
    background ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text.primary};
    background: ${props => props.theme.colors.surface.hover};
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

interface StyledActionButtonProps {
  $severity: ToastSeverity;
}

const StyledActionButton = styled.button<StyledActionButtonProps>`
  /* Reset */
  padding: ${props => props.theme.spacing.xs}px
    ${props => props.theme.spacing.sm}px;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  outline: none;

  /* Styling */
  color: ${props =>
    props.theme.colors.accent[SEVERITY_COLOR_MAP[props.$severity]]};
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.sm}px;
  transition: background ${props => props.theme.transitions.fast};
  margin-top: ${props => props.theme.spacing.sm}px;

  &:hover {
    background: ${props => props.theme.colors.surface.hover};
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

interface StyledProgressBarProps {
  $severity: ToastSeverity;
  $duration: number;
  $paused: boolean;
}

const StyledProgressBar = styled.div<StyledProgressBarProps>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${props =>
    props.theme.colors.accent[SEVERITY_COLOR_MAP[props.$severity]]};
  animation: ${progressShrink} ${props => props.$duration}ms linear forwards;
  animation-play-state: ${props => (props.$paused ? 'paused' : 'running')};
`;

// --- ToastItem component ---

interface ToastItemProps {
  toast: ToastInternalData;
  onDismiss: (id: string) => void;
}

/**
 * Individual toast notification with severity indicator, auto-dismiss,
 * optional progress bar, and action button support.
 *
 * - info/success: role="status", aria-live="polite"
 * - warning/error: role="alert", aria-live="assertive"
 * - Auto-dismiss pauses on hover
 */
export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const {
    id,
    title,
    message,
    severity,
    duration,
    closable,
    showProgress,
    icon,
    action,
  } = toast;

  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startRef = useRef(Date.now());

  const isAlert = severity === 'warning' || severity === 'error';
  const role = isAlert ? 'alert' : 'status';
  const ariaLive = isAlert ? 'assertive' : 'polite';

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (duration <= 0) return;
    clearTimer();
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, remainingRef.current);
  }, [duration, clearTimer, onDismiss, id]);

  const handleMouseEnter = useCallback(() => {
    if (duration <= 0) return;
    setPaused(true);
    clearTimer();
    remainingRef.current -= Date.now() - startRef.current;
  }, [duration, clearTimer]);

  const handleMouseLeave = useCallback(() => {
    if (duration <= 0) return;
    setPaused(false);
    startTimer();
  }, [duration, startTimer]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  return (
    <StyledToast
      $severity={severity}
      role={role}
      aria-live={ariaLive}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={`toast-${id}`}
    >
      <StyledContent>
        <StyledIconWrapper>
          {icon ?? <SeverityIcon severity={severity} color="currentColor" />}
        </StyledIconWrapper>
        <StyledTextContent>
          {title && <StyledTitle>{title}</StyledTitle>}
          <StyledMessage>{message}</StyledMessage>
          {action && (
            <StyledActionButton
              $severity={severity}
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </StyledActionButton>
          )}
        </StyledTextContent>
        {closable && (
          <StyledCloseButton
            onClick={() => onDismiss(id)}
            aria-label="Dismiss notification"
            type="button"
          >
            <svg
              width={12}
              height={12}
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="2"
                y1="2"
                x2="10"
                y2="10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="10"
                y1="2"
                x2="2"
                y2="10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </StyledCloseButton>
        )}
      </StyledContent>
      {showProgress && duration > 0 && (
        <StyledProgressBar
          $severity={severity}
          $duration={duration}
          $paused={paused}
          data-testid={`toast-progress-${id}`}
        />
      )}
    </StyledToast>
  );
};

ToastItem.displayName = 'ToastItem';
