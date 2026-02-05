// src/utils/mathExpression.ts

/**
 * Result of mathematical expression evaluation
 */
export interface EvaluationResult {
  /**
   * Whether the evaluation was successful
   */
  success: boolean;

  /**
   * The computed numerical result (only when success is true)
   */
  value?: number;

  /**
   * Error message if evaluation failed
   */
  error?: string;

  /**
   * The original expression that was evaluated
   */
  expression: string;
}

/**
 * Blocked identifiers that must be rejected before evaluation.
 * Defense-in-depth layer to prevent prototype pollution or code execution
 * via dangerous JavaScript identifiers that pass character validation.
 */
const BLOCKED_IDENTIFIERS: ReadonlySet<string> = new Set([
  'constructor',
  'prototype',
  '__proto__',
  'this',
  'self',
  'window',
  'document',
  'globalThis',
  'process',
  'require',
  'import',
  'module',
  'exports',
  'eval',
  'Function',
  'Object',
  'Array',
  'Reflect',
  'Proxy',
  'Symbol',
]);

/**
 * Mathematical constants available in expressions
 */
const MATH_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: 2 * Math.PI,
  phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
};

/**
 * Mathematical functions available in expressions
 */
const MATH_FUNCTIONS: Record<string, (x: number) => number> = {
  // Trigonometric functions
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,

  // Logarithmic and exponential
  log: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  exp: Math.exp,

  // Power and root functions
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,

  // Rounding functions
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,

  // Other useful functions
  abs: Math.abs,
  sign: Math.sign,
};

/**
 * Sanitizes mathematical expression by removing dangerous patterns
 * and normalizing the input for safe evaluation.
 */
function sanitizeExpression(expression: string): string {
  // Remove whitespace
  let sanitized = expression.replace(/\s+/g, '');

  // Convert common alternative notations
  sanitized = sanitized.replace(/×/g, '*'); // Multiplication symbol
  sanitized = sanitized.replace(/÷/g, '/'); // Division symbol
  sanitized = sanitized.replace(/\^/g, '**'); // Power operator

  // Ensure proper decimal notation
  sanitized = sanitized.replace(/,/g, '.'); // European decimal notation

  return sanitized;
}

/**
 * Validates that expression contains only allowed characters and patterns
 */
function isValidExpression(expression: string): boolean {
  // Allow numbers, operators, parentheses, dots, and known constants/functions
  const allowedPattern = /^[0-9+\-*/().a-zA-Z_]+$/;

  if (!allowedPattern.test(expression)) {
    return false;
  }

  // Check for balanced parentheses
  let depth = 0;
  for (const char of expression) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (depth < 0) return false;
  }

  return depth === 0;
}

/**
 * Checks whether the expression contains any blocked identifiers or
 * unknown alphabetic tokens. All word tokens must be either a known
 * constant, a known function name, or part of "Math" (introduced by
 * replaceConstantsAndFunctions). Any unrecognized identifier is rejected.
 */
function containsBlockedIdentifiers(expression: string): boolean {
  const wordTokens = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
  if (!wordTokens) return false;

  const allowedTokens = new Set([
    ...Object.keys(MATH_CONSTANTS),
    ...Object.keys(MATH_FUNCTIONS),
  ]);

  for (const token of wordTokens) {
    if (BLOCKED_IDENTIFIERS.has(token)) return true;
    if (!allowedTokens.has(token)) return true;
  }

  return false;
}

/**
 * Replaces mathematical constants and functions in the expression
 * with their JavaScript equivalents for safe evaluation.
 */
function replaceConstantsAndFunctions(expression: string): string {
  let result = expression;

  // Replace constants
  Object.entries(MATH_CONSTANTS).forEach(([name, value]) => {
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    result = result.replace(regex, value.toString());
  });

  // Replace functions
  Object.entries(MATH_FUNCTIONS).forEach(([name]) => {
    const regex = new RegExp(`\\b${name}\\(`, 'g');
    result = result.replace(regex, `Math.${name}(`);
  });

  return result;
}

/**
 * Safely evaluates a mathematical expression using Function constructor
 * instead of eval() for better security.
 */

