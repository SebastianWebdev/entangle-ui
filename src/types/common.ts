import React from 'react';

// src/types/common.ts
import type { Theme } from '@/theme';

export interface BaseComponent<T = HTMLDivElement> extends Omit<
  React.HTMLAttributes<T>,
  'css'
> {
  /** Unique identifier for the component */
  id?: string | undefined;

  /** Additional CSS class names */
  className?: string | undefined;

  /** Test identifier for automated testing */
  testId?: string;

  /** Custom inline styles */
  style?: React.CSSProperties | undefined;

  /**
   * Custom CSS styles included in styled-components
   * This allows for more powerful styling with theme access
   * Can be an object of CSS properties or a function that receives theme and returns CSS properties
   */
  css?:
    | React.CSSProperties
    | ((theme: Theme) => React.CSSProperties)
    | undefined;

  ref?: React.Ref<T> | undefined;
}

export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'default' | 'ghost' | 'filled';
