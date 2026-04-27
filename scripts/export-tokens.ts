/**
 * Token export — generates `dist/tokens/{tokens.json,tokens.dark.css,tokens.light.css}`.
 *
 * The artifacts are consumed by Figma plugins, design-tool integrations, and
 * non–Vanilla-Extract projects that want a drop-in stylesheet of the
 * `--etui-*` custom properties.
 *
 * The script imports the plain `darkThemeValues` / `lightThemeValues` data
 * modules and the `themeContractData` shape — all `.ts` modules that do NOT
 * call into the Vanilla Extract runtime, so this script runs in plain Node
 * via `tsx` with no bundler.
 *
 * `shell.*` tokens are intentionally INCLUDED (consumers may want the menu
 * bar / toolbar / dock heights for layout). `storybook.*` tokens are
 * intentionally EXCLUDED — they're library-internal canvas styling.
 *
 * The dark / light light-class fallback selector is the documented
 * `etui-theme-light` class. Vanilla Extract generates a hashed runtime class
 * (`lightThemeClass`) at library build time, but that hash is not available
 * to a plain Node script that doesn't run the VE plugin. Consumers using
 * `tokens.light.css` should apply `class="etui-theme-light"` to a wrapping
 * element — see the Theming guide for details.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { darkThemeValues } from '../src/theme/darkThemeValues';
import { lightThemeValues } from '../src/theme/lightThemeValues';
import { themeContractData } from '../src/theme/themeContractData';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const OUT_DIR = resolve(REPO_ROOT, 'dist/tokens');

const PACKAGE_VERSION = readPackageVersion();

const LIGHT_THEME_CLASS_FALLBACK = 'etui-theme-light';

// Top-level keys to drop from the export.
const EXCLUDED_TOP_LEVEL_KEYS: ReadonlySet<string> = new Set(['storybook']);

type Plain = Record<string, unknown>;

interface DtcgLeaf {
  $value: string;
  $type: string;
}

type DtcgNode = DtcgLeaf | { [key: string]: DtcgNode };

interface ThemeExport {
  json: Record<string, DtcgNode>;
  cssLines: string[];
  paths: Set<string>;
}

function readPackageVersion(): string {
  const pkgPath = resolve(REPO_ROOT, 'package.json');
  const parsed = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
    version?: string;
  };
  if (typeof parsed.version !== 'string') {
    throw new Error('package.json is missing a "version" field.');
  }
  return parsed.version;
}

function isPlainObject(value: unknown): value is Plain {
  return (
    typeof value === 'object' && value !== null && value.constructor === Object
  );
}

/**
 * Infer a DTCG `$type` for a token from its dot-path and value.
 *
 * The token tree is small and stable, so an explicit category map is more
 * predictable than a value-based heuristic. Color also matches `$value`
 * (covers `colors.backdrop`, which is a top-level color leaf, plus any
 * future top-level color tokens).
 */
