'use client';

import React from 'react';
import { Tooltip } from '@/components/primitives';
import { cx } from '@/utils/cx';
import type { BreadcrumbEllipsisProps } from './Breadcrumbs.types';
import {
  breadcrumbEllipsisButtonStyle,
  breadcrumbEllipsisStyle,
  breadcrumbEllipsisTextStyle,
} from './Breadcrumbs.css';

/**
 * Ellipsis placeholder for collapsed breadcrumb segments.
 *
 * @example
 * ```tsx
 * <BreadcrumbEllipsis onClick={expand} tooltip="src / components" />
 * ```
 */
export const BreadcrumbEllipsis =
  /*#__PURE__*/ React.memo<BreadcrumbEllipsisProps>(
    ({ onClick, tooltip, className, style, testId, ref, ...rest }) => {
      const ellipsis = onClick ? (
        <button
          type="button"
          className={breadcrumbEllipsisButtonStyle}
          onClick={onClick}
          aria-label="Show all breadcrumbs"
        >
          …
        </button>
      ) : (
        <span className={breadcrumbEllipsisTextStyle}>…</span>
      );

      return (
        <li
          ref={ref as React.Ref<HTMLLIElement>}
          className={cx(breadcrumbEllipsisStyle, className)}
          style={style}
          data-testid={testId}
          {...rest}
        >
          {tooltip ? (
            <Tooltip title={tooltip} delay={300}>
              {ellipsis}
            </Tooltip>
          ) : (
            ellipsis
          )}
        </li>
      );
    }
  );

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';
