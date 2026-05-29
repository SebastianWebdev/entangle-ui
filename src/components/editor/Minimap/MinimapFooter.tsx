import { MINIMAP_SLOT } from './Minimap.types';

import type { MinimapFooterProps } from './Minimap.types';

/**
 * Footer strip rendered below (or inside the bottom of) the Minimap
 * canvas body. Picked out of `<Minimap>` children by the `MINIMAP_SLOT`
 * symbol — does not render itself in place, so its tree position has no
 * effect on its placement.
 */
const MinimapFooterImpl: (props: MinimapFooterProps) => null = () => null;

export const MinimapFooter = Object.assign(MinimapFooterImpl, {
  displayName: 'Minimap.Footer',
  [MINIMAP_SLOT]: 'footer' as const,
});
