// src/components/layout/Spacer/Spacer.tsx
import React from 'react';
import styled from '@emotion/styled';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { processCss } from '@/utils/styledUtils';

export interface SpacerBaseProps
  extends Omit<BaseComponent<HTMLDivElement>, 'children'> {
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

interface StyledSpacerProps {
  $size?: string | number | undefined;
  $css?: SpacerProps['css'];
}

const StyledSpacer = styled.div<StyledSpacerProps>`
  /* Auto-expanding behavior by default */
  ${props =>
    !props.$size &&
    `
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    min-width: 0;
    min-height: 0;
  `}

  /* Fixed size mode — sets both width and height; flex layout uses the axis-aligned dimension */
  ${props =>
    props.$size &&
    `
    flex: none;
    ${
      typeof props.$size === 'number'
        ? `width: ${props.$size}px; height: ${props.$size}px;`
        : `width: ${props.$size}; height: ${props.$size};`
    }
  `}
  
  /* Ensure it doesn't interfere with content */
  pointer-events: none;
  user-select: none;

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

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
export const Spacer = React.memo<SpacerProps>(
  ({ size, className, testId, css, style, ref, ...htmlProps }) => {
    return (
      <StyledSpacer
        ref={ref}
        className={className}
        $size={size}
        $css={css}
        data-testid={testId}
        style={style}
        {...htmlProps}
      />
    );
  }
);

Spacer.displayName = 'Spacer';
