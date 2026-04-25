import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Radio } from './Radio';

describe('Radio', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Radio value="a" />);
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('renders with a label', () => {
      renderWithTheme(<Radio value="a" label="Local space" />);
      expect(screen.getByText('Local space')).toBeInTheDocument();
    });

    it('renders without a label', () => {
      renderWithTheme(<Radio value="a" testId="bare-radio" />);
      expect(screen.getByTestId('bare-radio')).toBeInTheDocument();
    });

    it('applies data-testid via testId prop', () => {
      renderWithTheme(<Radio value="a" testId="my-radio" />);
      expect(screen.getByTestId('my-radio')).toBeInTheDocument();
    });

    it('renders all sizes without crashing', () => {
      renderWithTheme(
        <>
          <Radio value="sm" size="sm" label="Small" />
          <Radio value="md" size="md" label="Medium" />
          <Radio value="lg" size="lg" label="Large" />
        </>
      );
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  describe('Label position', () => {
    it('renders label on the right by default', () => {
      renderWithTheme(<Radio value="a" label="Right" />);
      expect(screen.getByText('Right')).toBeInTheDocument();
    });

    it('renders label on the left', () => {
      renderWithTheme(<Radio value="a" label="Left" labelPosition="left" />);
      expect(screen.getByText('Left')).toBeInTheDocument();
    });
  });

  describe('Standalone — controlled', () => {
    it('respects checked prop', () => {
      renderWithTheme(<Radio value="a" checked label="A" />);
      expect(screen.getByRole('radio')).toBeChecked();
      expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
    });

    it('respects checked={false}', () => {
      renderWithTheme(
        <Radio value="a" checked={false} onChange={() => {}} label="A" />
      );
      expect(screen.getByRole('radio')).not.toBeChecked();
      expect(screen.getByRole('radio')).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    it('fires onChange with (value, event) when clicked', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Radio
          value="local"
          checked={false}
          onChange={handleChange}
          label="Local"
        />
      );

      fireEvent.click(screen.getByRole('radio'));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        'local',
        expect.objectContaining({ target: screen.getByRole('radio') })
      );
    });
  });

  describe('Standalone — uncontrolled', () => {
    it('starts unchecked when defaultChecked is false', () => {
      renderWithTheme(<Radio value="a" label="A" />);
      expect(screen.getByRole('radio')).not.toBeChecked();
    });

    it('starts checked when defaultChecked is true', () => {
      renderWithTheme(<Radio value="a" defaultChecked label="A" />);
      expect(screen.getByRole('radio')).toBeChecked();
    });

    it('toggles to checked when clicked', () => {
      renderWithTheme(<Radio value="a" label="A" />);
      const radio = screen.getByRole('radio');
      expect(radio).not.toBeChecked();

      fireEvent.click(radio);
      expect(radio).toBeChecked();
    });
  });

  describe('Disabled', () => {
    it('renders disabled attribute', () => {
      renderWithTheme(<Radio value="a" disabled label="A" />);
      expect(screen.getByRole('radio')).toBeDisabled();
    });

    it('does not fire onChange when disabled and clicked', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Radio
          value="a"
          disabled
          checked={false}
          onChange={handleChange}
          label="A"
        />
      );

      fireEvent.click(screen.getByRole('radio'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Error state', () => {
    it('sets aria-invalid when error is true', () => {
      renderWithTheme(<Radio value="a" error label="A" />);
      expect(screen.getByRole('radio')).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows errorMessage when error is true', () => {
      renderWithTheme(
        <Radio value="a" error errorMessage="Required" label="A" />
      );
      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('hides helperText when error message is shown', () => {
      renderWithTheme(
        <Radio
          value="a"
          error
          helperText="Helper"
          errorMessage="Error msg"
          label="A"
        />
      );
      expect(screen.getByText('Error msg')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });
  });

  describe('Helper text', () => {
    it('displays helper text', () => {
      renderWithTheme(<Radio value="a" helperText="Some help" label="A" />);
      expect(screen.getByText('Some help')).toBeInTheDocument();
    });

    it('links helper text via aria-describedby', () => {
      renderWithTheme(
        <Radio value="a" id="my-radio" helperText="Help me" label="A" />
      );
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-describedby');
    });
  });

  describe('Click on label', () => {
    it('toggles via label click', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Radio
          value="a"
          checked={false}
          onChange={handleChange}
          label="Click me"
        />
      );

      fireEvent.click(screen.getByText('Click me'));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('a', expect.anything());
    });
  });

  describe('Keyboard', () => {
    it('selects via Space key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(
        <Radio
          value="a"
          checked={false}
          onChange={handleChange}
          label="Space radio"
        />
      );

      await user.tab();
      expect(screen.getByRole('radio')).toHaveFocus();

      await user.keyboard('{ }');
      expect(handleChange).toHaveBeenCalledWith('a', expect.anything());
    });

    it('does not toggle via keyboard when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(
        <Radio
          value="a"
          checked={false}
          onChange={handleChange}
          disabled
          label="Disabled radio"
        />
      );

      const radio = screen.getByRole('radio');
      radio.focus();
      await user.keyboard('{ }');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('uses role="radio"', () => {
      renderWithTheme(<Radio value="a" label="A" />);
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('has aria-checked matching state', () => {
      renderWithTheme(<Radio value="a" checked label="A" />);
      expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
    });

    it('applies the name attribute', () => {
      renderWithTheme(<Radio value="a" name="space" label="A" />);
      expect(screen.getByRole('radio')).toHaveAttribute('name', 'space');
    });

    it('applies the value attribute', () => {
      renderWithTheme(<Radio value="local" label="Local" />);
      expect(screen.getByRole('radio')).toHaveAttribute('value', 'local');
    });
  });
});
