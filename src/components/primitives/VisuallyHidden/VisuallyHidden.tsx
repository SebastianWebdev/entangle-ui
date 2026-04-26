'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { VisuallyHiddenProps } from './VisuallyHidden.types';
import {
  visuallyHiddenStyle,
  visuallyHiddenFocusableStyle,
} from './VisuallyHidden.css';

/**
 * Hides content visually while keeping it accessible to screen readers.
 *
 * Implements the canonical `sr-only` / `visually-hidden` pattern. Use it for
 * screen-reader-only labels, additional context next to icons, and
 * skip-to-content links (with `focusable`).
 *
 * Don't use this to hide content from sighted users for layout reasons —
 * that's `display: none`. This component keeps content in the accessibility
 * tree on purpose.
 *
 * @example
 * ```tsx
 * // SR-only label next to an icon-only button
 * <button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </button>
 *
 * // Skip link revealed on focus
 * <VisuallyHidden as="a" href="#main" focusable>
 *   Skip to content
 * </VisuallyHidden>
 * ```
 */
export const VisuallyHidden = /*#__PURE__*/ React.memo<VisuallyHiddenProps>(
  ({
    as: Component = 'span',
    focusable = false,
    children,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    return (
      <Component
        ref={ref as React.Ref<never>}
        className={cx(
          focusable ? visuallyHiddenFocusableStyle : visuallyHiddenStyle,
          className
        )}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';
