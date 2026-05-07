import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { TagInput } from './TagInput';

function getInput(testId = 'tag-input'): HTMLInputElement {
  const wrapper = screen.getByTestId(testId);
  const input = wrapper.querySelector('input[type="text"]');
  if (!input) throw new Error('Inner input not found');
  return input as HTMLInputElement;
}

describe('TagInput', () => {
  describe('Rendering', () => {
    it('renders an empty input by default', () => {
      renderWithTheme(<TagInput testId="tag-input" placeholder="Add tag" />);
      expect(getInput().placeholder).toBe('Add tag');
    });

    it('renders initial uncontrolled tags', () => {
      renderWithTheme(
        <TagInput testId="tag-input" defaultValue={['react', 'ts']} />
      );
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('ts')).toBeInTheDocument();
    });

    it('renders controlled tags', () => {
      renderWithTheme(<TagInput testId="tag-input" value={['alpha']} />);
      expect(screen.getByText('alpha')).toBeInTheDocument();
    });

    it('renders a label and helper text', () => {
      renderWithTheme(
        <TagInput
          testId="tag-input"
          label="Keywords"
          helperText="Press Enter to add"
        />
      );
      expect(screen.getByText('Keywords')).toBeInTheDocument();
      expect(screen.getByText('Press Enter to add')).toBeInTheDocument();
    });

    it('renders an error message when error is true', () => {
      renderWithTheme(
        <TagInput
          testId="tag-input"
          error
          errorMessage="Required"
          helperText="ignored"
        />
      );
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.queryByText('ignored')).not.toBeInTheDocument();
    });

    it('hides the input in readOnly mode but shows tags', () => {
      renderWithTheme(
        <TagInput testId="tag-input" readOnly defaultValue={['locked']} />
      );
      expect(screen.getByText('locked')).toBeInTheDocument();
      expect(
        screen.getByTestId('tag-input').querySelector('input[type="text"]')
      ).toBeNull();
    });

    it('supports a custom renderTag', () => {
      renderWithTheme(
        <TagInput
          testId="tag-input"
          defaultValue={['custom']}
          renderTag={({ tag }) => <em data-testid="custom-tag">{tag}!</em>}
        />
      );
      expect(screen.getByTestId('custom-tag')).toHaveTextContent('custom!');
    });
  });

  describe('Interactions', () => {
    it('commits a tag on Enter', () => {
      const onChange = vi.fn();
      renderWithTheme(<TagInput testId="tag-input" onChange={onChange} />);
      const input = getInput();
      fireEvent.change(input, { target: { value: 'hello' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(['hello']);
    });

    it('commits a tag on Comma', () => {
      const onChange = vi.fn();
      renderWithTheme(<TagInput testId="tag-input" onChange={onChange} />);
      const input = getInput();
      fireEvent.change(input, { target: { value: 'one,' } });
      expect(onChange).toHaveBeenCalledWith(['one']);
    });

    it('removes the last tag on Backspace when the draft is empty', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <TagInput
          testId="tag-input"
          defaultValue={['a', 'b']}
          onChange={onChange}
        />
      );
      fireEvent.keyDown(getInput(), { key: 'Backspace' });
      expect(onChange).toHaveBeenCalledWith(['a']);
    });

    it('does not remove a tag on Backspace while typing', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <TagInput testId="tag-input" defaultValue={['a']} onChange={onChange} />
      );
      const input = getInput();
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.keyDown(input, { key: 'Backspace' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('removes a tag when the chip remove button is clicked', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <TagInput
          testId="tag-input"
          defaultValue={['x', 'y']}
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Remove x'));
      expect(onChange).toHaveBeenCalledWith(['y']);
    });

    it('commits the draft on blur when addOnBlur is true', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <TagInput testId="tag-input" addOnBlur onChange={onChange} />
      );
      const input = getInput();
      fireEvent.change(input, { target: { value: 'late' } });
      fireEvent.blur(input);
      expect(onChange).toHaveBeenCalledWith(['late']);
    });

    it('does not commit the draft on blur when addOnBlur is false', () => {
      const onChange = vi.fn();
      renderWithTheme(<TagInput testId="tag-input" onChange={onChange} />);
      const input = getInput();
      fireEvent.change(input, { target: { value: 'late' } });
      fireEvent.blur(input);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('splits pasted comma-separated values into multiple tags', () => {
      const onChange = vi.fn();
      renderWithTheme(<TagInput testId="tag-input" onChange={onChange} />);
      const input = getInput();
      fireEvent.change(input, { target: { value: 'a,b,c' } });
      expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
      // 'c' is left as the draft
      expect(input.value).toBe('c');
    });
  });

  describe('Validation', () => {
    it('rejects duplicates by default', () => {
      const onChange = vi.fn();
      const onValidate = vi.fn();
      renderWithTheme(
        <TagInput
          testId="tag-input"
          defaultValue={['react']}
          onChange={onChange}
          onValidate={onValidate}
        />
      );
      const input = getInput();
      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).not.toHaveBeenCalled();
      expect(onValidate).toHaveBeenCalledWith('react', 'duplicate');
    });

    it('allows duplicates when allowDuplicates is true', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <TagInput
          testId="tag-input"
          defaultValue={['react']}
          allowDuplicates
          onChange={onChange}
        />
      );
      const input = getInput();
      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(['react', 'react']);
    });

    it('respects max and disables the input', () => {
      const onValidate = vi.fn();
      renderWithTheme(
        <TagInput
          testId="tag-input"
          defaultValue={['a', 'b']}
          max={2}
          onValidate={onValidate}
        />
      );
      const input = getInput();
      expect(input.disabled).toBe(true);
    });

    it('rejects empty/whitespace-only candidates', () => {
      const onChange = vi.fn();
      renderWithTheme(<TagInput testId="tag-input" onChange={onChange} />);
      const input = getInput();
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('runs a custom validator', () => {
      const onChange = vi.fn();
      const onValidate = vi.fn();
      renderWithTheme(
        <TagInput
          testId="tag-input"
          validate={value => value.length >= 3 || 'too-short'}
          onChange={onChange}
          onValidate={onValidate}
        />
      );
      const input = getInput();
      fireEvent.change(input, { target: { value: 'no' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).not.toHaveBeenCalled();
      expect(onValidate).toHaveBeenCalledWith('no', 'too-short');
    });
  });

  describe('Accessibility', () => {
    it('associates the label with the inner input', () => {
      renderWithTheme(
        <TagInput testId="tag-input" id="tags" label="Keywords" />
      );
      const input = getInput();
      expect(input.id).toBe('tags');
      expect(screen.getByText('Keywords')).toHaveAttribute('for', 'tags');
    });

    it('exposes aria-invalid in error state', () => {
      renderWithTheme(<TagInput testId="tag-input" error errorMessage="Bad" />);
      expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    });

    it('uses inputAriaLabel when no label is provided', () => {
      renderWithTheme(
        <TagInput testId="tag-input" inputAriaLabel="Tags input" />
      );
      expect(getInput()).toHaveAttribute('aria-label', 'Tags input');
    });
  });
});
