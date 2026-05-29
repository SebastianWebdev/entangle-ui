import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import globals from 'globals';

/**
 * Files that are never linted. docs-site has its own toolchain/tsconfig and is
 * linted (if at all) from within docs-site itself.
 */
const GLOBAL_IGNORES = [
  'dist/**',
  'node_modules/**',
  'coverage/**',
  'docs-site/**',
  '.eslintrc.cjs',
  'eslint.config.js',
  'rollup.config.js',
  'prettier.config.js',
  'scripts/**',
];

const TEST_GLOBS = [
  '**/*.test.{js,jsx,ts,tsx}',
  '**/*.spec.{js,jsx,ts,tsx}',
  '**/__tests__/**/*.{js,jsx,ts,tsx}',
];

const tsLanguageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  parser: tsparser,
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: import.meta.dirname,
  },
  globals: {
    ...globals.browser,
    ...globals.es2020,
    ...globals.node,
  },
};

/**
 * The library's long-standing custom rule choices, layered on top of whichever
 * typescript-eslint preset a config block uses. Kept in one place so src and
 * test blocks stay in sync.
 */
const customTsRules = {
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  // strict-type-checked forbids every non-string template expression. For a
  // CSS-heavy UI library, interpolating numbers into style strings
  // (`${size}px`, transforms, percentages) is idiomatic and safe, so we
  // re-enable the rule's own default `allowNumber`. Booleans, nullish, any and
  // never stay forbidden.
  '@typescript-eslint/restrict-template-expressions': [
    'error',
    { allowNumber: true },
  ],
  'prefer-const': 'error',
  'no-var': 'error',
};

/**
 * react-hooks v7 `recommended` is the full Compiler-aware rule set (refs,
 * purity, immutability, set-state-in-render/effect, …). We run it at full
 * strength: the two rules the preset ships as warnings are promoted to errors
 * so nothing slips through unreviewed.
 */
const reactHooksRules = {
  ...reactHooks.configs.recommended.rules,
  'react-hooks/exhaustive-deps': 'error',
  'react-hooks/incompatible-library': 'error',
};

/**
 * import-x hygiene. no-cycle guards the barrel-export-heavy public surface;
 * order/type-specifier/duplicates keep imports consistent and are autofixable.
 */
const importXRules = {
  'import-x/no-cycle': 'error',
  'import-x/no-self-import': 'error',
  'import-x/no-duplicates': 'error',
  'import-x/no-useless-path-segments': ['error', { noUselessIndex: true }],
  'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
  'import-x/order': [
    'error',
    {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
        'type',
      ],
      pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
      pathGroupsExcludedImportTypes: ['type'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
};

/**
 * CLAUDE.md mandates the `@/` alias for cross-directory imports. Any relative
 * import that climbs out of the current directory (`../`) is therefore banned;
 * same-directory `./` sibling imports remain allowed.
 */
const aliasRule = {
  '@typescript-eslint/no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['../*'],
          message:
            'Use the "@/" alias for cross-directory imports instead of relative parent paths (see CLAUDE.md).',
        },
      ],
    },
  ],
};

const importXSettings = {
  'import-x/resolver-next': [
    createTypeScriptImportResolver({ project: './tsconfig.json' }),
  ],
};

export default [
  { ignores: GLOBAL_IGNORES },

  // Source files: full hardening (strict types, react-hooks, import hygiene,
  // a11y, alias enforcement).
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: TEST_GLOBS,
    languageOptions: tsLanguageOptions,
    settings: importXSettings,
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'import-x': importX,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs['strict-type-checked'].rules,
      ...reactHooksRules,
      ...importXRules,
      ...jsxA11y.configs.recommended.rules,
      ...aliasRule,
      ...customTsRules,
    },
  },

  // Test files: keep the established type-checked baseline. Test-quality
  // plugins were not adopted, and tests are not part of the published package,
  // so the stricter src-only rule set is intentionally not applied here.
  {
    files: TEST_GLOBS,
    languageOptions: {
      ...tsLanguageOptions,
      globals: {
        ...tsLanguageOptions.globals,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      ...customTsRules,
    },
  },
];
