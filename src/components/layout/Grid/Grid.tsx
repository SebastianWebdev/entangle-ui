// src/components/layout/Grid/Grid.tsx
import React from 'react';
import styled from '@emotion/styled';
import type { Prettify } from '@/types/utilities';

import type { Theme } from '@/theme/types';

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
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Ref forwarded to the root DOM element
   */
  ref?: React.Ref<HTMLDivElement> | undefined;
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

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test identifier for automated testing
   */
  'data-testid'?: string | undefined;
}

/**
 * Props for the Grid component with prettified type for better IntelliSense
 */
export type GridProps = Prettify<GridBaseProps>;

interface StyledGridProps {
  $container: boolean;
  $size?: GridSize | undefined;
  $xs?: GridSize | undefined;
  $sm?: GridSize | undefined;
  $md?: GridSize | undefined;
  $lg?: GridSize | undefined;
  $xl?: GridSize | undefined;
  $spacing: GridSpacing | undefined;
  $columns: number | undefined;
  $gap?: string | number | undefined;
}

/**
 * Calculate gap value based on spacing multiplier and theme
 */
const getGapValue = (
  spacing: GridSpacing,
  theme: Theme,
  customGap?: string | number
): string => {
  if (customGap !== undefined) {
    return typeof customGap === 'number' ? `${customGap}px` : customGap;
  }
  return `${spacing * theme.spacing.sm}px`;
};

const StyledGrid = styled.div<StyledGridProps>`
  /* Container styles - creates CSS Grid layout */
  ${props =>
    props.$container &&
    `
    display: grid;
    grid-template-columns: repeat(${props.$columns}, 1fr);
    width: 100%;
    box-sizing: border-box;
    gap: ${getGapValue(props.$spacing ?? 2, props.theme, props.$gap)};
  `}

  /* Item styles - defines how this grid item behaves */
  ${props =>
    !props.$container &&
    props.$size &&
    `
    grid-column: span ${props.$size === 'auto' ? 'auto' : props.$size};
  `}
  
  /* Responsive grid item sizes */
  ${props =>
    !props.$container &&
    `
    /* Base size */
    ${props.$size && `grid-column: span ${props.$size === 'auto' ? 'auto' : props.$size};`}
    
    /* Extra small screens and up */
    ${
      props.$xs &&
      `
      grid-column: span ${props.$xs === 'auto' ? 'auto' : props.$xs};
    `
    }
    
    /* Small screens and up (576px) */
    @media (min-width: 576px) {
      ${props.$sm && `grid-column: span ${props.$sm === 'auto' ? 'auto' : props.$sm};`}
    }
    
    /* Medium screens and up (768px) */
    @media (min-width: 768px) {
      ${props.$md && `grid-column: span ${props.$md === 'auto' ? 'auto' : props.$md};`}
    }
    
    /* Large screens and up (992px) */
    @media (min-width: 992px) {
      ${props.$lg && `grid-column: span ${props.$lg === 'auto' ? 'auto' : props.$lg};`}
    }
    
    /* Extra large screens and up (1200px) */
    @media (min-width: 1200px) {
      ${props.$xl && `grid-column: span ${props.$xl === 'auto' ? 'auto' : props.$xl};`}
    }
  `}
  
  /* Ensure proper box sizing for all grid items */
  box-sizing: border-box;
`;

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
  'data-testid': testId,
  ref,
  ...htmlProps
}) => {
  return (
    <StyledGrid
      ref={ref}
      className={className}
      $container={container}
      $size={size}
      $xs={xs}
      $sm={sm}
      $md={md}
      $lg={lg}
      $xl={xl}
      $spacing={spacing}
      $columns={columns}
      $gap={gap}
      data-testid={testId}
      {...htmlProps}
    >
      {children}
    </StyledGrid>
  );
};

Grid.displayName = 'Grid';
