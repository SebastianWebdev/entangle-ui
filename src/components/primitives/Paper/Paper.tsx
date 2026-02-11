// src/components/primitives/Paper/Paper.tsx
import React from 'react';
import type { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import { paperRecipe } from './Paper.css';

/**
 * Paper elevation levels (shadow intensity)
 */
export type PaperElevation = 0 | 1 | 2 | 3;

/**
 * Paper nesting levels for automatic background adjustment
 * Higher levels get progressively lighter backgrounds
 */
export type PaperNestLevel = 0 | 1 | 2 | 3;

/**
 * Paper spacing variants based on theme spacing tokens
 */
export type PaperSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';

export interface PaperBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'css'> {
  /**
   * Paper content - any React elements
   */
  children?: React.ReactNode;

  /**
   * Paper elevation level controlling shadow intensity
   * - `0`: No shadow (flat)
   * - `1`: Small shadow (subtle depth)
   * - `2`: Medium shadow (moderate depth)
   * - `3`: Large shadow (high depth)
   * @default 1
   */
  elevation?: PaperElevation;

  /**
   * Whether to show border around the paper
   * Uses theme border color with subtle opacity
   * @default false
   */
  bordered?: boolean;

  /**
   * Internal padding using theme spacing tokens
   * - `xs`: 2px padding
   * - `sm`: 4px padding
   * - `md`: 8px padding (default)
   * - `lg`: 12px padding
   * - `xl`: 16px padding
   * - `xxl`: 24px padding
   * - `xxxl`: 32px padding
   * @default "md"
   */
  padding?: PaperSpacing;

  /**
   * Nesting level for automatic background adjustment
   * Higher levels get progressively lighter backgrounds for better visual hierarchy
   * - `0`: Primary background (darkest)
   * - `1`: Secondary background
   * - `2`: Tertiary background
   * - `3`: Elevated background (lightest)
   * @default 0
   */
  nestLevel?: PaperNestLevel;

  /**
   * Whether the paper should expand to fill available space
   * Sets width and height to 100%
   * @default false
   */
  expand?: boolean;

  /**
   * Custom border radius override
   * Overrides default theme border radius if provided
   * @example "8px", "50%", "0"
   */
  customRadius?: string | number;

  /**
   * Test identifier for automated testing
   */
  testId?: string;

  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Props for the Paper component with prettified type for better IntelliSense
 */
export type PaperProps = Prettify<PaperBaseProps>;

/**
 * A versatile paper component providing surface elevation and visual hierarchy.
 *
 * Perfect for creating cards, panels, modals, and any content that needs to stand out
 * from the background. Supports elevation shadows, automatic background adjustment
 * for nested components, and flexible spacing control.
 *
 * @example
 * ```tsx
 * // Basic paper with elevation
 * <Paper elevation={2} padding="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Paper>
 *
 * // Nested papers with automatic background adjustment
 * <Paper nestLevel={0} padding="xl">
 *   <h2>Main Container</h2>
 *   <Paper nestLevel={1} padding="lg">
 *     <h3>Nested Section</h3>
 *     <Paper nestLevel={2} padding="md">
 *       <p>Deeply nested content</p>
 *     </Paper>
 *   </Paper>
 * </Paper>
 *
 * // Bordered paper without shadow
 * <Paper elevation={0} bordered padding="md">
 *   <p>Subtle outlined container</p>
 * </Paper>
 *
 * // Full-width expanded paper
 * <Paper expand elevation={1} padding="lg">
 *   <header>Full width header</header>
 *   <main>Main content area</main>
 * </Paper>
 *
 * // Custom radius paper
 * <Paper elevation={2} customRadius="12px" padding="lg">
 *   <p>Paper with custom border radius</p>
 * </Paper>
 *
 * // Compact paper for small UI elements
 * <Paper elevation={1} padding="xs">
 *   <Icon name="settings" />
 * </Paper>
 * ```
 */
export const Paper = /*#__PURE__*/ React.memo<PaperProps>(
  ({
    children,
    elevation = 1,
    bordered = false,
    padding = 'md',
    nestLevel = 0,
    expand = false,
    customRadius,
    className,
    testId,
    style,
    ref,
    ...htmlProps
  }) => {
    const customRadiusStyle = customRadius !== undefined
      ? {
          borderRadius:
            typeof customRadius === 'number'
              ? `${customRadius}px`
              : customRadius,
        }
      : undefined;

    return (
      <div
        ref={ref}
        className={cx(
          paperRecipe({
            elevation,
            bordered: bordered || undefined,
            padding,
            nestLevel,
            expand: expand || undefined,
          }),
          className,
        )}
        data-testid={testId}
        style={{ ...customRadiusStyle, ...style }}
        {...htmlProps}
      >
        {children}
      </div>
    );
  }
);

Paper.displayName = 'Paper';
