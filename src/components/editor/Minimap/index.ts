import { Minimap as MinimapBase } from './Minimap';
import { MinimapTitle } from './MinimapTitle';
import { MinimapFooter } from './MinimapFooter';
import { MinimapCorner } from './MinimapCorner';

type MinimapCompound = typeof MinimapBase & {
  Title: typeof MinimapTitle;
  Footer: typeof MinimapFooter;
  Corner: typeof MinimapCorner;
};

const MinimapWithSlots = MinimapBase as MinimapCompound;
MinimapWithSlots.Title = MinimapTitle;
MinimapWithSlots.Footer = MinimapFooter;
MinimapWithSlots.Corner = MinimapCorner;

export const Minimap = MinimapWithSlots;
export { MinimapTitle, MinimapFooter, MinimapCorner };
export { ViewportMinimap } from './ViewportMinimap';
export { computeBoundsFromItems } from './computeBoundsFromItems';
export { useMinimapContext } from './MinimapContext';

export type {
  MinimapProps,
  MinimapItem,
  MinimapRectItem,
  MinimapCircleItem,
  MinimapLineItem,
  MinimapCustomItem,
  MinimapNavigateInfo,
  MinimapNavigatePhase,
  MinimapInteractionConfig,
  MinimapDrawInfo,
  MinimapContextValue,
  MinimapTitleProps,
  MinimapFooterProps,
  MinimapCornerProps,
  MinimapTitlePlacement,
  MinimapFooterPlacement,
  MinimapCornerSide,
} from './Minimap.types';
export type {
  ViewportMinimapProps,
  ViewportMinimapPlacement,
} from './ViewportMinimap';
