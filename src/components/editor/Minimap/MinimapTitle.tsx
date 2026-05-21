'use client';

import React from 'react';
import type { MinimapTitleProps } from './Minimap.types';

/**
 * Title strip rendered above (or inside the top of) the Minimap canvas body.
 * Picked out of `<Minimap>` children by display name — does not render
 * itself in place, so its tree position has no effect on its placement.
 */
export const MinimapTitle: React.FC<MinimapTitleProps> = () => null;

MinimapTitle.displayName = 'Minimap.Title';
