import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { ListItem } from './ListItem';

describe('ListItem', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      renderWithTheme(<ListItem>Row text</ListItem>);
      expect(screen.getByText('Row text')).toBeInTheDocument();
    });

    it('renders leading and trailing slots', () => {
      renderWithTheme(
        <ListItem
          leading={<span data-testid="lead">L</span>}
          trailing={<span data-testid="trail">T</span>}
        >
          body
        </ListItem>
      );
      expect(screen.getByTestId('lead')).toBeInTheDocument();
      expect(screen.getByTestId('trail')).toBeInTheDocument();
    });

    it('sets data-selected attribute when selected', () => {
      renderWithTheme(
        <ListItem selected testId="i">
          selected
        </ListItem>
      );
      expect(screen.getByTestId('i')).toHaveAttribute('data-selected', 'true');
    });

    it('disabled item has aria-disabled', () => {
      renderWithTheme(
        <ListItem disabled testId="i">
          disabled
        </ListItem>
      );
      expect(screen.getByTestId('i')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Interactions', () => {
    it('fires onClick when clickable', () => {
      const handler = vi.fn();
      renderWithTheme(
        <ListItem onClick={handler} testId="i">
          x
        </ListItem>
      );
      fireEvent.click(screen.getByTestId('i'));
      expect(handler).toHaveBeenCalled();
    });

    it('becomes a button and Enter triggers onClick', () => {
      const handler = vi.fn();
      renderWithTheme(
        <ListItem onClick={handler} testId="i">
          x
        </ListItem>
      );
      const el = screen.getByTestId('i');
      expect(el).toHaveAttribute('role', 'button');
      fireEvent.keyDown(el, { key: 'Enter' });
      expect(handler).toHaveBeenCalled();
    });

    it('disabled item does not fire onClick on keyboard', () => {
      const handler = vi.fn();
      renderWithTheme(
        <ListItem disabled onClick={handler} testId="i">
          x
        </ListItem>
      );
      fireEvent.keyDown(screen.getByTestId('i'), { key: 'Enter' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('non-clickable item has no role=button', () => {
      renderWithTheme(<ListItem testId="i">plain</ListItem>);
      expect(screen.getByTestId('i')).not.toHaveAttribute('role', 'button');
    });

    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithTheme(<ListItem ref={ref}>x</ListItem>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
