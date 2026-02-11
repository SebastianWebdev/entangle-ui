'use client';

import React, { useCallback, useId, useState } from 'react';
import { cx } from '@/utils/cx';
import { usePropertyPanelContext } from './PropertyPanel';
import type {
  PropertyInspectorSize,
  PropertySectionProps,
} from './PropertyInspector.types';
import {
  sectionRoot,
  sectionTrigger,
  chevron,
  chevronExpanded,
  iconArea,
  sectionLabel,
  actionsArea,
  contentWrapper,
  contentInner,
} from './PropertySection.css';

// --- Size maps ---

interface TriggerSizeConfig {
  chevronSize: number;
}

const TRIGGER_SIZE_MAP: Record<PropertyInspectorSize, TriggerSizeConfig> = {
  sm: { chevronSize: 10 },
  md: { chevronSize: 12 },
  lg: { chevronSize: 14 },
};

// --- Chevron icon ---

const ChevronRightIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.5 3L7.5 6L4.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Component ---

export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  icon,
  actions,
  expanded: expandedProp,
  defaultExpanded = true,
  onExpandedChange,
  keepMounted = false,
  disabled = false,
  size: sizeProp,
  indicator,
  onContextMenu,
  children,

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const autoId = useId();
  const triggerId = `property-section-${autoId}-trigger`;
  const contentId = `property-section-${autoId}-content`;

  const panelCtx = usePropertyPanelContext();
  const size = sizeProp ?? panelCtx?.size ?? 'md';
  const sizeConfig = TRIGGER_SIZE_MAP[size];

  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expandedProp !== undefined;
  const resolvedExpanded = isControlled ? expandedProp : internalExpanded;

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const nextExpanded = !resolvedExpanded;

    if (!isControlled) {
      setInternalExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded);
  }, [disabled, resolvedExpanded, isControlled, onExpandedChange]);

  const handleActionsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const showIndicator = indicator !== null;

  return (
    <div
      ref={ref}
      className={cx(sectionRoot, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <button
        type="button"
        id={triggerId}
        aria-expanded={resolvedExpanded}
        aria-controls={contentId}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
        onContextMenu={onContextMenu}
        className={sectionTrigger({
          size,
          disabled,
          expanded: resolvedExpanded,
        })}
      >
        {showIndicator && (
          <span
            className={cx(chevron, resolvedExpanded && chevronExpanded)}
            style={{
              width: `${sizeConfig.chevronSize}px`,
              height: `${sizeConfig.chevronSize}px`,
            }}
          >
            {indicator ?? <ChevronRightIcon size={sizeConfig.chevronSize} />}
          </span>
        )}
        {icon && <span className={iconArea}>{icon}</span>}
        <span className={sectionLabel}>{title}</span>
        {actions && (
          <span className={actionsArea} onClick={handleActionsClick}>
            {actions}
          </span>
        )}
      </button>

      {(resolvedExpanded || keepMounted) && (
        <div
          className={contentWrapper({ expanded: resolvedExpanded })}
          role="region"
          id={contentId}
          aria-labelledby={triggerId}
          hidden={!resolvedExpanded || undefined}
        >
          <div className={contentInner}>{children}</div>
        </div>
      )}
    </div>
  );
};

PropertySection.displayName = 'PropertySection';
