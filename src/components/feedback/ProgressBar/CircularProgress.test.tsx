import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { CircularProgress } from './CircularProgress';

describe('CircularProgress', () => {
  describe('Rendering', () => {
    it('renders with role="progressbar"', () => {
      renderWithTheme(<CircularProgress value={0} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders an SVG with default 24px diameter (size="md")', () => {
      renderWithTheme(<CircularProgress value={0} testId="cp" />);
      const root = screen.getByTestId('cp');
      const svg = root.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('width')).toBe('24');
      expect(svg?.getAttribute('height')).toBe('24');
    });

    it('applies each size diameter', () => {
      const sizes = [
        ['xs', '16'],
        ['sm', '20'],
        ['md', '24'],
        ['lg', '32'],
        ['xl', '48'],
      ] as const;
      for (const [size, expected] of sizes) {
        const { unmount } = renderWithTheme(
          <CircularProgress value={50} size={size} testId="cp" />
        );
        const svg = screen.getByTestId('cp').querySelector('svg');
        expect(svg?.getAttribute('width')).toBe(expected);
        unmount();
      }
    });
  });

  describe('Progress math', () => {
    it('translates value=50 into half-circle dashoffset', () => {
      renderWithTheme(<CircularProgress value={50} size="md" testId="cp" />);
      const circles = screen.getByTestId('cp').querySelectorAll('circle');
      const fill = circles[1] as SVGCircleElement;
      const dashArray = Number(fill.getAttribute('stroke-dasharray'));
      const dashOffset = Number(fill.getAttribute('stroke-dashoffset'));
      expect(dashArray).toBeGreaterThan(0);
      expect(dashOffset).toBeCloseTo(dashArray / 2, 1);
    });

    it('value=100 → dashoffset = 0', () => {
      renderWithTheme(<CircularProgress value={100} testId="cp" />);
      const fill = screen
        .getByTestId('cp')
        .querySelectorAll('circle')[1] as SVGCircleElement;
      expect(Number(fill.getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 1);
    });

    it('value=0 → dashoffset = circumference (no fill)', () => {
      renderWithTheme(<CircularProgress value={0} testId="cp" />);
      const fill = screen
        .getByTestId('cp')
        .querySelectorAll('circle')[1] as SVGCircleElement;
      const dashArray = Number(fill.getAttribute('stroke-dasharray'));
      const dashOffset = Number(fill.getAttribute('stroke-dashoffset'));
      expect(dashOffset).toBeCloseTo(dashArray, 1);
    });

    it('clamps value above max', () => {
      renderWithTheme(<CircularProgress value={200} max={100} testId="cp" />);
      const fill = screen
        .getByTestId('cp')
        .querySelectorAll('circle')[1] as SVGCircleElement;
      expect(Number(fill.getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 1);
    });
  });

  describe('Thickness', () => {
    it('uses default thickness derived from size', () => {
      renderWithTheme(<CircularProgress value={50} size="md" testId="cp" />);
      const fill = screen
        .getByTestId('cp')
        .querySelectorAll('circle')[1] as SVGCircleElement;
      expect(fill.getAttribute('stroke-width')).toBe('2');
    });

    it('honors a custom thickness prop', () => {
      renderWithTheme(
        <CircularProgress value={50} thickness={5} testId="cp" />
      );
      const fill = screen
        .getByTestId('cp')
        .querySelectorAll('circle')[1] as SVGCircleElement;
      expect(fill.getAttribute('stroke-width')).toBe('5');
    });
  });

  describe('Indeterminate', () => {
    it('omits aria-valuenow when value is undefined', () => {
      renderWithTheme(<CircularProgress testId="cp" />);
      expect(screen.getByTestId('cp')).not.toHaveAttribute('aria-valuenow');
    });

    it('marks data-indeterminate', () => {
      renderWithTheme(<CircularProgress testId="cp" />);
      expect(screen.getByTestId('cp')).toHaveAttribute(
        'data-indeterminate',
        'true'
      );
    });
  });

  describe('Labels', () => {
    it('does not render label by default', () => {
      renderWithTheme(<CircularProgress value={42} />);
      expect(screen.queryByText('42%')).not.toBeInTheDocument();
    });

    it('renders centered percentage when showLabel is true', () => {
      renderWithTheme(<CircularProgress value={42} size="xl" showLabel />);
      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('custom label overrides the percentage', () => {
      renderWithTheme(
        <CircularProgress value={42} size="xl" showLabel label="42/100" />
      );
      expect(screen.getByText('42/100')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('aria-valuenow reflects clamped value, not the raw input', () => {
      renderWithTheme(<CircularProgress value={200} max={100} testId="cp" />);
      expect(screen.getByTestId('cp')).toHaveAttribute('aria-valuenow', '100');
    });

    it('exposes ariaValueText via aria-valuetext', () => {
      renderWithTheme(
        <CircularProgress
          value={45}
          max={120}
          ariaValueText="Exporting frame 45 of 120"
          testId="cp"
        />
      );
      expect(screen.getByTestId('cp')).toHaveAttribute(
        'aria-valuetext',
        'Exporting frame 45 of 120'
      );
    });

    it('falls back to a string label as aria-valuetext', () => {
      renderWithTheme(
        <CircularProgress
          value={42}
          size="xl"
          showLabel
          label="42/100"
          testId="cp"
        />
      );
      expect(screen.getByTestId('cp')).toHaveAttribute(
        'aria-valuetext',
        '42/100'
      );
    });

    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithTheme(<CircularProgress value={0} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
