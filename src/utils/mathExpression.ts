/**
 * Safe mathematical expression parser using recursive descent.
 *
 * Computes math expressions using a hand-written tokenizer and parser.
 * No dynamic code generation is used — the parser only understands
 * numbers, operators, constants, and allow-listed math functions.
 *
 * Supports:
 * - Arithmetic: `+`, `-`, `*`, `/`, `**`, `%`
 * - Grouping: `(`, `)`
 * - Unary minus: `-5`, `-(3+2)`
 * - Implicit multiplication: `2pi`, `3(4+1)`, `(2)(3)`
 * - Constants: `pi`, `e`, `tau`, `phi`, `inf`
 * - Functions (1-arg): `sin`, `cos`, `tan`, `asin`, `acos`, `atan`,
 *   `log`, `log10`, `log2`, `ln`, `exp`, `sqrt`, `cbrt`,
 *   `floor`, `ceil`, `round`, `trunc`, `abs`, `sign`,
 *   `deg`, `rad`, `fract`
 * - Functions (2-arg): `min`, `max`, `pow`, `atan2`, `mod`, `hypot`
 * - Functions (3-arg): `clamp`, `lerp`, `smoothstep`
 * - Alternative notations: `×` → `*`, `÷` → `/`, `^` → `**`, `,` → `.` (decimal)
 *
 * @module mathExpression
 */

// ─────────────────────────────────────────────────────────────────
// Result type
// ─────────────────────────────────────────────────────────────────

export interface EvaluationResult {
  success: boolean;
  value?: number;
  error?: string;
  expression: string;
}

// ─────────────────────────────────────────────────────────────────
// Constants & Functions registry
// ─────────────────────────────────────────────────────────────────

const MATH_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
  phi: (1 + Math.sqrt(5)) / 2,
  inf: Infinity,
};

const FUNCTIONS_1: Record<string, (a: number) => number> = {
  // Trigonometric
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  asinh: Math.asinh,
  acosh: Math.acosh,
  atanh: Math.atanh,

  // Logarithmic & exponential
  log: Math.log,
  ln: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  exp: Math.exp,
  exp2: (x: number) => 2 ** x,

  // Power & root
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,

  // Rounding
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  trunc: Math.trunc,

  // Other
  abs: Math.abs,
  sign: Math.sign,
  fract: (x: number) => x - Math.floor(x),

  // Unit conversion
  deg: (radians: number) => (radians * 180) / Math.PI,
  rad: (degrees: number) => (degrees * Math.PI) / 180,
};

const FUNCTIONS_2: Record<string, (a: number, b: number) => number> = {
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  atan2: Math.atan2,
  mod: (a: number, b: number) => ((a % b) + b) % b,
  hypot: Math.hypot,
};

const FUNCTIONS_3: Record<string, (a: number, b: number, c: number) => number> =
  {
    clamp: (val: number, lo: number, hi: number) =>
      Math.min(Math.max(val, lo), hi),
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
    smoothstep: (edge0: number, edge1: number, x: number) => {
      const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
      return t * t * (3 - 2 * t);
    },
    mix: (a: number, b: number, t: number) => a + (b - a) * t,
  };

const FUNCTION_ARITY: Record<string, number> = {};
for (const name of Object.keys(FUNCTIONS_1)) FUNCTION_ARITY[name] = 1;
for (const name of Object.keys(FUNCTIONS_2)) FUNCTION_ARITY[name] = 2;
for (const name of Object.keys(FUNCTIONS_3)) FUNCTION_ARITY[name] = 3;

// ─────────────────────────────────────────────────────────────────
// Tokenizer
// ─────────────────────────────────────────────────────────────────

const enum TokenType {
  Number,
  Ident,
  Op,
  LParen,
  RParen,
  Comma,
  End,
}

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

function isDigit(ch: string | undefined): boolean {
  return ch !== undefined && ch >= '0' && ch <= '9';
}

