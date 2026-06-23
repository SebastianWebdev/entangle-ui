/**
 * Browser-safety guard for the published ESM bundle (`dist/esm`).
 *
 * The package ships ESM-only and must be safe to evaluate in a browser. The
 * failure mode this guards against: a Node-targeted build of a (transitive)
 * dependency gets *inlined* into the runtime graph and reads a Node-only global
 * at module init — e.g. `picocolors` runs `let p = process || {}`, which throws
 * `process is not defined` and white-screens the consumer the moment the module
 * is evaluated (notably in `vite dev`, where nothing is tree-shaken).
 *
 * The scan walks every emitted `dist/esm/**\/*.js` and flags references to
 * Node-only globals (`process`, `require(`) outside an allow-list. The single
 * allowed pattern is `process.env.NODE_ENV` (and its bracket form), which every
 * mainstream bundler statically replaces at build time, so it never reaches the
 * browser as a live `process` access.
 *
 * Run via `npm run check:browser-safe` (wired into `prepublishOnly`). The
 * detection helpers are unit-tested in `scripts/check-browser-safe.test.ts`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Strip block comments (incl. JSDoc) and whole-line `//` comments so prose
 * never trips the scanner (e.g. a doc comment mentioning "the process").
 */
export function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/^[ \t]*\/\/.*$/gm, ''); // whole-line // comments (incl. sourceMappingURL)
}

/**
 * The only `process` reference allowed through: the bundler-replaceable
 * `process.env.NODE_ENV` guard, in dot or bracket form.
 */
const ALLOWED_PROCESS =
  /process\.env(?:\.NODE_ENV|\[\s*['"]NODE_ENV['"]\s*\])/g;

/**
 * Return the browser-unsafe references found in a JS source string.
 * An empty array means the source is browser-safe.
 */
export function findBrowserUnsafeRefs(source: string): string[] {
  const code = stripComments(source).replace(ALLOWED_PROCESS, '');
  const offenses: string[] = [];
  if (/\bprocess\b/.test(code)) offenses.push('process');
  if (/\brequire\s*\(/.test(code)) offenses.push('require(');
  return offenses;
}

/** Recursively collect `*.js` files under `dir`. */
function collectJsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJsFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

export interface BrowserSafeReport {
  /** Absolute paths of every `*.js` file scanned. */
  files: string[];
  /** Map of offending file (relative to `esmDir`) → list of offenses. */
  failures: Record<string, string[]>;
}

/** Scan a built ESM directory for browser-unsafe references. */
export function checkEsmDir(esmDir: string): BrowserSafeReport {
  const files = collectJsFiles(esmDir);
  const failures: Record<string, string[]> = {};
  for (const file of files) {
    const offenses = findBrowserUnsafeRefs(readFileSync(file, 'utf-8'));
    if (offenses.length > 0) failures[relative(esmDir, file)] = offenses;
  }
  return { files, failures };
}

function runCli(): void {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const esmDir = join(root, 'dist', 'esm');

  if (!existsSync(esmDir)) {
    // eslint-disable-next-line no-console -- script CLI output
    console.error(
      `[check-browser-safe] ${esmDir} not found — run \`npm run build\` first.`
    );
    process.exit(1);
  }

  const { files, failures } = checkEsmDir(esmDir);
  const entries = Object.entries(failures);

  if (entries.length > 0) {
    // eslint-disable-next-line no-console -- script CLI output
    console.error(
      '[check-browser-safe] Browser-unsafe references found in dist/esm:\n'
    );
    for (const [file, offenses] of entries) {
      // eslint-disable-next-line no-console -- script CLI output
      console.error(`  ${file} → ${offenses.join(', ')}`);
    }
    // eslint-disable-next-line no-console -- script CLI output
    console.error(
      '\nThese reference Node-only globals at runtime and will crash browser ' +
        'consumers. A dependency is most likely being inlined instead of ' +
        'externalized — check EXTERNAL_PACKAGES in rollup.config.js.'
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-console -- script CLI output
  console.log(`[check-browser-safe] OK — ${files.length} files clean.`);
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCli();
}
