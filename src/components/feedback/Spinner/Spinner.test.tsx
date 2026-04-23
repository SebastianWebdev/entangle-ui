import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('renders with role="status"', () => {
      renderWithTheme(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has default aria-label "Loading..."', () => {
      renderWithTheme(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Loading...'
      );
    });

    it('honors a custom label', () => {
      renderWithTheme(<Spinner label="Saving" />);
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Saving'
      );
    });

    it('shows label visually when showLabel is true', () => {
      renderWithTheme(<Spinner label="Saving" showLabel />);
      const labels = screen.getAllByText('Saving');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('renders ring variant by default', () => {
      renderWithTheme(<Spinner testId="spinner" />);
      const root = screen.getByTestId('spinner');
      expect(root.querySelectorAll('span').length).toBeGreaterThan(0);
    });

    it('renders dots variant with three dots', () => {
      renderWithTheme(<Spinner variant="dots" testId="spinner" />);
      const root = screen.getByTestId('spinner');
      const sizer = root.querySelector(':scope > span[aria-hidden]');
      expect(sizer?.children.length).toBe(3);
    });

    it('renders pulse variant', () => {
      renderWithTheme(<Spinner variant="pulse" testId="spinner" />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  describe('Sizes & colors', () => {
    it('applies each size without throwing', () => {
      const sizes = ['xs', 'sm', 'md', 'lg'] as const;
      for (const size of sizes) {
        const { unmount } = renderWithTheme(<Spinner size={size} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
        unmount();
      }
    });

    it('accepts a raw CSS color', () => {
      renderWithTheme(<Spinner color="#ff00ff" testId="spinner" />);
      const style = screen.getByTestId('spinner').getAttribute('style');
      expect(style).toContain('#ff00ff');
    });
  });

  describe('Accessibility', () => {
    it('forwards ref', () => {
      const ref = React.createRef<HTMLSpanElement>();
      renderWithTheme(<Spinner ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
