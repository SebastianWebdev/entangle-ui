import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

/**
 * HTML element types that VisuallyHidden can render as.
 *
 * Most cases use `span` (default). Use `div` when wrapping block content,
 * `label` for form labels, `p` for prose.
 */
export type VisuallyHiddenElement = 'span' | 'div' | 'label' | 'p';

export interface VisuallyHiddenBaseProps extends BaseComponent<HTMLSpanElement> {
  /**
   * HTML element to render as.
   * @default "span"
   */
  as?: VisuallyHiddenElement;

  /**
   * When true, the element becomes visible when it (or any descendant)
   * receives focus. Used for skip-to-content links.
   * @default false
   */
  focusable?: boolean;

  /** Content rendered inside the hidden region. */
  children: React.ReactNode;
}

export type VisuallyHiddenProps = Prettify<VisuallyHiddenBaseProps>;
