import React from 'react';
import type { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import {
  textRecipe,
  truncateSingleLineStyle,
  truncateMultiLineStyle,
} from './Text.css';

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
export interface TextBaseProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'css' | 'color'> {
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

  /**
   * Test identifier for automated testing
   */
  testId?: string;

  ref?: React.Ref<HTMLElement>;
}

/**
 * Props for the Text component with prettified type for better IntelliSense
 */
export type TextProps = Prettify<TextBaseProps>;

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
export const Text = /*#__PURE__*/ React.memo<TextProps>(
  ({
    children,
    as: Component = 'span',
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
    testId,
    ref,
    ...rest
  }) => {
    // Only pass size/weight/lineHeight overrides when variant is not 'inherit'
    const sizeVariant = size && variant !== 'inherit' ? size : undefined;
    const weightVariant = weight && variant !== 'inherit' ? weight : undefined;
    const lineHeightVariant =
      lineHeight && variant !== 'inherit' ? lineHeight : undefined;

    const truncateStyle =
      truncate && maxLines
        ? { WebkitLineClamp: maxLines }
        : undefined;

    return (
      <Component
        ref={ref as React.Ref<never>}
        className={cx(
          textRecipe({
            variant,
            color,
            size: sizeVariant,
            weight: weightVariant,
            lineHeight: lineHeightVariant,
            align,
            nowrap: nowrap || undefined,
            mono: (mono || variant === 'code') ? true : undefined,
            truncate: truncate || undefined,
          }),
          truncate && !maxLines && truncateSingleLineStyle,
          truncate && maxLines ? truncateMultiLineStyle : undefined,
          className,
        )}
        style={{ ...truncateStyle, ...style }}
        data-testid={testId}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';
