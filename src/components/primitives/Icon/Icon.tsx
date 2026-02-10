// src/primitives/Icon/Icon.tsx
import React from 'react';
import styled from '@emotion/styled';
import type { Prettify, LiteralUnion } from '@/types/utilities';
import type { Size } from '@/types/common';
import type { Theme } from '@/theme/types';
import { processCss } from '@/utils/styledUtils';

export type IconSize = Size;
export type IconColor = LiteralUnion<
  'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error'
>;

export interface IconBaseProps {
  children: React.ReactNode;
  size?: IconSize;
  color?: IconColor;
  className?: string;
  title?: string;
  decorative?: boolean;

  /**
   * Custom CSS styles included in styled-components
   * Can be an object of CSS properties or a function that receives theme and returns CSS properties
   */
  css?:
    | React.CSSProperties
    | ((theme: Theme) => React.CSSProperties)
    | undefined;

  /**
   * Test identifier for automated testing
   */
  testId?: string;

  ref?: React.Ref<SVGSVGElement>;
}

export type IconProps = Prettify<IconBaseProps>;

interface StyledSVGProps {
  $size: IconSize;
  $color: IconColor;
  $css?: IconProps['css'];
}

const StyledSVG = styled.svg<StyledSVGProps>`
  /* Reset and base styles */
  display: inline-block;
  vertical-align: middle;
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
    const color =
      colorMap[props.$color as keyof typeof colorMap] || props.$color;

    return `
      color: ${color};
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    `;
  }}
  
  /* Ensure crisp rendering */
  shape-rendering: geometricPrecision;

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

export const Icon = /*#__PURE__*/ React.memo<IconProps>(
  ({
    children,
    size = 'md',
    color = 'primary',
    className,
    title,
    decorative = false,
    css,
    testId,
    ref,
    ...props
  }) => {
    return (
      <StyledSVG
        ref={ref}
        className={className}
        $size={size}
        $color={color}
        $css={css}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden={decorative}
        role={decorative ? 'presentation' : 'img'}
        data-testid={testId}
        {...props}
      >
        {title && !decorative && <title>{title}</title>}
        {children}
      </StyledSVG>
    );
  }
);

Icon.displayName = 'Icon';
