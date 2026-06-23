'use client';

import React, { useCallback, useId, useState } from 'react';

import { ChevronRightIcon } from '@/components/Icons';
import { Switch } from '@/components/primitives/Switch';
import { cx } from '@/utils/cx';

import { usePropertyPanelContext } from './PropertyPanel';
import {
  sectionRoot,
  sectionHeader,
  sectionTrigger,
  chevron,
  chevronExpanded,
  iconArea,
  sectionLabel,
  headerControls,
  contentWrapper,
  contentInner,
} from './PropertySection.css';

import type {
  PropertyInspectorSize,
  PropertySectionProps,
} from './PropertyInspector.types';

// --- Size maps ---

interface TriggerSizeConfig {
  chevronSize: number;
}

const TRIGGER_SIZE_MAP: Record<PropertyInspectorSize, TriggerSizeConfig> = {
  sm: { chevronSize: 10 },
  md: { chevronSize: 12 },
  lg: { chevronSize: 14 },
};

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
  checkable = false,
  checked: checkedProp,
  defaultChecked = true,
  onCheckedChange,
  checkLabel,
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

  // Enable/disable toggle state (controlled or uncontrolled), mirroring the
  // expanded-state bridge above. Independent of the collapse state.
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isCheckedControlled = checkedProp !== undefined;
  const resolvedChecked = isCheckedControlled ? checkedProp : internalChecked;

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const nextExpanded = !resolvedExpanded;

    if (!isControlled) {
      setInternalExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded);
  }, [disabled, resolvedExpanded, isControlled, onExpandedChange]);

  const handleCheckedChange = useCallback(
    (next: boolean) => {
      if (!isCheckedControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
    },
    [isCheckedControlled, onCheckedChange]
  );

  // When the section is checkable and switched off, the body is dimmed and made
  // non-interactive but stays mounted (so its state is preserved).
  const isBodyDisabled = checkable && !resolvedChecked;

  const showIndicator = indicator !== null;

  return (
    <div
      ref={ref}
      className={cx(sectionRoot, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <div
        className={sectionHeader({
          size,
          disabled,
          expanded: resolvedExpanded,
        })}
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
          className={sectionTrigger({ size, disabled })}
        >
          {showIndicator && (
            <span
              className={cx(chevron, resolvedExpanded && chevronExpanded)}
              style={{
                width: `${sizeConfig.chevronSize}px`,
                height: `${sizeConfig.chevronSize}px`,
              }}
            >
              {indicator ?? (
                <ChevronRightIcon size={sizeConfig.chevronSize} decorative />
              )}
            </span>
          )}
          {icon && <span className={iconArea}>{icon}</span>}
          <span className={sectionLabel}>{title}</span>
        </button>
        {(checkable || actions) && (
          <span className={headerControls}>
            {checkable && (
              <Switch
                size={size}
                checked={resolvedChecked}
                onChange={handleCheckedChange}
                disabled={disabled}
                aria-label={checkLabel ?? title}
                testId="section-toggle"
              />
            )}
            {actions}
          </span>
        )}
      </div>

      {(resolvedExpanded || keepMounted) && (
        <div
          className={contentWrapper({ expanded: resolvedExpanded })}
          role="region"
          id={contentId}
          aria-labelledby={triggerId}
          hidden={!resolvedExpanded || undefined}
        >
          <div
            className={contentInner}
            style={
              isBodyDisabled
                ? { opacity: 0.5, pointerEvents: 'none' }
                : undefined
            }
            aria-disabled={isBodyDisabled || undefined}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

PropertySection.displayName = 'PropertySection';
