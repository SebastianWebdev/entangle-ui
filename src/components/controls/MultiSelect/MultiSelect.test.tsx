import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { MultiSelect } from './MultiSelect';
import type {
  MultiSelectOption,
  MultiSelectOptionGroup,
} from './MultiSelect.types';

const SIMPLE_OPTIONS: MultiSelectOption[] = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
  { value: 'd', label: 'Date', disabled: true },
];

const GROUPED_OPTIONS: Array<MultiSelectOption | MultiSelectOptionGroup> = [
  {
    label: 'Citrus',
    options: [
      { value: 'lemon', label: 'Lemon' },
      { value: 'lime', label: 'Lime' },
    ],
  },
  {
    label: 'Berries',
    options: [
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'blueberry', label: 'Blueberry' },
    ],
  },
];

function getTrigger(testId = 'multi'): HTMLElement {
  return screen.getByTestId(testId);
}

function openDropdown(testId = 'multi'): void {
  fireEvent.click(getTrigger(testId));
}

describe('MultiSelect', () => {
  describe('Rendering', () => {
    it('renders the placeholder when nothing is selected', () => {
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          placeholder="Pick fruits"
        />
      );
      expect(screen.getByText('Pick fruits')).toBeInTheDocument();
    });

    it('renders chips for selected values', () => {
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          defaultValue={['a', 'b']}
        />
      );
      expect(screen.getByTestId('multi-chip-a')).toHaveTextContent('Apple');
      expect(screen.getByTestId('multi-chip-b')).toHaveTextContent('Banana');
    });

    it('opens the dropdown on click', () => {
      renderWithTheme(<MultiSelect testId="multi" options={SIMPLE_OPTIONS} />);
      openDropdown();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('renders the empty message when search has no matches', () => {
      renderWithTheme(
        <MultiSelect
          testId="multi"
          searchable
          options={SIMPLE_OPTIONS}
          emptyMessage="Nothing"
        />
      );
      openDropdown();
      const search = screen.getByPlaceholderText('Search...');
      fireEvent.change(search, { target: { value: 'zzz' } });
      expect(screen.getByText('Nothing')).toBeInTheDocument();
    });

    it('renders grouped options', () => {
      renderWithTheme(<MultiSelect testId="multi" options={GROUPED_OPTIONS} />);
      openDropdown();
      expect(screen.getByText('Citrus')).toBeInTheDocument();
      expect(screen.getByText('Berries')).toBeInTheDocument();
    });

    it('renders a "+N more" badge past maxInlineChips', () => {
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          defaultValue={['a', 'b', 'c']}
          maxInlineChips={1}
        />
      );
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('toggles values on click', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          onChange={onChange}
        />
      );
      openDropdown();
      const listbox = screen.getByRole('listbox');
      fireEvent.click(within(listbox).getByText('Apple'));
      expect(onChange).toHaveBeenLastCalledWith(['a']);
      fireEvent.click(within(listbox).getByText('Banana'));
      expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
      fireEvent.click(within(listbox).getByText('Apple'));
      expect(onChange).toHaveBeenLastCalledWith(['b']);
    });

    it('does not toggle disabled options', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          onChange={onChange}
        />
      );
      openDropdown();
      fireEvent.click(screen.getByText('Date'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('respects max', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          max={2}
          defaultValue={['a', 'b']}
          onChange={onChange}
        />
      );
      openDropdown();
      fireEvent.click(screen.getByText('Cherry'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('removes a value via the chip remove button', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          defaultValue={['a', 'b']}
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Remove Apple'));
      expect(onChange).toHaveBeenLastCalledWith(['b']);
    });

    it('clears all when clearable is set and the clear button is clicked', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          defaultValue={['a', 'b']}
          clearable
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it('closeOnSelect closes the dropdown after a click', () => {
      renderWithTheme(
        <MultiSelect testId="multi" options={SIMPLE_OPTIONS} closeOnSelect />
      );
      openDropdown();
      fireEvent.click(screen.getByText('Apple'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('filters options as the user types', () => {
      renderWithTheme(
        <MultiSelect testId="multi" searchable options={SIMPLE_OPTIONS} />
      );
      openDropdown();
      const search = screen.getByPlaceholderText('Search...');
      fireEvent.change(search, { target: { value: 'ban' } });
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Banana')).toBeInTheDocument();
      expect(within(listbox).queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    it('opens with ArrowDown from the trigger', () => {
      renderWithTheme(<MultiSelect testId="multi" options={SIMPLE_OPTIONS} />);
      const trigger = getTrigger();
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('Enter toggles the active option', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          onChange={onChange}
        />
      );
      openDropdown();
      const listbox = screen.getByRole('listbox');
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(onChange).toHaveBeenLastCalledWith(['a']);
    });

    it('Escape closes the dropdown', () => {
      renderWithTheme(<MultiSelect testId="multi" options={SIMPLE_OPTIONS} />);
      openDropdown();
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses combobox + listbox roles with aria-multiselectable', () => {
      renderWithTheme(<MultiSelect testId="multi" options={SIMPLE_OPTIONS} />);
      const trigger = getTrigger();
      expect(trigger).toHaveAttribute('role', 'combobox');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      openDropdown();
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('reflects error state via aria-invalid', () => {
      renderWithTheme(
        <MultiSelect
          testId="multi"
          options={SIMPLE_OPTIONS}
          error
          errorMessage="Required"
        />
      );
      expect(getTrigger()).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });
});
