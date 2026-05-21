import { useState } from 'react';
import type {
  ViewportSize,
  ViewportTransform,
} from '@/components/primitives/viewport';
import type { MinimapNavigateInfo } from '@/components/editor/Minimap';

interface FakeViewport {
  transform: ViewportTransform;
  viewportSize: ViewportSize;
  onNavigate: (info: MinimapNavigateInfo) => void;
}

/**
 * Tiny helper for docs demos — fakes a Viewport without actually rendering
 * one. Stores transform state, exposes a static viewportSize, and updates
 * transform on every onNavigate so dragging the minimap visibly moves the
 * tracked rect.
 */
export function useFakeViewport(
  viewportSize: ViewportSize = { width: 600, height: 400 },
  initial: ViewportTransform = { x: 0, y: 0, zoom: 1 }
): FakeViewport {
  const [transform, setTransform] = useState(initial);
  const onNavigate = (info: MinimapNavigateInfo): void => {
    setTransform(prev => ({
      ...prev,
      x: viewportSize.width / 2 - info.worldPoint.x * prev.zoom,
      y: viewportSize.height / 2 - info.worldPoint.y * prev.zoom,
    }));
  };
  return { transform, viewportSize, onNavigate };
}
