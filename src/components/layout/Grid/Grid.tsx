// src/components/layout/Grid/Grid.tsx
import React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { gridContainer, gridItem, gapVar, columnsVar } from './Grid.css';

/**
 * Grid size variants from 1-12 columns or auto-sizing
 */
export type GridSize =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 'auto';

/**
 * Spacing multiplier (0-8) based on theme spacing unit
 * 0 = no spacing, 1 = 1x base unit, 2 = 2x base unit, etc.
 */
export type GridSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface GridBaseProps
  extends Omit<BaseComponent<HTMLDivElement>, 'children'> {
  /**
   * Grid content - other Grid components or any React elements
   */
  children: React.ReactNode;

  /**
   * Whether this Grid acts as a container (enables CSS Grid)
   * When true, this Grid becomes a container for child Grid items
   * @default false
   */
  container?: boolean;

  /**
   * Grid item size (1-12 columns)
   * Only used when this Grid is a child of a container Grid
   * @example 6 // Takes 6 out of 12 columns (50% width)
   */
  size?: GridSize | undefined;

  /**
   * Responsive grid sizes
   * Allows different column spans at different breakpoints
   * @example xs={12} sm={6} md={4} // Full width on mobile, half on tablet, third on desktop
   */
  xs?: GridSize | undefined;
  sm?: GridSize | undefined;
  md?: GridSize | undefined;
  lg?: GridSize | undefined;
  xl?: GridSize | undefined;

  /**
   * Spacing between grid items (multiplier of base spacing unit)
   * Only applies when container=true
   * - `0`: No spacing (0px)
   * - `1`: 1x base unit (4px)
   * - `2`: 2x base unit (8px)
   * - `3`: 3x base unit (12px)
   * - `4`: 4x base unit (16px)
   * @default 2
   */
  spacing?: GridSpacing | undefined;

  /**
   * Total number of columns in the grid
   * Only applies when container=true
   * @default 12
   */
  columns?: number | undefined;

  /**
   * Custom gap override (CSS value)
   * Overrides spacing prop if provided
   * @example "16px", "1rem", "2"
   */
  gap?: string | number | undefined;
}

/**
 * Props for the Grid component with prettified type for better IntelliSense
 */
export type GridProps = Prettify<GridBaseProps>;

/** Base spacing unit in px */
const SPACING_UNIT = 4;

/**
 * Calculate gap value based on spacing multiplier
 */
const getGapValue = (
  spacing: GridSpacing,
  customGap?: string | number
): string => {
  if (customGap !== undefined) {
    return typeof customGap === 'number' ? `${customGap}px` : customGap;
  }
  return `${spacing * SPACING_UNIT}px`;
};

/**
 * A flexible 12-column grid system component for creating responsive layouts.
 *
 * Supports both container and item modes. Container grids create the grid layout,
 * while item grids define how much space each child should occupy.
 * Built on CSS Grid for modern, flexible layouts.
 *
 * @example
 * ```tsx
 * // Basic two-column layout
 * <Grid container spacing="md">
 *   <Grid size={6}>Left content</Grid>
 *   <Grid size={6}>Right content</Grid>
 * </Grid>
 *
 * // Responsive three-column layout
 * <Grid container spacing="lg">
 *   <Grid xs={12} sm={6} md={4}>Card 1</Grid>
 *   <Grid xs={12} sm={6} md={4}>Card 2</Grid>
 *   <Grid xs={12} sm={12} md={4}>Card 3</Grid>
 * </Grid>
 *
 * // Nested grids
 * <Grid container spacing="md">
 *   <Grid size={8}>
 *     <Grid container spacing="sm">
 *       <Grid size={6}>Nested left</Grid>
 *       <Grid size={6}>Nested right</Grid>
 *     </Grid>
 *   </Grid>
 *   <Grid size={4}>Sidebar</Grid>
 * </Grid>
 *
 * // Custom gap
 * <Grid container gap="2rem">
 *   <Grid size={4}>Item 1</Grid>
 *   <Grid size={4}>Item 2</Grid>
 *   <Grid size={4}>Item 3</Grid>
 * </Grid>
 * ```
 */
export const Grid: React.FC<GridProps> = ({
  children,
  container = false,
  size,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing = 2,
  columns = 12,
  gap,
  className,
  testId,
  style,
  ref,
  ...htmlProps
}) => {
  if (container) {
    const containerStyle: React.CSSProperties = {
      ...assignInlineVars({
        [gapVar]: getGapValue(spacing, gap),
        [columnsVar]: String(columns),
      }),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cx(gridContainer, className)}
        data-testid={testId}
        style={containerStyle}
        {...htmlProps}
      >
        {children}
      </div>
    );
  }

  // Item mode — use data attributes for responsive grid-column spans
  const dataAttrs: Record<string, string> = {};
  if (size !== undefined) {
    // Base size applied via inline style for simplicity
  }
  if (xs !== undefined) dataAttrs['data-xs'] = String(xs);
  if (sm !== undefined) dataAttrs['data-sm'] = String(sm);
  if (md !== undefined) dataAttrs['data-md'] = String(md);
  if (lg !== undefined) dataAttrs['data-lg'] = String(lg);
  if (xl !== undefined) dataAttrs['data-xl'] = String(xl);

  const itemStyle: React.CSSProperties = {
    ...(size !== undefined
      ? { gridColumn: `span ${size === 'auto' ? 'auto' : size}` }
      : undefined),
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cx(gridItem, className)}
      data-testid={testId}
      style={itemStyle}
      {...dataAttrs}
      {...htmlProps}
    >
      {children}
    </div>
  );
};

Grid.displayName = 'Grid';
