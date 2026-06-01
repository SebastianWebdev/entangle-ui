'use client';

import React, { useCallback, useMemo } from 'react';

import { ChevronDownIcon, ChevronRightIcon } from '@/components/Icons';
import {
  Breadcrumbs,
  BreadcrumbItem,
} from '@/components/navigation/Breadcrumbs';
import { Menu } from '@/components/navigation/Menu';
import { IconButton } from '@/components/primitives';
import { useControlledState, useLatest } from '@/hooks';

import { pathBarSiblingTriggerStyle } from './PathBar.css';
import { normalizePath, segmentPrefix } from './pathUtils';

import type { PathBarProps, PathSegment } from './PathBar.types';
import type { ResolvedPathSegment } from './pathUtils';

const EMPTY_SEGMENTS: ResolvedPathSegment[] = [];

/**
 * Resolve a `getSiblings` result into segments with concrete navigation
 * values. A sibling lives in the same parent as `segments[index]`, so it
 * inherits that segment's prefix and only swaps the trailing label.
 */
function resolveSiblings(
  segments: readonly ResolvedPathSegment[],
  index: number,
  entries: ReadonlyArray<string | PathSegment>
): ResolvedPathSegment[] {
  const anchor = segments[index];
  if (!anchor) {
    return EMPTY_SEGMENTS;
  }
  const prefix = segmentPrefix(anchor);
  return entries.map(entry => {
    const segment: PathSegment =
      typeof entry === 'string' ? { label: entry } : entry;
    return {
      ...segment,
      value: segment.value ?? prefix + segment.label,
    };
  });
}

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

  const [segments, setSegments] = useControlledState<ResolvedPathSegment[]>({
    value: controlledSegments,
    defaultValue: defaultSegments,
    fallback: EMPTY_SEGMENTS,
  });

  // Read the live trail from a ref so the handlers stay identity-stable and
  // never go stale, even though the rendered crumbs change every navigation.
  const segmentsRef = useLatest(segments);

  const navigateToIndex = useCallback(
    (index: number) => {
      const target = segmentsRef.current[index];
      if (!target) {
        return;
      }
      // Navigating to an ancestor drops everything below it (uncontrolled mode;
      // a controlled `value` is left untouched and driven by the consumer).
      setSegments(segmentsRef.current.slice(0, index + 1));
      onNavigateRef.current?.(target.value, target, index);
    },
    [segmentsRef, setSegments, onNavigateRef]
  );

  const selectSibling = useCallback(
    (index: number, sibling: ResolvedPathSegment) => {
      // A lateral move: keep the ancestors, swap this segment, drop anything
      // deeper since the old subtree no longer applies.
      setSegments([...segmentsRef.current.slice(0, index), sibling]);
      onNavigateRef.current?.(sibling.value, sibling, index);
    },
    [segmentsRef, setSegments, onNavigateRef]
  );

  const items = segments.map((segment, index) => {
    const isLast = index === segments.length - 1;
    const icon = segment.icon ?? (index === 0 ? rootIcon : undefined);

    const rawSiblings = getSiblings?.(segment, index) ?? [];
    const siblings = resolveSiblings(segments, index, rawSiblings);
    const endContent =
      siblings.length > 0 ? (
        <Menu>
          <Menu.Trigger
            render={
              <IconButton
                aria-label={`Browse ${segment.label} siblings`}
                size="sm"
                radius="sm"
                className={pathBarSiblingTriggerStyle}
              >
                <ChevronDownIcon size="sm" decorative />
              </IconButton>
            }
          />
          <Menu.Content>
            {siblings.map((sibling, siblingIndex) => (
              <Menu.Item
                key={`${sibling.value}-${siblingIndex}`}
                icon={sibling.icon}
                onSelect={() => {
                  selectSibling(index, sibling);
                }}
              >
                {sibling.label}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu>
      ) : undefined;

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
        endContent={endContent}
      >
        {segment.label}
      </BreadcrumbItem>
    );
  });

  return (
    <Breadcrumbs
      ref={ref}
      separator={separator ?? <ChevronRightIcon size="sm" decorative />}
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
