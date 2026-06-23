import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { MenuBar } from './MenuBar';

const renderMenuBar = () =>
  renderWithTheme(
    <MenuBar>
      <MenuBar.Menu label="File">
        <MenuBar.Item onClick={() => {}}>New</MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+O">
          Open
        </MenuBar.Item>
        <MenuBar.Separator />
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+S">
          Save
        </MenuBar.Item>
      </MenuBar.Menu>
      <MenuBar.Menu label="Edit">
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Z">
          Undo
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Y">
          Redo
        </MenuBar.Item>
      </MenuBar.Menu>
      <MenuBar.Menu label="View">
        <MenuBar.Sub label="Layout">
          <MenuBar.Item onClick={() => {}}>Single</MenuBar.Item>
          <MenuBar.Item onClick={() => {}}>Split</MenuBar.Item>
        </MenuBar.Sub>
      </MenuBar.Menu>
    </MenuBar>
  );

describe('MenuBar', () => {
  describe('Rendering', () => {
    it('renders with role="menubar"', () => {
      renderMenuBar();
      expect(screen.getByRole('menubar')).toBeInTheDocument();
    });

    it('renders menu triggers', () => {
      renderMenuBar();
      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('does not show dropdown by default', () => {
      renderMenuBar();
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('opens menu on click', () => {
      renderMenuBar();
      fireEvent.click(screen.getByText('File'));
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('closes menu on second click', () => {
      renderMenuBar();
      fireEvent.click(screen.getByText('File'));
      expect(screen.getByText('New')).toBeInTheDocument();
      fireEvent.click(screen.getByText('File'));
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });

    it('opens adjacent menu on hover when one is open', () => {
      renderMenuBar();
      // Open File menu
      fireEvent.click(screen.getByText('File'));
      expect(screen.getByText('New')).toBeInTheDocument();

      // Hover over Edit — should open Edit menu
      fireEvent.mouseEnter(screen.getByText('Edit'));
      expect(screen.getByText('Undo')).toBeInTheDocument();
      // File menu items should be gone
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });

    it('does NOT open menu on hover when none is open', () => {
      renderMenuBar();
      fireEvent.mouseEnter(screen.getByText('Edit'));
      expect(screen.queryByText('Undo')).not.toBeInTheDocument();
    });

    it('fires onClick and closes menu when item is clicked', () => {
      const handleNew = vi.fn();
      renderWithTheme(
        <MenuBar>
          <MenuBar.Menu label="File">
            <MenuBar.Item onClick={handleNew}>New</MenuBar.Item>
          </MenuBar.Menu>
        </MenuBar>
      );
      fireEvent.click(screen.getByText('File'));
      fireEvent.click(screen.getByText('New'));
      expect(handleNew).toHaveBeenCalledTimes(1);
      // Menu should close
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });

    it('displays shortcut text on items', () => {
      renderMenuBar();
      fireEvent.click(screen.getByText('File'));
      expect(screen.getByText('Ctrl+O')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
    });

    it('renders separator inside dropdown', () => {
      renderMenuBar();
      fireEvent.click(screen.getByText('File'));
      const separators = screen.getAllByRole('separator');
      expect(separators.length).toBeGreaterThanOrEqual(1);
    });

    it('applies configurable dropdown offset', () => {
      renderWithTheme(
        <MenuBar menuOffset={6}>
          <MenuBar.Menu label="File">
            <MenuBar.Item onClick={() => {}}>New</MenuBar.Item>
          </MenuBar.Menu>
        </MenuBar>
      );

      fireEvent.click(screen.getByText('File'));
      const dropdown = screen.getByRole('menu', { name: 'File' });
      expect(dropdown).toHaveStyle({ top: 'calc(100% + 6px)' });
    });
  });

  describe('Submenu', () => {
    it('opens submenu on hover', async () => {
      renderMenuBar();
      fireEvent.click(screen.getByText('View'));
      // Layout is a sub-menu trigger
      const layoutTrigger = screen.getByText('Layout');
      const triggerContainer = layoutTrigger.closest('div') as HTMLElement;
      fireEvent.mouseEnter(triggerContainer);
      await waitFor(() => {
        expect(screen.getByText('Single')).toBeInTheDocument();
        expect(screen.getByText('Split')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens menu with ArrowDown key', () => {
      renderMenuBar();
      const fileTrigger = screen.getByText('File');
      fileTrigger.focus();
      fireEvent.keyDown(fileTrigger, { key: 'ArrowDown' });
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('closes menu with Escape key', () => {
      renderMenuBar();
      const fileTrigger = screen.getByText('File');
      fireEvent.click(fileTrigger);
      expect(screen.getByText('New')).toBeInTheDocument();
      fireEvent.keyDown(fileTrigger, { key: 'Escape' });
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });
  });

  describe('Checkable items', () => {
    it('renders a checkbox item with role and unchecked state', () => {
      renderWithTheme(
        <MenuBar>
          <MenuBar.Menu label="View">
            <MenuBar.CheckboxItem>Show Grid</MenuBar.CheckboxItem>
          </MenuBar.Menu>
        </MenuBar>
      );
      fireEvent.click(screen.getByText('View'));
      const item = screen.getByRole('menuitemcheckbox', { name: 'Show Grid' });
      expect(item).toHaveAttribute('aria-checked', 'false');
    });

    it('toggles aria-checked and fires onCheckedChange (uncontrolled)', () => {
      const onCheckedChange = vi.fn();
      renderWithTheme(
        <MenuBar>
          <MenuBar.Menu label="View">
            <MenuBar.CheckboxItem onCheckedChange={onCheckedChange}>
              Show Grid
            </MenuBar.CheckboxItem>
          </MenuBar.Menu>
        </MenuBar>
      );
      fireEvent.click(screen.getByText('View'));
      const item = screen.getByRole('menuitemcheckbox', { name: 'Show Grid' });
      fireEvent.click(item);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
      expect(item).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps the menu open after toggling a checkbox by default', () => {
      renderWithTheme(
        <MenuBar>
          <MenuBar.Menu label="View">
            <MenuBar.CheckboxItem>Show Grid</MenuBar.CheckboxItem>
          </MenuBar.Menu>
        </MenuBar>
      );
      fireEvent.click(screen.getByText('View'));
      fireEvent.click(
        screen.getByRole('menuitemcheckbox', { name: 'Show Grid' })
      );
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Show Grid' })
      ).toBeInTheDocument();
    });

    it('respects controlled checked state', () => {
      const onCheckedChange = vi.fn();
      renderWithTheme(
        <MenuBar>
          <MenuBar.Menu label="View">
            <MenuBar.CheckboxItem
              checked={false}
              onCheckedChange={onCheckedChange}
            >
              Show Grid
            </MenuBar.CheckboxItem>
          </MenuBar.Menu>
        </MenuBar>
      );
      fireEvent.click(screen.getByText('View'));
      const item = screen.getByRole('menuitemcheckbox', { name: 'Show Grid' });
      expect(item).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(item);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
      // Controlled: stays unchecked until the parent updates `checked`.
      expect(item).toHaveAttribute('aria-checked', 'false');
    });

    it('radio group single-selects and fires onValueChange', () => {
      const onValueChange = vi.fn();
      renderWithTheme(
        <MenuBar>
          <MenuBar.Menu label="View">
            <MenuBar.RadioGroup
              defaultValue="solid"
              onValueChange={onValueChange}
            >
              <MenuBar.RadioItem value="solid">Solid</MenuBar.RadioItem>
              <MenuBar.RadioItem value="wireframe">Wireframe</MenuBar.RadioItem>
            </MenuBar.RadioGroup>
          </MenuBar.Menu>
        </MenuBar>
      );
      fireEvent.click(screen.getByText('View'));
      const solid = screen.getByRole('menuitemradio', { name: 'Solid' });
      const wireframe = screen.getByRole('menuitemradio', {
        name: 'Wireframe',
      });
      expect(solid).toHaveAttribute('aria-checked', 'true');
      expect(wireframe).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(wireframe);
      expect(onValueChange).toHaveBeenCalledWith('wireframe');
      expect(wireframe).toHaveAttribute('aria-checked', 'true');
      expect(solid).toHaveAttribute('aria-checked', 'false');
    });

    it('reserves a leading gutter so checkable items align', () => {
      renderWithTheme(
        <MenuBar>
          <MenuBar.Menu label="View">
            <MenuBar.CheckboxItem checked>Show Grid</MenuBar.CheckboxItem>
            <MenuBar.CheckboxItem>Show Axes</MenuBar.CheckboxItem>
          </MenuBar.Menu>
        </MenuBar>
      );
      fireEvent.click(screen.getByText('View'));
      // Both items carry the same number of leading slots (the reserved gutter
      // is always rendered, checked or not).
      const checked = screen.getByRole('menuitemcheckbox', {
        name: 'Show Grid',
      });
      const unchecked = screen.getByRole('menuitemcheckbox', {
        name: 'Show Axes',
      });
      expect(checked.firstElementChild).not.toBeNull();
      expect(unchecked.firstElementChild).not.toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('triggers have aria-haspopup and aria-expanded', () => {
      renderMenuBar();
      const fileTrigger = screen.getByText('File');
      expect(fileTrigger).toHaveAttribute('aria-haspopup', 'true');
      expect(fileTrigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(fileTrigger);
      expect(fileTrigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('dropdown has role="menu"', () => {
      renderMenuBar();
      fireEvent.click(screen.getByText('File'));
      const menus = screen.getAllByRole('menu');
      expect(menus.length).toBeGreaterThanOrEqual(1);
    });

    it('items have role="menuitem"', () => {
      renderMenuBar();
      fireEvent.click(screen.getByText('File'));
      const items = screen.getAllByRole('menuitem');
      // File, Edit, View triggers + New, Open, Save items
      expect(items.length).toBeGreaterThanOrEqual(3);
    });
  });
});
