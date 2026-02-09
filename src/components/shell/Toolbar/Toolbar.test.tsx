import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  describe('Rendering', () => {
    it('renders with role="toolbar"', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Button onClick={() => {}}>Save</Toolbar.Button>
        </Toolbar>
      );
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('renders horizontal by default', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Button onClick={() => {}}>Save</Toolbar.Button>
        </Toolbar>
      );
      expect(screen.getByRole('toolbar')).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      );
    });

    it('renders vertical when specified', () => {
      renderWithTheme(
        <Toolbar $orientation="vertical" aria-label="Tools">
          <Toolbar.Button onClick={() => {}}>Pen</Toolbar.Button>
        </Toolbar>
      );
      expect(screen.getByRole('toolbar')).toHaveAttribute(
        'aria-orientation',
        'vertical'
      );
    });

    it('renders groups with role="group"', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Group aria-label="File">
            <Toolbar.Button onClick={() => {}}>Save</Toolbar.Button>
            <Toolbar.Button onClick={() => {}}>Open</Toolbar.Button>
          </Toolbar.Group>
        </Toolbar>
      );
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'File');
    });

    it('renders separator with role="separator"', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Button onClick={() => {}}>A</Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Button onClick={() => {}}>B</Toolbar.Button>
        </Toolbar>
      );
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('fires onClick on button click', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Button onClick={handleClick}>Save</Toolbar.Button>
        </Toolbar>
      );
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('toggles pressed state on toggle click', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Toggle pressed={false} onPressedChange={handleChange}>
            Bold
          </Toolbar.Toggle>
        </Toolbar>
      );
      const toggle = screen.getByRole('button', { name: 'Bold' });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(toggle);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('does not fire onClick when disabled', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Button onClick={handleClick} disabled>
            Save
          </Toolbar.Button>
        </Toolbar>
      );
      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('moves focus with ArrowRight/ArrowLeft in horizontal mode', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Button onClick={() => {}}>A</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>B</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>C</Toolbar.Button>
        </Toolbar>
      );
      const toolbar = screen.getByRole('toolbar');
      const buttons = screen.getAllByRole('button');

      // Focus first button directly
      (buttons[0] as HTMLElement).focus();
      expect(document.activeElement).toBe(buttons[0]);

      // ArrowRight moves to next
      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(buttons[1]);

      // ArrowRight again
      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(buttons[2]);

      // ArrowRight wraps to first
      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(buttons[0]);

      // ArrowLeft wraps to last
      fireEvent.keyDown(toolbar, { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(buttons[2]);
    });

    it('moves focus with ArrowDown/ArrowUp in vertical mode', () => {
      renderWithTheme(
        <Toolbar $orientation="vertical" aria-label="Tools">
          <Toolbar.Button onClick={() => {}}>X</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>Y</Toolbar.Button>
        </Toolbar>
      );
      const toolbar = screen.getByRole('toolbar');
      const buttons = screen.getAllByRole('button');

      (buttons[0] as HTMLElement).focus();
      expect(document.activeElement).toBe(buttons[0]);

      fireEvent.keyDown(toolbar, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(buttons[1]);

      fireEvent.keyDown(toolbar, { key: 'ArrowUp' });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('Home/End moves to first/last', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Button onClick={() => {}}>A</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>B</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>C</Toolbar.Button>
        </Toolbar>
      );
      const toolbar = screen.getByRole('toolbar');
      const buttons = screen.getAllByRole('button');

      (buttons[0] as HTMLElement).focus();

      fireEvent.keyDown(toolbar, { key: 'End' });
      expect(document.activeElement).toBe(buttons[2]);

      fireEvent.keyDown(toolbar, { key: 'Home' });
      expect(document.activeElement).toBe(buttons[0]);
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on toolbar', () => {
      renderWithTheme(
        <Toolbar aria-label="Main toolbar">
          <Toolbar.Button onClick={() => {}}>Save</Toolbar.Button>
        </Toolbar>
      );
      expect(screen.getByRole('toolbar')).toHaveAttribute(
        'aria-label',
        'Main toolbar'
      );
    });

    it('toggle button has aria-pressed', () => {
      renderWithTheme(
        <Toolbar aria-label="Format">
          <Toolbar.Toggle pressed={true} onPressedChange={() => {}}>
            Bold
          </Toolbar.Toggle>
        </Toolbar>
      );
      expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });
});
