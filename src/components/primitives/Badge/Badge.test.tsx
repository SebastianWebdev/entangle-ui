import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders its children', () => {
      renderWithTheme(<Badge>Draft</Badge>);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(<Badge className="my-badge">Tag</Badge>);
      const text = screen.getByText('Tag');
      expect(text.parentElement).toHaveClass('my-badge');
    });

    it('applies data-testid via testId prop', () => {
      renderWithTheme(<Badge testId="status">Done</Badge>);
      expect(screen.getByTestId('status')).toBeInTheDocument();
    });

    it('renders each variant without crashing', () => {
      const variants = ['subtle', 'solid', 'outline', 'dot'] as const;
      for (const variant of variants) {
        const { unmount } = renderWithTheme(
          <Badge variant={variant}>{variant}</Badge>
        );
        expect(screen.getByText(variant)).toBeInTheDocument();
        unmount();
      }
    });

    it('renders each size without crashing', () => {
      const sizes = ['xs', 'sm', 'md', 'lg'] as const;
      for (const size of sizes) {
        const { unmount } = renderWithTheme(<Badge size={size}>{size}</Badge>);
        expect(screen.getByText(size)).toBeInTheDocument();
        unmount();
      }
    });

    it('renders the leading icon slot', () => {
      renderWithTheme(
        <Badge icon={<svg data-testid="leading" />}>Active</Badge>
      );
      expect(screen.getByTestId('leading')).toBeInTheDocument();
    });

    it('uppercase sets textTransform', () => {
      renderWithTheme(
        <Badge uppercase testId="badge">
          tag
        </Badge>
      );
      const style = window.getComputedStyle(screen.getByTestId('badge'));
      expect(style.textTransform).toBe('uppercase');
    });
  });

  describe('Colors', () => {
    it('accepts a named color without throwing', () => {
      renderWithTheme(<Badge color="success">OK</Badge>);
      expect(screen.getByText('OK')).toBeInTheDocument();
    });

    it('accepts a raw hex color', () => {
      renderWithTheme(
        <Badge color="#ff00ff" testId="custom">
          Magenta
        </Badge>
      );
      const style = screen.getByTestId('custom').getAttribute('style');
      expect(style).toContain('#ff00ff');
    });
  });

  describe('Removable', () => {
    it('renders a button when removable', () => {
      renderWithTheme(
        <Badge removable onRemove={() => {}}>
          Tag
        </Badge>
      );
      expect(
        screen.getByRole('button', { name: /remove/i })
      ).toBeInTheDocument();
    });

    it('fires onRemove when the button is clicked', () => {
      const handler = vi.fn();
      renderWithTheme(
        <Badge removable onRemove={handler}>
          Tag
        </Badge>
      );
      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('clicking the badge itself does not fire onRemove', () => {
      const handler = vi.fn();
      renderWithTheme(
        <Badge removable onRemove={handler}>
          Tag
        </Badge>
      );
      fireEvent.click(screen.getByText('Tag'));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('remove button has accessible label', () => {
      renderWithTheme(
        <Badge removable onRemove={() => {}}>
          Tag
        </Badge>
      );
      const btn = screen.getByRole('button', { name: /remove/i });
      expect(btn).toHaveAttribute('aria-label', 'Remove');
    });

    it('forwards ref to the root element', () => {
      const ref = React.createRef<HTMLSpanElement>();
      renderWithTheme(<Badge ref={ref}>Tag</Badge>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
