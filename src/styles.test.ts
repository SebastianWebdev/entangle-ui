import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

/**
 * Packaging invariant: `entangle-ui/styles.css` must survive a consumer's
 * production tree-shaking.
 *
 * The jsdom tests above prove the source module registers the tokens, but
 * jsdom never tree-shakes, so they cannot catch the failure this guards
 * against. A bare `import 'entangle-ui/styles.css'` resolves to an
 * exports-less side-effect module; a production bundler keeps it only if its
 * resolved path is recognized as side-effectful. The contract: the
 * `./styles.css` export target must be a real `.css` file OR match one of the
 * `sideEffects` globs. A plain `styles.js` (matching none of `*.css`,
 * `*.css.ts`, `*.css.js`) is flagged side-effect-free and dropped — silently
 * shipping a themeless production build. See the `styles.css.js` output name
 * in `rollup.config.js`.
 */
describe('entangle-ui/styles.css (production tree-shaking invariant)', () => {
  // Vitest runs with the package root as cwd, so the published manifest is
  // resolvable here without depending on the (transform-mangled)
  // `import.meta.url`.
  const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
  ) as { exports: Record<string, unknown>; sideEffects: string[] };

  it('resolves ./styles.css to a side-effectful module a bundler will keep', () => {
    const target = pkg.exports['./styles.css'];
    expect(typeof target).toBe('string');

    const isSideEffectful =
      (target as string).endsWith('.css') ||
      pkg.sideEffects.some(glob =>
        matchesSideEffectGlob(glob, target as string)
      );

    // If this fails: the export points at a module (likely `*.js`) that no
    // `sideEffects` glob covers. Rename the build output so it ends in
    // `.css.js`, or add a real `.css` target — do NOT just ship a bare `.js`.
    expect(isSideEffectful).toBe(true);
  });

  it('lists the three CSS side-effect globs that keep stylesheets alive', () => {
    // Regression anchor: removing any of these reopens the tree-shaking hole.
    for (const glob of ['*.css', '*.css.ts', '*.css.js']) {
      expect(pkg.sideEffects).toContain(glob);
    }
  });
});

/**
 * Mirror a bundler's `sideEffects` glob matching closely enough to assert the
 * packaging contract: a glob with no `/` is matched in any directory (webpack
 * prepends `**\/`), so test it against the basename; `*` matches a run of
 * non-separator characters.
 */
function matchesSideEffectGlob(glob: string, filePath: string): boolean {
  const subject = glob.includes('/')
    ? filePath
    : (filePath.split('/').pop() ?? '');
  const pattern = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // escape regex specials, keep `*`
    .replace(/\*/g, '[^/]*'); // `*` => any run of non-separator chars
  return new RegExp(`^${pattern}$`).test(subject);
}

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
