// src/primitives/Icon/Icon.tsx
import React from 'react';
import styled from '@emotion/styled';
import type { Prettify, LiteralUnion } from '@/types/utilities';
import type { Size } from '@/types/common';

/**
 * Standard icon sizes used across the library.
 * Maps to pixel dimensions optimized for editor interfaces.
 */
export type IconSize = Size;

/**
 * Color variants for icons with extensibility for custom themes.
 * Standard variants map to theme colors, custom colors supported.
 */
export type IconColor = LiteralUnion<
  'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error'
>;

export interface IconBaseProps {
  /**
   * SVG content as string - the raw SVG markup to render
   * Should be a valid SVG string without the outer <svg> wrapper
   * @example "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
   */
  svg: string;
  
  /**
   * Icon size using standard library sizing
   * - `sm`: 12px, for inline text and compact UI
   * - `md`: 16px, standard for buttons and controls
   * - `lg`: 20px, for headers and prominent actions
   * @default "md"
   */
  size?: IconSize;
  
  /**
   * Icon color variant with extensibility for custom themes
   * Maps to theme colors or accepts custom color values
   * @default "primary"
   */
  color?: IconColor;
  
  /**
   * Additional CSS classes for custom styling
   */
  className?: string;
  
  /**
   * Accessible title for screen readers
   * Recommended for all icons that convey meaning
   * @example "Save file", "Delete item", "Settings"
   */
  title?: string;
  
  /**
   * Whether the icon should be decorative only
   * If true, hides from screen readers (aria-hidden="true")
   * @default false
   */
  decorative?: boolean;
  
  /**
   * Test identifier for automated testing
   * @example "icon-save", "icon-delete"
   */
  'data-testid'?: string;
}

/**
 * Props for the Icon component with prettified type for better IntelliSense
 */
export type IconProps = Prettify<IconBaseProps>;

interface StyledIconProps {
  $size: IconSize;
  $color: IconColor;
}

const StyledSVG = styled.svg<StyledIconProps>`
  /* Reset and base styles */
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  flex-shrink: 0;
  user-select: none;
  
  /* Size variants optimized for editor interfaces */
  ${props => {
    const sizes = {
      sm: '12px',
      md: '16px', 
      lg: '20px',
    };
    return `
      width: ${sizes[props.$size]};
      height: ${sizes[props.$size]};
    `;
  }}
  
  /* Color variants using theme tokens */
  ${props => {
    const { theme } = props;
    
    // Standard color mappings to theme
    const colorMap = {
      primary: theme.colors.text.primary,
      secondary: theme.colors.text.secondary,
      muted: theme.colors.text.muted,
      accent: theme.colors.accent.primary,
      success: theme.colors.accent.success,
      warning: theme.colors.accent.warning,
      error: theme.colors.accent.error,
    };
    
    // Use theme color if available, otherwise treat as custom color
    const color = colorMap[props.$color as keyof typeof colorMap] || props.$color;
    
    return `color: ${color};`;
  }}
  
  /* Ensure crisp rendering */
  shape-rendering: geometricPrecision;
`;

/**
 * A flexible icon component for displaying SVG icons in editor interfaces.
 * 
 * Supports standard sizing, theming, and accessibility features.
 * Accepts raw SVG path data and renders it with consistent styling.
 * 
 * @example
 * ```tsx
 * // Basic usage with SVG path
 * <Icon svg="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
 * 
 * // With size and color
 * <Icon 
 *   svg="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
 *   size="lg"
 *   color="accent" 
 *   title="Add item"
 * />
 * 
 * // Custom color
 * <Icon 
 *   svg="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-12H6v12z"
 *   color="#ff6b6b"
 *   title="Delete"
 * />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  svg,
  size = 'md',
  color = 'primary',
  className,
  title,
  decorative = false,
  'data-testid': testId,
  ...props
}) => {
  return (
    <StyledSVG
      className={className}
      $size={size}
      $color={color}
      viewBox="0 0 24 24"
      aria-hidden={decorative}
      role={decorative ? 'presentation' : 'img'}
      data-testid={testId}
      {...props}
    >
      {title && !decorative && <title>{title}</title>}
      <path d={svg} />
    </StyledSVG>
  );
};