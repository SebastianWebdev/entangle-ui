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
  segmentedItemWrapperRecipe,
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

  const ariaLabelProp = rest['aria-label'];
  const ariaLabelledByProp = rest['aria-labelledby'];

  // Warn when an icon-only segment has no accessible name. Runs in an
  // effect so it does not fire from the render path (which would double in
  // StrictMode and on every rerender).
  useEffect(() => {
    if (isIconOnly && !tooltip && !ariaLabelProp && !ariaLabelledByProp) {
      console.warn(
        `[SegmentedControl] Icon-only segment "${value}" has no tooltip or aria-label. ` +
          'Add a tooltip prop or aria-label so the segment is accessible.'
      );
    }
  }, [isIconOnly, tooltip, ariaLabelProp, ariaLabelledByProp, value]);

  // Wrapper ref: this is the direct child of the SegmentedControl root and
  // the measurement target for the sliding indicator. When `tooltip` is set
  // the Tooltip introduces its own positioned wrapper between us and the
  // button, which is why measuring the button itself would yield (0, 0)
  // relative to that intermediate wrapper.
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const setWrapperRef = useCallback(
    (node: HTMLSpanElement | null) => {
      wrapperRef.current = node;
      registerItem(value, node);
    },
    [registerItem, value]
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
    ariaLabelProp ?? (isIconOnly ? tooltipString : undefined);

  const button = (
    <button
      ref={ref}
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

  return (
    <span
      ref={setWrapperRef}
      data-segmented-item-wrapper="true"
      className={segmentedItemWrapperRecipe({
        fullWidth,
        orientation,
        iconOnly: isIconOnly,
        size,
      })}
    >
      {tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button}
    </span>
  );
};

SegmentedControlItem.displayName = 'SegmentedControlItem';
