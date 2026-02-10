// src/components/primitives/Tooltip/Tooltip.tsx
import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import styled from '@emotion/styled';
import React from 'react';

import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { processCss } from '@/utils/styledUtils';

import {
  CollisionAvoidance,
  TooltipAnimation,
  TooltipCollisionConfig,
  TooltipCollisionStrategy,
  TooltipPlacement,
  TooltipPositioner,
  BaseTooltipPositionerProps,
  BaseTooltipRootProps,
} from './types';

import { ArrowSvg, StyledTooltipArrow } from './Arrow';
import { parseCollisionStrategy, parsePlacement } from './utils';

interface TooltipBaseProps extends Omit<BaseComponent, 'title'> {
  /**
   * The trigger element that will show the tooltip on hover.
   * Must be a single React element or component.
   *
   * @example
   * <Button>Hover me</Button>
   * <IconButton><SaveIcon /></IconButton>
   */
  children: React.ReactElement;

  /**
   * The content to display in the tooltip.
   * Can be simple text or a complex React node for advanced customization.
   *
   * @example
   * "Save file"
   * <div><strong>Save</strong><br />Ctrl+S</div>
   */
  title: React.ReactNode;

  /**
   * Intuitive placement similar to MUI
   * @default "top"
   */
  placement?: TooltipPlacement;

  /**
   * Collision handling strategy
   * @default "smart"
   */
  collision?: TooltipCollisionStrategy;

  /**
   * Advanced collision configuration for power users
   * When provided, overrides the collision strategy
   */
  collisionConfig?: TooltipCollisionConfig;

  /**
   * Advanced positioning configuration
   */
  positioner?: TooltipPositioner;

  /**
   * Animation configuration
   */
  animation?: TooltipAnimation;

  /**
   * Delay in milliseconds before showing the tooltip
   * @default 600
   */
  delay?: number;

  /**
   * Delay in milliseconds before hiding the tooltip
   * @default 0
   */
  closeDelay?: number;

  /**
   * Whether to show the arrow pointing to the trigger
   * @default true
   */
  arrow?: boolean;

  /**
   * Whether the tooltip is disabled
   * When true, tooltip will not appear
   * @default false
   */
  disabled?: boolean;

  /**
   * Direct props passed to Base UI Root component
   * For power users who need full control
   */
  rootProps?: Partial<BaseTooltipRootProps>;

  /**
   * Direct props passed to Base UI Positioner component
   * For power users who need full control
   */
  positionerProps?: Partial<BaseTooltipPositionerProps>;
}

/**
 * Props for the Tooltip component with prettified type for better IntelliSense
 */
export type TooltipProps = Prettify<TooltipBaseProps>;

const StyledTooltipPositioner = styled(BaseTooltip.Positioner)`
  /* Positioner handles positioning, no visual styles needed here */
`;

const StyledTooltipContent = styled.div<{
  $css?: TooltipProps['css'];
  $animation?: TooltipAnimation;
}>`
  /* Base styles */
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  border-radius: ${props => props.theme.borderRadius.md}px;
  padding: ${props => props.theme.spacing.sm}px
    ${props => props.theme.spacing.md}px;
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  line-height: ${props => props.theme.typography.lineHeight.tight};
  font-family: ${props => props.theme.typography.fontFamily.sans};
  box-shadow: ${props => props.theme.shadows.lg};
  max-width: 320px;
  word-wrap: break-word;
  z-index: ${props => props.theme.zIndex.tooltip};
  min-height: 25px; // Ensure minimum height for better UX
  display: flex;
  align-items: center; // Center content vertically
  justify-content: center; // Center content horizontally

  /* Animation */
  ${props => {
    const { $animation } = props;
    const duration = $animation?.duration ?? 200;
    const easing = $animation?.easing ?? 'ease-out';
    const animated = $animation?.animated !== false;

    if (!animated) {
      return 'transition: none;';
    }

    return `
      transition: opacity ${duration}ms ${easing}, transform ${duration}ms ${easing};
      transform-origin: var(--transform-origin);
    `;
  }}

  /* Entry/exit animations */
  &[data-open] {
    opacity: 1;
    transform: scale(1);
  }

  &[data-closed] {
    opacity: 0;
    transform: scale(0.96);
  }

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

const StyledTooltipTrigger = styled.div<{
  $css?: TooltipProps['css'];
}>`
  /* Trigger styles */
  display: inline-block;
  cursor: pointer;
  width: fit-content; // Allow trigger to size to content
  height: fit-content; // Allow trigger to size to content
  position: relative; // Required for tooltip positioning
  z-index: 1; // Ensure trigger is above tooltip
  /* Prevents pointer events on the tooltip trigger */
  pointer-events: none;
  /* Allows pointer events on the children */
  & > * {
    pointer-events: auto;
  }
  /* Ensures the trigger is focusable */
  &:focus {
    outline: none; // Remove default focus outline
    box-shadow: ${props => props.theme.shadows.focus}; // Custom focus style
  }
  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

