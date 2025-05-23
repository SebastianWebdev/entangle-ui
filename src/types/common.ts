// src/types/common.ts
export interface BaseComponent {
  /** Unique identifier for the component */
  id?: string;
  /** Additional CSS class names */
  className?: string;
  /** Test identifier for automated testing */
  testId?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'default' | 'ghost' | 'filled';
