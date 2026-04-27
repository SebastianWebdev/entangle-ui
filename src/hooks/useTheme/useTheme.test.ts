import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lightThemeClass } from '@/theme';
import { useTheme } from './useTheme';

const TEST_TOKENS: Record<string, string> = {
  '--etui-color-accent-primary': '#007acc',
  '--etui-color-text-primary': '#ffffff',
  '--etui-spacing-md': '8px',
  '--etui-shell-menubar-height': '28px',
  '--etui-radius-md': '4px',
  '--etui-color-surface-white-overlay': 'rgba(255, 255, 255, 0.1)',
};

function applyTokens(target: HTMLElement, tokens: Record<string, string>) {
  for (const [name, value] of Object.entries(tokens)) {
    target.style.setProperty(name, value);
  }
}

function clearTokens(target: HTMLElement, tokens: Record<string, string>) {
  for (const name of Object.keys(tokens)) {
    target.style.removeProperty(name);
  }
}

describe('useTheme', () => {
  beforeEach(() => {
    applyTokens(document.documentElement, TEST_TOKENS);
  });

  afterEach(() => {
    clearTokens(document.documentElement, TEST_TOKENS);
    document.documentElement.classList.remove(lightThemeClass);
    document.body.classList.remove(lightThemeClass);
  });

  describe('snapshot resolution', () => {
    it('reads top-level token values from CSS variables', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.values.colors.accent.primary).toBe('#007acc');
      expect(result.current.values.colors.text.primary).toBe('#ffffff');
    });

    it('reads nested shell tokens under their kebab-cased CSS var names', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.values.shell.menuBar.height).toBe('28px');
    });

    it('falls back to dark-theme defaults when a CSS var is unset', () => {
      document.documentElement.style.removeProperty(
        '--etui-color-accent-primary'
      );
      const { result } = renderHook(() => useTheme());
      // Falls back to the darkThemeValues entry (#007acc happens to match),
      // so override with a different missing token to verify behaviour.
      document.documentElement.style.removeProperty('--etui-spacing-xxxl');
      expect(result.current.values.spacing.xxxl).toBe('32px');
    });
  });

  describe('variant detection (root-only)', () => {
    it('defaults to dark when no light-theme class is present', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.variant).toBe('dark');
    });

    it('detects light variant when documentElement has lightThemeClass', () => {
      document.documentElement.classList.add(lightThemeClass);
      const { result } = renderHook(() => useTheme());
      expect(result.current.variant).toBe('light');
    });

    it('stays dark when lightThemeClass is only on body', () => {
      // CSS custom properties on <body> don't propagate up to
      // documentElement, so the variant must not flip — otherwise the
      // reported variant would disagree with the resolved values.
      document.body.classList.add(lightThemeClass);
      const { result } = renderHook(() => useTheme());
      expect(result.current.variant).toBe('dark');
    });

    it('stays dark when lightThemeClass is only on a descendant subtree', () => {
      // A scoped light dialog inside a dark app must not flip the
      // root-level reading — variant comes from documentElement only.
      const subtree = document.createElement('div');
      subtree.classList.add(lightThemeClass);
      document.body.appendChild(subtree);
      const { result } = renderHook(() => useTheme());
      expect(result.current.variant).toBe('dark');
      subtree.remove();
    });
  });

  describe('scope coherence (root-only reads)', () => {
    it('reports root values even when called inside a light subtree', () => {
      // Apply tokens to documentElement (the dark root).
      // Add a light subtree that overrides accent locally — useTheme
      // must continue to report the root values, not the subtree's.
      const subtree = document.createElement('div');
      subtree.classList.add(lightThemeClass);
      subtree.style.setProperty('--etui-color-accent-primary', '#0066cc');
      document.body.appendChild(subtree);

      const { result } = renderHook(() => useTheme());

      expect(result.current.variant).toBe('dark');
      expect(result.current.values.colors.accent.primary).toBe('#007acc');
      expect(result.current.getToken('colors.accent.primary')).toBe('#007acc');

      subtree.remove();
    });
  });

  describe('getToken', () => {
    it('resolves a leaf path to the current CSS-var value', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getToken('colors.accent.primary')).toBe('#007acc');
      expect(result.current.getToken('spacing.md')).toBe('8px');
    });

    it('resolves the kebab-cased shell paths correctly', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getToken('shell.menuBar.height')).toBe('28px');
    });

    it('handles camelCase → kebab-case token names like whiteOverlay', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getToken('colors.surface.whiteOverlay')).toBe(
        'rgba(255, 255, 255, 0.1)'
      );
    });

    it('returns empty string for an unknown path', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getToken('does.not.exist')).toBe('');
    });

    it('caches per-path so getComputedStyle is not called repeatedly', () => {
      const spy = vi.spyOn(window, 'getComputedStyle');
      const { result } = renderHook(() => useTheme());
      const beforeCalls = spy.mock.calls.length;

      result.current.getToken('colors.accent.primary');
      result.current.getToken('colors.accent.primary');
      result.current.getToken('colors.accent.primary');

      expect(spy.mock.calls.length - beforeCalls).toBe(1);
      spy.mockRestore();
    });

    it('falls back to dark-theme defaults when the CSS var is empty', () => {
      document.documentElement.style.removeProperty(
        '--etui-color-text-primary'
      );
      const { result } = renderHook(() => useTheme());
      expect(result.current.getToken('colors.text.primary')).toBe('#ffffff');
    });
  });

  describe('getVar', () => {
    it('returns the var() reference for a known token', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getVar('colors.accent.primary')).toBe(
        'var(--etui-color-accent-primary)'
      );
    });

    it('returns the kebab-cased reference for nested shell paths', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getVar('shell.menuBar.height')).toBe(
        'var(--etui-shell-menubar-height)'
      );
    });

    it('returns empty string for unknown paths', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.getVar('not.a.real.path')).toBe('');
    });
  });

  describe('callback stability', () => {
    it('getToken and getVar identities are stable across renders', () => {
      const { result, rerender } = renderHook(() => useTheme());
      const first = {
        getToken: result.current.getToken,
        getVar: result.current.getVar,
      };
      rerender();
      expect(result.current.getToken).toBe(first.getToken);
      expect(result.current.getVar).toBe(first.getVar);
    });
  });

  describe('SSR fallback paths', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('getToken returns the dark-theme default when document is undefined', () => {
      const { result } = renderHook(() => useTheme());
      // Mount happened against a real document; now mimic SSR for fresh
      // (uncached) lookups by removing the global.
      vi.stubGlobal('document', undefined);
      expect(result.current.getToken('borderRadius.md')).toBe('4px');
      expect(result.current.getToken('typography.fontSize.md')).toBe('12px');
    });

    it('getToken returns empty string for an unknown path during SSR', () => {
      const { result } = renderHook(() => useTheme());
      vi.stubGlobal('document', undefined);
      expect(result.current.getToken('nope.not.real')).toBe('');
    });
  });
});
