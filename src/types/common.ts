import React from 'react';

// src/types/common.ts

export interface BaseComponent<
  T = HTMLDivElement,
> extends React.HTMLAttributes<T> {
  /** Unique identifier for the component */
  id?: string | undefined;

  /** Additional CSS class names */
  className?: string | undefined;

  /** Test identifier for automated testing */
  testId?: string;

  /** Custom inline styles */
  style?: React.CSSProperties | undefined;

  ref?: React.Ref<T> | undefined;
}

export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'default' | 'ghost' | 'filled';
