import { screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { EditableText } from './EditableText';

import type { EditableTextHandle } from './EditableText.types';

/**
 * Test suite for EditableText.
 *
 * Covers: rendering, activation, commit/cancel flow, controlled/uncontrolled,
 * disabled/read-only, accessibility, and the imperative handle.
 */
describe('EditableText', () => {
  describe('Rendering', () => {
    it('renders the value as idle display text', () => {
      renderWithTheme(<EditableText value="Layer 1" onChange={() => {}} />);
      expect(screen.getByText('Layer 1')).toBeInTheDocument();
      // Not editing initially — no input.
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('renders an uncontrolled default value', () => {
      renderWithTheme(<EditableText defaultValue="Untitled" />);
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });

    it('renders the placeholder when empty', () => {
      renderWithTheme(<EditableText defaultValue="" placeholder="Name me" />);
      expect(screen.getByText('Name me')).toBeInTheDocument();
    });

    it('applies a custom className to the display element', () => {
      renderWithTheme(
        <EditableText defaultValue="X" className="custom" testId="et" />
      );
      expect(screen.getByTestId('et')).toHaveClass('custom');
    });

    it('renders the requested element via `as`', () => {
      renderWithTheme(
        <EditableText as="h2" defaultValue="Title" testId="et" />
      );
      expect(screen.getByTestId('et').tagName).toBe('H2');
    });
  });

  describe('Activation', () => {
    it('enters edit mode on single click by default', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EditableText defaultValue="Layer" />);

      await user.click(screen.getByRole('button'));

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Layer');
    });

    it('does not enter edit mode on single click when activationMode="double"', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <EditableText defaultValue="Layer" activationMode="double" />
      );

      await user.click(screen.getByRole('button'));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      await user.dblClick(screen.getByRole('button'));
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('enters edit mode on Enter and F2 when the display is focused', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(
        <EditableText defaultValue="Layer" />
      );

      const display = screen.getByRole('button');
      display.focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      // Cancel back to idle, then try F2.
      await user.keyboard('{Escape}');
      rerender(<EditableText defaultValue="Layer" />);
      screen.getByRole('button').focus();
      await user.keyboard('{F2}');
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Commit and cancel', () => {
    it('commits on Enter and calls onChange once with the new value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(
        <EditableText defaultValue="Layer" onChange={onChange} />
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Renamed');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('Renamed');
      // Back to idle showing the new value.
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Renamed')).toBeInTheDocument();
    });

    it('does not call onChange when the value is unchanged', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(
        <EditableText defaultValue="Layer" onChange={onChange} />
      );

      await user.click(screen.getByRole('button'));
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('cancels on Escape without calling onChange and restores the value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(
        <EditableText defaultValue="Layer" onChange={onChange} />
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Discarded');
      await user.keyboard('{Escape}');

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('Layer')).toBeInTheDocument();
    });

    it('commits on blur by default', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(
        <EditableText defaultValue="Layer" onChange={onChange} />
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Blurred');
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('Blurred');
    });

    it('discards on blur when submitOnBlur is false', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(
        <EditableText
          defaultValue="Layer"
          onChange={onChange}
          submitOnBlur={false}
        />
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Blurred');
      fireEvent.blur(input);

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('Layer')).toBeInTheDocument();
    });

    it('fires onEditStart and onEditEnd with the reason', async () => {
      const user = userEvent.setup();
      const onEditStart = vi.fn();
      const onEditEnd = vi.fn();
      renderWithTheme(
        <EditableText
          defaultValue="Layer"
          onEditStart={onEditStart}
          onEditEnd={onEditEnd}
        />
      );

      await user.click(screen.getByRole('button'));
      expect(onEditStart).toHaveBeenCalledTimes(1);

      await user.keyboard('{Escape}');
      expect(onEditEnd).toHaveBeenCalledWith('cancel');
    });
  });

  describe('Controlled mode', () => {
    it('reflects the controlled value and reports commits via onChange', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(<EditableText value="A" onChange={onChange} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'B');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith('B');
      // Parent owns the value; without a rerender the display stays "A".
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('Disabled and read-only', () => {
    it('does not enter edit mode when disabled', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EditableText defaultValue="Layer" disabled />);

      // No interactive button role when disabled.
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      await user.click(screen.getByText('Layer'));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('does not enter edit mode when read-only', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EditableText defaultValue="Layer" readOnly />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      await user.click(screen.getByText('Layer'));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('exposes the display as a focusable button when interactive', () => {
      renderWithTheme(<EditableText defaultValue="Layer" />);
      const display = screen.getByRole('button');
      expect(display).toHaveAttribute('tabindex', '0');
    });

    it('labels the edit field with the default edit label', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EditableText defaultValue="" placeholder="Name" />);
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('textbox')).toHaveAccessibleName('Edit text');
    });

    it('honors a custom aria-label on the edit field', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <EditableText defaultValue="Layer" aria-label="Rename layer" />
      );
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('textbox')).toHaveAccessibleName('Rename layer');
    });

    it('applies a labels override', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <EditableText defaultValue="" labels={{ editLabel: 'Edytuj' }} />
      );
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('textbox')).toHaveAccessibleName('Edytuj');
    });

    it('marks the display aria-disabled when disabled', () => {
      renderWithTheme(
        <EditableText defaultValue="Layer" disabled testId="et" />
      );
      expect(screen.getByTestId('et')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Imperative handle', () => {
    it('enters and reports edit state via the ref', () => {
      const ref = React.createRef<EditableTextHandle>();
      renderWithTheme(<EditableText defaultValue="Layer" ref={ref} />);

      expect(ref.current?.isEditing()).toBe(false);

      act(() => {
        ref.current?.edit();
      });

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(ref.current?.isEditing()).toBe(true);
    });

    it('cancels editing via the ref', async () => {
      const user = userEvent.setup();
      const ref = React.createRef<EditableTextHandle>();
      renderWithTheme(<EditableText defaultValue="Layer" ref={ref} />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      act(() => {
        ref.current?.cancel();
      });
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });
});
