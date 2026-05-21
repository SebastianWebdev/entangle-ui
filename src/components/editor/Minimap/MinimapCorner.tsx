'use client';

import React from 'react';
import type { MinimapCornerProps } from './Minimap.types';

/**
 * Small chrome block anchored in one of the four corners of the Minimap
 * canvas body. Typical use cases: coordinate readouts, zoom-level chips,
 * status badges. Picked out of `<Minimap>` children by display name —
 * does not render itself in place.
 */
export const MinimapCorner: React.FC<MinimapCornerProps> = () => null;

MinimapCorner.displayName = 'Minimap.Corner';
