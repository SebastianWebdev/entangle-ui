'use client';

import React from 'react';
import type { MinimapFooterProps } from './Minimap.types';

/**
 * Footer strip rendered below (or inside the bottom of) the Minimap canvas
 * body. Picked out of `<Minimap>` children by display name — does not
 * render itself in place, so its tree position has no effect on its
 * placement.
 */
export const MinimapFooter: React.FC<MinimapFooterProps> = () => null;

MinimapFooter.displayName = 'Minimap.Footer';
