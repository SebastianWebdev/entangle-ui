// src/components/layout/Spacer/Spacer.tsx
import React from 'react';
import styled from '@emotion/styled';
import type { Prettify } from '@/types/utilities';

export interface SpacerBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Ref forwarded to the root DOM element
   */
  ref?: React.Ref<HTMLDivElement> | undefined;
  /**
   * Fixed size instead of auto-expanding
   * When provided, spacer will have a fixed dimension instead of flexible growth
   * @example "20px", "1rem", "2em", 40
   */
  size?: string | number | undefined;

  /**
   * Additional CSS classes
   */
  className?: string | undefined;

  /**
   * Test identifier for automated testing
   */
  'data-testid'?: string | undefined;
}

/**
 * Props for the Spacer component with prettified type for better IntelliSense
 */
export type SpacerProps = Prettify<SpacerBaseProps>;

interface StyledSpacerProps {
  $size?: string | number | undefined;
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

  /* Fixed size mode */
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
  ({ size, className, 'data-testid': testId, ref, ...htmlProps }) => {
    return (
      <StyledSpacer
        ref={ref}
        className={className}
        $size={size}
        data-testid={testId}
        {...htmlProps}
      />
    );
  }
);

Spacer.displayName = 'Spacer';
