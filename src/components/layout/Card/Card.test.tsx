import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Card } from './Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children inside a div', () => {
      renderWithTheme(
        <Card testId="card">
          <span>content</span>
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card.tagName).toBe('DIV');
      expect(card).toHaveTextContent('content');
    });

    it('renders a header with title and subtitle', () => {
      renderWithTheme(
        <Card>
          <Card.Header title="Title" subtitle="Subtitle" />
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('renders custom header content over title/subtitle when children given', () => {
      renderWithTheme(
        <Card>
          <Card.Header title="Title">
            <span>custom</span>
          </Card.Header>
        </Card>
      );
      expect(screen.queryByText('Title')).not.toBeInTheDocument();
      expect(screen.getByText('custom')).toBeInTheDocument();
    });

    it('renders Media with an image when src is provided', () => {
      renderWithTheme(
        <Card>
          <Card.Media src="/preview.png" alt="preview" />
        </Card>
      );
      expect(screen.getByAltText('preview')).toBeInTheDocument();
    });

    it('renders Footer children with the requested alignment', () => {
      renderWithTheme(
        <Card>
          <Card.Footer testId="footer" align="space-between">
            <span>a</span>
            <span>b</span>
          </Card.Footer>
        </Card>
      );
      expect(screen.getByTestId('footer')).toHaveTextContent('a');
    });
  });

  describe('Interactions', () => {
    it('does not have button role when not clickable', () => {
      renderWithTheme(<Card testId="card">x</Card>);
      expect(screen.getByTestId('card')).not.toHaveAttribute('role');
    });

    it('exposes button role and tabIndex=0 when onClick is set', () => {
      renderWithTheme(
        <Card testId="card" onClick={() => {}}>
          x
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('fires onClick when clicked', () => {
      const onClick = vi.fn();
      renderWithTheme(
        <Card testId="card" onClick={onClick}>
          x
        </Card>
      );
      fireEvent.click(screen.getByTestId('card'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('fires onClick on Enter and Space when interactive', () => {
      const onClick = vi.fn();
      renderWithTheme(
        <Card testId="card" onClick={onClick}>
          x
        </Card>
      );
      const card = screen.getByTestId('card');
      fireEvent.keyDown(card, { key: 'Enter' });
      fireEvent.keyDown(card, { key: ' ' });
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('does not invoke onClick when disabled', () => {
      const onClick = vi.fn();
      renderWithTheme(
        <Card testId="card" onClick={onClick} disabled>
          x
        </Card>
      );
      fireEvent.click(screen.getByTestId('card'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('marks aria-disabled when disabled', () => {
      renderWithTheme(
        <Card testId="card" disabled onClick={() => {}}>
          x
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('exposes aria-pressed when interactive and selected', () => {
      renderWithTheme(
        <Card testId="card" onClick={() => {}} selected>
          x
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });
});
