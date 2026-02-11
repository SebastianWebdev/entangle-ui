'use client';

import React, { useCallback } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import { Tooltip } from '@/components/primitives/Tooltip';
import { usePropertyPanelContext } from './PropertyPanel';
import type {
  PropertyInspectorSize,
  PropertyRowProps,
} from './PropertyInspector.types';
import {
  RESET_BUTTON_CLASS,
  splitRatioVar,
  controlRatioVar,
  rowRoot,
  rowLabel,
  fullWidthLabel,
  modifiedDot,
  rowControl,
  fullWidthControl,
  resetButton,
} from './PropertyRow.css';

// --- Size maps ---

interface RowSizeConfig {
  minHeight: number;
  fontSize: string;
  resetIconSize: number;
}

const ROW_SIZE_MAP: Record<PropertyInspectorSize, RowSizeConfig> = {
  sm: {
    minHeight: 22,
    fontSize: 'var(--etui-font-size-md)',
    resetIconSize: 10,
  },
  md: {
    minHeight: 26,
    fontSize: 'var(--etui-font-size-md)',
    resetIconSize: 12,
  },
  lg: {
    minHeight: 30,
    fontSize: 'var(--etui-font-size-lg)',
    resetIconSize: 14,
  },
};

// --- Reset icon ---

const ResetIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 4.5h6.5a2 2 0 0 1 0 4H6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 2.5L2 4.5L4 6.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Component ---

export const PropertyRow: React.FC<PropertyRowProps> = ({
  label,
  tooltip,
  children,
  fullWidth = false,
  splitRatio = [40, 60],
  modified = false,
  disabled = false,
  visible = true,
  size: sizeProp,
  action,
  onLabelContextMenu,
  onReset,

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const panelCtx = usePropertyPanelContext();
  const size = sizeProp ?? panelCtx?.size ?? 'md';
  const sizeConfig = ROW_SIZE_MAP[size];

  const handleResetClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onReset?.();
    },
    [onReset]
  );

  const modifiedDotEl = modified ? (
    <span
      className={modifiedDot}
      aria-label="Modified"
      data-testid="modified-dot"
    />
  ) : null;

  const labelText = <span>{label}</span>;

  const labelElement = tooltip ? (
    <Tooltip title={tooltip}>
      <span style={{ display: 'contents' }}>
        {modifiedDotEl}
        {labelText}
      </span>
    </Tooltip>
  ) : (
    <>
      {modifiedDotEl}
      {labelText}
    </>
  );

  const inlineVars = assignInlineVars({
    [splitRatioVar]: `${splitRatio[0]}%`,
    [controlRatioVar]: `${splitRatio[1]}%`,
  });

  return (
    <div
      ref={ref}
      className={cx(rowRoot, className)}
      style={{
        ...style,
        ...inlineVars,
        display: visible ? 'flex' : 'none',
        flexDirection: fullWidth ? 'column' : 'row',
        alignItems: fullWidth ? 'stretch' : 'center',
        minHeight: `${sizeConfig.minHeight}px`,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      data-testid={testId}
      {...rest}
    >
      {fullWidth ? (
        <>
          <div
            className={fullWidthLabel}
            onContextMenu={onLabelContextMenu}
            style={{
              fontSize: sizeConfig.fontSize,
              fontWeight: modified
                ? 'var(--etui-font-weight-medium)'
                : 'var(--etui-font-weight-normal)',
            }}
          >
            {labelElement}
          </div>
          <div className={fullWidthControl}>{children}</div>
        </>
      ) : (
        <>
          <div
            className={rowLabel}
            onContextMenu={onLabelContextMenu}
            style={{
              fontSize: sizeConfig.fontSize,
              fontWeight: modified
                ? 'var(--etui-font-weight-medium)'
                : 'var(--etui-font-weight-normal)',
            }}
          >
            {labelElement}
          </div>
          <div className={rowControl}>{children}</div>
        </>
      )}

      {action}

      {onReset && (
        <span
          className={cx(RESET_BUTTON_CLASS, resetButton)}
          role="button"
          tabIndex={0}
          aria-label="Reset to default"
          onClick={handleResetClick}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onReset();
            }
          }}
          data-testid="reset-button"
        >
          <ResetIcon size={sizeConfig.resetIconSize} />
        </span>
      )}
    </div>
  );
};

PropertyRow.displayName = 'PropertyRow';
