import { describe, expect, it } from 'vitest';
import { createTypeMatchValidator } from './createTypeMatchValidator';
import type {
  NodeGraphConnectionValidationInfo,
  NodeGraphPortRef,
} from './NodeGraph.types';

const SRC: NodeGraphPortRef = { node: 'a', port: 'out' };
const TGT: NodeGraphPortRef = { node: 'b', port: 'in' };

function info(
  over: Partial<NodeGraphConnectionValidationInfo> = {}
): NodeGraphConnectionValidationInfo {
  return { sameNode: false, sideCombo: 'right->left', ...over };
}

describe('createTypeMatchValidator', () => {
  describe('defaults', () => {
    const isValid = createTypeMatchValidator();

    it('rejects same-node connections', () => {
      expect(isValid(SRC, TGT, info({ sameNode: true }))).toBe(false);
    });

    it('accepts both horizontal directions', () => {
      expect(isValid(SRC, TGT, info({ sideCombo: 'right->left' }))).toBe(true);
      expect(isValid(SRC, TGT, info({ sideCombo: 'left->right' }))).toBe(true);
    });

    it('rejects non-horizontal direction combos', () => {
      expect(isValid(SRC, TGT, info({ sideCombo: 'right->right' }))).toBe(
        false
      );
      expect(isValid(SRC, TGT, info({ sideCombo: 'top->bottom' }))).toBe(false);
    });

    it('accepts matching data types', () => {
      expect(
        isValid(
          SRC,
          TGT,
          info({ sourceDataType: 'float', targetDataType: 'float' })
        )
      ).toBe(true);
    });

    it('rejects mismatched data types', () => {
      expect(
        isValid(
          SRC,
          TGT,
          info({ sourceDataType: 'float', targetDataType: 'bool' })
        )
      ).toBe(false);
    });

    it('accepts when either port is untyped', () => {
      expect(isValid(SRC, TGT, info({ sourceDataType: 'float' }))).toBe(true);
      expect(isValid(SRC, TGT, info({ targetDataType: 'bool' }))).toBe(true);
      expect(isValid(SRC, TGT, info())).toBe(true);
    });

    it("treats 'any' as a wildcard", () => {
      expect(
        isValid(
          SRC,
          TGT,
          info({ sourceDataType: 'any', targetDataType: 'bool' })
        )
      ).toBe(true);
      expect(
        isValid(
          SRC,
          TGT,
          info({ sourceDataType: 'float', targetDataType: 'any' })
        )
      ).toBe(true);
    });
  });

  describe('options', () => {
    it('restricts direction with `directions`', () => {
      const isValid = createTypeMatchValidator({ directions: ['right->left'] });
      expect(isValid(SRC, TGT, info({ sideCombo: 'right->left' }))).toBe(true);
      expect(isValid(SRC, TGT, info({ sideCombo: 'left->right' }))).toBe(false);
    });

    it('allows same-node when `allowSameNode` is true', () => {
      const isValid = createTypeMatchValidator({ allowSameNode: true });
      expect(isValid(SRC, TGT, info({ sameNode: true }))).toBe(true);
    });

    it('honours a custom `anyType` token', () => {
      const isValid = createTypeMatchValidator({ anyType: 'wild' });
      expect(
        isValid(
          SRC,
          TGT,
          info({ sourceDataType: 'wild', targetDataType: 'bool' })
        )
      ).toBe(true);
      // The old 'any' token is no longer special.
      expect(
        isValid(
          SRC,
          TGT,
          info({ sourceDataType: 'any', targetDataType: 'bool' })
        )
      ).toBe(false);
    });

    it('delegates type comparison to a custom `match`', () => {
      const isValid = createTypeMatchValidator({
        match: (source, target) => source === 'int' && target === 'float',
      });
      expect(
        isValid(
          SRC,
          TGT,
          info({ sourceDataType: 'int', targetDataType: 'float' })
        )
      ).toBe(true);
      expect(
        isValid(
          SRC,
          TGT,
          info({ sourceDataType: 'float', targetDataType: 'float' })
        )
      ).toBe(false);
    });
  });
});
