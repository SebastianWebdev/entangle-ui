'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { BreadcrumbSeparatorProps } from './Breadcrumbs.types';
import { breadcrumbSeparatorStyle } from './Breadcrumbs.css';

/**
 * Decorative separator rendered between breadcrumb items.
 *
 * @example
 * ```tsx
 * <BreadcrumbSeparator>/</BreadcrumbSeparator>
 * ```
 */
export const BreadcrumbSeparator =
  /*#__PURE__*/ React.memo<BreadcrumbSeparatorProps>(
    ({ children, className, style, testId, ref, ...rest }) => {
      return (
        <li
          ref={ref as React.Ref<HTMLLIElement>}
          className={cx(breadcrumbSeparatorStyle, className)}
          style={style}
          data-testid={testId}
          aria-hidden="true"
          {...rest}
        >
          {children}
        </li>
      );
    }
  );

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';
