import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('renders title and description', () => {
      renderWithTheme(
        <EmptyState title="No results" description="Try a different query" />
      );
      expect(screen.getByText('No results')).toBeInTheDocument();
      expect(screen.getByText('Try a different query')).toBeInTheDocument();
    });

    it('renders the icon slot', () => {
      renderWithTheme(
        <EmptyState icon={<svg data-testid="icon" />} title="No results" />
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders the action slot', () => {
      renderWithTheme(
        <EmptyState title="Empty" action={<button>Reset</button>} />
      );
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    });
  });

  describe('Loading', () => {
    it('renders a Spinner in place of the icon when loading', () => {
      renderWithTheme(
        <EmptyState loading icon={<svg data-testid="icon" />} title="Loading" />
      );
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      // Both the root and the inner Spinner are role="status"
      expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    });

    it('marks the root with role="status" when loading', () => {
      renderWithTheme(<EmptyState loading testId="root" title="Loading" />);
      expect(screen.getByTestId('root')).toHaveAttribute('role', 'status');
    });
  });

  describe('Variants', () => {
    it('compact variant renders without error', () => {
      renderWithTheme(
        <EmptyState variant="compact" title="Empty" testId="root" />
      );
      expect(screen.getByTestId('root')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithTheme(<EmptyState ref={ref} title="Empty" />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
