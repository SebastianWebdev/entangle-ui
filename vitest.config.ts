import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './test_results/coverage',
      exclude: [
        'node_modules/',
        'scripts/',
        'src/tests/setup.ts',
        '**/*.stories.tsx',
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        '**/index.ts',
        'dist/',
        'test_results/',
        '.storybook/',
        'stories/',
        'rollup.config.js',
        'vite.config.ts',
        'vitest.config.ts',
      ],
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/theme/**/*.{ts,tsx}',
        'src/types/**/*.{ts,tsx}',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
