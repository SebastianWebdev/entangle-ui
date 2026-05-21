import { MINIMAP_SLOT } from './Minimap.types';
import type { MinimapCornerProps } from './Minimap.types';

/**
 * Small chrome block anchored in one of the four corners of the Minimap
 * canvas body. Typical use cases: coordinate readouts, zoom-level chips,
 * status badges. Picked out of `<Minimap>` children by the `MINIMAP_SLOT`
 * symbol — does not render itself in place.
 */
const MinimapCornerImpl: (props: MinimapCornerProps) => null = () => null;

export const MinimapCorner = Object.assign(MinimapCornerImpl, {
  displayName: 'Minimap.Corner',
  [MINIMAP_SLOT]: 'corner' as const,
});
