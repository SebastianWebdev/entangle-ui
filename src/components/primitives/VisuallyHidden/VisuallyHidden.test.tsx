import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  describe('Rendering', () => {
    it('renders as a <span> by default', () => {
      renderWithTheme(<VisuallyHidden testId="vh">Hidden text</VisuallyHidden>);
      const el = screen.getByTestId('vh');
      expect(el.tagName).toBe('SPAN');
    });

    it('renders as the element specified by `as`', () => {
      renderWithTheme(
        <VisuallyHidden as="div" testId="vh">
          Block content
        </VisuallyHidden>
      );
      expect(screen.getByTestId('vh').tagName).toBe('DIV');
    });

    it('renders children into the DOM', () => {
      renderWithTheme(<VisuallyHidden>Hidden text</VisuallyHidden>);
      expect(screen.getByText('Hidden text')).toBeInTheDocument();
    });

    it('forwards extra props to the rendered element', () => {
      renderWithTheme(
        <VisuallyHidden id="custom-id" testId="vh">
          x
        </VisuallyHidden>
      );
      expect(screen.getByTestId('vh')).toHaveAttribute('id', 'custom-id');
    });

    it('merges custom className', () => {
      renderWithTheme(
        <VisuallyHidden className="custom" testId="vh">
          x
        </VisuallyHidden>
      );
      expect(screen.getByTestId('vh')).toHaveClass('custom');
    });
  });

  describe('Hidden styling', () => {
    it('applies the canonical SR-only styles', () => {
      renderWithTheme(<VisuallyHidden testId="vh">Hidden</VisuallyHidden>);
      const styles = window.getComputedStyle(screen.getByTestId('vh'));
      expect(styles.position).toBe('absolute');
      expect(styles.width).toBe('1px');
      expect(styles.height).toBe('1px');
      expect(styles.overflow).toBe('hidden');
      expect(styles.whiteSpace).toBe('nowrap');
    });

    it('does not use display:none — content stays accessible', () => {
      renderWithTheme(
        <VisuallyHidden testId="vh">Important context</VisuallyHidden>
      );
      const el = screen.getByTestId('vh');
      const styles = window.getComputedStyle(el);
      expect(styles.display).not.toBe('none');
      expect(el.textContent).toBe('Important context');
    });
  });

  describe('Focusable variant', () => {
    it('accepts the focusable prop without error', () => {
      renderWithTheme(
        <VisuallyHidden focusable testId="vh" tabIndex={0}>
          Skip to content
        </VisuallyHidden>
      );
      expect(screen.getByTestId('vh')).toBeInTheDocument();
    });

    it('still hides content by default when not focused', () => {
      renderWithTheme(
        <VisuallyHidden focusable testId="vh" tabIndex={0}>
          Skip to content
        </VisuallyHidden>
      );
      const styles = window.getComputedStyle(screen.getByTestId('vh'));
      expect(styles.position).toBe('absolute');
      expect(styles.width).toBe('1px');
    });

    it('preserves children when focusable', () => {
      renderWithTheme(
        <VisuallyHidden focusable tabIndex={0}>
          Skip to content
        </VisuallyHidden>
      );
      expect(screen.getByText('Skip to content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders children into the accessibility tree (textContent present)', () => {
      renderWithTheme(
        <VisuallyHidden testId="vh">Screen-reader text</VisuallyHidden>
      );
      expect(screen.getByTestId('vh').textContent).toBe('Screen-reader text');
    });

    it('forwards ref to the rendered element', () => {
      const ref = React.createRef<HTMLSpanElement>();
      renderWithTheme(<VisuallyHidden ref={ref}>x</VisuallyHidden>);
      expect(ref.current?.tagName).toBe('SPAN');
    });

    it('applies aria-* attributes via spread', () => {
      renderWithTheme(
        <VisuallyHidden testId="vh" aria-live="polite">
          Status update
        </VisuallyHidden>
      );
      expect(screen.getByTestId('vh')).toHaveAttribute('aria-live', 'polite');
    });
  });
});
