'use client';

import { useMemo } from 'react';
import {
  BREAKPOINT_ORDER,
  breakpoints,
  type Breakpoint,
} from '@/theme/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { UseBreakpointReturn } from './useBreakpoint.types';

const SM_QUERY = `(min-width: ${breakpoints.sm}px)`;
const MD_QUERY = `(min-width: ${breakpoints.md}px)`;
const LG_QUERY = `(min-width: ${breakpoints.lg}px)`;
const XL_QUERY = `(min-width: ${breakpoints.xl}px)`;

function resolveCurrent(map: Omit<UseBreakpointReturn, 'current'>): Breakpoint {
  for (let i = BREAKPOINT_ORDER.length - 1; i >= 0; i -= 1) {
    const name = BREAKPOINT_ORDER[i];
    if (name && map[name]) return name;
  }
  return 'xs';
}

/**
 * Reactive named-breakpoint matcher.
 *
 * Returns booleans for each named breakpoint plus the largest matching
 * `current`. Built on top of `useMediaQuery`. Breakpoint values come from
 * `@/theme/breakpoints` and match the values used by `Stack` and other
 * responsive layout components.
 *
 * @example
 * ```tsx
 * const { md, current } = useBreakpoint();
 * return md ? <Sidebar /> : <BottomSheet />;
 * ```
 */
export function useBreakpoint(): UseBreakpointReturn {
  const sm = useMediaQuery(SM_QUERY);
  const md = useMediaQuery(MD_QUERY);
  const lg = useMediaQuery(LG_QUERY);
  const xl = useMediaQuery(XL_QUERY);

  return useMemo(() => {
    const map = { xs: true, sm, md, lg, xl };
    return { ...map, current: resolveCurrent(map) };
  }, [sm, md, lg, xl]);
}
