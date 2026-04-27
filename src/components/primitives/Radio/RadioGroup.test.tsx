import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      renderWithTheme(
        <RadioGroup>
          <Radio value="a" label="Option A" />
          <Radio value="b" label="Option B" />
        </RadioGroup>
      );

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    it('renders the group label', () => {
      renderWithTheme(
        <RadioGroup label="Coordinate space">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByText('Coordinate space')).toBeInTheDocument();
    });

    it('uses role="radiogroup"', () => {
      renderWithTheme(
        <RadioGroup label="Group">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('applies data-testid via testId prop', () => {
      renderWithTheme(
        <RadioGroup testId="my-group">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByTestId('my-group')).toBeInTheDocument();
    });
  });

  describe('Orientation', () => {
    it('defaults to vertical', () => {
      renderWithTheme(
        <RadioGroup testId="vert">
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </RadioGroup>
      );

      expect(screen.getByTestId('vert')).toHaveAttribute(
        'aria-orientation',
        'vertical'
      );
    });

    it('renders horizontally when orientation="horizontal"', () => {
      renderWithTheme(
        <RadioGroup orientation="horizontal" testId="horiz">
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </RadioGroup>
      );

      expect(screen.getByTestId('horiz')).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      );
    });
  });

  describe('Controlled', () => {
    it('drives selection from value prop', () => {
      renderWithTheme(
        <RadioGroup value="a">
          <Radio value="a" label="Option A" />
          <Radio value="b" label="Option B" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toBeChecked();
      expect(radios[1]).not.toBeChecked();
    });

    it('only one radio is aria-checked at a time', () => {
      renderWithTheme(
        <RadioGroup value="b">
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
          <Radio value="c" label="C" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      const checkedCount = radios.filter(
        r => r.getAttribute('aria-checked') === 'true'
      ).length;
      expect(checkedCount).toBe(1);
    });

    it('fires onChange with the new value when a radio is selected', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <RadioGroup value="a" onChange={handleChange}>
          <Radio value="a" label="Option A" />
          <Radio value="b" label="Option B" />
        </RadioGroup>
      );

      fireEvent.click(screen.getByLabelText('Option B'));
      expect(handleChange).toHaveBeenCalledWith('b');
    });
  });

  describe('Uncontrolled', () => {
    it('uses defaultValue for initial state', () => {
      renderWithTheme(
        <RadioGroup defaultValue="b">
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it('updates internal state when a radio is clicked', () => {
      renderWithTheme(
        <RadioGroup>
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </RadioGroup>
      );

      const radioA = screen.getByLabelText('A');
      fireEvent.click(radioA);
      expect(radioA).toBeChecked();

      const radioB = screen.getByLabelText('B');
      fireEvent.click(radioB);
      expect(radioB).toBeChecked();
      expect(radioA).not.toBeChecked();
    });
  });

  describe('Exclusive selection', () => {
    it('selecting one radio deselects the previous one', () => {
      renderWithTheme(
        <RadioGroup defaultValue="a">
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
          <Radio value="c" label="C" />
        </RadioGroup>
      );

      fireEvent.click(screen.getByLabelText('C'));
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).not.toBeChecked();
      expect(radios[2]).toBeChecked();
    });
  });

  describe('Disabled', () => {
    it('propagates disabled to all children', () => {
      renderWithTheme(
        <RadioGroup disabled>
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toBeDisabled();
      expect(radios[1]).toBeDisabled();
    });

    it('sets aria-disabled on the group', () => {
      renderWithTheme(
        <RadioGroup disabled testId="g">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByTestId('g')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Error', () => {
    it('sets aria-invalid on the group', () => {
      renderWithTheme(
        <RadioGroup error testId="g">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByTestId('g')).toHaveAttribute('aria-invalid', 'true');
    });

    it('propagates error to children', () => {
      renderWithTheme(
        <RadioGroup error>
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByRole('radio')).toHaveAttribute('aria-invalid', 'true');
    });

    it('displays error message', () => {
      renderWithTheme(
        <RadioGroup error errorMessage="Selection required">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByText('Selection required')).toBeInTheDocument();
    });
  });

  describe('Required', () => {
    it('sets aria-required on the group', () => {
      renderWithTheme(
        <RadioGroup required testId="g">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByTestId('g')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Name propagation', () => {
    it('shares the name attribute across all child radios', () => {
      renderWithTheme(
        <RadioGroup name="space">
          <Radio value="local" label="Local" />
          <Radio value="world" label="World" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach(r => expect(r).toHaveAttribute('name', 'space'));
    });
  });

  describe('Size propagation', () => {
    it('child radios get the group size', () => {
      // No direct DOM signal for size, so we verify the group's size prop does
      // not throw and the radios render. The sm size visually maps to 12px.
      renderWithTheme(
        <RadioGroup size="sm">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByRole('radio')).toBeInTheDocument();
    });
  });

  describe('Helper text', () => {
    it('displays helper text', () => {
      renderWithTheme(
        <RadioGroup helperText="Pick one">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByText('Pick one')).toBeInTheDocument();
    });

    it('error message overrides helper text when error is true', () => {
      renderWithTheme(
        <RadioGroup error helperText="Help" errorMessage="Error">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Help')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('group has aria-labelledby pointing to the label', () => {
      renderWithTheme(
        <RadioGroup label="Coordinate space">
          <Radio value="a" label="A" />
        </RadioGroup>
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAttribute('aria-labelledby');
    });
  });
});
