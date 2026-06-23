import { describe, expect, it } from 'vitest';

// Import ONLY the canonical stylesheet entry. Vitest isolates each test file,
// so the `:root` custom properties asserted below can only have been registered
// by `@/styles` itself — this is what `import 'entangle-ui/styles.css'` ships.
import '@/styles';

/**
 * Packaging guard for the canonical theme entry (`entangle-ui/styles.css`).
 *
 * A fresh consumer must be able to render styled components with the dark
 * theme by importing this single stylesheet — no `ThemeProvider` wrapper. The
 * contract is that importing it registers every `--etui-*` token on `:root`
 * and makes the opt-in global-scrollbar rules available.
 */
describe('entangle-ui/styles.css (canonical theme entry)', () => {
  it('registers dark-theme --etui-* custom properties on :root', () => {
    const root = getComputedStyle(document.documentElement);
    expect(root.getPropertyValue('--etui-color-bg-primary').trim()).toBe(
      '#1a1a1a'
    );
    expect(root.getPropertyValue('--etui-color-text-primary').trim()).toBe(
      '#ffffff'
    );
    expect(root.getPropertyValue('--etui-spacing-md').trim()).toBe('8px');
  });

  it('emits a :root rule declaring the token values into the document', () => {
    const rootRules = collectCssText().filter(
      text => text.includes(':root') && text.includes('--etui-')
    );
    expect(rootRules.length).toBeGreaterThan(0);
  });

  it('makes the opt-in global-scrollbar class rules available', () => {
    const hasScrollbarRule = collectCssText().some(text =>
      text.includes('etuiGlobalScrollbars')
    );
    expect(hasScrollbarRule).toBe(true);
  });
});

/** Flatten every stylesheet rule's `cssText` reachable from the document. */
function collectCssText(): string[] {
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | undefined;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules ?? [])) {
      out.push(rule.cssText);
    }
  }
  return out;
}
