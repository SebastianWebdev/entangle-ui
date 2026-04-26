'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Tooltip } from '@/components/primitives/Tooltip/Tooltip';
import { cx } from '@/utils/cx';
import { useSegmentedControlContext } from './SegmentedControl';
import type { SegmentedControlItemProps } from './SegmentedControl.types';
import {
  itemOutlineStyle,
  itemSolidStyle,
  itemSubtleStyle,
  segmentedItemBaseStyle,
  segmentedItemIconStyle,
  segmentedItemRecipe,
} from './SegmentedControl.css';

function getVariantClass(variant: 'subtle' | 'solid' | 'outline'): string {
  switch (variant) {
    case 'solid':
      return itemSolidStyle;
    case 'outline':
      return itemOutlineStyle;
    case 'subtle':
    default:
      return itemSubtleStyle;
  }
}

/**
 * Individual segment inside a `SegmentedControl`.
 *
 * Supports text, icon-only, or icon + label segments. Pair icon-only
 * segments with a `tooltip` so the action remains discoverable.
 */
export const SegmentedControlItem: React.FC<SegmentedControlItemProps> = ({
  value,
  children,
  icon,
  tooltip,
  disabled: itemDisabled = false,
  className,
  style,
  testId,
  onClick,
  onFocus,
  ref,
  ...rest
}) => {
  const {
    value: activeValue,
    size,
    variant,
    orientation,
    disabled: groupDisabled,
    fullWidth,
    onChange,
    registerItem,
  } = useSegmentedControlContext();

  const isSelected = activeValue === value;
  const isDisabled = groupDisabled || itemDisabled;
  const hasLabel =
    children !== undefined && children !== null && children !== '';
  const isIconOnly = !hasLabel && Boolean(icon);

  // Warn when an icon-only segment has no accessible name.
  if (
    isIconOnly &&
    !tooltip &&
    !rest['aria-label'] &&
    !rest['aria-labelledby']
  ) {
    console.warn(
      `[SegmentedControl] Icon-only segment "${value}" has no tooltip or aria-label. ` +
        'Add a tooltip prop or aria-label so the segment is accessible.'
    );
  }

  // Register node for sliding indicator measurement
  const localRef = useRef<HTMLButtonElement | null>(null);
  const setBtnRef = useCallback(
    (node: HTMLButtonElement | null) => {
      localRef.current = node;
      registerItem(value, node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    },
    [registerItem, value, ref]
  );

  useEffect(() => {
    return () => {
      registerItem(value, null);
    };
  }, [registerItem, value]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      onChange(value);
      onClick?.(e);
    },
    [isDisabled, onChange, value, onClick]
  );

  // Resolve aria-label fallback for icon-only segments
  const tooltipString = typeof tooltip === 'string' ? tooltip : undefined;
  const resolvedAriaLabel =
    rest['aria-label'] ?? (isIconOnly ? tooltipString : undefined);

  const button = (
    <button
      ref={setBtnRef}
      type="button"
      role="button"
      data-segmented-item="true"
      data-value={value}
      data-disabled={isDisabled || undefined}
      aria-pressed={isSelected}
      aria-disabled={isDisabled || undefined}
      aria-label={resolvedAriaLabel}
      tabIndex={isSelected && !isDisabled ? 0 : -1}
      disabled={isDisabled}
      onClick={handleClick}
      onFocus={onFocus}
      className={cx(
        segmentedItemBaseStyle,
        segmentedItemRecipe({
          size,
          fullWidth,
          iconOnly: isIconOnly,
          orientation,
        }),
        getVariantClass(variant),
        className
      )}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {icon && <span className={segmentedItemIconStyle}>{icon}</span>}
      {hasLabel && <span>{children}</span>}
    </button>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{button}</Tooltip>;
  }

  return button;
};

SegmentedControlItem.displayName = 'SegmentedControlItem';
