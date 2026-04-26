import { describe, expect, it } from 'vitest';
import { darkThemeValues } from './darkTheme.css';
import { lightThemeValues, lightThemeClass } from './lightTheme.css';
import { createLightTheme } from './createLightTheme';

const sortedKeys = (obj: Record<string, unknown>): string[] =>
  Object.keys(obj).sort();

const deepKeyShape = (value: unknown): unknown => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    sortedKeys(record).map(key => [key, deepKeyShape(record[key])])
  );
};

describe('lightThemeValues', () => {
  it('has the same nested key shape as darkThemeValues', () => {
    expect(deepKeyShape(lightThemeValues)).toStrictEqual(
      deepKeyShape(darkThemeValues)
    );
  });

  it('shares structural tokens (spacing) verbatim with darkThemeValues', () => {
    expect(lightThemeValues.spacing).toStrictEqual(darkThemeValues.spacing);
  });

  it('shares structural tokens (typography) verbatim with darkThemeValues', () => {
    expect(lightThemeValues.typography).toStrictEqual(
      darkThemeValues.typography
    );
  });

  it('shares structural tokens (borderRadius) verbatim with darkThemeValues', () => {
    expect(lightThemeValues.borderRadius).toStrictEqual(
      darkThemeValues.borderRadius
    );
  });

  it('shares structural tokens (transitions) verbatim with darkThemeValues', () => {
    expect(lightThemeValues.transitions).toStrictEqual(
      darkThemeValues.transitions
    );
  });

  it('shares structural tokens (zIndex) verbatim with darkThemeValues', () => {
    expect(lightThemeValues.zIndex).toStrictEqual(darkThemeValues.zIndex);
  });

  it('flips background.primary to white', () => {
    expect(lightThemeValues.colors.background.primary).toBe('#ffffff');
  });

  it('flips text.primary to near-black', () => {
    expect(lightThemeValues.colors.text.primary).toBe('#1a1a1a');
  });
});

describe('createLightTheme', () => {
  it('returns a non-empty CSS class string', () => {
    const className = createLightTheme();
    expect(typeof className).toBe('string');
    expect(className.length).toBeGreaterThan(0);
  });

  it('returns the same class as the directly-imported lightThemeClass', () => {
    expect(createLightTheme()).toBe(lightThemeClass);
  });
});
