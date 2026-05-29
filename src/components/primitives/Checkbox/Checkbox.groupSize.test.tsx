import { describe, it, expect } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

/**
 * Regression tests for the `CheckboxGroup` -> `Checkbox` size inheritance.
 *
 * A `Checkbox` rendered inside a `CheckboxGroup` must adopt the group's `size`
 * when it does not set its own `size` prop, mirroring how `disabled` and
 * `error` already inherit. Previously a destructuring default (`size = 'md'`)
 * made the prop never `undefined`, so the group size was silently ignored.
 *
 * The assertions compare the set of rendered class tokens rather than specific
 * hashed Vanilla Extract class names, so they stay stable across style changes.
 */
const classSignature = (html: string): string =>
  [...html.matchAll(/class="([^"]*)"/g)].map(match => match[1] ?? '').join(' ');

describe('Checkbox size inheritance from CheckboxGroup', () => {
  it('adopts the group size when no explicit size prop is set', () => {
    const large = classSignature(
      renderWithTheme(<Checkbox label="large" size="lg" />).container.innerHTML
    );
    const medium = classSignature(
      renderWithTheme(<Checkbox label="medium" />).container.innerHTML
    );
    // Sanity check: size actually changes the rendered output.
    expect(large).not.toBe(medium);

    const grouped = classSignature(
      renderWithTheme(
        <CheckboxGroup size="lg">
          <Checkbox label="grouped" />
        </CheckboxGroup>
      ).container.innerHTML
    );

    for (const token of large.split(' ').filter(Boolean)) {
      expect(grouped).toContain(token);
    }
  });

  it('lets an explicit checkbox size override the group size', () => {
    const small = classSignature(
      renderWithTheme(<Checkbox label="small" size="sm" />).container.innerHTML
    );
    const grouped = classSignature(
      renderWithTheme(
        <CheckboxGroup size="lg">
          <Checkbox label="override" size="sm" />
        </CheckboxGroup>
      ).container.innerHTML
    );

    for (const token of small.split(' ').filter(Boolean)) {
      expect(grouped).toContain(token);
    }
  });
});
