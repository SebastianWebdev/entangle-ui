import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { Menu } from './Menu';

// Mock Base UI Menu to avoid @floating-ui positioning loops in jsdom and to
// keep the popup content mounted so items can be queried without opening.
vi.mock('@base-ui/react/menu', async () => {
  const { createElement, Fragment, forwardRef } = await import('react');

  interface MockProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler;
    disabled?: boolean;
    'data-testid'?: string;
  }

  const Frag = ({ children }: MockProps) =>
    createElement(Fragment, null, children);
  const Div = ({ children }: MockProps) => createElement('div', null, children);
  const Pass = forwardRef<HTMLDivElement, MockProps>(
    ({ children, className, onClick, disabled, 'data-testid': testId }, ref) =>
      createElement(
        'div',
        {
          ref,
          className,
          onClick,
          'data-disabled': disabled ? '' : undefined,
          'data-testid': testId,
        },
        children
      )
  );
  Pass.displayName = 'Pass';
  const Trigger = ({ children }: MockProps) =>
    createElement('button', { type: 'button' }, children);

  return {
    Menu: {
      Root: Frag,
      Trigger,
      Portal: Frag,
      Positioner: Div,
      Popup: Pass,
      Group: Frag,
      GroupLabel: Div,
      Separator: Pass,
      RadioGroup: Frag,
      RadioItem: Pass,
      RadioItemIndicator: Frag,
      CheckboxItem: Pass,
      CheckboxItemIndicator: Frag,
      Item: Pass,
      SubmenuRoot: Frag,
      SubmenuTrigger: Pass,
    },
  };
});

describe('Menu', () => {
  describe('Rendering', () => {
    it('renders the trigger label', () => {
      renderWithTheme(
        <Menu>
          <Menu.Trigger>Options</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Copy</Menu.Item>
          </Menu.Content>
        </Menu>
      );

      expect(screen.getByText('Options')).toBeInTheDocument();
    });

    it('renders composed items with labels', () => {
      renderWithTheme(
        <Menu>
          <Menu.Trigger>Edit</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Cut</Menu.Item>
            <Menu.Item>Copy</Menu.Item>
            <Menu.Item>Paste</Menu.Item>
          </Menu.Content>
        </Menu>
      );

      expect(screen.getByText('Cut')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
    });

    it('renders icon, shortcut and end content slots', () => {
      renderWithTheme(
        <Menu>
          <Menu.Trigger>File</Menu.Trigger>
          <Menu.Content>
            <Menu.Item
              icon={<span data-testid="icon">i</span>}
              shortcut="⌘S"
              endContent={<span data-testid="badge">3</span>}
            >
              Save
            </Menu.Item>
          </Menu.Content>
        </Menu>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('⌘S')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders a group label', () => {
      renderWithTheme(
        <Menu>
          <Menu.Trigger>View</Menu.Trigger>
          <Menu.Content>
            <Menu.Group label="View Mode">
              <Menu.Item>Solid</Menu.Item>
            </Menu.Group>
          </Menu.Content>
        </Menu>
      );

      expect(screen.getByText('View Mode')).toBeInTheDocument();
      expect(screen.getByText('Solid')).toBeInTheDocument();
    });

    it('renders radio and checkbox items', () => {
      renderWithTheme(
        <Menu>
          <Menu.Trigger>Display</Menu.Trigger>
          <Menu.Content>
            <Menu.RadioGroup value="perspective">
              <Menu.RadioItem value="perspective">Perspective</Menu.RadioItem>
              <Menu.RadioItem value="ortho">Orthographic</Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.Separator />
            <Menu.CheckboxItem checked>Grid</Menu.CheckboxItem>
          </Menu.Content>
        </Menu>
      );

      expect(screen.getByText('Perspective')).toBeInTheDocument();
      expect(screen.getByText('Orthographic')).toBeInTheDocument();
      expect(screen.getByText('Grid')).toBeInTheDocument();
    });

    it('renders a submenu trigger and its content', () => {
      renderWithTheme(
        <Menu>
          <Menu.Trigger>Add</Menu.Trigger>
          <Menu.Content>
            <Menu.Sub>
              <Menu.SubTrigger>Mesh</Menu.SubTrigger>
              <Menu.SubContent>
                <Menu.Item>Cube</Menu.Item>
                <Menu.Item>Sphere</Menu.Item>
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.Content>
        </Menu>
      );

      expect(screen.getByText('Mesh')).toBeInTheDocument();
      expect(screen.getByText('Cube')).toBeInTheDocument();
      expect(screen.getByText('Sphere')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when an item is clicked', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <Menu>
          <Menu.Trigger>Edit</Menu.Trigger>
          <Menu.Content>
            <Menu.Item onClick={handleClick}>Copy</Menu.Item>
          </Menu.Content>
        </Menu>
      );

      fireEvent.click(screen.getByText('Copy'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('marks disabled items with data-disabled', () => {
      renderWithTheme(
        <Menu>
          <Menu.Trigger>Edit</Menu.Trigger>
          <Menu.Content>
            <Menu.Item disabled testId="paste-item">
              Paste
            </Menu.Item>
          </Menu.Content>
        </Menu>
      );

      expect(screen.getByTestId('paste-item')).toHaveAttribute('data-disabled');
    });
  });
});
