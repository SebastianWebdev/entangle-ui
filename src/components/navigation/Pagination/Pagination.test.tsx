import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Pagination } from './Pagination';

const getPageButtons = () =>
  screen
    .getAllByRole('button')
    .filter(b => b.getAttribute('data-type') === 'page');

const getPageNumbers = () =>
  getPageButtons().map(b => b.getAttribute('data-page'));

describe('Pagination', () => {
  describe('Rendering', () => {
    it('renders a nav landmark with the right aria-label', () => {
      renderWithTheme(<Pagination count={5} />);
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'pagination'
      );
    });

    it('renders all pages when count fits without ellipsis', () => {
      renderWithTheme(<Pagination count={5} defaultPage={1} />);
      expect(getPageNumbers()).toEqual(['1', '2', '3', '4', '5']);
    });

    it('inserts an ellipsis when there is a gap on the right', () => {
      renderWithTheme(
        <Pagination
          count={20}
          defaultPage={1}
          siblingCount={1}
          boundaryCount={1}
        />
      );
      // Expected: 1 [2] 3 ... 20 — current page is 1, siblings = 2 (not before page 1)
      // MUI yields: 1 2 ... 20 with the right structure
      const ellipsisCount = screen.getAllByText('…', {
        selector: 'span',
      }).length;
      expect(ellipsisCount).toBeGreaterThanOrEqual(1);
      expect(getPageNumbers()).toContain('1');
      expect(getPageNumbers()).toContain('20');
    });

    it('inserts ellipsis on both sides when current page is in the middle', () => {
      renderWithTheme(
        <Pagination
          count={20}
          defaultPage={10}
          siblingCount={1}
          boundaryCount={1}
        />
      );
      const ellipses = screen.getAllByText('…', { selector: 'span' });
      expect(ellipses.length).toBe(2);
      expect(getPageNumbers()).toEqual(
        expect.arrayContaining(['1', '9', '10', '11', '20'])
      );
    });

    it('omits prev/next when hidden, includes first/last when shown', () => {
      renderWithTheme(
        <Pagination
          count={5}
          hidePrevButton
          hideNextButton
          showFirstButton
          showLastButton
        />
      );
      const types = screen
        .getAllByRole('button')
        .map(b => b.getAttribute('data-type'));
      expect(types).toContain('first');
      expect(types).toContain('last');
      expect(types).not.toContain('previous');
      expect(types).not.toContain('next');
    });

    it('marks the current page with aria-current="page"', () => {
      renderWithTheme(<Pagination count={5} defaultPage={3} />);
      const current = screen.getByRole('button', { current: 'page' });
      expect(current).toHaveAttribute('data-page', '3');
    });
  });

  describe('Interactions', () => {
    it('moves to the clicked page in uncontrolled mode', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Pagination count={5} defaultPage={1} onChange={onChange} />
      );
      const page3 = screen.getByRole('button', { name: 'Go to page 3' });
      fireEvent.click(page3);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 3);
      // After click, current page should reflect 3
      const current = screen.getByRole('button', { current: 'page' });
      expect(current).toHaveAttribute('data-page', '3');
    });

    it('does not change internal page in controlled mode', () => {
      const onChange = vi.fn();
      renderWithTheme(<Pagination count={5} page={2} onChange={onChange} />);
      const page4 = screen.getByRole('button', { name: 'Go to page 4' });
      fireEvent.click(page4);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), 4);
      // Current is still 2 because pageProp didn't change
      const current = screen.getByRole('button', { current: 'page' });
      expect(current).toHaveAttribute('data-page', '2');
    });

    it('previous button is disabled on the first page', () => {
      renderWithTheme(<Pagination count={5} defaultPage={1} />);
      expect(
        screen.getByRole('button', { name: 'Go to previous page' })
      ).toBeDisabled();
    });

    it('next button is disabled on the last page', () => {
      renderWithTheme(<Pagination count={5} defaultPage={5} />);
      expect(
        screen.getByRole('button', { name: 'Go to next page' })
      ).toBeDisabled();
    });

    it('next button advances by one and fires onChange', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Pagination count={5} defaultPage={2} onChange={onChange} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 3);
    });

    it('first/last buttons jump to boundaries', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Pagination
          count={20}
          defaultPage={10}
          showFirstButton
          showLastButton
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Go to first page' }));
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 1);
      fireEvent.click(screen.getByRole('button', { name: 'Go to last page' }));
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 20);
    });

    it('does not fire onChange when clicking the current page', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Pagination count={5} defaultPage={3} onChange={onChange} />
      );
      const current = screen.getByRole('button', { current: 'page' });
      fireEvent.click(current);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables every interactive button when `disabled` is set', () => {
      renderWithTheme(<Pagination count={5} defaultPage={3} disabled />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      for (const b of buttons) {
        expect(b).toBeDisabled();
      }
    });
  });

  describe('Algorithm', () => {
    it('handles count=0 by rendering only nav controls (all disabled)', () => {
      renderWithTheme(<Pagination count={0} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.every(b => (b as HTMLButtonElement).disabled)).toBe(true);
      expect(getPageButtons()).toHaveLength(0);
    });

    it('uses custom getItemAriaLabel when provided', () => {
      renderWithTheme(
        <Pagination
          count={3}
          defaultPage={1}
          getItemAriaLabel={(type, page) =>
            type === 'page' ? `p-${String(page)}` : type
          }
        />
      );
      const list = screen.getByRole('navigation');
      expect(within(list).getByLabelText('p-2')).toBeInTheDocument();
      expect(within(list).getByLabelText('next')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('selected page has aria-current="page" and others do not', () => {
      renderWithTheme(<Pagination count={5} defaultPage={2} />);
      const all = getPageButtons();
      const currents = all.filter(
        b => b.getAttribute('aria-current') === 'page'
      );
      expect(currents).toHaveLength(1);
      expect(currents[0]).toHaveAttribute('data-page', '2');
    });
  });
});
