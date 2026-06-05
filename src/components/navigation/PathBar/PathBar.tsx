'use client';

import React, { useMemo } from 'react';

import { ChevronRightIcon } from '@/components/Icons';
import {
  Breadcrumbs,
  BreadcrumbItem,
} from '@/components/navigation/Breadcrumbs';
import { useControlledState, useLatest } from '@/hooks';

import { PathBarSiblingMenu } from './PathBarSiblingMenu';
import { normalizePath } from './pathUtils';

import type { PathBarProps } from './PathBar.types';
import type { ResolvedPathSegment } from './pathUtils';

// Frozen so the shared fallback can never be mutated in place; every write path
// builds a fresh array via slice/spread.
const EMPTY_SEGMENTS: readonly ResolvedPathSegment[] = Object.freeze([]);

/**
 * File-path breadcrumbs, like the VS Code editor breadcrumb bar.
 *
 * PathBar specializes {@link Breadcrumbs}: give it a path — a delimited string
 * or a structured segment array — and it renders each segment as a crumb.
 * Folder crumbs navigate on click (`onNavigate`); the final segment is the
 * current location. Provide `getSiblings` to add a VS-Code-style dropdown that
 * swaps a segment for one of its siblings. Long paths reuse the Breadcrumbs
 * collapse / ellipsis machinery via `maxItems`.
 *
 * The current path is controllable: pass `value` to drive it, or `defaultValue`
 * to let PathBar track it (clicking an ancestor truncates the trail).
 *
 * @example
 * ```tsx
 * <PathBar
 *   defaultValue="src/components/Button/Button.tsx"
 *   rootIcon={<HomeIcon size="sm" decorative />}
 *   onNavigate={path => router.push(path)}
 * />
 * ```
 */
export const PathBar = ({
  value,
  defaultValue,
  delimiter = '/',
  onNavigate,
  getSiblings,
  rootIcon,
  separator,
  maxItems,
  itemsBeforeCollapse,
  itemsAfterCollapse,
  expandable,
  size = 'sm',
  className,
  style,
  testId,
  ref,
  ...rest
}: PathBarProps): React.ReactElement => {
  // Wrap the consumer callback so navigation handlers don't depend on its
  // (typically inline, render-fresh) identity.
  const onNavigateRef = useLatest(onNavigate);

  const controlledSegments = useMemo(
    () => (value !== undefined ? normalizePath(value, delimiter) : undefined),
    [value, delimiter]
  );
  const defaultSegments = useMemo(
    () =>
      defaultValue !== undefined
        ? normalizePath(defaultValue, delimiter)
        : undefined,
    [defaultValue, delimiter]
  );

  const [segments, setSegments] = useControlledState<
    readonly ResolvedPathSegment[]
  >({
    value: controlledSegments,
    defaultValue: defaultSegments,
    fallback: EMPTY_SEGMENTS,
  });

  // Handlers are invoked only from the crumb-mapping below (recreated every
  // render anyway), so they close over the current-render `segments` directly —
  // no ref indirection needed, and the value is always live at click time.
  const navigateToIndex = (index: number): void => {
    const target = segments[index];
    if (!target) {
      return;
    }
    // Navigating to an ancestor drops everything below it (uncontrolled mode;
    // a controlled `value` is left untouched and driven by the consumer).
    setSegments(segments.slice(0, index + 1));
    onNavigateRef.current?.(target.value, target, index);
  };

  const selectSibling = (index: number, sibling: ResolvedPathSegment): void => {
    // A lateral move: keep the ancestors, swap this segment, drop anything
    // deeper since the old subtree no longer applies.
    setSegments([...segments.slice(0, index), sibling]);
    onNavigateRef.current?.(sibling.value, sibling, index);
  };

  const items = segments.map((segment, index) => {
    const isLast = index === segments.length - 1;
    const icon = segment.icon ?? (index === 0 ? rootIcon : undefined);

    return (
      <BreadcrumbItem
        key={`${index}-${segment.value}`}
        icon={icon}
        isCurrent={isLast}
        onClick={
          isLast
            ? undefined
            : () => {
                navigateToIndex(index);
              }
        }
        endContent={
          getSiblings ? (
            <PathBarSiblingMenu
              segment={segment}
              index={index}
              getSiblings={getSiblings}
              onSelect={selectSibling}
              size={size}
            />
          ) : undefined
        }
      >
        {segment.label}
      </BreadcrumbItem>
    );
  });

  return (
    <Breadcrumbs
      ref={ref}
      separator={separator ?? <ChevronRightIcon size={size} decorative />}
      maxItems={maxItems}
      itemsBeforeCollapse={itemsBeforeCollapse}
      itemsAfterCollapse={itemsAfterCollapse}
      expandable={expandable}
      size={size}
      className={className}
      style={style}
      testId={testId}
      {...rest}
    >
      {items}
    </Breadcrumbs>
  );
};

PathBar.displayName = 'PathBar';
