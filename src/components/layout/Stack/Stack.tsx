// src/components/layout/Stack/Stack.tsx
import React from 'react';
import styled from '@emotion/styled';
import type { Prettify } from '@/types/utilities';

import type { Theme } from '@/theme/types';

/**
 * Stack direction options
 */
export type StackDirection = 'row' | 'column';

/**
 * Stack wrap options  
 */
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Justify content options for main axis alignment
 */
export type StackJustify = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

/**
 * Align items options for cross axis alignment
 */
export type StackAlign = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

/**
 * Spacing multiplier (0-8) based on theme spacing unit
 */
export type StackSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StackBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Stack content - any React elements
   */
  children: React.ReactNode;
  
  /**
   * Stack direction - controls main axis orientation
   * - `row`: Left to right (horizontal)
   * - `column`: Top to bottom (vertical)
   * @default "column"
   */
  direction?: StackDirection | undefined;

  /**
   * Responsive stack direction
   * Allows different directions at different breakpoints
   * @example direction="column" md="row" // Vertical on mobile, horizontal on desktop
   */
  sm?: StackDirection | undefined;
  md?: StackDirection | undefined;
  lg?: StackDirection | undefined;
  xl?: StackDirection | undefined;

  /**
   * Stack wrap behavior
   * - `nowrap`: Items stay on one line (default)
   * - `wrap`: Items wrap to new lines as needed
   * - `wrap-reverse`: Items wrap in reverse order
   * @default "nowrap"
   */
  wrap?: StackWrap | undefined;

  /**
   * Whether stack should expand to fill available space
   * - For row direction: takes 100% width
   * - For column direction: takes 100% height
   * @default false
   */
  expand?: boolean;

  /**
   * Spacing between stack items (multiplier of base spacing unit)
   * - `0`: No spacing (0px)
   * - `1`: 1x base unit (4px)
   * - `2`: 2x base unit (8px)
   * - `3`: 3x base unit (12px)
   * - `4`: 4x base unit (16px)
   * @default 0
   */
  spacing?: StackSpacing | undefined;
  
  /**
   * Custom gap override (CSS value)
   * Overrides spacing prop if provided
   * @example "16px", "1rem", "2rem 1rem"
   */
  customGap?: string | number | undefined;
  
  /**
   * Justify content - distributes space along main axis
   * - `flex-start`: Items packed to start (default)
   * - `flex-end`: Items packed to end
   * - `center`: Items centered
   * - `space-between`: Even space between items
   * - `space-around`: Even space around items
   * - `space-evenly`: Equal space between and around items
   * @default "flex-start"
   */
  justify?: StackJustify | undefined;

  /**
   * Align items - aligns items along cross axis
   * - `flex-start`: Items align to start of cross axis (default)
   * - `flex-end`: Items align to end of cross axis
   * - `center`: Items centered on cross axis
   * - `stretch`: Items stretch to fill container
   * - `baseline`: Items align to text baseline
   * @default "flex-start"
   */
  align?: StackAlign | undefined;
  
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
 * Props for the Stack component with prettified type for better IntelliSense
 */
export type StackProps = Prettify<StackBaseProps>;

interface StyledStackProps {
  $direction: StackDirection;
  $sm?: StackDirection | undefined;
  $md?: StackDirection | undefined;
  $lg?: StackDirection | undefined;
  $xl?: StackDirection | undefined;
  $wrap: StackWrap;
  $expand: boolean;
  $spacing: StackSpacing;
  $customGap?: string | number | undefined;
  $justify: StackJustify;
  $align: StackAlign;
}

/**
 * Calculate gap value based on spacing multiplier and theme
 */
const getGapValue = (spacing: StackSpacing, theme: Theme, customGap?: string | number): string => {
  if (customGap !== undefined) {
    return typeof customGap === 'number' ? `${customGap}px` : customGap;
  }
  return `${spacing * theme.spacing.sm}px`;
};

