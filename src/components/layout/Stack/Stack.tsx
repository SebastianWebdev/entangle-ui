// src/components/layout/Stack/Stack.tsx
import React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { stackRecipe, gapVar } from './Stack.css';

/**
 * Stack direction options
 */
export type StackDirection = 'row' | 'column';

/**
 * Stack wrap options
 */
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Justify content options for main axis alignment
 */
export type StackJustify =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * Align items options for cross axis alignment
 */
export type StackAlign =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'baseline';

/**
 * Spacing multiplier (0-8) based on theme spacing unit
 */
export type StackSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StackBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'children'
> {
  /**
   * Stack content - any React elements
   */
  children: React.ReactNode;

  /**
   * Stack direction - controls main axis orientation
   * - `row`: Left to right (horizontal)
   * - `column`: Top to bottom (vertical)
   * @default "column"
   */
  direction?: StackDirection | undefined;

  /**
   * Responsive stack direction
   * Allows different directions at different breakpoints
   * @example direction="column" md="row" // Vertical on mobile, horizontal on desktop
   */
  sm?: StackDirection | undefined;
  md?: StackDirection | undefined;
  lg?: StackDirection | undefined;
  xl?: StackDirection | undefined;

  /**
   * Stack wrap behavior
   * - `nowrap`: Items stay on one line (default)
   * - `wrap`: Items wrap to new lines as needed
   * - `wrap-reverse`: Items wrap in reverse order
   * @default "nowrap"
   */
  wrap?: StackWrap | undefined;

  /**
   * Whether stack should expand to fill available space
   * - For row direction: takes 100% width
   * - For column direction: takes 100% height
   * @default false
   */
  expand?: boolean;

  /**
   * Spacing between stack items (multiplier of base spacing unit)
   * - `0`: No spacing (0px)
   * - `1`: 1x base unit (4px)
   * - `2`: 2x base unit (8px)
   * - `3`: 3x base unit (12px)
   * - `4`: 4x base unit (16px)
   * @default 0
   */
  spacing?: StackSpacing | undefined;

  /**
   * Custom gap override (CSS value)
   * Overrides spacing prop if provided
   * @example "16px", "1rem", "2rem 1rem"
   */
  customGap?: string | number | undefined;

  /**
   * Justify content - distributes space along main axis
   * - `flex-start`: Items packed to start (default)
   * - `flex-end`: Items packed to end
   * - `center`: Items centered
   * - `space-between`: Even space between items
   * - `space-around`: Even space around items
   * - `space-evenly`: Equal space between and around items
   * @default "flex-start"
   */
  justify?: StackJustify | undefined;

  /**
   * Align items - aligns items along cross axis
   * - `flex-start`: Items align to start of cross axis (default)
   * - `flex-end`: Items align to end of cross axis
   * - `center`: Items centered on cross axis
   * - `stretch`: Items stretch to fill container
   * - `baseline`: Items align to text baseline
   * @default "flex-start"
   */
  align?: StackAlign | undefined;
}

/**
 * Props for the Stack component with prettified type for better IntelliSense
 */
export type StackProps = Prettify<StackBaseProps>;

/** Base spacing unit in px */
const SPACING_UNIT = 4;

/**
 * Calculate gap value based on spacing multiplier
 */
const getGapValue = (
  spacing: StackSpacing,
  customGap?: string | number
): string => {
  if (customGap !== undefined) {
    return typeof customGap === 'number' ? `${customGap}px` : customGap;
  }
  return `${spacing * SPACING_UNIT}px`;
};

/**
 * A flexible stacking component for arranging elements vertically or horizontally.
 *
 * Built on flexbox with consistent spacing and alignment options. Perfect for
 * simple layouts where you need to stack elements with controlled spacing.
 * Use Grid or Flex components for more complex layout requirements.
 *
 * @example
 * ```tsx
 * // Basic vertical stack
 * <Stack spacing={2}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Stack>
 *
 * // Horizontal stack with full width
 * <Stack direction="row" expand spacing={3} justify="space-between">
 *   <Button>Cancel</Button>
 *   <Button variant="filled">Save</Button>
 * </Stack>
 *
 * // Responsive stack
 * <Stack
 *   direction="column"
 *   md="row"
 *   spacing={2}
 *   align="center"
 * >
 *   <Logo />
 *   <Navigation />
 *   <UserMenu />
 * </Stack>
 *
 * // Centered content
 * <Stack
 *   direction="column"
 *   expand
 *   justify="center"
 *   align="center"
 *   spacing={4}
 * >
 *   <Icon />
 *   <Title>Welcome</Title>
 *   <Button>Get Started</Button>
 * </Stack>
 *
 * // Wrapping horizontal stack
 * <Stack
 *   direction="row"
 *   wrap="wrap"
 *   spacing={2}
 *   justify="center"
 * >
 *   <Tag>React</Tag>
 *   <Tag>TypeScript</Tag>
 *   <Tag>CSS</Tag>
 * </Stack>
 * ```
 */
export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  sm,
  md,
  lg,
  xl,
  wrap = 'nowrap',
  expand = false,
  spacing = 0,
  customGap,
  justify = 'flex-start',
  align = 'flex-start',
  className,
  testId,
  style,
  ref,
  ...htmlProps
}) => {
  const mergedStyle: React.CSSProperties = {
    ...assignInlineVars({
      [gapVar]: getGapValue(spacing, customGap),
    }),
    ...style,
  };

  // Build data attributes for responsive direction overrides
  const dataAttrs: Record<string, string> = {};
  if (sm) dataAttrs['data-sm-dir'] = sm;
  if (md) dataAttrs['data-md-dir'] = md;
  if (lg) dataAttrs['data-lg-dir'] = lg;
  if (xl) dataAttrs['data-xl-dir'] = xl;
  if (expand) dataAttrs['data-expand'] = 'true';

  return (
    <div
      ref={ref}
      className={cx(
        stackRecipe({
          direction,
          wrap,
          justify,
          align,
          expandRow: expand && direction === 'row' ? true : undefined,
          expandColumn: expand && direction === 'column' ? true : undefined,
        }),
        className
      )}
      data-testid={testId}
      style={mergedStyle}
      {...dataAttrs}
      {...htmlProps}
    >
      {children}
    </div>
  );
};

Stack.displayName = 'Stack';
