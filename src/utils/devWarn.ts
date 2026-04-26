'use client';

/**
 * Whether the current build is a development build.
 *
 * Resolves to `true` in Vite/Vitest/Storybook dev mode, `false` in production
 * builds, and `false` (silent) in environments where `import.meta.env` is not
 * defined (e.g. consumer apps using Webpack without an env shim).
 */
const isDev: boolean = Boolean(
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV
);

/**
 * Log a warning, but only in development builds. No-op in production.
 *
 * Use this for developer-facing warnings (a11y issues, controlled/uncontrolled
 * switches, missing required props, etc.). Logging in production leaks noise
 * into consumer applications and is treated as a bug in this library.
 */
export function devWarn(...args: unknown[]): void {
  if (isDev) {
    console.warn(...args);
  }
}

/**
 * Log an error, but only in development builds. No-op in production.
 *
 * Use this for non-fatal errors that the consumer should hear about during
 * development (parse failures, recoverable invariant breaks). For fatal errors
 * throw an `Error` instead.
 */
export function devError(...args: unknown[]): void {
  if (isDev) {
    console.error(...args);
  }
}
