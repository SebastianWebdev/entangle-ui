// Types
export type {
  Point2D,
  CanvasViewport,
  DomainBounds,
  CanvasSize,
  CanvasBackgroundInfo,
  CanvasThemeColors,
  GridOptions,
  AxisLabelOptions,
  CrosshairOptions,
  PointMarkerOptions,
  CanvasContainerProps,
  CanvasContainerSize,
} from './canvas.types';

// Coordinate utilities
export {
  domainToCanvas,
  canvasToDomain,
  hitTestPoint,
  getCanvasPointerPosition,
} from './canvasCoords';

// Drawing utilities
export {
  drawGrid,
  drawDomainBounds,
  drawAxisLabels,
  drawCrosshair,
  drawPointMarker,
  drawOriginAxes,
  formatLabel,
} from './canvasDrawing';

// Theme resolution
export { resolveCanvasTheme, resolveVarValue } from './canvasTheme';

// Hooks
export { useCanvasSetup } from './useCanvasSetup';
export { useCanvasRenderer } from './useCanvasRenderer';

// Components
export { CanvasContainer } from './CanvasContainer';
