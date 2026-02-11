import React, { useEffect, useRef, useState, useCallback } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { ToastInternalData, ToastSeverity } from './Toast.types';
import {
  progressDurationVar,
  toast,
  content,
  iconWrapper,
  textContent,
  titleStyle,
  message,
  closeButton,
  actionButton,
  progressBar,
} from './ToastItem.css';

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
export const ToastItem: React.FC<ToastItemProps> = ({ toast: toastData, onDismiss }) => {
  const {
    id,
    title,
    message: msg,
    severity,
    duration,
    closable,
    showProgress,
    icon,
    action,
  } = toastData;

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
    <div
      className={toast({ severity })}
      role={role}
      aria-live={ariaLive}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={`toast-${id}`}
    >
      <div className={content}>
        <div className={iconWrapper}>
          {icon ?? <SeverityIcon severity={severity} color="currentColor" />}
        </div>
        <div className={textContent}>
          {title && <div className={titleStyle}>{title}</div>}
          <div className={message}>{msg}</div>
          {action && (
            <button
              className={actionButton({ severity })}
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          )}
        </div>
        {closable && (
          <button
            className={closeButton}
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
          </button>
        )}
      </div>
      {showProgress && duration > 0 && (
        <div
          className={progressBar({ severity, paused })}
          style={assignInlineVars({
            [progressDurationVar]: `${duration}ms`,
          })}
          data-testid={`toast-progress-${id}`}
        />
      )}
    </div>
  );
};

ToastItem.displayName = 'ToastItem';
