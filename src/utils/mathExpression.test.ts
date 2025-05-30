import { describe, it, expect } from 'vitest';
import {
  evaluateExpression,
  isExpression,
  parseNumericInput,
  AVAILABLE_CONSTANTS,
  AVAILABLE_FUNCTIONS,
} from './mathExpression';

describe('mathExpression', () => {
  describe('evaluateExpression', () => {
    describe('Basic arithmetic operations', () => {
      it('evaluates simple addition', () => {
        const result = evaluateExpression('3 + 4');
        expect(result.success).toBe(true);
        expect(result.value).toBe(7);
        expect(result.expression).toBe('3 + 4');
      });

      it('evaluates simple subtraction', () => {
        const result = evaluateExpression('10 - 3');
        expect(result.success).toBe(true);
        expect(result.value).toBe(7);
      });

      it('evaluates simple multiplication', () => {
        const result = evaluateExpression('4 * 5');
        expect(result.success).toBe(true);
        expect(result.value).toBe(20);
      });

      it('evaluates simple division', () => {
        const result = evaluateExpression('15 / 3');
        expect(result.success).toBe(true);
        expect(result.value).toBe(5);
      });

      it('evaluates power operations', () => {
        const result = evaluateExpression('2 ** 3');
        expect(result.success).toBe(true);
        expect(result.value).toBe(8);
      });

      it('respects operator precedence', () => {
        const result = evaluateExpression('3 + 4 * 2');
        expect(result.success).toBe(true);
        expect(result.value).toBe(11);
      });

      it('handles parentheses correctly', () => {
        const result = evaluateExpression('(3 + 4) * 2');
        expect(result.success).toBe(true);
        expect(result.value).toBe(14);
      });

      it('handles nested parentheses', () => {
        const result = evaluateExpression('((2 + 3) * 4) - 1');
        expect(result.success).toBe(true);
        expect(result.value).toBe(19);
      });

      it('handles negative numbers', () => {
        const result = evaluateExpression('-5 + 3');
        expect(result.success).toBe(true);
        expect(result.value).toBe(-2);
      });

      it('handles decimal numbers', () => {
        const result = evaluateExpression('3.14 + 2.86');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(6);
      });
    });

    describe('Alternative notation support', () => {
      it('converts multiplication symbol ×', () => {
        const result = evaluateExpression('3 × 4');
        expect(result.success).toBe(true);
        expect(result.value).toBe(12);
      });

      it('converts division symbol ÷', () => {
        const result = evaluateExpression('12 ÷ 3');
        expect(result.success).toBe(true);
        expect(result.value).toBe(4);
      });

      it('converts power symbol ^', () => {
        const result = evaluateExpression('2 ^ 4');
        expect(result.success).toBe(true);
        expect(result.value).toBe(16);
      });

      it('converts European decimal notation', () => {
        const result = evaluateExpression('3,14 + 2,86');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(6);
      });
    });

    describe('Mathematical constants', () => {
      it('evaluates pi constant', () => {
        const result = evaluateExpression('pi');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(Math.PI);
      });

      it('evaluates e constant', () => {
        const result = evaluateExpression('e');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(Math.E);
      });

      it('evaluates tau constant', () => {
        const result = evaluateExpression('tau');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(2 * Math.PI);
      });

      it('evaluates phi (golden ratio) constant', () => {
        const result = evaluateExpression('phi');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo((1 + Math.sqrt(5)) / 2);
      });

      it('uses constants in expressions', () => {
        const result = evaluateExpression('pi * 2');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(2 * Math.PI);
      });
    });

    describe('Mathematical functions', () => {
      it('evaluates sqrt function', () => {
        const result = evaluateExpression('sqrt(16)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(4);
      });

      it('evaluates sin function', () => {
        const result = evaluateExpression('sin(0)');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(0);
      });

      it('evaluates cos function', () => {
        const result = evaluateExpression('cos(0)');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(1);
      });

      it('evaluates log function', () => {
        const result = evaluateExpression('log(1)');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(0);
      });

      it('evaluates abs function', () => {
        const result = evaluateExpression('abs(-5)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(5);
      });

      it('evaluates floor function', () => {
        const result = evaluateExpression('floor(3.7)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(3);
      });

      it('evaluates ceil function', () => {
        const result = evaluateExpression('ceil(3.2)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(4);
      });

      it('evaluates round function', () => {
        const result = evaluateExpression('round(3.6)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(4);
      });

      it('chains functions', () => {
        const result = evaluateExpression('sqrt(abs(-16))');
        expect(result.success).toBe(true);
        expect(result.value).toBe(4);
      });

      it('uses functions in complex expressions', () => {
        const result = evaluateExpression('sqrt(16) + abs(-3)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(7);
      });
    });

    describe('Complex expressions', () => {
      it('evaluates complex mathematical expression', () => {
        const result = evaluateExpression(
          'sqrt(16) + sin(0) * cos(0) + pi / 2'
        );
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(4 + 0 * 1 + Math.PI / 2);
      });

      it('handles whitespace correctly', () => {
        const result = evaluateExpression('  3   +   4   *   2  ');
        expect(result.success).toBe(true);
        expect(result.value).toBe(11);
      });
    });

    describe('Error handling', () => {
      it('handles empty expression', () => {
        const result = evaluateExpression('');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Expression cannot be empty');
        expect(result.expression).toBe('');
      });

      it('handles whitespace-only expression', () => {
        const result = evaluateExpression('   ');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Expression cannot be empty');
      });

      it('handles invalid characters', () => {
        const result = evaluateExpression('3 + $');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'Expression contains invalid characters or syntax'
        );
      });

      it('handles unbalanced parentheses - missing closing', () => {
        const result = evaluateExpression('(3 + 4');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'Expression contains invalid characters or syntax'
        );
      });

      it('handles unbalanced parentheses - missing opening', () => {
        const result = evaluateExpression('3 + 4)');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'Expression contains invalid characters or syntax'
        );
      });

      it('handles division by zero', () => {
        const result = evaluateExpression('5 / 0');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'Expression does not evaluate to a valid number'
        );
      });

      it('handles invalid function calls', () => {
        const result = evaluateExpression('sqrt(-1)');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'Expression does not evaluate to a valid number'
        );
      });

      it('handles syntax errors', () => {
        const result = evaluateExpression('3 + + 4');
        expect(result.success).toBe(false);
        expect(result.error).toContain(
          'Invalid left-hand side expression in postfix operation'
        );
      });

      it('preserves original expression in error result', () => {
        const original = '3 + $invalid';
        const result = evaluateExpression(original);
        expect(result.success).toBe(false);
        expect(result.expression).toBe(original);
      });
    });
  });

  describe('isExpression', () => {
    describe('Detects mathematical operators', () => {
      it('detects addition operator', () => {
        expect(isExpression('3 + 4')).toBe(true);
      });

      it('detects subtraction operator', () => {
        expect(isExpression('5 - 2')).toBe(true);
      });

      it('detects multiplication operator', () => {
        expect(isExpression('3 * 4')).toBe(true);
      });

      it('detects division operator', () => {
        expect(isExpression('8 / 2')).toBe(true);
      });

      it('detects power operator', () => {
        expect(isExpression('2 ^ 3')).toBe(true);
      });

      it('detects alternative multiplication symbol', () => {
        expect(isExpression('3 × 4')).toBe(true);
      });

      it('detects alternative division symbol', () => {
        expect(isExpression('8 ÷ 2')).toBe(true);
      });

      it('detects parentheses', () => {
        expect(isExpression('(3 + 4)')).toBe(true);
      });
    });

    describe('Detects mathematical functions', () => {
      it('detects sqrt function', () => {
        expect(isExpression('sqrt(16)')).toBe(true);
      });

      it('detects sin function', () => {
        expect(isExpression('sin(0)')).toBe(true);
      });

      it('detects case-insensitive functions', () => {
        expect(isExpression('SQRT(16)')).toBe(true);
        expect(isExpression('Sin(0)')).toBe(true);
      });
    });

    describe('Detects mathematical constants', () => {
      it('detects pi constant', () => {
        expect(isExpression('pi')).toBe(true);
      });

      it('detects e constant', () => {
        expect(isExpression('e')).toBe(true);
      });

      it('detects tau constant', () => {
        expect(isExpression('tau')).toBe(true);
      });

      it('detects phi constant', () => {
        expect(isExpression('phi')).toBe(true);
      });

      it('detects case-insensitive constants', () => {
        expect(isExpression('PI')).toBe(true);
        expect(isExpression('E')).toBe(true);
      });
    });

    describe('Does not detect simple numbers', () => {
      it('does not detect integer', () => {
        expect(isExpression('42')).toBe(false);
      });

      it('does not detect decimal', () => {
        expect(isExpression('3.14')).toBe(false);
      });

      it('does not detect scientific notation', () => {
        expect(isExpression('1e5')).toBe(false);
      });
    });

    describe('Handles edge cases', () => {
      it('handles empty string', () => {
        expect(isExpression('')).toBe(false);
      });

      it('handles whitespace', () => {
        expect(isExpression('   ')).toBe(false);
      });

      it('handles random text', () => {
        expect(isExpression('hello world')).toBe(false);
      });
    });
  });

  describe('parseNumericInput', () => {
    describe('Direct number parsing', () => {
      it('parses simple integer', () => {
        const result = parseNumericInput('42');
        expect(result.success).toBe(true);
        expect(result.value).toBe(42);
        expect(result.expression).toBe('42');
      });

      it('parses decimal number', () => {
        const result = parseNumericInput('3.14');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(3.14);
      });

      it('parses negative number', () => {
        const result = parseNumericInput('-5');
        expect(result.success).toBe(true);
        expect(result.value).toBe(-5);
      });

      it('handles whitespace around numbers', () => {
        const result = parseNumericInput('  42  ');
        expect(result.success).toBe(true);
        expect(result.value).toBe(42);
      });
    });

    describe('Expression evaluation fallback', () => {
      it('evaluates simple expression', () => {
        const result = parseNumericInput('3 + 4');
        expect(result.success).toBe(true);
        expect(result.value).toBe(7);
      });

      it('evaluates complex expression', () => {
        const result = parseNumericInput('sqrt(16) + 2');
        expect(result.success).toBe(true);
        expect(result.value).toBe(6);
      });

      it('uses constants', () => {
        const result = parseNumericInput('pi');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(Math.PI);
      });
    });

    describe('Error handling', () => {
      it('handles invalid input', () => {
        const result = parseNumericInput('invalid');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('handles empty input', () => {
        const result = parseNumericInput('');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Expression cannot be empty');
      });
    });
  });

  describe('Constants and functions availability', () => {
    describe('AVAILABLE_CONSTANTS', () => {
      it('contains expected constants', () => {
        expect(AVAILABLE_CONSTANTS).toContain('pi');
        expect(AVAILABLE_CONSTANTS).toContain('e');
        expect(AVAILABLE_CONSTANTS).toContain('tau');
        expect(AVAILABLE_CONSTANTS).toContain('phi');
      });

      it('has correct length', () => {
        expect(AVAILABLE_CONSTANTS).toHaveLength(4);
      });
    });

    describe('AVAILABLE_FUNCTIONS', () => {
      it('contains trigonometric functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('sin');
        expect(AVAILABLE_FUNCTIONS).toContain('cos');
        expect(AVAILABLE_FUNCTIONS).toContain('tan');
        expect(AVAILABLE_FUNCTIONS).toContain('asin');
        expect(AVAILABLE_FUNCTIONS).toContain('acos');
        expect(AVAILABLE_FUNCTIONS).toContain('atan');
      });

      it('contains logarithmic functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('log');
        expect(AVAILABLE_FUNCTIONS).toContain('log10');
        expect(AVAILABLE_FUNCTIONS).toContain('log2');
        expect(AVAILABLE_FUNCTIONS).toContain('exp');
      });

      it('contains power and root functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('sqrt');
        expect(AVAILABLE_FUNCTIONS).toContain('cbrt');
      });

      it('contains rounding functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('floor');
        expect(AVAILABLE_FUNCTIONS).toContain('ceil');
        expect(AVAILABLE_FUNCTIONS).toContain('round');
      });

      it('contains utility functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('abs');
        expect(AVAILABLE_FUNCTIONS).toContain('sign');
      });
    });
  });

  describe('EvaluationResult type', () => {
    it('has correct structure for successful evaluation', () => {
      const result = evaluateExpression('3 + 4');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('expression');
      expect(result.success).toBe(true);
      expect(typeof result.value).toBe('number');
      expect(typeof result.expression).toBe('string');
    });

    it('has correct structure for failed evaluation', () => {
      const result = evaluateExpression('invalid');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('expression');
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(typeof result.expression).toBe('string');
      expect(result.value).toBeUndefined();
    });
  });

  describe('Edge cases and security', () => {
    it('handles very large numbers', () => {
      const result = evaluateExpression('999999999999999');
      expect(result.success).toBe(true);
      expect(result.value).toBe(999999999999999);
    });

    it('handles very small numbers', () => {
      const result = evaluateExpression('0.000000001');
      expect(result.success).toBe(true);
      expect(result.value).toBeCloseTo(0.000000001);
    });

    it('prevents code injection attempts', () => {
      const result = evaluateExpression('alert("hack")');
      expect(result.success).toBe(false);
    });

    it('prevents access to global objects', () => {
      const result = evaluateExpression('window.location');
      expect(result.success).toBe(false);
    });

    it('prevents function constructor abuse', () => {
      const result = evaluateExpression('constructor');
      expect(result.success).toBe(false);
    });
  });
});
