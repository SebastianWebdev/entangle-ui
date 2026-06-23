/**
 * Sourcemap guard for the published ESM bundle (`dist/esm`).
 *
 * Published `.js.map` files must be self-contained inside the package:
 *
 * 1. **Package-relative `sources`** — no `../` climbing and no absolute paths.
 *    Rollup's default `sources` (`../../../../../../src/foo.tsx`) resolve to an
 *    unshipped `node_modules/entangle-ui/src/...` in a consumer, which trips
 *    "source file outside its package" warnings in Vite/Rollup.
 * 2. **Embedded `sourcesContent`** — every referenced source ships its original
 *    text, so devtools can show sources without the (unpublished) `src` tree.
 *
 * Both are produced by `sourcemapPathTransform` in `rollup.config.js` and
 * `inlineSources` in `tsconfig.build.json`. This guard fails the build if a
 * regression reintroduces escaping paths or null source content.
 *
 * Run via `npm run check:sourcemaps` (wired into `prepublishOnly`). The
 * detection helpers are unit-tested in `scripts/check-sourcemaps.test.ts`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export interface SourcemapIssue {
  /** `sources` entries that escape the package (absolute or `../`-climbing). */
  escapingSources: string[];
  /** `sources` indices whose `sourcesContent` entry is missing/null. */
  missingContentFor: string[];
}

/** True when a (normalised) source path leaves the package directory. */
function escapesPackage(source: string): boolean {
  const normalized = source.replace(/\\/g, '/');
  // Absolute (posix or windows drive) paths, or any `..` path segment.
  return (
    normalized.startsWith('/') ||
    /^[A-Za-z]:\//.test(normalized) ||
    /(^|\/)\.\.(\/|$)/.test(normalized)
  );
}

/**
 * Inspect a parsed sourcemap object for publish-safety problems. A map that
 * references no sources (e.g. a pure re-export hub) is always clean.
 */
export function inspectSourcemap(map: {
  sources?: unknown;
  sourcesContent?: unknown;
}): SourcemapIssue {
  const sources = Array.isArray(map.sources) ? map.sources : [];
  const sourcesContent = Array.isArray(map.sourcesContent)
    ? map.sourcesContent
    : [];

  const escapingSources: string[] = [];
  const missingContentFor: string[] = [];

  sources.forEach((source, index) => {
    if (typeof source !== 'string') return;
    if (escapesPackage(source)) escapingSources.push(source);
    if (typeof sourcesContent[index] !== 'string')
      missingContentFor.push(source);
  });

  return { escapingSources, missingContentFor };
}

/** Recursively collect `*.js.map` files under `dir`. */
function collectMapFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectMapFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.js.map')) out.push(full);
  }
  return out;
}

export interface SourcemapReport {
  /** Absolute paths of every `*.js.map` scanned. */
  maps: string[];
  /** Map of offending file (relative to `esmDir`) → issue detail. */
  failures: Record<string, SourcemapIssue>;
}

/** Scan a built ESM directory for publish-unsafe sourcemaps. */
export function checkEsmDirSourcemaps(esmDir: string): SourcemapReport {
  const maps = collectMapFiles(esmDir);
  const failures: Record<string, SourcemapIssue> = {};
  for (const file of maps) {
    const parsed = JSON.parse(readFileSync(file, 'utf-8')) as {
      sources?: unknown;
      sourcesContent?: unknown;
    };
    const issue = inspectSourcemap(parsed);
    if (
      issue.escapingSources.length > 0 ||
      issue.missingContentFor.length > 0
    ) {
      failures[relative(esmDir, file)] = issue;
    }
  }
  return { maps, failures };
}

function runCli(): void {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const esmDir = join(root, 'dist', 'esm');

  if (!existsSync(esmDir)) {
    // eslint-disable-next-line no-console -- script CLI output
    console.error(
      `[check-sourcemaps] ${esmDir} not found — run \`npm run build\` first.`
    );
    process.exit(1);
  }

  const { maps, failures } = checkEsmDirSourcemaps(esmDir);
  const entries = Object.entries(failures);

  if (entries.length > 0) {
    // eslint-disable-next-line no-console -- script CLI output
    console.error(
      '[check-sourcemaps] Publish-unsafe sourcemaps in dist/esm:\n'
    );
    for (const [file, issue] of entries) {
      if (issue.escapingSources.length > 0) {
        // eslint-disable-next-line no-console -- script CLI output
        console.error(
          `  ${file} → sources escape the package: ${issue.escapingSources.join(', ')}`
        );
      }
      if (issue.missingContentFor.length > 0) {
        // eslint-disable-next-line no-console -- script CLI output
        console.error(
          `  ${file} → missing sourcesContent for: ${issue.missingContentFor.join(', ')}`
        );
      }
    }
    // eslint-disable-next-line no-console -- script CLI output
    console.error(
      '\nSee sourcemapPathTransform in rollup.config.js and inlineSources in ' +
        'tsconfig.build.json.'
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-console -- script CLI output
  console.log(`[check-sourcemaps] OK — ${maps.length} sourcemaps clean.`);
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCli();
}
