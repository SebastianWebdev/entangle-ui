'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { CloseIcon } from '@/components/Icons/CloseIcon';
import { ErrorIcon } from '@/components/Icons/ErrorIcon';
import { InfoIcon } from '@/components/Icons/InfoIcon';
import { SuccessIcon } from '@/components/Icons/SuccessIcon';
import { WarningIcon } from '@/components/Icons/WarningIcon';
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

// --- Severity icons ---

const SeverityIcon: React.FC<{ severity: ToastSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'info':
      return <InfoIcon size="md" color="currentColor" decorative />;
    case 'success':
      return <SuccessIcon size="md" color="currentColor" decorative />;
    case 'warning':
      return <WarningIcon size="md" color="currentColor" decorative />;
    case 'error':
      return <ErrorIcon size="md" color="currentColor" decorative />;
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
export const ToastItem: React.FC<ToastItemProps> = ({
  toast: toastData,
  onDismiss,
}) => {
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
          {icon ?? <SeverityIcon severity={severity} />}
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
            <CloseIcon size="sm" decorative />
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
