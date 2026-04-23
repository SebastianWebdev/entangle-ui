import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  describe('Rendering', () => {
    it('renders a textarea', () => {
      renderWithTheme(<TextArea placeholder="Type..." testId="ta" />);
      const el = screen.getByTestId('ta');
      expect(el.tagName).toBe('TEXTAREA');
    });

    it('renders label when provided', () => {
      renderWithTheme(<TextArea label="Description" />);
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders helper text', () => {
      renderWithTheme(<TextArea helperText="optional" />);
      expect(screen.getByText('optional')).toBeInTheDocument();
    });

    it('shows errorMessage when error is true', () => {
      renderWithTheme(
        <TextArea error errorMessage="required field" helperText="optional" />
      );
      expect(screen.getByText('required field')).toBeInTheDocument();
      expect(screen.queryByText('optional')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('fires onChange with the string value', () => {
      const onChange = vi.fn();
      renderWithTheme(<TextArea onChange={onChange} testId="ta" />);
      fireEvent.change(screen.getByTestId('ta'), {
        target: { value: 'hello' },
      });
      expect(onChange).toHaveBeenCalledWith('hello');
    });

    it('controlled value is respected', () => {
      renderWithTheme(<TextArea value="hi" onChange={() => {}} testId="ta" />);
      expect(screen.getByTestId('ta')).toHaveValue('hi');
    });

    it('disabled textarea is not editable', () => {
      renderWithTheme(<TextArea disabled testId="ta" />);
      expect(screen.getByTestId('ta')).toBeDisabled();
    });
  });

  describe('Character count', () => {
    it('renders count when showCount and maxLength are set', () => {
      renderWithTheme(
        <TextArea
          value="abc"
          onChange={() => {}}
          showCount
          maxLength={10}
          testId="ta"
        />
      );
      expect(screen.getByText('3/10')).toBeInTheDocument();
    });
  });

  describe('Monospace', () => {
    it('applies a different class when monospace', () => {
      const { rerender } = renderWithTheme(<TextArea testId="ta" />);
      const original = screen.getByTestId('ta').className;
      rerender(<TextArea monospace testId="ta" />);
      const mono = screen.getByTestId('ta').className;
      expect(mono).not.toEqual(original);
    });
  });

  describe('Accessibility', () => {
    it('label htmlFor matches textarea id', () => {
      renderWithTheme(<TextArea label="Notes" testId="ta" />);
      const ta = screen.getByTestId('ta');
      const label = screen.getByText('Notes');
      expect(label.getAttribute('for')).toBe(ta.id);
    });

    it('forwards ref', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      renderWithTheme(<TextArea ref={ref} />);
      expect(ref.current?.tagName).toBe('TEXTAREA');
    });
  });
});