function isAlpha(ch: string | undefined): boolean {
  return (
    ch !== undefined &&
    ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_')
  );
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }

    // Number: 123, 3.14, .5
    if (isDigit(ch) || (ch === '.' && isDigit(input[i + 1]))) {
      const start = i;
      while (isDigit(input[i])) i++;
      if (input[i] === '.' && isDigit(input[i + 1])) {
        i++;
        while (isDigit(input[i])) i++;
      } else if (input[i] === '.' && !isAlpha(input[i + 1])) {
        i++;
      }
      tokens.push({
        type: TokenType.Number,
        value: input.slice(start, i),
        pos: start,
      });
      continue;
    }

    // Identifier
    if (isAlpha(ch)) {
      const start = i;
      while (isAlpha(input[i]) || isDigit(input[i])) i++;
      tokens.push({
        type: TokenType.Ident,
        value: input.slice(start, i),
        pos: start,
      });
      continue;
    }

    // ** (before single *)
    if (ch === '*' && input[i + 1] === '*') {
      tokens.push({ type: TokenType.Op, value: '**', pos: i });
      i += 2;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%') {
      tokens.push({ type: TokenType.Op, value: ch, pos: i });
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: TokenType.LParen, value: '(', pos: i });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: TokenType.RParen, value: ')', pos: i });
      i++;
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: TokenType.Comma, value: ',', pos: i });
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${ch}' at position ${i}`);
  }

  tokens.push({ type: TokenType.End, value: '', pos: i });
  return tokens;
}

// ─────────────────────────────────────────────────────────────────
// Parser — recursive descent, evaluates during parsing
// ─────────────────────────────────────────────────────────────────

let _tokens: Token[] = [];
let _pos = 0;

function peek(): Token {
  // _tokens always ends with an End token, so _pos is always valid
  const t = _tokens[_pos];
  if (t === undefined) {
    return { type: TokenType.End, value: '', pos: _pos };
  }
  return t;
}

function advance(): Token {
  const t = peek();
  _pos++;
  return t;
}

function expect(type: TokenType, label: string): Token {
  const t = advance();
  if (t.type !== type) {
    throw new Error(
      `Expected ${label}, got '${t.value || 'end of input'}' at position ${t.pos}`
    );
  }
  return t;
}

function parseExpression(): number {
  let left = parseTerm();

  while (
    peek().type === TokenType.Op &&
    (peek().value === '+' || peek().value === '-')
  ) {
    const op = advance().value;
    const right = parseTerm();
    left = op === '+' ? left + right : left - right;
  }

  return left;
}

function parseTerm(): number {
  let left = parsePower();

  while (
    peek().type === TokenType.Op &&
    (peek().value === '*' || peek().value === '/' || peek().value === '%')
  ) {
    const op = advance().value;
    const right = parsePower();
    if (op === '*') left *= right;
    else if (op === '/') left /= right;
    else left = ((left % right) + right) % right;
  }

  return left;
}

function parsePower(): number {
  const base = parseUnary();

  if (peek().type === TokenType.Op && peek().value === '**') {
    advance();
    const exp = parsePower();
    return Math.pow(base, exp);
  }

  return base;
}

function parseUnary(): number {
  if (peek().type === TokenType.Op && peek().value === '-') {
    advance();
    return -parseUnary();
  }
  if (peek().type === TokenType.Op && peek().value === '+') {
    advance();
    return parseUnary();
  }
  return parsePostfix();
}

function parsePostfix(): number {
  let left = parseCall();

  while (canImplicitMultiply()) {
    const right = parseCall();
    left *= right;
  }

  return left;
}

function canImplicitMultiply(): boolean {
  const t = peek();
  if (t.type === TokenType.LParen) return true;
  if (t.type === TokenType.Number) return true;
  if (t.type === TokenType.Ident) {
    return t.value in MATH_CONSTANTS || t.value in FUNCTION_ARITY;
  }
  return false;
}

function parseCall(): number {
  if (
    peek().type === TokenType.Ident &&
    peek().value in FUNCTION_ARITY &&
    _tokens[_pos + 1]?.type === TokenType.LParen
  ) {
    const name = advance().value;
    const arity = FUNCTION_ARITY[name] ?? 1;
    advance(); // consume '('

    const args: number[] = [parseExpression()];
    while (peek().type === TokenType.Comma && args.length < arity) {
      advance();
      args.push(parseExpression());
    }

    expect(TokenType.RParen, `')' after ${name}() arguments`);

    const a0 = args[0] ?? 0;
    const a1 = args[1] ?? 0;
    const a2 = args[2] ?? 0;

    if (arity === 1 && args.length === 1) {
      const fn = FUNCTIONS_1[name];
      if (fn) return fn(a0);
    }
    if (arity === 2) {
      if (args.length === 1) {
        const fn1 = FUNCTIONS_1[name];
        if (fn1) return fn1(a0);
      }
      if (args.length !== 2) {
        throw new Error(`${name}() expects 2 arguments, got ${args.length}`);
      }
      const fn2 = FUNCTIONS_2[name];
      if (fn2) return fn2(a0, a1);
    }
    if (arity === 3) {
      if (args.length !== 3) {
        throw new Error(`${name}() expects 3 arguments, got ${args.length}`);
      }
      const fn3 = FUNCTIONS_3[name];
      if (fn3) return fn3(a0, a1, a2);
    }

    throw new Error(`Unknown function: ${name}`);
  }

  return parsePrimary();
}

