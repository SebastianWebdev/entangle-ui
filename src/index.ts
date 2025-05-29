// src/index.ts
// Theme system
export { 
  tokens, 
  createTheme, 
  ThemeProvider 
} from '@/theme';
export type { Theme, Tokens } from '@/theme';

// Primitives
export {
  Button,
  Icon,
  Input
} from '@/components/primitives';

export {Grid} from '@/components/layout';

export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  IconProps,
  IconSize,
  InputProps
} from '@/components/primitives';

export type {
  GridProps,
  GridSpacing,
  GridSize
} from '@/components/layout';

// Types
export type { 
  BaseComponent, 
  Size, 
  Variant 
} from '@/types/common';

// Utility Types for better DX
export type {
  Prettify,
  LiteralUnion,
  DeepPartial,
  ValueOf,
  KeyOf,
  RequireFields,
  StrictExclude,
  Brand,
  DeepReadonly,
  NonEmptyArray
} from '@/types/utilities';

// Utilities
export { cn } from '@/utils/cn';
