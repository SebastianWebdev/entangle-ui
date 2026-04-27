import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const TOKENS_DIR = resolve(REPO_ROOT, 'dist', 'tokens');

interface DtcgLeaf {
  $value: string;
  $type: string;
}
type DtcgNode = DtcgLeaf | { [key: string]: DtcgNode };

function collectLeafPaths(
  node: DtcgNode,
  prefix = '',
  acc: string[] = []
): string[] {
  if ('$value' in node) {
    acc.push(prefix);
    return acc;
  }
  for (const key of Object.keys(node)) {
    collectLeafPaths(
      (node as { [k: string]: DtcgNode })[key]!,
      prefix ? `${prefix}.${key}` : key,
      acc
    );
  }
  return acc;
}

describe('export-tokens script', () => {
  it('builds tokens.json and per-theme CSS artifacts', () => {
    execSync('npm run build:tokens', {
      cwd: REPO_ROOT,
      stdio: 'pipe',
    });

    const jsonPath = resolve(TOKENS_DIR, 'tokens.json');
    const darkCssPath = resolve(TOKENS_DIR, 'tokens.dark.css');
    const lightCssPath = resolve(TOKENS_DIR, 'tokens.light.css');

    expect(existsSync(jsonPath)).toBe(true);
    expect(existsSync(darkCssPath)).toBe(true);
    expect(existsSync(lightCssPath)).toBe(true);

    const json = JSON.parse(readFileSync(jsonPath, 'utf-8')) as {
      themes: { dark: DtcgNode; light: DtcgNode };
    };
    expect(json.themes.dark).toBeDefined();
    expect(json.themes.light).toBeDefined();

    const darkCss = readFileSync(darkCssPath, 'utf-8');
    const lightCss = readFileSync(lightCssPath, 'utf-8');

    expect(darkCss).toContain(':root {');
    expect(lightCss).toContain('.etui-theme-light {');

    const darkVarCount = (darkCss.match(/--etui-/g) ?? []).length;
    const lightVarCount = (lightCss.match(/--etui-/g) ?? []).length;
    expect(darkVarCount).toBeGreaterThanOrEqual(50);
    expect(lightVarCount).toBeGreaterThanOrEqual(50);

    // Both themes must declare the same set of `--etui-*` variable names.
    const cssNames = (css: string): string[] =>
      Array.from(css.matchAll(/--etui-[\w-]+/g))
        .map(([m]) => m)
        .sort();
    expect(cssNames(lightCss)).toEqual(cssNames(darkCss));

    // Drift check: every leaf path in dark must also exist in light, and
    // vice versa — guards against contract drift between themes.
    const darkPaths = collectLeafPaths(json.themes.dark).sort();
    const lightPaths = collectLeafPaths(json.themes.light).sort();
    expect(lightPaths).toEqual(darkPaths);

    // The `storybook` branch is intentionally excluded from the public export.
    expect(JSON.stringify(json.themes.dark)).not.toContain('"storybook"');
    expect(darkCss).not.toContain('etui-storybook');
  });
});
