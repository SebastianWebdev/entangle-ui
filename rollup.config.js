import { resolve } from 'path';
import { fileURLToPath } from 'url';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import dts from 'rollup-plugin-dts';
import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * External dependency matcher.
 * Matches exact package names AND deep imports.
 */
const EXTERNAL_PACKAGES = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@base-ui/react',
  '@floating-ui/react',
  '@tanstack/react-virtual',
  // `@vanilla-extract/css` must stay external: its runtime pulls in the Node
  // build of `picocolors` (`let p = process || {}` at module init) plus
  // `lru-cache`, which white-screen browser consumers when inlined. Kept
  // external, the consumer's bundler resolves it and honours each dep's
  // `browser` field. Declared as a peerDependency. See scripts/check-browser-safe.ts.
  '@vanilla-extract/css',
  '@vanilla-extract/dynamic',
  '@vanilla-extract/recipes',
];

const isExternal = id =>
  EXTERNAL_PACKAGES.some(pkg => id === pkg || id.startsWith(pkg + '/'));

const aliasPlugin = alias({
  entries: [{ find: '@', replacement: resolve(__dirname, 'src') }],
});

/** Suppress MODULE_LEVEL_DIRECTIVE warnings from preserveDirectives */
const onwarn = (warning, warn) => {
  if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
  warn(warning);
};

export default [
  // ESM build — preserveModules for tree-shaking
  {
    input: {
      index: 'src/index.ts',
      palettes: 'src/palettes.ts',
      // Explicit theme entry — without it Rollup tree-shakes the pure
      // re-export hub and dist/esm/theme/index.js is never emitted,
      // breaking the `entangle-ui/theme` subpath export.
      'theme/index': 'src/theme/index.ts',
      'theme-values': 'src/theme-values.ts',
      // Canonical stylesheet entry exposed as `entangle-ui/styles.css`. A
      // side-effect-only module (zero exports) that registers the dark theme
      // `:root` vars + global scrollbar rules so consumers load the theme with
      // a single import.
      //
      // The output is named `styles.css.js`, NOT `styles.js`. package.json
      // `sideEffects` only whitelists `*.css`, `*.css.ts`, `*.css.js`; a bare
      // `styles.js` matches none of them. Because this module exports nothing,
      // a consumer's production bundler would then flag it side-effect-free and
      // tree-shake the whole `import 'entangle-ui/styles.css'` away — dropping
      // every `--etui-*` token (broken theme in prod builds; dev is unaffected
      // because dev servers don't tree-shake). The `.css.js` suffix lands it in
      // the same proven side-effect bucket as the component `*.css.js` modules.
      'styles.css': 'src/styles.ts',
    },
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      // Keep published sourcemaps self-contained inside the package. Rollup
      // emits `sources` like `../../../../../../src/foo.tsx`, which resolve to
      // an unshipped `node_modules/entangle-ui/src/...` in a consumer and trip
      // "source file outside its package" warnings. Rewrite them to stable
      // package-relative `src/...` paths; paired with `inlineSources` in
      // tsconfig.build.json the original source travels in `sourcesContent`,
      // so debugging works without the (unpublished) src tree.
      sourcemapPathTransform: relativeSourcePath => {
        const normalized = relativeSourcePath.replace(/\\/g, '/');
        const srcIndex = normalized.indexOf('src/');
        return srcIndex === -1
          ? normalized.replace(/^(?:\.\.\/)+/, '')
          : normalized.slice(srcIndex);
      },
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
    },
    external: isExternal,
    plugins: [
      vanillaExtractPlugin(),
      aliasPlugin,
      nodeResolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
        outDir: 'dist/esm',
      }),
      preserveDirectives(),
    ],
    onwarn,
  },

  // Type declarations — preserveModules for per-file .d.ts
  {
    input: {
      index: 'src/index.ts',
      palettes: 'src/palettes.ts',
      'theme/index': 'src/theme/index.ts',
      'theme-values': 'src/theme-values.ts',
    },
    output: {
      dir: 'dist/types',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external: isExternal,
    plugins: [
      alias({
        entries: [{ find: '@', replacement: resolve(__dirname, 'src') }],
      }),
      dts({ tsconfig: './tsconfig.build.json' }),
    ],
  },
];
