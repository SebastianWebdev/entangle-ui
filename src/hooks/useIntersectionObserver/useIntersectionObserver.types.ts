import type React from 'react';

export interface UseIntersectionObserverOptions {
  /** Root element. `null` (default) targets the viewport. */
  root?: Element | null;
  /** Margin around the root, e.g. `"0px 0px 200px 0px"`. */
  rootMargin?: string;
  /** Single threshold or an array of thresholds. */
  threshold?: number | number[];
  /** Disable the observer without unmounting the component. @default true */
  enabled?: boolean;
}

export interface UseIntersectionObserverReturn<T extends Element> {
  /** Ref callback to attach to the observed element. */
  ref: React.RefCallback<T>;
  /** Latest IntersectionObserverEntry or null before the first callback. */
  entry: IntersectionObserverEntry | null;
  /** Convenience boolean — `entry?.isIntersecting ?? false`. */
  isIntersecting: boolean;
}