const StyledStack = styled.div<StyledStackProps>`
  /* Base stack container */
  display: flex;
  box-sizing: border-box;
  
  /* Flex properties */
  flex-direction: ${props => props.$direction};
  flex-wrap: ${props => props.$wrap};
  justify-content: ${props => props.$justify};
  align-items: ${props => props.$align};
  
  /* Gap between items */
  gap: ${props => getGapValue(props.$spacing, props.theme, props.$customGap)};
  
  /* Expand behavior based on direction */
  ${props => props.$expand && props.$direction === 'row' && 'width: 100%;'}
  ${props => props.$expand && props.$direction === 'column' && 'height: 100%;'}
  
  /* Responsive direction changes */
  ${props => props.$sm && `
    @media (min-width: 576px) {
      flex-direction: ${props.$sm};
      ${props.$expand && props.$sm === 'row' ? 'width: 100%; height: auto;' : ''}
      ${props.$expand && props.$sm === 'column' ? 'height: 100%; width: auto;' : ''}
    }
  `}
  
  ${props => props.$md && `
    @media (min-width: 768px) {
      flex-direction: ${props.$md};
      ${props.$expand && props.$md === 'row' ? 'width: 100%; height: auto;' : ''}
      ${props.$expand && props.$md === 'column' ? 'height: 100%; width: auto;' : ''}
    }
  `}
  
  ${props => props.$lg && `
    @media (min-width: 992px) {
      flex-direction: ${props.$lg};
      ${props.$expand && props.$lg === 'row' ? 'width: 100%; height: auto;' : ''}
      ${props.$expand && props.$lg === 'column' ? 'height: 100%; width: auto;' : ''}
    }
  `}
  
  ${props => props.$xl && `
    @media (min-width: 1200px) {
      flex-direction: ${props.$xl};
      ${props.$expand && props.$xl === 'row' ? 'width: 100%; height: auto;' : ''}
      ${props.$expand && props.$xl === 'column' ? 'height: 100%; width: auto;' : ''}
    }
  `}
`;

/**
 * A flexible stacking component for arranging elements vertically or horizontally.
 * 
 * Built on flexbox with consistent spacing and alignment options. Perfect for
 * simple layouts where you need to stack elements with controlled spacing.
 * Use Grid or Flex components for more complex layout requirements.
 * 
 * @example
 * ```tsx
 * // Basic vertical stack
 * <Stack spacing={2}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Stack>
 * 
 * // Horizontal stack with full width
 * <Stack direction="row" expand spacing={3} justify="space-between">
 *   <Button>Cancel</Button>
 *   <Button variant="filled">Save</Button>
 * </Stack>
 * 
 * // Responsive stack
 * <Stack 
 *   direction="column" 
 *   md="row" 
 *   spacing={2}
 *   align="center"
 * >
 *   <Logo />
 *   <Navigation />
 *   <UserMenu />
 * </Stack>
 * 
 * // Centered content
 * <Stack 
 *   direction="column" 
 *   expand 
 *   justify="center" 
 *   align="center"
 *   spacing={4}
 * >
 *   <Icon />
 *   <Title>Welcome</Title>
 *   <Button>Get Started</Button>
 * </Stack>
 * 
 * // Wrapping horizontal stack
 * <Stack 
 *   direction="row" 
 *   wrap="wrap" 
 *   spacing={2}
 *   justify="center"
 * >
 *   <Tag>React</Tag>
 *   <Tag>TypeScript</Tag>
 *   <Tag>CSS</Tag>
 * </Stack>
 * ```
 */
export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  sm,
  md,
  lg,
  xl,
  wrap = 'nowrap',
  expand = false,
  spacing = 0,
  customGap,
  justify = 'flex-start',
  align = 'flex-start',
  className,
  'data-testid': testId,
  ...htmlProps
}) => {
  return (
    <StyledStack
      className={className}
      $direction={direction}
      $sm={sm}
      $md={md}
      $lg={lg}
      $xl={xl}
      $wrap={wrap}
      $expand={expand}
      $spacing={spacing}
      $customGap={customGap}
      $justify={justify}
      $align={align}
      data-testid={testId}
      {...htmlProps}
    >
      {children}
    </StyledStack>
  );
};