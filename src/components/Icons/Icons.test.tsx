// src/components/Icons/Icons.test.tsx
import { screen } from '@testing-library/react';

import { renderWithTheme, styleAssertions } from '@/tests/testUtils';

import { CameraIcon } from './CameraIcon';
import { CubeIcon } from './CubeIcon';
import { OrbitIcon } from './OrbitIcon';
import { RotateIcon } from './RotateIcon';
import { SpinIcon } from './SpinIcon';
import { ZoomFitIcon } from './ZoomFitIcon';

import type { IconProps } from '@/components/primitives/Icon';
import type { ComponentType } from 'react';

/**
 * Test suite for the viewport / 3D icon glyphs (task H1).
 *
 * Each icon is a thin `Icon` wrapper, so the contract under test is:
 * it renders an `<svg>` with SVG geometry and forwards `IconProps`
 * (size, color, className, decorative, testId) to the underlying `Icon`.
 */
const NEW_ICONS: ReadonlyArray<{
  name: string;
  Component: ComponentType<Omit<IconProps, 'children'>>;
}> = [
  { name: 'OrbitIcon', Component: OrbitIcon },
  { name: 'RotateIcon', Component: RotateIcon },
  { name: 'SpinIcon', Component: SpinIcon },
  { name: 'CameraIcon', Component: CameraIcon },
  { name: 'CubeIcon', Component: CubeIcon },
  { name: 'ZoomFitIcon', Component: ZoomFitIcon },
];

describe('Viewport / 3D icons', () => {
  describe('Rendering', () => {
    it.each(NEW_ICONS)(
      '$name renders an <svg> with the standard 24x24 viewBox and geometry',
      ({ Component }) => {
        renderWithTheme(<Component testId="icon" />);

        const icon = screen.getByTestId('icon');
        expect(icon).toBeInTheDocument();
        expect(icon.tagName).toBe('svg');
        expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
        expect(icon).toHaveAttribute('fill', 'none');

        // Each glyph draws at least one SVG primitive.
        expect(
          icon.querySelector('path, circle, rect, line, polyline')
        ).toBeInTheDocument();
      }
    );

    it('has a stable displayName for every icon', () => {
      for (const { name, Component } of NEW_ICONS) {
        expect(Component.displayName).toBe(name);
      }
    });
  });

  describe('Forwards IconProps', () => {
    it.each(NEW_ICONS)('$name applies a custom pixel size', ({ Component }) => {
      renderWithTheme(<Component testId="icon" size="lg" />);

      // lg maps to 20px through the Icon recipe.
      styleAssertions.expectDimensions(
        screen.getByTestId('icon'),
        '20px',
        '20px'
      );
    });

    it.each(NEW_ICONS)('$name forwards className', ({ Component }) => {
      renderWithTheme(<Component testId="icon" className="custom-class" />);

      expect(screen.getByTestId('icon')).toHaveClass('custom-class');
    });

    it.each(NEW_ICONS)(
      '$name applies a numeric size as a pixel value',
      ({ Component }) => {
        renderWithTheme(<Component testId="icon" size={28} />);

        const style = screen.getByTestId('icon').getAttribute('style') ?? '';
        expect(style).toContain('width: 28px');
        expect(style).toContain('height: 28px');
      }
    );

    it.each(NEW_ICONS)(
      '$name renders without throwing for every standard color',
      ({ Component }) => {
        const colors = [
          'primary',
          'secondary',
          'muted',
          'accent',
          'success',
          'warning',
          'error',
        ] as const;

        for (const color of colors) {
          const { unmount } = renderWithTheme(
            <Component testId="icon" color={color} />
          );
          expect(screen.getByTestId('icon')).toBeInTheDocument();
          unmount();
        }
      }
    );
  });

  describe('Accessibility', () => {
    it.each(NEW_ICONS)(
      '$name is presentational and aria-hidden when decorative',
      ({ Component }) => {
        renderWithTheme(<Component testId="icon" decorative />);

        const icon = screen.getByTestId('icon');
        expect(icon).toHaveAttribute('role', 'presentation');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      }
    );

    it.each(NEW_ICONS)(
      '$name exposes an accessible name via the title prop',
      ({ name, Component }) => {
        renderWithTheme(<Component testId="icon" title={name} />);

        const icon = screen.getByTestId('icon');
        expect(icon).toHaveAttribute('role', 'img');
        expect(icon).toHaveAccessibleName(name);
      }
    );
  });
});
