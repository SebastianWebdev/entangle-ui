'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRightIcon } from '@/components/Icons';
import { cx } from '@/utils/cx';
import type { BreadcrumbsProps } from './Breadcrumbs.types';
import { BreadcrumbEllipsis } from './BreadcrumbEllipsis';
import { BreadcrumbItem } from './BreadcrumbItem';
import { BreadcrumbSeparator } from './BreadcrumbSeparator';
import {
  breadcrumbsListRecipe,
  breadcrumbsRootRecipe,
} from './Breadcrumbs.css';

function isComponentElement(
  child: React.ReactNode,
  component: React.ComponentType<unknown>
) {
  return React.isValidElement(child) && child.type === component;
}

function getItemLabel(child: React.ReactNode) {
  if (
    React.isValidElement<{ children?: React.ReactNode }>(child) &&
    typeof child.props.children === 'string'
  ) {
    return child.props.children;
  }

  return undefined;
}

function withSeparators(
  items: React.ReactNode[],
  separator: React.ReactNode
): React.ReactNode[] {
  return items.flatMap((item, index) =>
    index === 0
      ? [item]
      : [
          <BreadcrumbSeparator key={`separator-${index}`}>
            {separator}
          </BreadcrumbSeparator>,
          item,
        ]
  );
}

/**
 * Breadcrumb navigation for hierarchical paths.
 *
 * Use Breadcrumbs for file paths, nested categories, editor hierarchy depth,
 * or parent-route navigation. Mark the current page explicitly with
 * `isCurrent`.
 *
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <BreadcrumbItem href="/">Home</BreadcrumbItem>
 *   <BreadcrumbItem href="/components">Components</BreadcrumbItem>
 *   <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
 * </Breadcrumbs>
 * ```
 */
export const Breadcrumbs = /*#__PURE__*/ React.memo<BreadcrumbsProps>(
  ({
    separator = <ArrowRightIcon size="sm" decorative />,
    maxItems = 0,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 2,
    expandable = true,
    size = 'sm',
    children,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const [expanded, setExpanded] = useState(false);

    const renderedChildren = useMemo(() => {
      const childArray = React.Children.toArray(children);
      const hasExplicitSeparators = childArray.some(child =>
        isComponentElement(
          child,
          BreadcrumbSeparator as React.ComponentType<unknown>
        )
      );

      if (expanded || !maxItems || maxItems <= 0) {
        return hasExplicitSeparators
          ? childArray
          : withSeparators(childArray, separator);
      }

      const breadcrumbItems = childArray.filter(child =>
        isComponentElement(
          child,
          BreadcrumbItem as React.ComponentType<unknown>
        )
      );

      if (breadcrumbItems.length <= maxItems) {
        return hasExplicitSeparators
          ? childArray
          : withSeparators(childArray, separator);
      }

      const safeBefore = Math.max(0, itemsBeforeCollapse);
      const safeAfter = Math.max(0, itemsAfterCollapse);
      const visibleBefore = breadcrumbItems.slice(0, safeBefore);
      const visibleAfter =
        safeAfter > 0 ? breadcrumbItems.slice(-safeAfter) : [];
      const collapsedItems = breadcrumbItems.slice(
        safeBefore,
        breadcrumbItems.length - safeAfter
      );

      const collapsedLabels = collapsedItems
        .map(getItemLabel)
        .filter((label): label is string => Boolean(label))
        .join(' / ');

      const collapsedTrail = [
        ...visibleBefore,
        <BreadcrumbEllipsis
          key="breadcrumb-ellipsis"
          onClick={expandable ? () => setExpanded(true) : undefined}
          tooltip={collapsedLabels || undefined}
        />,
        ...visibleAfter,
      ];

      return withSeparators(collapsedTrail, separator);
    }, [
      children,
      expandable,
      expanded,
      itemsAfterCollapse,
      itemsBeforeCollapse,
      maxItems,
      separator,
    ]);

    return (
      <nav
        ref={ref}
        className={cx(breadcrumbsRootRecipe({ size }), className)}
        style={style}
        data-testid={testId}
        aria-label="Breadcrumb"
        {...rest}
      >
        <ol className={breadcrumbsListRecipe({ size })}>{renderedChildren}</ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';
