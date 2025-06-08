import type {
  TooltipPlacement,
  TooltipCollisionStrategy,
  BaseTooltipPositionerProps,
  CollisionAvoidance,
} from './types';

/**
 * Convert our placement prop to Base UI side and align
 */
export const parsePlacement = (placement: TooltipPlacement) => {
  const [side, align = 'center'] = placement.split('-') as [
    BaseTooltipPositionerProps['side'],
    BaseTooltipPositionerProps['align']?,
  ];
  return { side, align: align || 'center' };
};

/**
 * Convert collision strategy to Base UI CollisionAvoidance config
 */
export const parseCollisionStrategy = (
  strategy: TooltipCollisionStrategy
): {
  collisionAvoidance: CollisionAvoidance;
  hideWhenDetached?: boolean;
} => {
  switch (strategy) {
    case 'flip':
      return {
        collisionAvoidance: {
          side: 'flip',
          align: 'none',
          fallbackAxisSide: 'none',
        },
      };

    case 'shift':
      return {
        collisionAvoidance: {
          side: 'shift',
          align: 'shift',
          fallbackAxisSide: 'none',
        },
      };

    case 'hide':
      return {
        collisionAvoidance: undefined,
        hideWhenDetached: true,
      };

    case 'flip-shift':
      return {
        collisionAvoidance: {
          side: 'flip',
          align: 'shift',
          fallbackAxisSide: 'none',
        },
      };

    case 'smart':
      return {
        collisionAvoidance: {
          side: 'flip',
          align: 'shift',
          fallbackAxisSide: 'start',
        },
      };

    case 'none':
      return {
        collisionAvoidance: undefined,
      };

    default:
      return {
        collisionAvoidance: {
          side: 'flip',
          align: 'shift',
          fallbackAxisSide: 'start',
        },
      };
  }
};
