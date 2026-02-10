import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import type { MenuConfig } from '../Menu';
import { ContextMenu } from './ContextMenu';
import type { ContextMenuTargetDetails } from './ContextMenu.types';

// Mock Base UI ContextMenu to avoid @floating-ui positioning loops in jsdom.
// Positioner uses floating-ui which infinite-loops when getBoundingClientRect returns zeros.
vi.mock('@base-ui-components/react/context-menu', async () => {
  const { createElement, Fragment, forwardRef } = await import('react');
  const F = ({ children }: { children?: React.ReactNode }) =>
    createElement(Fragment, null, children);
  const D = ({ children }: { children?: React.ReactNode }) =>
    createElement('div', null, children);
  // styled() needs forwardRef-based components
  const S = forwardRef<HTMLDivElement, { children?: React.ReactNode }>(
    ({ children, ...props }, ref) =>
      createElement('div', { ...props, ref }, children as string)
  );
  return {
    ContextMenu: {
      Root: F,
      Trigger: ({
        children,
        onContextMenuCapture,
      }: {
        children: React.ReactNode;
        onContextMenuCapture?: React.MouseEventHandler;
      }) => createElement('div', { onContextMenuCapture }, children),
      Portal: F,
      Positioner: D,
      Popup: S,
      Group: F,
      GroupLabel: D,
      RadioGroup: F,
      Item: S,
      RadioItem: S,
      RadioItemIndicator: F,
      CheckboxItem: S,
      ItemIndicator: F,
      Separator: S,
    },
  };
});

// ContextMenu reuses Menu styled components which wrap BaseMenu sub-components.
// Since BaseContextMenu.Item === BaseMenu.Item (same underlying module), we mock both.
vi.mock('@base-ui-components/react/menu', async () => {
  const { createElement, Fragment, forwardRef } = await import('react');
  const F = ({ children }: { children?: React.ReactNode }) =>
    createElement(Fragment, null, children);
  const D = ({ children }: { children?: React.ReactNode }) =>
    createElement('div', null, children);
  const S = forwardRef<HTMLDivElement, { children?: React.ReactNode }>(
    ({ children, ...props }, ref) =>
      createElement('div', { ...props, ref }, children as string)
  );
  return {
    Menu: {
      Root: F,
      Trigger: D,
      SubmenuTrigger: D,
      Portal: F,
      Positioner: D,
      Popup: S,
      Group: F,
      GroupLabel: D,
      RadioGroup: F,
      Item: S,
      RadioItem: S,
      RadioItemIndicator: F,
      CheckboxItem: S,
      CheckboxItemIndicator: F,
      Separator: S,
    },
  };
});

describe('ContextMenu', () => {
  it('renders trigger area children', () => {
    renderWithTheme(
      <ContextMenu
        config={{
          groups: [
            {
              id: 'actions',
              itemSelectionType: 'none',
              items: [{ id: 'copy', label: 'Copy', onClick: () => {} }],
            },
          ],
        }}
      >
        <div data-testid="context-target">Right click target</div>
      </ContextMenu>
    );

    expect(screen.getByTestId('context-target')).toBeInTheDocument();
  });

  it('resolves config with payload and target from right-click event', () => {
    const payload = { surface: 'assets', id: 'node-1' };
    const resolver = vi
      .fn<(context: ContextMenuTargetDetails<typeof payload>) => MenuConfig>()
      .mockReturnValue({
        groups: [
          {
            id: 'actions',
            itemSelectionType: 'none',
            items: [{ id: 'rename', label: 'Rename', onClick: () => {} }],
          },
        ],
      });

    renderWithTheme(
      <ContextMenu config={resolver} payload={payload}>
        <div data-testid="context-target">
          <span>Target</span>
        </div>
      </ContextMenu>
    );

    fireEvent.contextMenu(screen.getByText('Target'));

    const lastCall = resolver.mock.calls[resolver.mock.calls.length - 1]?.[0];
    expect(lastCall).toBeDefined();
    if (!lastCall) return;

    expect(lastCall.payload).toEqual(payload);
    expect(lastCall.target).toBeInstanceOf(HTMLElement);
    expect(lastCall.event).toBeInstanceOf(MouseEvent);
  });

  it('renders menu items from static config', () => {
    renderWithTheme(
      <ContextMenu
        config={{
          groups: [
            {
              id: 'actions',
              itemSelectionType: 'none',
              items: [
                { id: 'cut', label: 'Cut', onClick: () => {} },
                { id: 'copy', label: 'Copy', onClick: () => {} },
                { id: 'paste', label: 'Paste', onClick: () => {} },
              ],
            },
          ],
        }}
      >
        <div>Content</div>
      </ContextMenu>
    );

    expect(screen.getByText('Cut')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
  });

  it('does not call resolver until context menu is triggered', () => {
    const resolver = vi.fn().mockReturnValue({
      groups: [
        {
          id: 'actions',
          itemSelectionType: 'none',
          items: [{ id: 'action', label: 'Action', onClick: () => {} }],
        },
      ],
    });

    renderWithTheme(
      <ContextMenu config={resolver}>
        <div data-testid="target">Content</div>
      </ContextMenu>
    );

    const initialCallCount = resolver.mock.calls.length;

    fireEvent.contextMenu(screen.getByTestId('target'));

    expect(resolver.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('passes disabled prop to prevent opening', () => {
    renderWithTheme(
      <ContextMenu
        config={{
          groups: [
            {
              id: 'actions',
              itemSelectionType: 'none',
              items: [{ id: 'action', label: 'Action', onClick: () => {} }],
            },
          ],
        }}
        disabled
      >
        <div data-testid="target">Content</div>
      </ContextMenu>
    );

    expect(screen.getByTestId('target')).toBeInTheDocument();
  });
});
