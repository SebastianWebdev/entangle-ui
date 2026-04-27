import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  describe('Rendering', () => {
    it('renders with role="progressbar"', () => {
      renderWithTheme(<ProgressBar value={0} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders default props (value=0, max=100)', () => {
      renderWithTheme(<ProgressBar value={0} testId="bar" />);
      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('aria-valuenow', '0');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('reflects value/max as 50% fill width', () => {
      renderWithTheme(<ProgressBar value={50} testId="bar" />);
      const bar = screen.getByTestId('bar');
      expect(bar.getAttribute('style')).toContain('50%');
    });

    it('reflects custom min/max correctly (value=10, min=0, max=20 → 50%)', () => {
      renderWithTheme(<ProgressBar value={10} min={0} max={20} testId="bar" />);
      const bar = screen.getByTestId('bar');
      expect(bar.getAttribute('style')).toContain('50%');
    });

    it('clamps value above max (visual + aria-valuenow)', () => {
      renderWithTheme(<ProgressBar value={150} max={100} testId="bar" />);
      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('aria-valuenow', '100');
      expect(bar.getAttribute('style')).toContain('100%');
    });

    it('clamps value below min', () => {
      renderWithTheme(
        <ProgressBar value={-10} min={0} max={100} testId="bar" />
      );
      const bar = screen.getByTestId('bar');
      expect(bar.getAttribute('style')).toContain('0%');
    });
  });

  describe('Indeterminate', () => {
    it('omits aria-valuenow when value is undefined', () => {
      renderWithTheme(<ProgressBar testId="bar" />);
      const bar = screen.getByTestId('bar');
      expect(bar).not.toHaveAttribute('aria-valuenow');
    });

    it('marks the root with data-indeterminate', () => {
      renderWithTheme(<ProgressBar testId="bar" />);
      expect(screen.getByTestId('bar')).toHaveAttribute(
        'data-indeterminate',
        'true'
      );
    });

    it('uses default aria-label "Loading" when indeterminate', () => {
      renderWithTheme(<ProgressBar testId="bar" />);
      expect(screen.getByTestId('bar')).toHaveAttribute(
        'aria-label',
        'Loading'
      );
    });
  });

  describe('Sizes & colors', () => {
    it('applies each size without throwing', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      for (const size of sizes) {
        const { unmount } = renderWithTheme(
          <ProgressBar value={50} size={size} />
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });

    it('applies each named color via CSS var', () => {
      const colors = ['primary', 'success', 'warning', 'error'] as const;
      for (const color of colors) {
        const { unmount } = renderWithTheme(
          <ProgressBar value={50} color={color} testId="bar" />
        );
        const bar = screen.getByTestId('bar');
        expect(bar.getAttribute('style')).toContain('etui-color-accent');
        unmount();
      }
    });

    it('passes through arbitrary CSS color', () => {
      renderWithTheme(<ProgressBar value={50} color="#ff00ff" testId="bar" />);
      const bar = screen.getByTestId('bar');
      expect(bar.getAttribute('style')).toContain('#ff00ff');
    });
  });

  describe('Labels', () => {
    it('does not render any label by default', () => {
      renderWithTheme(<ProgressBar value={42} />);
      expect(screen.queryByText('42%')).not.toBeInTheDocument();
    });

    it('renders inline percentage label when showLabel="inline"', () => {
      renderWithTheme(<ProgressBar value={42} showLabel="inline" />);
      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('renders overlay percentage label when showLabel="overlay"', () => {
      renderWithTheme(<ProgressBar value={42} showLabel="overlay" size="lg" />);
      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('rounds the percentage to a whole number', () => {
      renderWithTheme(<ProgressBar value={42.6} showLabel="inline" />);
      expect(screen.getByText('43%')).toBeInTheDocument();
    });

    it('custom label overrides the percentage', () => {
      renderWithTheme(
        <ProgressBar value={42} showLabel="inline" label="12 / 50 files" />
      );
      expect(screen.getByText('12 / 50 files')).toBeInTheDocument();
      expect(screen.queryByText('42%')).not.toBeInTheDocument();
    });
  });

  describe('Striped & animated', () => {
    it('applies striped styling when striped is true', () => {
      renderWithTheme(<ProgressBar value={50} striped testId="bar" />);
      const bar = screen.getByTestId('bar');
      const fill = bar.querySelector('div > div[aria-hidden]');
      expect(fill?.className).toMatch(/striped/i);
    });

    it('animated has no effect without striped', () => {
      renderWithTheme(<ProgressBar value={50} animated testId="bar" />);
      const bar = screen.getByTestId('bar');
      const fill = bar.querySelector('div > div[aria-hidden]');
      expect(fill?.className).not.toMatch(/animated/i);
    });

    it('animated applies stripe animation when striped is also true', () => {
      renderWithTheme(<ProgressBar value={50} striped animated testId="bar" />);
      const bar = screen.getByTestId('bar');
      const fill = bar.querySelector('div > div[aria-hidden]');
      expect(fill?.className).toMatch(/animated/i);
    });
  });

  describe('Accessibility', () => {
    it('honors a custom aria-label', () => {
      renderWithTheme(<ProgressBar value={50} ariaLabel="Uploading file" />);
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-label',
        'Uploading file'
      );
    });

    it('exposes ariaValueText via aria-valuetext', () => {
      renderWithTheme(
        <ProgressBar
          value={45}
          max={120}
          ariaValueText="Exporting frame 45 of 120"
        />
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuetext',
        'Exporting frame 45 of 120'
      );
    });

    it('falls back to a string label as aria-valuetext', () => {
      renderWithTheme(
        <ProgressBar value={24} max={50} label="12 / 50 files" />
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuetext',
        '12 / 50 files'
      );
    });

    it('omits aria-valuetext when indeterminate', () => {
      renderWithTheme(<ProgressBar />);
      expect(screen.getByRole('progressbar')).not.toHaveAttribute(
        'aria-valuetext'
      );
    });

    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithTheme(<ProgressBar value={0} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
