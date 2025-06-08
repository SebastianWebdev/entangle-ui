// src/index.ts
// Theme system
export { createTheme, ThemeProvider, tokens } from '@/theme';
export type { Theme, Tokens } from '@/theme';

// Primitives
export { Flex, Grid, Spacer, Stack } from '@/components/layout';
export {
  Button,
  Icon,
  IconButton,
  Input,
  Tooltip,
} from '@/components/primitives';
export { NumberInput, Slider } from './components/controls';
export { FormHelperText, FormLabel, InputWrapper } from './components/form';

export type {
  FlexAlign,
  FlexAlignContent,
  FlexDirection,
  FlexJustify,
  FlexProps,
  FlexSpacing,
  FlexWrap,
  GridProps,
  GridSize,
  GridSpacing,
} from '@/components/layout';
export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  CollisionAvoidance,
  IconProps,
  IconSize,
  InputProps,
  InputSize,
  TooltipCollisionConfig,
  TooltipCollisionStrategy,
  TooltipPlacement,
  TooltipProps,
} from '@/components/primitives';
export type { NumberInputProps, SliderProps } from './components/controls';
export type {
  FormHelperTextProps,
  FormLabelProps,
  InputWrapperProps,
} from './components/form';

// Types
export type { BaseComponent, Size, Variant } from '@/types/common';

// Utility Types for better DX
export type {
  Brand,
  DeepPartial,
  DeepReadonly,
  KeyOf,
  LiteralUnion,
  NonEmptyArray,
  Prettify,
  RequireFields,
  StrictExclude,
  ValueOf,
} from '@/types/utilities';

// Utilities
export { cn } from '@/utils/cn';
