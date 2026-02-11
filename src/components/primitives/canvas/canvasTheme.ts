import { vars } from '@/theme/contract.css';
import type { CanvasThemeColors } from './canvas.types';

/**
 * Resolve CSS variable references (e.g., `var(--etui-color-text-primary)`)
 * to their computed values via getComputedStyle.
 */
function resolveVar(element: Element, cssVar: string): string {
  const match = cssVar.match(/var\(([^)]+)\)/);
  if (!match) return cssVar;
  const varName = match[1];
  if (!varName) return cssVar;
  return getComputedStyle(element).getPropertyValue(varName).trim() || cssVar;
}

/**
 * Resolve Vanilla Extract CSS variables from a canvas element to
 * actual color values for canvas 2D drawing.
 *
 * Canvas 2D contexts cannot read CSS variables — this resolves them
 * via getComputedStyle.
 */
export function resolveCanvasTheme(
  canvas: HTMLCanvasElement
): CanvasThemeColors {
  return {
    backgroundSecondary: resolveVar(canvas, vars.colors.background.secondary),
    borderDefault: resolveVar(canvas, vars.colors.border.default),
    textMuted: resolveVar(canvas, vars.colors.text.muted),
    textPrimary: resolveVar(canvas, vars.colors.text.primary),
    textSecondary: resolveVar(canvas, vars.colors.text.secondary),
    accentPrimary: resolveVar(canvas, vars.colors.accent.primary),
    fontSizeXs:
      parseFloat(resolveVar(canvas, vars.typography.fontSize.xs)) || 10,
  };
}

/**
 * Resolve a single CSS variable reference string (e.g. `var(--etui-color-accent-primary)`)
 * to its computed value.
 */
export function resolveVarValue(element: Element, cssVar: string): string {
  return resolveVar(element, cssVar);
}