/**
 * A tooltip component that displays contextual information on hover.
 *
 * Built on @base-ui-components/react for robust accessibility and positioning.
 * Provides an intuitive API similar to MUI with advanced positioning and collision handling.
 * Supports both simple text and complex React nodes for advanced tooltip content.
 *
 * @example
 * ```tsx
 * // Simple text tooltip
 * <Tooltip title="Save your work">
 *   <Button>Save</Button>
 * </Tooltip>
 *
 * // Intuitive positioning (MUI-style)
 * <Tooltip placement="bottom-start" title="Menu options">
 *   <IconButton><MenuIcon /></IconButton>
 * </Tooltip>
 *
 * // Intelligent collision handling (new default)
 * <Tooltip collision="smart" title="Intelligent positioning">
 *   <Button>Smart tooltip</Button>
 * </Tooltip>
 *
 * // Advanced collision configuration
 * <Tooltip
 *   collisionConfig={{
 *     side: 'flip',
 *     align: 'shift',
 *     fallbackAxisSide: 'start',
 *     hideWhenDetached: true
 *   }}
 *   title="Custom collision handling"
 * >
 *   <Button>Advanced collision</Button>
 * </Tooltip>
 *
 * // Advanced positioning
 * <Tooltip
 *   positioner={{
 *     offset: 12,
 *     padding: 10,
 *     sticky: true,
 *     boundary: '#container'
 *   }}
 *   title="Advanced positioning"
 * >
 *   <Button>Advanced</Button>
 * </Tooltip>
 *
 * // Custom animations
 * <Tooltip
 *   animation={{
 *     animated: true,
 *     duration: 300,
 *     easing: 'ease-in-out'
 *   }}
 *   title="Custom animation"
 * >
 *   <Button>Animated</Button>
 * </Tooltip>
 *
 * // Interactive tooltip
 * <Tooltip
 *   hoverable={true}
 *   closeDelay={300}
 *   title={
 *     <div>
 *       <strong>Interactive Content</strong>
 *       <br />
 *       <button>Click me</button>
 *     </div>
 *   }
 * >
 *   <Button>Hoverable tooltip</Button>
 * </Tooltip>
 *
 * // Full control with raw props
 * <Tooltip
 *   arrow={false}
 *   rootProps={{ trackCursorAxis: 'x' }}
 *   positionerProps={{ arrowPadding: 20 }}
 *   title="Full control"
 * >
 *   <Button>Power user</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  placement = 'top',
  collision = 'smart',
  collisionConfig,
  positioner = {},
  animation = {},
  delay = 600,
  closeDelay = 0,
  arrow = true,
  disabled = false,
  rootProps = {},
  positionerProps = {},
  className,
  testId,
  id,
  style,
  css,
  ref,
  ...htmlProps
}) => {
  // If disabled, return just the children without tooltip
  if (disabled) {
    return children;
  }

  // Parse placement into side and align
  const { side, align } = parsePlacement(placement);

  // Parse collision strategy or use custom config
  const collisionSettings = collisionConfig
    ? {
        collisionAvoidance: {
          side: collisionConfig.side ?? 'flip',
          align: collisionConfig.align ?? 'shift',
          fallbackAxisSide: collisionConfig.fallbackAxisSide ?? 'none',
        } as CollisionAvoidance,
      }
    : parseCollisionStrategy(collision);

  // Prepare positioner configuration
  const {
    offset = 8,
    padding = 8,
    sticky = false,
    boundary,
    trackCursor,
  } = positioner;

  // Prepare final positioner props
  const finalPositionerProps: Partial<BaseTooltipPositionerProps> = {
    side,
    align,
    sideOffset: offset,
    collisionPadding: padding,
    sticky,
    collisionAvoidance: collisionSettings.collisionAvoidance,
    ...positionerProps,
  };

  // Handle boundary if specified
  if (boundary) {
    if (typeof boundary === 'string') {
      const boundaryElement = document.querySelector(boundary);
      if (boundaryElement) {
        finalPositionerProps.collisionBoundary = boundaryElement as HTMLElement;
      }
    } else {
      finalPositionerProps.collisionBoundary = boundary;
    }
  }

  // Handle cursor tracking
  if (trackCursor) {
    rootProps.trackCursorAxis = trackCursor;
  }

  return (
    <BaseTooltip.Provider delay={delay} closeDelay={closeDelay} {...rootProps}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger
          render={props => <StyledTooltipTrigger {...props} />}
        >
          {children}
        </BaseTooltip.Trigger>

        <BaseTooltip.Portal>
          <StyledTooltipPositioner {...finalPositionerProps}>
            <BaseTooltip.Popup
              render={props => (
                <StyledTooltipContent
                  {...props}
                  className={className}
                  data-testid={testId}
                  id={id}
                  style={style}
                  $css={css}
                  $animation={animation}
                  ref={ref}
                  {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
                >
                  {title}
                  {arrow && (
                    <StyledTooltipArrow>
                      <ArrowSvg />
                    </StyledTooltipArrow>
                  )}
                </StyledTooltipContent>
              )}
            />
          </StyledTooltipPositioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
};

Tooltip.displayName = 'Tooltip';