function safeEvaluate(expression: string): number {
  // Create a function that returns the expression result
  // This is safer than eval() as it doesn't have access to the scope

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const func = new Function('Math', `"use strict"; return (${expression});`);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return func(Math) as number;
}

/**
 * Evaluates a mathematical expression and returns the result.
 *
 * Supports:
 * - Basic arithmetic: +, -, *, /, **, ()
 * - Mathematical constants: pi, e, tau, phi
 * - Mathematical functions: sin, cos, tan, sqrt, log, etc.
 * - Alternative notations: × (multiplication), ÷ (division), ^ (power)
 * - European decimal notation: , instead of .
 *
 * @param expression The mathematical expression to evaluate
 * @returns Evaluation result with success status and value or error
 *
 * @example
 * ```typescript
 * evaluateExpression("3 + 4 * 2") // { success: true, value: 11 }
 * evaluateExpression("sqrt(16)") // { success: true, value: 4 }
 * evaluateExpression("pi * 2") // { success: true, value: 6.283... }
 * evaluateExpression("2 ^ 3") // { success: true, value: 8 }
 * evaluateExpression("invalid") // { success: false, error: "..." }
 * ```
 */
export function evaluateExpression(expression: string): EvaluationResult {
  const originalExpression = expression;

  try {
    // Handle empty or whitespace-only expressions
    if (!expression?.trim()) {
      return {
        success: false,
        error: 'Expression cannot be empty',
        expression: originalExpression,
      };
    }

    // Sanitize the expression
    const sanitized = sanitizeExpression(expression);

    // Validate the expression
    if (!isValidExpression(sanitized)) {
      return {
        success: false,
        error: 'Expression contains invalid characters or syntax',
        expression: originalExpression,
      };
    }

    // Check for blocked or unknown identifiers (defense-in-depth)
    if (containsBlockedIdentifiers(sanitized)) {
      return {
        success: false,
        error: 'Expression contains invalid characters or syntax',
        expression: originalExpression,
      };
    }

    // Replace constants and functions
    const processed = replaceConstantsAndFunctions(sanitized);

    // Evaluate the expression
    const result = safeEvaluate(processed);

    // Check if result is a valid number
    if (typeof result !== 'number' || !isFinite(result)) {
      return {
        success: false,
        error: 'Expression does not evaluate to a valid number',
        expression: originalExpression,
      };
    }

    return {
      success: true,
      value: result,
      expression: originalExpression,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown evaluation error',
      expression: originalExpression,
    };
  }
}

/**
 * Checks if a string looks like a mathematical expression
 * (contains operators, functions, or constants)
 */
export function isExpression(input: string): boolean {
  const trimmed = input.trim();

  // Check for mathematical operators
  if (/[+\-*/^×÷()]/.test(trimmed)) {
    return true;
  }

  // Check for mathematical functions
  const functionNames = Object.keys(MATH_FUNCTIONS);
  const functionRegex = new RegExp(`\\b(${functionNames.join('|')})\\(`, 'i');
  if (functionRegex.test(trimmed)) {
    return true;
  }

  // Check for mathematical constants
  const constantNames = Object.keys(MATH_CONSTANTS);
  const constantRegex = new RegExp(`\\b(${constantNames.join('|')})\\b`, 'i');
  if (constantRegex.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Attempts to parse a string as either a direct number or mathematical expression
 */
export function parseNumericInput(input: string): EvaluationResult {
  const trimmed = input.trim();

  // Try direct number parsing first (more efficient)
  const directNumber = parseFloat(trimmed);
  if (
    !isNaN(directNumber) &&
    isFinite(directNumber) &&
    trimmed === directNumber.toString()
  ) {
    return {
      success: true,
      value: directNumber,
      expression: input,
    };
  }

  // Fall back to expression evaluation
  return evaluateExpression(input);
}

/**
 * Available mathematical constants that can be used in expressions
 */
export const AVAILABLE_CONSTANTS = Object.keys(MATH_CONSTANTS);

/**
 * Available mathematical functions that can be used in expressions
 */
export const AVAILABLE_FUNCTIONS = Object.keys(MATH_FUNCTIONS);
