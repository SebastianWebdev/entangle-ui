import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkEsmDirSourcemaps, inspectSourcemap } from './check-sourcemaps';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ESM_DIR = resolve(__dirname, '..', 'dist', 'esm');

describe('check-sourcemaps', () => {
  describe('inspectSourcemap', () => {
    it('flags `../`-climbing sources (the "outside its package" pattern)', () => {
      const result = inspectSourcemap({
        sources: ['../../../../../../src/components/Button/Button.tsx'],
        sourcesContent: ['source'],
      });
      expect(result.escapingSources).toEqual([
        '../../../../../../src/components/Button/Button.tsx',
      ]);
    });

    it('flags absolute sources', () => {
      const result = inspectSourcemap({
        sources: ['/home/user/entangle-ui/src/index.ts'],
        sourcesContent: ['source'],
      });
      expect(result.escapingSources).toHaveLength(1);
    });

    it('flags missing (null) sourcesContent', () => {
      const result = inspectSourcemap({
        sources: ['src/index.ts'],
        sourcesContent: [null],
      });
      expect(result.missingContentFor).toEqual(['src/index.ts']);
    });

    it('accepts package-relative sources with embedded content', () => {
      const result = inspectSourcemap({
        sources: ['src/components/primitives/Button/Button.tsx'],
        sourcesContent: ["'use client';\nexport const Button = () => null;"],
      });
      expect(result.escapingSources).toEqual([]);
      expect(result.missingContentFor).toEqual([]);
    });

    it('treats a map with no sources as clean (pure re-export / CSS entry)', () => {
      const result = inspectSourcemap({ sources: [], sourcesContent: [] });
      expect(result.escapingSources).toEqual([]);
      expect(result.missingContentFor).toEqual([]);
    });
  });

  // Integration: the actually-built sourcemaps must be publish-safe. Skipped
  // when `dist/esm` is absent (the test suite can run without a prior build);
  // the `prepublishOnly` guard covers the publish path regardless.
  describe('built dist/esm', () => {
    it.skipIf(!existsSync(ESM_DIR))(
      'emits only package-relative sources with embedded content',
      () => {
        const { maps, failures } = checkEsmDirSourcemaps(ESM_DIR);
        expect(maps.length).toBeGreaterThan(0);
        expect(failures).toEqual({});
      }
    );
  });
});
