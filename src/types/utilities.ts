// src/types/utilities.ts

/**
 * Makes complex intersection types readable by flattening them
 * @example
 * type Complex = { a: string } & { b: number } & { c: boolean }
 * type Pretty = Prettify<Complex> // { a: string; b: number; c: boolean }
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Allows autocomplete for union values while still accepting any string
 * @example
 * type Colors = LiteralUnion<'red' | 'blue' | 'green', string>
 * // Shows autocomplete for 'red', 'blue', 'green' but accepts any string
 */
export type LiteralUnion<T extends U, U = string> =
  | T
  | (U & Record<never, never>);

/**
 * Makes all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extracts the value type from a record/object
 * @example
 * type Colors = { red: '#ff0000', blue: '#0000ff' }
 * type ColorValue = ValueOf<Colors> // '#ff0000' | '#0000ff'
 */
export type ValueOf<T> = T[keyof T];

/**
 * Creates a union from object keys
 * @example
 * type Sizes = { sm: 1, md: 2, lg: 3 }
 * type SizeKey = KeyOf<Sizes> // 'sm' | 'md' | 'lg'
 */
export type KeyOf<T> = keyof T;

/**
 * Makes specific properties required
 * @example
 * type User = { name?: string; age?: number; email?: string }
 * type UserWithName = RequireFields<User, 'name'> // { name: string; age?: number; email?: string }
 */
export type RequireFields<T, K extends keyof T> = Prettify<
  T & Required<Pick<T, K>>
>;

/**
 * Strict exclude that shows what was excluded
 * @example
 * type Colors = 'red' | 'blue' | 'green'
 * type WarmColors = StrictExclude<Colors, 'blue'> // 'red' | 'green'
 */
export type StrictExclude<T, U extends T> = Exclude<T, U>;

/**
 * Creates a branded type for better type safety
 * @example
 * type UserId = Brand<string, 'UserId'>
 * type ProductId = Brand<string, 'ProductId'>
 * // UserId and ProductId are not assignable to each other
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Recursive readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];
