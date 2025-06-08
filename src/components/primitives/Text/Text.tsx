import React from 'react';
import styled from '@emotion/styled';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import { processCss } from '@/utils/styledUtils';

/**
 * HTML element types that Text component can render as
 */
export type TextElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'label'
  | 'strong'
  | 'em'
  | 'small';

/**
 * Semantic text variants optimized for editor interfaces
 */
export type TextVariant =
  | 'display' // Large headings, titles
  | 'heading' // Section headings
  | 'subheading' // Subsection headings
  | 'body' // Standard body text
  | 'caption' // Small descriptive text
  | 'code' // Inline code text
  | 'inherit'; // Inherit from parent

/**
 * Text size using theme typography tokens
 */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Text weight using theme typography tokens
 */
export type TextWeight = 'normal' | 'medium' | 'semibold';

/**
 * Text color using theme color tokens
 */
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'disabled'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Text alignment options
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Line height using theme typography tokens
 */
export type TextLineHeight = 'tight' | 'normal' | 'relaxed';

/**
 * Base props for Text component
 */
export interface TextBaseProps extends BaseComponent<HTMLElement> {
  /**
   * Text content
   */
  children: React.ReactNode;

  /**
   * HTML element to render as
   * @default "span"
   */
  as?: TextElement;

  /**
   * Semantic variant with predefined styling
   * - `display`: Large text for main titles (xl size, semibold weight)
   * - `heading`: Section headings (lg size, medium weight)
   * - `subheading`: Subsection headings (md size, medium weight)
   * - `body`: Standard body text (sm size, normal weight)
   * - `caption`: Small descriptive text (xs size, normal weight)
   * - `code`: Monospace text for code (sm size, mono font)
   * - `inherit`: Inherit typography from parent
   * @default "body"
   */
  variant?: TextVariant;

  /**
   * Text size using theme typography tokens
   * Overrides variant size if specified
   */
  size?: TextSize;

  /**
   * Text weight using theme typography tokens
   * Overrides variant weight if specified
   */
  weight?: TextWeight;

  /**
   * Text color using theme color tokens
   * @default "primary"
   */
  color?: TextColor;

  /**
   * Line height using theme typography tokens
   * Overrides variant line height if specified
   */
  lineHeight?: TextLineHeight;

  /**
   * Text alignment
   */
  align?: TextAlign;

  /**
   * Whether to truncate text with ellipsis on overflow
   * @default false
   */
  truncate?: boolean;

  /**
   * Maximum number of lines before truncating (requires truncate=true)
   * Single line truncation if not specified
   */
  maxLines?: number;

  /**
   * Whether text should not wrap to next line
   * @default false
   */
  nowrap?: boolean;

