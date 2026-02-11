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
 * Matches exact package names AND deep imports (e.g. '@emotion/react/jsx-runtime').
 */
const EXTERNAL_PACKAGES = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@emotion/react',
  '@emotion/styled',
  '@emotion/react/jsx-runtime',
  '@base-ui/react',
  '@floating-ui/react',
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
    },
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
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
