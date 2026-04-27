'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { darkThemeValues, lightThemeClass, vars } from '@/theme';
import type {
  ResolvedThemeValues,
  ThemeVariant,
  UseThemeReturn,
} from './useTheme.types';

const VAR_REF_PATTERN = /^var\((--[^,)]+)/;

/**
 * Walk a dot-path on the theme contract and return the underlying CSS
 * custom property name (without the leading `var(`/trailing `)`).
 *
 * The contract emits hand-tuned, non-derivable names — `colors.accent.primary`
 * resolves to `--etui-color-accent-primary`, not `--etui-colors-accent-primary`.
 * Walking the existing `vars` object (whose leaves are already
 * `var(--etui-...)` references) is the only correct way to get the var name.
 *
 * Returns `''` for paths that don't resolve to a leaf reference.
 */
function pathToCssVar(path: string): string {
  const segments = path.split('.');
  let node: unknown = vars;
  for (const segment of segments) {
    if (
      node !== null &&
      typeof node === 'object' &&
      segment in (node as Record<string, unknown>)
    ) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return '';
    }
  }
  if (typeof node !== 'string') return '';
  const match = VAR_REF_PATTERN.exec(node);
  return match?.[1] ?? '';
}

function pathToVarRef(path: string): string {
  const cssVar = pathToCssVar(path);
  return cssVar ? `var(${cssVar})` : '';
}

/**
 * Walk the dark-theme template alongside the contract, replacing each
 * leaf with the resolved CSS variable value read from `root`. Falls back
 * to the template value when a property is empty (e.g. before stylesheets
 * have applied during testing).
 */
function resolveValues<T>(template: T, root: Element, contract: unknown): T {
  if (typeof template === 'string') {
    if (typeof contract === 'string') {
      const match = VAR_REF_PATTERN.exec(contract);
      const cssVar = match?.[1];
      if (cssVar) {
        const value = getComputedStyle(root).getPropertyValue(cssVar).trim();
        return (value || template) as T;
      }
    }
    return template;
  }
  if (template !== null && typeof template === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(template as Record<string, unknown>)) {
      const childTemplate = (template as Record<string, unknown>)[key];
      const childContract = (contract as Record<string, unknown> | undefined)?.[
        key
      ];
      out[key] = resolveValues(childTemplate, root, childContract);
    }
    return out as T;
  }
  return template;
}

function readTemplateValue(template: unknown, path: string): string {
  const segments = path.split('.');
  let node: unknown = template;
  for (const segment of segments) {
    if (
      node !== null &&
      typeof node === 'object' &&
      segment in (node as Record<string, unknown>)
    ) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return '';
    }
  }
  return typeof node === 'string' ? node : '';
}

/**
 * Root-only detection: the variant is determined by whether the
 * light-theme class is applied to `document.documentElement` — the same
 * element from which `values` are resolved. Anything more permissive
 * (descendant scan, `<body>` check) would let the variant disagree with
 * the resolved values for a dark app that contains a single light
 * subtree.
 */
function detectVariant(): ThemeVariant {
  if (typeof document === 'undefined') return 'dark';
  if (!lightThemeClass) return 'dark';
  if (document.documentElement.classList.contains(lightThemeClass)) {
    return 'light';
  }
  return 'dark';
}

interface ThemeSnapshot {
  variant: ThemeVariant;
  values: ResolvedThemeValues;
}

const FALLBACK_SNAPSHOT: ThemeSnapshot = {
  variant: 'dark',
  values: darkThemeValues as ResolvedThemeValues,
};

/**
 * Read the current theme at runtime.
 *
 * Returns the resolved CSS variable snapshot from `:root`, the detected
 * theme variant, and helpers for reading individual tokens by path.
 * Components should prefer compile-time tokens via Vanilla Extract
 * (`vars.*` from `@/theme`) — reach for `useTheme` only when a runtime
 * read is genuinely required (canvas drawing, third-party libraries that
 * take colors as plain strings).
 *
 * **Scope:** the hook always reads from `:root` — both the variant and
 * the resolved values come from `document.documentElement`. A light- or
 * custom-themed subtree wrapped in `VanillaThemeProvider` will **not** be
 * reflected here; for that, components inside the subtree should style
 * via Vanilla Extract `vars.*` (which the browser resolves correctly per
 * scope) rather than runtime reads.
 *
 * **SSR:** returns the dark-theme defaults as a fallback. The hook
 * re-evaluates against the live DOM on mount via `useLayoutEffect`, so
 * the second render contains the real values before the browser paints.
 *
 * **Reactivity:** v0.8 reads once on mount. Toggling the root theme at
 * runtime is not reflected — remount the consuming subtree to pick up
 * the new theme. A `MutationObserver`-based subscription may be added
 * in a later release if consumer demand emerges.
 *
 * @example
 * ```tsx
 * const { values, variant, getVar, getToken } = useTheme();
 *
 * // Canvas drawing with theme-aware colors
 * ctx.strokeStyle = values.colors.accent.primary;
 *
 * // Conditional logic
 * if (variant === 'dark') loadDarkAssets();
 *
 * // Inline styles that follow theme changes automatically
 * <div style={{ color: getVar('colors.text.primary') }} />
 *
 * // One-off token resolution
 * const accent = getToken('colors.accent.primary');
 * ```
 */
export function useTheme(): UseThemeReturn {
  const tokenCacheRef = useRef<Map<string, string>>(new Map());
  const [snapshot, setSnapshot] = useState<ThemeSnapshot>(FALLBACK_SNAPSHOT);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const next: ThemeSnapshot = {
      variant: detectVariant(),
      values: resolveValues(darkThemeValues, root, vars) as ResolvedThemeValues,
    };
    tokenCacheRef.current.clear();
    setSnapshot(next);
  }, []);

  const getToken = useCallback((path: string): string => {
    const cache = tokenCacheRef.current;
    const cached = cache.get(path);
    if (cached !== undefined) return cached;

    if (typeof document === 'undefined') {
      const fallback = readTemplateValue(darkThemeValues, path);
      cache.set(path, fallback);
      return fallback;
    }

    const cssVar = pathToCssVar(path);
    if (!cssVar) {
      cache.set(path, '');
      return '';
    }

    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
    const resolved = value || readTemplateValue(darkThemeValues, path);
    cache.set(path, resolved);
    return resolved;
  }, []);

  const getVar = useCallback((path: string): string => pathToVarRef(path), []);

  return useMemo(
    () => ({
      variant: snapshot.variant,
      values: snapshot.values,
      getToken,
      getVar,
    }),
    [snapshot, getToken, getVar]
  );
}
