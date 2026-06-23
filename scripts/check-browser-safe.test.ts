import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  checkEsmDir,
  findBrowserUnsafeRefs,
  stripComments,
} from './check-browser-safe';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ESM_DIR = resolve(__dirname, '..', 'dist', 'esm');

describe('check-browser-safe', () => {
  describe('findBrowserUnsafeRefs', () => {
    it('flags a bare `process` global (the picocolors crash pattern)', () => {
      // picocolors' Node build, the exact thing that white-screened consumers.
      expect(findBrowserUnsafeRefs('let p = process || {};')).toContain(
        'process'
      );
    });

    it('flags `process.argv` and other process members', () => {
      expect(findBrowserUnsafeRefs('const a = process.argv;')).toContain(
        'process'
      );
    });

    it('flags `require(` (CommonJS leaking into ESM output)', () => {
      expect(findBrowserUnsafeRefs('const fs = require("fs");')).toContain(
        'require('
      );
    });

    it('allows the bundler-replaceable process.env.NODE_ENV guard', () => {
      expect(
        findBrowserUnsafeRefs(
          "if (process.env.NODE_ENV !== 'production') { warn(); }"
        )
      ).toEqual([]);
    });

    it('allows the bracket form process.env["NODE_ENV"]', () => {
      expect(
        findBrowserUnsafeRefs(
          "if (process.env['NODE_ENV'] !== 'production') { warn(); }"
        )
      ).toEqual([]);
    });

    it('does not flag the word "process" inside a doc comment', () => {
      const src =
        '/** Pause icon for pausing playback and the process. */\nexport const x = 1;';
      expect(findBrowserUnsafeRefs(src)).toEqual([]);
    });

    it('returns an empty array for browser-safe source', () => {
      expect(
        findBrowserUnsafeRefs('export const add = (a, b) => a + b;')
      ).toEqual([]);
    });
  });

  describe('stripComments', () => {
    it('removes block comments', () => {
      expect(stripComments('/* uses process */ const x = 1;')).not.toContain(
        'process'
      );
    });

    it('removes whole-line // comments (e.g. sourceMappingURL)', () => {
      expect(
        stripComments('const x = 1;\n//# sourceMappingURL=x.js.map')
      ).not.toContain('sourceMappingURL');
    });

    it('keeps code intact', () => {
      expect(stripComments('const x = 1; // trailing')).toContain(
        'const x = 1;'
      );
    });
  });

  // Integration: the actually-built bundle must be browser-safe. Skipped when
  // `dist/esm` is absent (e.g. CI runs the test suite without a prior build);
  // the `prepublishOnly` guard covers the publish path regardless.
  describe('built dist/esm', () => {
    it.skipIf(!existsSync(ESM_DIR))(
      'contains no browser-unsafe references',
      () => {
        const { files, failures } = checkEsmDir(ESM_DIR);
        expect(files.length).toBeGreaterThan(0);
        expect(failures).toEqual({});
      }
    );
  });
});
