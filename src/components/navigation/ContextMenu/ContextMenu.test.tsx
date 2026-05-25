import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { ContextMenu } from './ContextMenu';
import { Menu } from '../Menu/Menu';

interface MockProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  'data-testid'?: string;
}

// Mock Base UI ContextMenu to avoid @floating-ui positioning loops in jsdom.
// Positioner uses floating-ui which infinite-loops when getBoundingClientRect
// returns zeros. Popup stays mounted so content can be queried without opening.
vi.mock('@base-ui/react/context-menu', async () => {
  const { createElement, Fragment, forwardRef } = await import('react');

  const Frag = ({ children }: MockProps) =>
    createElement(Fragment, null, children);
  const Div = ({ children }: MockProps) => createElement('div', null, children);
  const Pass = forwardRef<HTMLDivElement, MockProps>(
    ({ children, className, style, 'data-testid': testId }, ref) =>
      createElement(
        'div',
        { ref, className, style, 'data-testid': testId },
        children
      )
  );
  Pass.displayName = 'Pass';

  return {
    ContextMenu: {
      Root: Frag,
      Trigger: Pass,
      Portal: Frag,
      Positioner: Div,
      Popup: Pass,
    },
  };
});

// Items inside the content reuse the shared Menu primitives.
vi.mock('@base-ui/react/menu', async () => {
  const { createElement, Fragment, forwardRef } = await import('react');

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

  return {
    Menu: {
      Root: Frag,
      Trigger: ({ children }: MockProps) =>
        createElement('button', { type: 'button' }, children),
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

describe('ContextMenu', () => {
  it('renders the trigger area children', () => {
    renderWithTheme(
      <ContextMenu>
        <ContextMenu.Trigger>
          <div data-testid="context-target">Right click target</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <Menu.Item>Copy</Menu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    );

    expect(screen.getByTestId('context-target')).toBeInTheDocument();
  });

  it('renders composed items inside the content', () => {
    renderWithTheme(
      <ContextMenu>
        <ContextMenu.Trigger>
          <div>Content</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <Menu.Item>Cut</Menu.Item>
          <Menu.Item>Copy</Menu.Item>
          <Menu.Item>Paste</Menu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    );

    expect(screen.getByText('Cut')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
  });

  it('fires the item onClick handler', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <ContextMenu>
        <ContextMenu.Trigger>
          <div>Content</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <Menu.Item onClick={handleClick}>Delete</Menu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders a fully custom panel node inside the content', () => {
    renderWithTheme(
      <ContextMenu>
        <ContextMenu.Trigger>
          <div>Content</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <div data-testid="custom-panel">
            <input placeholder="Search" />
          </div>
        </ContextMenu.Content>
      </ContextMenu>
    );

    expect(screen.getByTestId('custom-panel')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('accepts the disabled prop without breaking the trigger', () => {
    renderWithTheme(
      <ContextMenu disabled>
        <ContextMenu.Trigger>
          <div data-testid="target">Content</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <Menu.Item>Action</Menu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    );

    expect(screen.getByTestId('target')).toBeInTheDocument();
  });
});