  /**
   * Whether to use monospace font family
   * Automatically true for 'code' variant
   * @default false
   */
  mono?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Props for the Text component with prettified type for better IntelliSense
 */
export type TextProps = Prettify<TextBaseProps>;

interface StyledTextProps {
  $variant: TextVariant;
  $size?: TextSize;
  $weight?: TextWeight;
  $color: TextColor;
  $lineHeight?: TextLineHeight;
  $align?: TextAlign;
  $truncate: boolean;
  $maxLines?: number;
  $nowrap: boolean;
  $mono: boolean;
  $css?: TextProps['css'];
}

const StyledText = styled.span<StyledTextProps>`
  /* Reset */
  margin: 0;
  padding: 0;

  /* Font family */
  font-family: ${props =>
    props.$mono || props.$variant === 'code'
      ? props.theme.typography.fontFamily.mono
      : props.theme.typography.fontFamily.sans};

  /* Variant-based styling */
  ${props => {
    if (props.$variant === 'inherit') {
      return '';
    }

    const variants = {
      display: {
        fontSize: props.theme.typography.fontSize.xl,
        fontWeight: props.theme.typography.fontWeight.semibold,
        lineHeight: props.theme.typography.lineHeight.tight,
      },
      heading: {
        fontSize: props.theme.typography.fontSize.lg,
        fontWeight: props.theme.typography.fontWeight.medium,
        lineHeight: props.theme.typography.lineHeight.tight,
      },
      subheading: {
        fontSize: props.theme.typography.fontSize.md,
        fontWeight: props.theme.typography.fontWeight.medium,
        lineHeight: props.theme.typography.lineHeight.normal,
      },
      body: {
        fontSize: props.theme.typography.fontSize.sm,
        fontWeight: props.theme.typography.fontWeight.normal,
        lineHeight: props.theme.typography.lineHeight.normal,
      },
      caption: {
        fontSize: props.theme.typography.fontSize.xs,
        fontWeight: props.theme.typography.fontWeight.normal,
        lineHeight: props.theme.typography.lineHeight.tight,
      },
      code: {
        fontSize: props.theme.typography.fontSize.sm,
        fontWeight: props.theme.typography.fontWeight.normal,
        lineHeight: props.theme.typography.lineHeight.normal,
      },
    };

    const variant = variants[props.$variant];
    if (!variant) return '';

    return `
      font-size: ${variant.fontSize}px;
      font-weight: ${variant.fontWeight};
      line-height: ${variant.lineHeight};
    `;
  }}

  /* Size override */
  ${props =>
    props.$size &&
    props.$variant !== 'inherit' &&
    `
    font-size: ${props.theme.typography.fontSize[props.$size]}px;
  `}

  /* Weight override */
  ${props =>
    props.$weight &&
    props.$variant !== 'inherit' &&
    `
    font-weight: ${props.theme.typography.fontWeight[props.$weight]};
  `}

  /* Line height override */
  ${props =>
    props.$lineHeight &&
    props.$variant !== 'inherit' &&
    `
    line-height: ${props.theme.typography.lineHeight[props.$lineHeight]};
  `}

  /* Color */
  color: ${props => {
    const colorMap = {
      primary: props.theme.colors.text.primary,
      secondary: props.theme.colors.text.secondary,
      muted: props.theme.colors.text.muted,
      disabled: props.theme.colors.text.disabled,
      accent: props.theme.colors.accent.primary,
      success: props.theme.colors.accent.success,
      warning: props.theme.colors.accent.warning,
      error: props.theme.colors.accent.error,
    };
    return colorMap[props.$color];
  }};

  /* Text alignment */
  ${props => props.$align && `text-align: ${props.$align};`}

  /* No wrap */
  ${props => props.$nowrap && 'white-space: nowrap;'}

  /* Truncation */
  ${props =>
    props.$truncate &&
    !props.$maxLines &&
    `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}

  /* Multi-line truncation */
  ${props =>
    props.$truncate &&
    props.$maxLines &&
    `
    display: -webkit-box;
    -webkit-line-clamp: ${props.$maxLines};
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  `}

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

/**
 * A versatile text component for consistent typography in editor interfaces.
 *
 * Provides semantic variants, flexible sizing, and comprehensive text styling
 * options optimized for professional editor UIs. Uses theme typography tokens
 * for consistent spacing and sizing across the application.
 *
 * @example
 * ```tsx
 * // Semantic variants
 * <Text variant="display">Main Title</Text>
 * <Text variant="heading">Section Heading</Text>
 * <Text variant="body">Regular paragraph text</Text>
 * <Text variant="caption">Small helper text</Text>
 * <Text variant="code">console.log('hello')</Text>
 *
 * // Custom sizing and colors
 * <Text size="lg" weight="semibold" color="accent">
 *   Custom styled text
 * </Text>
 *
 * // With truncation
 * <Text truncate maxLines={2}>
 *   Long text that will be truncated after two lines...
 * </Text>
 *
 * // Different HTML elements
 * <Text as="h1" variant="display">Page Title</Text>
 * <Text as="p" variant="body">Paragraph content</Text>
 * <Text as="label" variant="caption">Form label</Text>
 * ```
 */
export const Text: React.FC<TextProps> = ({
  children,
  as = 'span',
  variant = 'body',
  size,
  weight,
  color = 'primary',
  lineHeight,
  align,
  truncate = false,
  maxLines,
  nowrap = false,
  mono = false,
  className,
  style,
  css,
  ...rest
}) => {
  return (
    <StyledText
      as={as}
      $variant={variant}
      $size={size}
      $weight={weight}
      $color={color}
      $lineHeight={lineHeight}
      $align={align}
      $truncate={truncate}
      $maxLines={maxLines}
      $nowrap={nowrap}
      $mono={mono}
      $css={css}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </StyledText>
  );
};
