import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type React from 'react';

export type EmptyStateVariant = 'default' | 'compact';

export interface EmptyStateBaseProps extends Omit<BaseComponent, 'title'> {
  /** Icon or illustration (typically 48–64px). */
  icon?: React.ReactNode;
  /** Main heading. */
  title?: React.ReactNode;
  /** Supporting description — one short paragraph. */
  description?: React.ReactNode;
  /** CTA buttons rendered below the description. */
  action?: React.ReactNode;
  /**
   * Layout variant.
   * - `default`: centered column layout
   * - `compact`: single horizontal row (for empty list cells)
   * @default "default"
   */
  variant?: EmptyStateVariant;
  /**
   * Show a Spinner in place of the icon — useful for "loading" vs
   * "empty" states on the same surface.
   * @default false
   */
  loading?: boolean;
}

export type EmptyStateProps = Prettify<EmptyStateBaseProps>;
