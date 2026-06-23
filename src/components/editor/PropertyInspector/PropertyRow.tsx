'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, { useCallback } from 'react';

import { UndoIcon } from '@/components/Icons';
import { Tooltip } from '@/components/primitives/Tooltip';
import { cx } from '@/utils/cx';

import { usePropertyPanelContext } from './PropertyPanel';
import {
  RESET_BUTTON_CLASS,
  splitRatioVar,
  controlRatioVar,
  rowRoot,
  rowLabel,
  fullWidthLabel,
  labelTooltipTarget,
  modifiedDot,
  rowControl,
  fullWidthControl,
  resetButton,
} from './PropertyRow.css';

import type {
  PropertyDensity,
  PropertyInspectorSize,
  PropertyRowProps,
} from './PropertyInspector.types';

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

// --- Density maps ---

interface DensityConfig {
  /** Adjustment applied to the size-based min-height (px). */
  minHeightDelta: number;
  /** Vertical padding above/below the row content (px). */
  paddingBlock: number;
}

const DENSITY_MAP: Record<PropertyDensity, DensityConfig> = {
  compact: { minHeightDelta: -4, paddingBlock: 0 },
  normal: { minHeightDelta: 0, paddingBlock: 2 },
  spacious: { minHeightDelta: 6, paddingBlock: 5 },
};

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
  const densityConfig = DENSITY_MAP[panelCtx?.density ?? 'normal'];
  const rowMinHeight = sizeConfig.minHeight + densityConfig.minHeightDelta;

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
      <span className={labelTooltipTarget}>
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
        minHeight: `${rowMinHeight}px`,
        paddingTop: `${densityConfig.paddingBlock}px`,
        paddingBottom: `${densityConfig.paddingBlock}px`,
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
          <UndoIcon size={sizeConfig.resetIconSize} decorative />
        </span>
      )}
    </div>
  );
};

PropertyRow.displayName = 'PropertyRow';
