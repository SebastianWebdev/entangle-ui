// src/components/layout/Flex/Flex.tsx
import React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { flexRecipe, gapVar, growVar, shrinkVar, basisVar } from './Flex.css';

/**
 * Flex direction options
 */
export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/**
 * Flex wrap options
 */
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Justify content options
 */
export type FlexJustify =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * Align items options
 */
export type FlexAlign =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'baseline';

/**
 * Align content options (for wrapped flex containers)
 */
export type FlexAlignContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around';

/**
 * Spacing multiplier (0-8) based on theme spacing unit
 */
export type FlexSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface FlexBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Flex content - any React elements
   */
  children?: React.ReactNode;

  /**
   * Flex direction - controls main axis orientation
   * - `row`: Left to right (default)
   * - `row-reverse`: Right to left
   * - `column`: Top to bottom
   * - `column-reverse`: Bottom to top
   * @default "row"
   */
  direction?: FlexDirection | undefined;

  /**
   * Responsive flex direction
   * Allows different directions at different breakpoints
   */
  sm?: FlexDirection | undefined;
  md?: FlexDirection | undefined;
  lg?: FlexDirection | undefined;
  xl?: FlexDirection | undefined;

  /**
   * Flex wrap behavior
   * - `nowrap`: Items stay on one line (default)
   * - `wrap`: Items wrap to new lines as needed
   * - `wrap-reverse`: Items wrap in reverse order
   * @default "nowrap"
   */
  wrap?: FlexWrap | undefined;

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
  justify?: FlexJustify | undefined;

  /**
   * Align items - aligns items along cross axis
   * - `stretch`: Items stretch to fill container (default)
   * - `flex-start`: Items align to start of cross axis
   * - `flex-end`: Items align to end of cross axis
   * - `center`: Items centered on cross axis
   * - `baseline`: Items align to text baseline
   * @default "stretch"
   */
  align?: FlexAlign | undefined;

  /**
   * Align content - aligns wrapped lines
   * Only applies when wrap is enabled and there are multiple lines
   * - `stretch`: Lines stretch to fill container (default)
   * - `flex-start`: Lines packed to start
   * - `flex-end`: Lines packed to end
   * - `center`: Lines centered
   * - `space-between`: Even space between lines
   * - `space-around`: Even space around lines
   * @default "stretch"
   */
  alignContent?: FlexAlignContent | undefined;

  /**
   * Gap between flex items (multiplier of base spacing unit)
   * - `0`: No gap (0px)
   * - `1`: 1x base unit (4px)
   * - `2`: 2x base unit (8px)
   * - `3`: 3x base unit (12px)
   * - `4`: 4x base unit (16px)
   * @default 0
   */
  gap?: FlexSpacing | undefined;

  /**
   * Custom gap override (CSS value)
   * Overrides gap prop if provided
   * @example "16px", "1rem", "2rem 1rem"
   */
  customGap?: string | number | undefined;

  /**
   * Flex grow - how much item should grow
   * @default 0
   */
  grow?: number | undefined;

  /**
   * Flex shrink - how much item should shrink
   * @default 1
   */
  shrink?: number | undefined;

  /**
   * Flex basis - initial size before free space is distributed
   * @example "auto", "100px", "50%", "0"
   * @default "auto"
   */
  basis?: string | number | undefined;

  /**
   * Whether this flex container should fill available width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether this flex container should fill available height
   * @default false
   */
  fullHeight?: boolean;

  /**
   * Minimum height for the flex container
   * @example "100vh", "300px", "50%"
   */
  minHeight?: string | number | undefined;

  /**
   * Maximum width for the flex container
   * @example "1200px", "100%", "50vw"
   */
  maxWidth?: string | number | undefined;
}

/**
 * Props for the Flex component with prettified type for better IntelliSense
 */
export type FlexProps = Prettify<FlexBaseProps>;

/** Base spacing unit in px */
const SPACING_UNIT = 4;

