// src/components/primitives/Tooltip/Tooltip.tsx
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import React from 'react';

import type { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';

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
import { tooltipContentStyle, tooltipTriggerStyle } from './Tooltip.css';

interface TooltipBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'css' | 'title'> {
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

  /**
   * Test identifier for automated testing
   */
  testId?: string;

  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Props for the Tooltip component with prettified type for better IntelliSense
 */
export type TooltipProps = Prettify<TooltipBaseProps>;

/**
 * A tooltip component that displays contextual information on hover.
 *
 * Built on @base-ui/react for robust accessibility and positioning.
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

  // Build animation transition style
  const animated = animation?.animated !== false;
  const duration = animation?.duration ?? 200;
  const easing = animation?.easing ?? 'ease-out';

  const animationStyle: React.CSSProperties = animated
    ? {
        transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
      }
    : { transition: 'none' };

  return (
    <BaseTooltip.Provider delay={delay} closeDelay={closeDelay} {...rootProps}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger
          render={props => (
            <div
              {...props}
              className={cx(tooltipTriggerStyle, props.className)}
            />
          )}
        >
          {children}
        </BaseTooltip.Trigger>

        <BaseTooltip.Portal>
          <BaseTooltip.Positioner {...finalPositionerProps}>
            <BaseTooltip.Popup
              render={props => (
                <div
                  {...props}
                  className={cx(
                    tooltipContentStyle,
                    className,
                    props.className
                  )}
                  data-testid={testId}
                  id={id}
                  style={{
                    ...animationStyle,
                    ...style,
                    ...props.style,
                  }}
                  ref={ref}
                  {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
                >
                  {title}
                  {arrow && (
                    <StyledTooltipArrow>
                      <ArrowSvg />
                    </StyledTooltipArrow>
                  )}
                </div>
              )}
            />
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
};

Tooltip.displayName = 'Tooltip';
