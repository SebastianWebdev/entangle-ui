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
        expect(result.error).toBeDefined();
      });

      it('handles unbalanced parentheses - missing closing', () => {
        const result = evaluateExpression('(3 + 4');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('handles unbalanced parentheses - missing opening', () => {
        const result = evaluateExpression('3 + 4)');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('handles division by zero', () => {
        const result = evaluateExpression('5 / 0');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'Expression does not evaluate to a finite number'
        );
      });

      it('handles invalid function calls', () => {
        const result = evaluateExpression('sqrt(-1)');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'Expression does not evaluate to a finite number'
        );
      });

      it('handles unary plus in expressions', () => {
        const result = evaluateExpression('3 + + 4');
        expect(result.success).toBe(true);
        expect(result.value).toBe(7);
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

      it('detects modulo operator', () => {
        expect(isExpression('10 % 3')).toBe(true);
      });
    });

    describe('Detects mathematical functions', () => {
      it('detects sqrt function', () => {
        expect(isExpression('sqrt(16)')).toBe(true);
      });

      it('detects sin function', () => {
        expect(isExpression('sin(0)')).toBe(true);
      });

      it('detects functions with parentheses regardless of case', () => {
        // Parentheses trigger operator detection even when function name case mismatches
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

      it('detects inf constant', () => {
        expect(isExpression('inf')).toBe(true);
      });

      it('does not detect case-mismatched constants', () => {
        expect(isExpression('PI')).toBe(false);
        expect(isExpression('E')).toBe(false);
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
        expect(AVAILABLE_CONSTANTS).toContain('inf');
      });

      it('has correct length', () => {
        expect(AVAILABLE_CONSTANTS).toHaveLength(5);
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

      it('contains hyperbolic functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('sinh');
        expect(AVAILABLE_FUNCTIONS).toContain('cosh');
        expect(AVAILABLE_FUNCTIONS).toContain('tanh');
        expect(AVAILABLE_FUNCTIONS).toContain('asinh');
        expect(AVAILABLE_FUNCTIONS).toContain('acosh');
        expect(AVAILABLE_FUNCTIONS).toContain('atanh');
      });

      it('contains logarithmic functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('log');
        expect(AVAILABLE_FUNCTIONS).toContain('ln');
        expect(AVAILABLE_FUNCTIONS).toContain('log10');
        expect(AVAILABLE_FUNCTIONS).toContain('log2');
        expect(AVAILABLE_FUNCTIONS).toContain('exp');
        expect(AVAILABLE_FUNCTIONS).toContain('exp2');
      });

      it('contains power and root functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('sqrt');
        expect(AVAILABLE_FUNCTIONS).toContain('cbrt');
      });

      it('contains rounding functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('floor');
        expect(AVAILABLE_FUNCTIONS).toContain('ceil');
        expect(AVAILABLE_FUNCTIONS).toContain('round');
        expect(AVAILABLE_FUNCTIONS).toContain('trunc');
      });

      it('contains utility functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('abs');
        expect(AVAILABLE_FUNCTIONS).toContain('sign');
        expect(AVAILABLE_FUNCTIONS).toContain('fract');
      });

      it('contains unit conversion functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('deg');
        expect(AVAILABLE_FUNCTIONS).toContain('rad');
      });

      it('contains 2-arg functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('min');
        expect(AVAILABLE_FUNCTIONS).toContain('max');
        expect(AVAILABLE_FUNCTIONS).toContain('pow');
        expect(AVAILABLE_FUNCTIONS).toContain('atan2');
        expect(AVAILABLE_FUNCTIONS).toContain('mod');
        expect(AVAILABLE_FUNCTIONS).toContain('hypot');
      });

      it('contains 3-arg functions', () => {
        expect(AVAILABLE_FUNCTIONS).toContain('clamp');
        expect(AVAILABLE_FUNCTIONS).toContain('lerp');
        expect(AVAILABLE_FUNCTIONS).toContain('smoothstep');
        expect(AVAILABLE_FUNCTIONS).toContain('mix');
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

    describe('Blocked identifier rejection', () => {
      it('rejects __proto__ identifier', () => {
        const result = evaluateExpression('__proto__');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects prototype identifier', () => {
        const result = evaluateExpression('prototype');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects this identifier', () => {
        const result = evaluateExpression('this');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects globalThis identifier', () => {
        const result = evaluateExpression('globalThis');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects eval identifier', () => {
        const result = evaluateExpression('eval');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects Function identifier', () => {
        const result = evaluateExpression('Function');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects Object identifier', () => {
        const result = evaluateExpression('Object');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects require identifier', () => {
        const result = evaluateExpression('require');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects self identifier', () => {
        const result = evaluateExpression('self');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Prototype chain and constructor access attempts', () => {
      it('rejects constructor.constructor("return this")()', () => {
        const result = evaluateExpression(
          'constructor.constructor("return this")()'
        );
        expect(result.success).toBe(false);
      });

      it('rejects Math.constructor via dot notation', () => {
        const result = evaluateExpression('Math.constructor');
        expect(result.success).toBe(false);
      });

      it('rejects constructor embedded in arithmetic', () => {
        const result = evaluateExpression('1+constructor+1');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects prototype in arithmetic context', () => {
        const result = evaluateExpression('prototype+1');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Unknown identifier rejection', () => {
      it('rejects arbitrary unknown identifiers', () => {
        const result = evaluateExpression('foo');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects unknown identifiers mixed with valid math', () => {
        const result = evaluateExpression('sin(0)+unknown');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('still allows valid constants and functions', () => {
        expect(evaluateExpression('pi').success).toBe(true);
        expect(evaluateExpression('sin(0)').success).toBe(true);
        expect(evaluateExpression('sqrt(16)+abs(-3)').success).toBe(true);
        expect(evaluateExpression('e+tau+phi').success).toBe(true);
      });
    });

    describe('JavaScript keyword rejection', () => {
      it('rejects arguments identifier', () => {
        const result = evaluateExpression('arguments');
        expect(result.success).toBe(false);
      });

      it('rejects return keyword', () => {
        const result = evaluateExpression('return');
        expect(result.success).toBe(false);
      });

      it('rejects new keyword', () => {
        const result = evaluateExpression('new');
        expect(result.success).toBe(false);
      });

      it('rejects typeof keyword', () => {
        const result = evaluateExpression('typeof');
        expect(result.success).toBe(false);
      });

      it('rejects void keyword', () => {
        const result = evaluateExpression('void');
        expect(result.success).toBe(false);
      });

      it('rejects delete keyword', () => {
        const result = evaluateExpression('delete');
        expect(result.success).toBe(false);
      });

      it('rejects control flow keywords', () => {
        expect(evaluateExpression('for').success).toBe(false);
        expect(evaluateExpression('while').success).toBe(false);
        expect(evaluateExpression('if').success).toBe(false);
        expect(evaluateExpression('switch').success).toBe(false);
        expect(evaluateExpression('throw').success).toBe(false);
      });

      it('rejects variable declaration keywords', () => {
        expect(evaluateExpression('var').success).toBe(false);
        expect(evaluateExpression('let').success).toBe(false);
        expect(evaluateExpression('const').success).toBe(false);
        expect(evaluateExpression('class').success).toBe(false);
      });

      it('rejects async keywords', () => {
        expect(evaluateExpression('yield').success).toBe(false);
        expect(evaluateExpression('await').success).toBe(false);
        expect(evaluateExpression('async').success).toBe(false);
      });

      it('rejects debugger and with keywords', () => {
        expect(evaluateExpression('debugger').success).toBe(false);
        expect(evaluateExpression('with').success).toBe(false);
      });
    });

    describe('Expression length limit', () => {
      it('rejects expressions exceeding max length', () => {
        const longExpression = '1+'.repeat(101) + '1';
        const result = evaluateExpression(longExpression);
        expect(result.success).toBe(false);
        expect(result.error).toContain('too long');
      });

      it('accepts expressions within max length', () => {
        const result = evaluateExpression('1+2+3+4+5');
        expect(result.success).toBe(true);
        expect(result.value).toBe(15);
      });

      it('accepts expressions at exactly max length', () => {
        // 200 chars: '1+' * 99 + '10' = 200
        const expression = '1+'.repeat(99) + '10';
        expect(expression.length).toBe(200);
        const result = evaluateExpression(expression);
        expect(result.success).toBe(true);
      });
    });

    describe('Scientific notation handling', () => {
      it('blocks scientific notation via identifier check', () => {
        // '1e5' — after sanitize, 'e' is a valid constant (Math.E),
        // so '1e5' is parsed as implicit multiplication 1 * e * 5
        // which gives 1 * 2.718... * 5 ≈ 13.59
        // But we still test it doesn't produce 100000
        const result = evaluateExpression('1e5');
        // Parser treats this as 1 * e * 5 via implicit multiply, not 1e5=100000
        if (result.success) {
          expect(result.value).not.toBe(100000);
        }
      });
    });
  });

  describe('New features', () => {
    describe('Modulo operator', () => {
      it('evaluates basic modulo', () => {
        const result = evaluateExpression('10 % 3');
        expect(result.success).toBe(true);
        expect(result.value).toBe(1);
      });

      it('uses positive modulo semantics for negative numbers', () => {
        const result = evaluateExpression('(-7) % 3');
        expect(result.success).toBe(true);
        expect(result.value).toBe(2);
      });
    });

    describe('Implicit multiplication', () => {
      it('handles number followed by constant', () => {
        const result = evaluateExpression('2pi');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(2 * Math.PI);
      });

      it('handles number followed by parenthesized expression', () => {
        const result = evaluateExpression('3(4+1)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(15);
      });

      it('handles adjacent parenthesized expressions', () => {
        const result = evaluateExpression('(2)(3)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(6);
      });
    });

    describe('Unary plus', () => {
      it('handles standalone unary plus', () => {
        const result = evaluateExpression('+5');
        expect(result.success).toBe(true);
        expect(result.value).toBe(5);
      });

      it('handles unary plus in expression', () => {
        const result = evaluateExpression('3 + +4');
        expect(result.success).toBe(true);
        expect(result.value).toBe(7);
      });
    });

    describe('Multi-arg functions', () => {
      it('evaluates min with 2 args', () => {
        const result = evaluateExpression('min(3,7)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(3);
      });

      it('evaluates max with 2 args', () => {
        const result = evaluateExpression('max(3,7)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(7);
      });

      it('evaluates pow with 2 args', () => {
        const result = evaluateExpression('pow(2,10)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(1024);
      });

      it('evaluates clamp with 3 args', () => {
        const result = evaluateExpression('clamp(15,0,10)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(10);
      });

      it('evaluates lerp', () => {
        const result = evaluateExpression('lerp(0,100,0.5)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(50);
      });

      it('evaluates smoothstep', () => {
        const result = evaluateExpression('smoothstep(0,1,0.5)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(0.5);
      });

      it('evaluates mix (GLSL alias for lerp)', () => {
        const result = evaluateExpression('mix(0,100,0.5)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(50);
      });

      it('evaluates hypot', () => {
        const result = evaluateExpression('hypot(3,4)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(5);
      });

      it('evaluates mod', () => {
        const result = evaluateExpression('mod(7,3)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(1);
      });

      it('evaluates atan2', () => {
        const result = evaluateExpression('atan2(1,1)');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(Math.PI / 4);
      });
    });

    describe('New 1-arg functions', () => {
      it('evaluates trunc', () => {
        const result = evaluateExpression('trunc(3.7)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(3);
      });

      it('evaluates fract', () => {
        const result = evaluateExpression('fract(3.7)');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(0.7);
      });

      it('evaluates deg', () => {
        const result = evaluateExpression('deg(pi)');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(180);
      });

      it('evaluates rad', () => {
        const result = evaluateExpression('rad(180)');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(Math.PI);
      });

      it('evaluates sinh', () => {
        const result = evaluateExpression('sinh(0)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(0);
      });

      it('evaluates ln', () => {
        const result = evaluateExpression('ln(1)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(0);
      });

      it('evaluates exp2', () => {
        const result = evaluateExpression('exp2(3)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(8);
      });
    });

    describe('inf constant', () => {
      it('recognizes inf as Infinity (results in error — not finite)', () => {
        const result = evaluateExpression('inf');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'Expression does not evaluate to a finite number'
        );
      });

      it('is detected by isExpression', () => {
        expect(isExpression('inf')).toBe(true);
      });
    });

    describe('Context-aware comma handling', () => {
      it('treats comma as decimal separator outside parens', () => {
        const result = evaluateExpression('3,14 + 2,86');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(6);
      });

      it('treats comma as argument separator inside function parens', () => {
        const result = evaluateExpression('min(3,7)');
        expect(result.success).toBe(true);
        expect(result.value).toBe(3);
      });
    });
  });
});