/**
 * Calculate gap value based on spacing multiplier
 */
const getGapValue = (
  gap: FlexSpacing,
  customGap?: string | number
): string => {
  if (customGap !== undefined) {
    return typeof customGap === 'number' ? `${customGap}px` : customGap;
  }
  return `${gap * SPACING_UNIT}px`;
};

/**
 * A comprehensive flexbox component providing full control over flex properties.
 *
 * More powerful than Stack for complex layouts requiring precise flexbox control.
 * Supports all flexbox properties, responsive direction changes, and flexible sizing.
 * Perfect for complex layouts, navigation bars, form layouts, and sophisticated arrangements.
 *
 * @example
 * ```tsx
 * // Basic horizontal flex
 * <Flex justify="space-between" align="center">
 *   <div>Left content</div>
 *   <div>Right content</div>
 * </Flex>
 *
 * // Vertical stack with gap
 * <Flex direction="column" gap={3}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Flex>
 *
 * // Responsive navigation
 * <Flex
 *   direction="column"
 *   md="row"
 *   justify="space-between"
 *   align="center"
 *   gap={2}
 * >
 *   <Logo />
 *   <Navigation />
 *   <UserMenu />
 * </Flex>
 *
 * // Flexible form layout
 * <Flex direction="column" gap={2} maxWidth="400px">
 *   <Input label="Email" />
 *   <Input label="Password" />
 *   <Flex justify="space-between" gap={2}>
 *     <Button fullWidth variant="ghost">Cancel</Button>
 *     <Button fullWidth variant="filled">Login</Button>
 *   </Flex>
 * </Flex>
 *
 * // Card grid with wrapping
 * <Flex wrap="wrap" gap={3} justify="center">
 *   <Card basis="300px">Card 1</Card>
 *   <Card basis="300px">Card 2</Card>
 *   <Card basis="300px">Card 3</Card>
 * </Flex>
 *
 * // Complex layout with nesting
 * <Flex direction="column" fullHeight>
 *   <Header />
 *   <Flex grow={1}>
 *     <Sidebar basis="200px" />
 *     <MainContent grow={1} />
 *   </Flex>
 *   <Footer />
 * </Flex>
 * ```
 */
export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  sm,
  md,
  lg,
  xl,
  wrap = 'nowrap',
  justify = 'flex-start',
  align = 'stretch',
  alignContent = 'stretch',
  gap = 0,
  customGap,
  grow = 0,
  shrink = 1,
  basis = 'auto',
  fullWidth = false,
  fullHeight = false,
  minHeight,
  maxWidth,
  className,
  testId,
  style,
  ref,
  ...htmlProps
}) => {
  const basisValue =
    typeof basis === 'number' ? `${basis}px` : basis;

  const dynamicStyle: React.CSSProperties = {
    ...assignInlineVars({
      [gapVar]: getGapValue(gap, customGap),
      [growVar]: String(grow),
      [shrinkVar]: String(shrink),
      [basisVar]: basisValue,
    }),
    ...(minHeight !== undefined
      ? { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }
      : undefined),
    ...(maxWidth !== undefined
      ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }
      : undefined),
    ...style,
  };

  // Build data attributes for responsive direction overrides
  const dataAttrs: Record<string, string> = {};
  if (sm) dataAttrs['data-sm-dir'] = sm;
  if (md) dataAttrs['data-md-dir'] = md;
  if (lg) dataAttrs['data-lg-dir'] = lg;
  if (xl) dataAttrs['data-xl-dir'] = xl;

  return (
    <div
      ref={ref}
      className={cx(
        flexRecipe({
          direction,
          wrap,
          justify,
          align,
          alignContent,
          fullWidth: fullWidth || undefined,
          fullHeight: fullHeight || undefined,
        }),
        className,
      )}
      data-testid={testId}
      style={dynamicStyle}
      {...dataAttrs}
      {...htmlProps}
    >
      {children}
    </div>
  );
};

Flex.displayName = 'Flex';
