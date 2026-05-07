/**
 * Library breakpoint values (px) — used by responsive components like
 * `Stack` and exposed via `useBreakpoint`.
 *
 * Values follow the same scale Stack already uses (576/768/992/1200) and
 * are part of the public API.
 *
 * `xs` is always `0` and effectively means "no minimum"; every viewport
 * matches `xs`.
 */
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const BREAKPOINT_ORDER: ReadonlyArray<Breakpoint> = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
];
