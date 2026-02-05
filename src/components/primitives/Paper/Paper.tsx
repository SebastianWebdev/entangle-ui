// src/components/primitives/Paper/Paper.tsx
import React from 'react';
import styled from '@emotion/styled';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type { Theme } from '@/theme/types';
import { processCss } from '@/utils/styledUtils';

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
  extends Omit<BaseComponent<HTMLDivElement>, 'children'> {
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
}

/**
 * Props for the Paper component with prettified type for better IntelliSense
 */
export type PaperProps = Prettify<PaperBaseProps>;

interface StyledPaperProps {
  $elevation: PaperElevation;
  $bordered: boolean;
  $padding: PaperSpacing;
  $nestLevel: PaperNestLevel;
  $expand: boolean;
  $customRadius?: string | number;
  $css?: PaperProps['css'];
}

/**
 * Get background color based on nesting level
 */
const getBackgroundColor = (
  nestLevel: PaperNestLevel,
  theme: Theme
): string | undefined => {
  const backgroundLevels = [
    theme.colors.background.primary, // Level 0 - darkest
    theme.colors.background.secondary, // Level 1
    theme.colors.background.tertiary, // Level 2
    theme.colors.background.elevated, // Level 3 - lightest
  ];

  return backgroundLevels[nestLevel] ?? backgroundLevels[0];
};

/**
 * Get box shadow based on elevation level
 */
const getElevationShadow = (
  elevation: PaperElevation,
  theme: Theme
): string => {
  const shadowLevels = [
    'none', // Level 0 - no shadow
    theme.shadows.sm, // Level 1 - small shadow
    theme.shadows.md, // Level 2 - medium shadow
    theme.shadows.lg, // Level 3 - large shadow
  ];

  return shadowLevels[elevation] ?? 'none';
};

/**
 * Get padding value from theme spacing tokens
 */
const getPaddingValue = (spacing: PaperSpacing, theme: Theme): string => {
  return `${theme.spacing[spacing]}px`;
};

const StyledPaper = styled.div<StyledPaperProps>`
  /* Base styles */
  box-sizing: border-box;
  position: relative;

  /* Background based on nesting level */
  background-color: ${props =>
    getBackgroundColor(props.$nestLevel, props.theme)};

  /* Border radius */
  border-radius: ${props => {
    if (props.$customRadius !== undefined) {
      return typeof props.$customRadius === 'number'
        ? `${props.$customRadius}px`
        : props.$customRadius;
    }
    return `${props.theme.borderRadius.md}px`;
  }};

  /* Border */
  ${props =>
    props.$bordered &&
    `
    border: 1px solid ${props.theme.colors.border.default};
  `}

  /* Elevation shadow */
  box-shadow: ${props => getElevationShadow(props.$elevation, props.theme)};

  /* Padding */
  padding: ${props => getPaddingValue(props.$padding, props.theme)};

  /* Expansion */
  ${props =>
    props.$expand &&
    `
    width: 100%;
    height: 100%;
  `}

  /* Smooth transitions for interactive states */
  transition: box-shadow ${props => props.theme.transitions.normal},
              background-color ${props => props.theme.transitions.normal};

  /* Hover enhancement for elevated papers */
  ${props =>
    props.$elevation > 0 &&
    `
    &:hover {
      box-shadow: ${
        props.$elevation === 1
          ? props.theme.shadows.md
          : props.$elevation === 2
            ? props.theme.shadows.lg
            : '0 8px 16px rgba(0, 0, 0, 0.5)'
      };
    }
  `}

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

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
export const Paper = React.memo<PaperProps>(
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
    css,
    style,
    ref,
    ...htmlProps
  }) => {
    return (
      <StyledPaper
        ref={ref}
        className={className}
        $elevation={elevation}
        $bordered={bordered}
        $padding={padding}
        $nestLevel={nestLevel}
        $expand={expand}
        $customRadius={customRadius}
        $css={css}
        data-testid={testId}
        style={style}
        {...htmlProps}
      >
        {children}
      </StyledPaper>
    );
  }
);

Paper.displayName = 'Paper';
