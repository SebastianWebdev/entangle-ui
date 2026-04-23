'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { PageHeaderProps } from './PageHeader.types';
import {
  pageHeaderActionsStyle,
  pageHeaderBreadcrumbsStyle,
  pageHeaderIconStyle,
  pageHeaderRecipe,
  pageHeaderSubtitleStyle,
  pageHeaderTitleColumnStyle,
  pageHeaderTitleRecipe,
} from './PageHeader.css';

/**
 * Structural page/view header with optional breadcrumbs, subtitle,
 * leading icon, and right-aligned actions.
 *
 * Renders a semantic `<header>` element.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   icon={<FolderIcon size="lg" />}
 *   title="Project Assets"
 *   subtitle="124 items"
 *   actions={<Button variant="filled">Upload</Button>}
 * />
 * ```
 */
export const PageHeader = /*#__PURE__*/ React.memo<PageHeaderProps>(
  ({
    icon,
    title,
    subtitle,
    actions,
    breadcrumbs,
    size = 'md',
    bordered = true,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    return (
      <header
        ref={ref}
        className={cx(pageHeaderRecipe({ size, bordered }), className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {icon && <span className={pageHeaderIconStyle}>{icon}</span>}

        <div className={pageHeaderTitleColumnStyle}>
          {breadcrumbs && (
            <div className={pageHeaderBreadcrumbsStyle}>{breadcrumbs}</div>
          )}
          <h1 className={pageHeaderTitleRecipe({ size })}>{title}</h1>
          {subtitle && (
            <div className={pageHeaderSubtitleStyle}>{subtitle}</div>
          )}
        </div>

        {actions && <div className={pageHeaderActionsStyle}>{actions}</div>}
      </header>
    );
  }
);

PageHeader.displayName = 'PageHeader';
