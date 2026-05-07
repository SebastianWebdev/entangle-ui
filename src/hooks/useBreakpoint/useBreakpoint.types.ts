import type { Breakpoint } from '@/theme/breakpoints';

export interface BreakpointMap {
  /** Always `true` — base mobile breakpoint. */
  xs: boolean;
  /** `min-width: 576px`. */
  sm: boolean;
  /** `min-width: 768px`. */
  md: boolean;
  /** `min-width: 992px`. */
  lg: boolean;
  /** `min-width: 1200px`. */
  xl: boolean;
}

export interface UseBreakpointReturn extends BreakpointMap {
  /** Name of the largest matching breakpoint. */
  current: Breakpoint;
}
