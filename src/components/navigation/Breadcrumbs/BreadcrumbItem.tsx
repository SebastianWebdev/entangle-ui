'use client';

import React, { useCallback } from 'react';
import { Tooltip } from '@/components/primitives';
import { cx } from '@/utils/cx';
import type { BreadcrumbItemProps } from './Breadcrumbs.types';
import {
  breadcrumbContentRecipe,
  breadcrumbIconStyle,
  breadcrumbItemStyle,
  breadcrumbLabelStyle,
} from './Breadcrumbs.css';

function getTruncatedLabel(children: React.ReactNode, maxLength?: number) {
  if (
    typeof children !== 'string' ||
    !maxLength ||
    children.length <= maxLength
  ) {
    return { label: children, fullLabel: undefined };
  }

  const endIndex = Math.max(0, maxLength - 1);
  return {
    label: `${children.slice(0, endIndex)}…`,
    fullLabel: children,
  };
}

/**
 * Individual segment in a breadcrumb trail.
 *
 * Renders as a link, clickable span for client routing, current-page text, or
 * disabled text depending on the props provided.
 *
 * @example
 * ```tsx
 * <BreadcrumbItem href="/components">Components</BreadcrumbItem>
 * <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
 * ```
 */
export const BreadcrumbItem = /*#__PURE__*/ React.memo<BreadcrumbItemProps>(
  ({
    href,
    onClick,
    isCurrent = false,
    icon,
    maxLength,
    children,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const { label, fullLabel } = getTruncatedLabel(children, maxLength);
    const isInteractive =
      (href !== undefined || onClick !== undefined) && !isCurrent;
    const state = isCurrent ? 'current' : isInteractive ? 'link' : 'disabled';

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (!onClick || isCurrent) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.currentTarget.click();
        }
      },
      [isCurrent, onClick]
    );

    const content = (
      <>
        {icon && <span className={breadcrumbIconStyle}>{icon}</span>}
        <span className={breadcrumbLabelStyle}>{label}</span>
      </>
    );

    let inner: React.ReactElement;

    if (isCurrent) {
      inner = (
        <span
          className={breadcrumbContentRecipe({ state })}
          aria-current="page"
        >
          {content}
        </span>
      );
    } else if (href) {
      inner = (
        <a className={breadcrumbContentRecipe({ state })} href={href}>
          {content}
        </a>
      );
    } else if (onClick) {
      inner = (
        <span
          className={breadcrumbContentRecipe({ state })}
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={handleKeyDown}
        >
          {content}
        </span>
      );
    } else {
      inner = (
        <span className={breadcrumbContentRecipe({ state })}>{content}</span>
      );
    }

    return (
      <li
        ref={ref as React.Ref<HTMLLIElement>}
        className={cx(breadcrumbItemStyle, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {fullLabel ? (
          <Tooltip title={fullLabel} delay={300}>
            {inner}
          </Tooltip>
        ) : (
          inner
        )}
      </li>
    );
  }
);

BreadcrumbItem.displayName = 'BreadcrumbItem';
