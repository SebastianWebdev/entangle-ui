import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox.types';

const FRUITS: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date', disabled: true },
];

function getInput(testId = 'cmb'): HTMLInputElement {
  const el = screen.getByTestId(testId);
  if (!(el instanceof HTMLInputElement)) {
    throw new Error('Combobox testId did not resolve to an input');
  }
  return el;
}

describe('Combobox', () => {
  describe('Rendering', () => {
    it('renders the placeholder', () => {
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} placeholder="Pick a fruit" />
      );
      expect(getInput().placeholder).toBe('Pick a fruit');
    });

    it('renders the selected label when value is set', () => {
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} defaultValue="banana" />
      );
      expect(getInput().value).toBe('Banana');
    });

    it('opens the dropdown on chevron click', () => {
      renderWithTheme(<Combobox testId="cmb" options={FRUITS} />);
      fireEvent.click(screen.getByLabelText('Open suggestions'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens on focus when openOnFocus is true', () => {
      renderWithTheme(<Combobox testId="cmb" options={FRUITS} openOnFocus />);
      fireEvent.focus(getInput());
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('shows the empty message when no option matches', () => {
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} emptyMessage="None" />
      );
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'zzz' } });
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('renders the loading message', () => {
      renderWithTheme(
        <Combobox
          testId="cmb"
          options={FRUITS}
          loading
          loadingMessage="Fetching..."
          openOnFocus
        />
      );
      fireEvent.focus(getInput());
      expect(screen.getByText('Fetching...')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters options as the user types', () => {
      renderWithTheme(<Combobox testId="cmb" options={FRUITS} />);
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'ban' } });
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Banana')).toBeInTheDocument();
      expect(within(listbox).queryByText('Apple')).not.toBeInTheDocument();
    });

    it('uses a custom filterFn when provided', () => {
      const filterFn = vi.fn((opt: ComboboxOption, q: string) =>
        opt.value.startsWith(q.toLowerCase())
      );
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} filterFn={filterFn} />
      );
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'ch' } });
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Cherry')).toBeInTheDocument();
      expect(within(listbox).queryByText('Apple')).not.toBeInTheDocument();
      expect(filterFn).toHaveBeenCalled();
    });
  });

  describe('Selection', () => {
    it('commits a selection on click', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} onChange={onChange} />
      );
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'ban' } });
      fireEvent.click(within(screen.getByRole('listbox')).getByText('Banana'));
      expect(onChange).toHaveBeenLastCalledWith('banana');
      expect(input.value).toBe('Banana');
    });

    it('Enter on the active option commits it', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} onChange={onChange} />
      );
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'che' } });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenLastCalledWith('cherry');
    });

    it('clears on the clear button', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Combobox
          testId="cmb"
          options={FRUITS}
          defaultValue="apple"
          clearable
          onChange={onChange}
        />
      );
      fireEvent.mouseDown(screen.getByLabelText('Clear selection'));
      expect(onChange).toHaveBeenLastCalledWith(null);
      expect(getInput().value).toBe('');
    });

    it('does not commit a disabled option', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} onChange={onChange} />
      );
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'dat' } });
      fireEvent.click(within(screen.getByRole('listbox')).getByText('Date'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Free solo / creatable', () => {
    it('freeSolo accepts arbitrary input on Enter', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} freeSolo onChange={onChange} />
      );
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'kiwi' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenLastCalledWith('kiwi');
    });

    it('creatable shows a "Create" row and triggers onCreate', () => {
      const onCreate = vi.fn();
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} creatable onCreate={onCreate} />
      );
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'kiwi' } });
      const createOption = screen.getByText(/Create.*"kiwi"/);
      expect(createOption).toBeInTheDocument();
      fireEvent.click(createOption);
      expect(onCreate).toHaveBeenCalledWith('kiwi');
    });

    it('creatable does not show the Create row for an exact match', () => {
      renderWithTheme(<Combobox testId="cmb" options={FRUITS} creatable />);
      const input = getInput();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Apple' } });
      expect(screen.queryByText(/Create.*"Apple"/)).not.toBeInTheDocument();
    });

    it('keeps the create row consistent with the filtered list when editing toward an exact match', () => {
      // Regression: the create row is gated on the same deferred query that
      // drives `filteredOptions`. Editing a non-matching query into an exact
      // match must drop the create row in lockstep with the list — never leave
      // a stray "Create" row beside the matched option.
      renderWithTheme(<Combobox testId="cmb" options={FRUITS} creatable />);
      const input = getInput();
      fireEvent.focus(input);

      fireEvent.change(input, { target: { value: 'Appl' } });
      expect(screen.getByText(/Create.*"Appl"/)).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'Apple' } });
      expect(screen.queryByText(/Create.*"Apple"/)).not.toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has combobox role and aria-expanded', () => {
      renderWithTheme(<Combobox testId="cmb" options={FRUITS} />);
      const input = getInput();
      expect(input).toHaveAttribute('role', 'combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'a' } });
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('reports error state via aria-invalid', () => {
      renderWithTheme(
        <Combobox testId="cmb" options={FRUITS} error errorMessage="Required" />
      );
      expect(getInput()).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });
});
