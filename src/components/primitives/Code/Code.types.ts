import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type CodeSize = 'xs' | 'sm' | 'md';

export interface CodeBaseProps extends BaseComponent<HTMLElement> {
  /** Inline code content. */
  children: React.ReactNode;
  /**
   * Font size scale — relative to surrounding text.
   * @default "sm"
   */
  size?: CodeSize;
}

export type CodeProps = Prettify<CodeBaseProps>;
