'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import { Spinner } from '../Spinner';
import type { EmptyStateProps } from './EmptyState.types';
import {
  emptyStateActionStyle,
  emptyStateDescriptionStyle,
  emptyStateIconStyle,
  emptyStateRecipe,
  emptyStateTextColumnCompactStyle,
  emptyStateTextColumnStyle,
  emptyStateTitleStyle,
} from './EmptyState.css';

/**
 * Generic empty / loading state surface.
 *
 * Use for empty lists, filtered-out results, or "not yet started"
 * placeholders. When `loading` is `true`, a `Spinner` is rendered in
 * place of the icon and the root uses `role="status"`.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<SearchIcon size="lg" />}
 *   title="No results"
 *   description="Try a different search term."
 *   action={<Button>Reset filters</Button>}
 * />
 *
 * <EmptyState loading title="Loading conversation..." />
 * ```
 */
export const EmptyState = /*#__PURE__*/ React.memo<EmptyStateProps>(
  ({
    icon,
    title,
    description,
    action,
    variant = 'default',
    loading = false,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const textColumnClass =
      variant === 'compact'
        ? emptyStateTextColumnCompactStyle
        : emptyStateTextColumnStyle;

    const statusAttrs = loading
      ? {
          role: 'status' as const,
          'aria-live': 'polite' as const,
        }
      : {};

    return (
      <div
        ref={ref}
        className={cx(emptyStateRecipe({ variant }), className)}
        style={style}
        data-testid={testId}
        {...statusAttrs}
        {...rest}
      >
        {loading ? (
          <span className={emptyStateIconStyle}>
            <Spinner size="lg" />
          </span>
        ) : (
          icon && <span className={emptyStateIconStyle}>{icon}</span>
        )}

        {(title !== undefined && title !== null) ||
        (description !== undefined && description !== null) ? (
          <div className={textColumnClass}>
            {title !== undefined && title !== null && (
              <h3 className={emptyStateTitleStyle}>{title}</h3>
            )}
            {description !== undefined && description !== null && (
              <p className={emptyStateDescriptionStyle}>{description}</p>
            )}
          </div>
        ) : null}

        {action && <div className={emptyStateActionStyle}>{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