function inferType(path: string, value: string): string {
  if (path.startsWith('colors.')) return 'color';
  if (path === 'colors') return 'color';
  if (/^#|^rgb|^rgba|^hsl|^hsla/i.test(value)) return 'color';
  if (path.startsWith('spacing.')) return 'dimension';
  if (path.startsWith('borderRadius.')) return 'dimension';
  if (path.startsWith('typography.fontSize.')) return 'dimension';
  if (path.startsWith('typography.lineHeight.')) return 'dimension';
  if (
    path === 'typography.fontFamily' ||
    path.startsWith('typography.fontFamily.')
  )
    return 'fontFamily';
  if (
    path === 'typography.fontWeight' ||
    path.startsWith('typography.fontWeight.')
  )
    return 'fontWeight';
  if (path.startsWith('shadows.')) return 'shadow';
  if (path.startsWith('transitions.')) return 'duration';
  if (path.startsWith('zIndex.')) return 'string';
  if (path.startsWith('shell.')) {
    if (
      path.endsWith('.bg') ||
      path.endsWith('.text') ||
      path.includes('Color')
    )
      return 'color';
    if (
      path.endsWith('.height') ||
      path.endsWith('.heightMd') ||
      path.endsWith('.tabHeight') ||
      path.endsWith('.splitterSize') ||
      path.endsWith('.borderBarSize') ||
      /\.height\.[a-z]+$/.test(path)
    ) {
      return 'dimension';
    }
    return 'string';
  }
  return 'string';
}

/**
 * Walk a values tree alongside the contract tree, producing the DTCG JSON
 * node, the `--etui-*: value` lines for the CSS file, and the set of leaf
 * paths (used for dark/light parity validation).
 */
function buildThemeExport(
  values: Plain,
  contract: Plain,
  pathSegments: string[] = []
): ThemeExport {
  const json: Record<string, DtcgNode> = {};
  const cssLines: string[] = [];
  const paths = new Set<string>();

  for (const key of Object.keys(values)) {
    if (pathSegments.length === 0 && EXCLUDED_TOP_LEVEL_KEYS.has(key)) {
      continue;
    }
    const value = values[key];
    const contractValue = contract[key];
    const nextPath = [...pathSegments, key];
    const dottedPath = nextPath.join('.');

    if (isPlainObject(value) && isPlainObject(contractValue)) {
      const child = buildThemeExport(value, contractValue, nextPath);
      json[key] = child.json;
      cssLines.push(...child.cssLines);
      for (const p of child.paths) paths.add(p);
      continue;
    }

    if (typeof value !== 'string' || typeof contractValue !== 'string') {
      throw new Error(
        `Token mismatch at "${dottedPath}": value/contract pair must both be strings or both be objects.`
      );
    }

    paths.add(dottedPath);
    json[key] = {
      $value: value,
      $type: inferType(dottedPath, value),
    };
    cssLines.push(`  --${contractValue}: ${value};`);
  }

  return { json, cssLines, paths };
}

function ensureParity(
  darkPaths: ReadonlySet<string>,
  lightPaths: ReadonlySet<string>
): void {
  const missingInLight: string[] = [];
  const missingInDark: string[] = [];
  for (const p of darkPaths) {
    if (!lightPaths.has(p)) missingInLight.push(p);
  }
  for (const p of lightPaths) {
    if (!darkPaths.has(p)) missingInDark.push(p);
  }
  if (missingInLight.length > 0 || missingInDark.length > 0) {
    const lines = [
      'Token export aborted — dark/light parity check failed.',
      ...(missingInLight.length > 0
        ? [`  Missing in light theme: ${missingInLight.join(', ')}`]
        : []),
      ...(missingInDark.length > 0
        ? [`  Missing in dark theme: ${missingInDark.join(', ')}`]
        : []),
    ];
    throw new Error(lines.join('\n'));
  }
}

function buildCssFile(
  themeLabel: 'dark' | 'light',
  selector: string,
  cssLines: readonly string[]
): string {
  const sortedLines = [...cssLines].sort();
  const header = `/* Entangle UI ${themeLabel} theme — token export (v${PACKAGE_VERSION}) */
/* Generated by scripts/export-tokens.ts — do not edit by hand. */
`;
  return `${header}${selector} {\n${sortedLines.join('\n')}\n}\n`;
}

function buildJsonFile(
  dark: Record<string, DtcgNode>,
  light: Record<string, DtcgNode>
): string {
  const payload = {
    $schema: 'https://design-tokens.org/schema.json',
    $description: 'Entangle UI design tokens',
    $version: PACKAGE_VERSION,
    themes: {
      dark,
      light,
    },
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function main(): void {
  const dark = buildThemeExport(
    darkThemeValues as unknown as Plain,
    themeContractData as unknown as Plain
  );
  const light = buildThemeExport(
    lightThemeValues as unknown as Plain,
    themeContractData as unknown as Plain
  );

  ensureParity(dark.paths, light.paths);

  mkdirSync(OUT_DIR, { recursive: true });

  const jsonPath = resolve(OUT_DIR, 'tokens.json');
  const darkCssPath = resolve(OUT_DIR, 'tokens.dark.css');
  const lightCssPath = resolve(OUT_DIR, 'tokens.light.css');

  writeFileSync(jsonPath, buildJsonFile(dark.json, light.json), 'utf-8');
  writeFileSync(
    darkCssPath,
    buildCssFile('dark', ':root', dark.cssLines),
    'utf-8'
  );
  writeFileSync(
    lightCssPath,
    buildCssFile('light', `.${LIGHT_THEME_CLASS_FALLBACK}`, light.cssLines),
    'utf-8'
  );

  const tokenCount = dark.paths.size;
  // eslint-disable-next-line no-console -- script CLI output
  console.log(
    `[export-tokens] wrote ${tokenCount} tokens × 2 themes → ${OUT_DIR}`
  );
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
