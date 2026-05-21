import { MINIMAP_SLOT } from './Minimap.types';
import type { MinimapTitleProps } from './Minimap.types';

/**
 * Title strip rendered above (or inside the top of) the Minimap canvas
 * body. Picked out of `<Minimap>` children by the `MINIMAP_SLOT` symbol —
 * does not render itself in place, so its tree position has no effect on
 * its placement.
 */
const MinimapTitleImpl: (props: MinimapTitleProps) => null = () => null;

export const MinimapTitle = Object.assign(MinimapTitleImpl, {
  displayName: 'Minimap.Title',
  [MINIMAP_SLOT]: 'title' as const,
});
