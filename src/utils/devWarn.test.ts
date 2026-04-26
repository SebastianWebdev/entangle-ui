import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { devError, devWarn } from './devWarn';

describe('devWarn / devError', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  // Vitest sets import.meta.env.DEV = true, so logs should fire in tests.
  // The "silent in production" behavior is enforced by tree-shaking the
  // const branch and cannot be unit-tested without re-importing the module
  // under a different env, which is more brittle than valuable.

  it('forwards args to console.warn in dev', () => {
    devWarn('hello', 1, { a: 2 });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('hello', 1, { a: 2 });
  });

  it('forwards args to console.error in dev', () => {
    const err = new Error('boom');
    devError('failure:', err);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('failure:', err);
  });

  it('handles zero args gracefully', () => {
    devWarn();
    devError();
    expect(warnSpy).toHaveBeenCalledWith();
    expect(errorSpy).toHaveBeenCalledWith();
  });
});
