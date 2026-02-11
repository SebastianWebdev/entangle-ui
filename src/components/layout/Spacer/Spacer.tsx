// src/components/layout/Spacer/Spacer.tsx
import React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import { spacerBase, spacerFixed, spacerFlexible } from './Spacer.css';

export interface SpacerBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'children'
> {
  /**
   * Fixed size instead of auto-expanding.
   * When provided, spacer will have a fixed dimension instead of flexible growth.
   *
   * Note: In fixed mode, both width and height are set to the same value.
   * The parent flex container's direction determines which dimension is used —
   * the cross-axis dimension is typically overridden by `align-items: stretch`.
   *
   * @example "20px", "1rem", "2em", 40
   */
  size?: string | number | undefined;
}

/**
 * Props for the Spacer component with prettified type for better IntelliSense
 */
export type SpacerProps = Prettify<SpacerBaseProps>;

/**
 * A flexible spacer component that expands to fill available space.
 *
 * Perfect for pushing elements apart in flex layouts (Stack, Flex components).
 * By default, it grows to fill available space. Can also be used with fixed size.
 *
 * @example
 * ```tsx
 * // Auto-expanding spacer (pushes elements apart)
 * <Stack direction="row">
 *   <Button>Left</Button>
 *   <Spacer />
 *   <Button>Right</Button>
 * </Stack>
 *
 * // Fixed size spacer
 * <Stack direction="column">
 *   <Title>Header</Title>
 *   <Spacer size="2rem" />
 *   <Content>Body</Content>
 * </Stack>
 *
 * // Multiple spacers for even distribution
 * <Flex direction="row">
 *   <Logo />
 *   <Spacer />
 *   <Navigation />
 *   <Spacer />
 *   <UserMenu />
 * </Flex>
 *
 * // Numeric size
 * <Stack>
 *   <Item />
 *   <Spacer size={20} />
 *   <Item />
 * </Stack>
 * ```
 */
export const Spacer = /*#__PURE__*/ React.memo<SpacerProps>(
  ({ size, className, testId, style, ref, ...htmlProps }) => {
    const sizeValue =
      size !== undefined
        ? typeof size === 'number'
          ? `${size}px`
          : size
        : undefined;

    const inlineStyle: React.CSSProperties | undefined =
      sizeValue !== undefined
        ? { ...style, width: sizeValue, height: sizeValue }
        : style;

    return (
      <div
        ref={ref}
        className={cx(
          spacerBase,
          size !== undefined ? spacerFixed : spacerFlexible,
          className
        )}
        data-testid={testId}
        style={inlineStyle}
        {...htmlProps}
      />
    );
  }
);

Spacer.displayName = 'Spacer';
