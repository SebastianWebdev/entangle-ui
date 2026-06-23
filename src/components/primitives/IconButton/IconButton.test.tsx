import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { IconButton } from './IconButton';

describe('IconButton', () => {
  describe('Rendering', () => {
    it('renders a glyph passed as children', () => {
      renderWithTheme(
        <IconButton aria-label="Save">
          <span data-testid="glyph">x</span>
        </IconButton>
      );
      expect(screen.getByTestId('glyph')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders a glyph passed via the icon prop (Button-parity API)', () => {
      renderWithTheme(
        <IconButton
          aria-label="Save"
          icon={<span data-testid="glyph">x</span>}
        />
      );
      expect(screen.getByTestId('glyph')).toBeInTheDocument();
    });

    it('prefers the icon prop over children when both are provided', () => {
      renderWithTheme(
        <IconButton aria-label="Save" icon={<span data-testid="from-icon" />}>
          <span data-testid="from-children" />
        </IconButton>
      );
      expect(screen.getByTestId('from-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('from-children')).not.toBeInTheDocument();
    });

    it('shows a spinner instead of the glyph while loading', () => {
      renderWithTheme(
        <IconButton
          aria-label="Save"
          loading
          icon={<span data-testid="glyph" />}
        />
      );
      expect(screen.queryByTestId('glyph')).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      renderWithTheme(
        <IconButton aria-label="Save" icon={<span />} onClick={onClick} />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      renderWithTheme(
        <IconButton
          aria-label="Save"
          icon={<span />}
          disabled
          onClick={onClick}
        />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('exposes the aria-label and reflects pressed state', () => {
      renderWithTheme(
        <IconButton aria-label="Toggle" pressed icon={<span />} />
      );
      const btn = screen.getByRole('button', { name: 'Toggle' });
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
