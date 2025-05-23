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
} from '@/components/primitives';

export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '@/components/primitives';

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
