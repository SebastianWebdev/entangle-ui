import { describe, it, expect } from 'vitest';
import { camelToKebab, processCss } from './styledUtils';
import { createTestTheme } from '@/tests/testUtils';

describe('styledUtils', () => {
  describe('camelToKebab', () => {
    it('converts camelCase to kebab-case', () => {
      expect(camelToKebab('lineHeight')).toBe('line-height');
      expect(camelToKebab('backgroundColor')).toBe('background-color');
      expect(camelToKebab('borderTopLeftRadius')).toBe(
        'border-top-left-radius'
      );
    });

    it('handles single word', () => {
      expect(camelToKebab('color')).toBe('color');
    });
  });

  describe('processCss', () => {
    const theme = createTestTheme();

    it('returns empty string for undefined css', () => {
      expect(processCss(undefined, theme)).toBe('');
    });

    it('appends px to pixel properties', () => {
      const result = processCss({ padding: 10, margin: 20 }, theme);
      expect(result).toContain('padding: 10px;');
      expect(result).toContain('margin: 20px;');
    });

    it('does NOT append px to unitless properties', () => {
      const result = processCss(
        {
          lineHeight: 1.4,
          fontWeight: 600,
          opacity: 0.5,
          zIndex: 10,
          flexGrow: 1,
        },
        theme
      );
      expect(result).toContain('line-height: 1.4;');
      expect(result).toContain('font-weight: 600;');
      expect(result).toContain('opacity: 0.5;');
      expect(result).toContain('z-index: 10;');
      expect(result).toContain('flex-grow: 1;');
    });

    it('handles zero values', () => {
      const result = processCss({ padding: 0, lineHeight: 0 }, theme);
      expect(result).toContain('padding: 0;');
      expect(result).toContain('line-height: 0;');
    });

    it('handles string values', () => {
      const result = processCss({ color: 'red', display: 'flex' }, theme);
      expect(result).toContain('color: red;');
      expect(result).toContain('display: flex;');
    });

    it('handles function css with theme', () => {
      const result = processCss(t => ({ padding: t.spacing.sm }), theme);
      expect(result).toContain('padding:');
      expect(result).toContain('px;');
    });
  });
});