function parsePrimary(): number {
  const t = peek();

  if (t.type === TokenType.Number) {
    advance();
    return parseFloat(t.value);
  }

  if (t.type === TokenType.Ident) {
    if (t.value in MATH_CONSTANTS) {
      advance();
      return MATH_CONSTANTS[t.value] ?? 0;
    }
    throw new Error(`Unknown identifier '${t.value}' at position ${t.pos}`);
  }

  if (t.type === TokenType.LParen) {
    advance();
    const result = parseExpression();
    expect(TokenType.RParen, "')'");
    return result;
  }

  throw new Error(
    `Unexpected ${t.value ? `'${t.value}'` : 'end of input'} at position ${t.pos}`
  );
}

// ─────────────────────────────────────────────────────────────────
// Input sanitization (pre-tokenizer normalization)
// ─────────────────────────────────────────────────────────────────

const MAX_EXPRESSION_LENGTH = 200;

function sanitize(expression: string): string {
  let result = expression;
  result = result.replace(/×/g, '*');
  result = result.replace(/÷/g, '/');
  result = result.replace(/\^/g, '**');

  // Context-aware comma handling:
  // Inside parens → keep as comma (argument separator)
  // Outside parens → convert to dot (European decimal notation)
  let depth = 0;
  let sanitized = '';
  for (const ch of result) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth <= 0) {
      sanitized += '.';
    } else {
      sanitized += ch;
    }
  }

  return sanitized;
}

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

export function evaluateExpression(expression: string): EvaluationResult {
  const original = expression;

  try {
    if (!expression?.trim()) {
      return {
        success: false,
        error: 'Expression cannot be empty',
        expression: original,
      };
    }

    if (expression.length > MAX_EXPRESSION_LENGTH) {
      return {
        success: false,
        error: `Expression is too long (max ${MAX_EXPRESSION_LENGTH} characters)`,
        expression: original,
      };
    }

    const sanitized = sanitize(expression);
    _tokens = tokenize(sanitized);
    _pos = 0;

    const value = parseExpression();

    if (peek().type !== TokenType.End) {
      throw new Error(`Unexpected '${peek().value}' at position ${peek().pos}`);
    }

    if (typeof value !== 'number' || !isFinite(value)) {
      return {
        success: false,
        error: 'Expression does not evaluate to a finite number',
        expression: original,
      };
    }

    return { success: true, value, expression: original };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown evaluation error',
      expression: original,
    };
  }
}

export function isExpression(input: string): boolean {
  const trimmed = input.trim();

  if (/[+\-*/^×÷%()]/.test(trimmed)) {
    return true;
  }

  const fnNames = Object.keys(FUNCTION_ARITY);
  const fnPattern = new RegExp(`\\b(${fnNames.join('|')})\\(`);
  if (fnPattern.test(trimmed)) {
    return true;
  }

  const constNames = Object.keys(MATH_CONSTANTS);
  const constPattern = new RegExp(`\\b(${constNames.join('|')})\\b`);
  if (constPattern.test(trimmed)) {
    return true;
  }

  return false;
}

export function parseNumericInput(input: string): EvaluationResult {
  const trimmed = input.trim();

  const directNumber = parseFloat(trimmed);
  if (
    !isNaN(directNumber) &&
    isFinite(directNumber) &&
    trimmed === directNumber.toString()
  ) {
    return { success: true, value: directNumber, expression: input };
  }

  return evaluateExpression(input);
}

export const AVAILABLE_CONSTANTS = Object.keys(MATH_CONSTANTS);
export const AVAILABLE_FUNCTIONS = Object.keys(FUNCTION_ARITY);
