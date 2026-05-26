import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { Menu } from './Menu';
import type { MenuHandle } from './Menu.types';

// These tests run against the real `@base-ui/react` Menu (no mock) so they
// catch integration regressions on dependency upgrades: keyboard/pointer
// activation, open/close wiring, and the imperative handle.

describe('Menu (integration)', () => {
  it('keeps the popup closed until the trigger is activated', () => {
    renderWithTheme(
      <Menu>
        <Menu.Trigger>Options</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Copy</Menu.Item>
        </Menu.Content>
      </Menu>
    );

    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
  });

  it('opens on trigger click and fires the item handler when selected', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    renderWithTheme(
      <Menu>
        <Menu.Trigger>Edit</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onClick={handleSelect}>Copy</Menu.Item>
        </Menu.Content>
      </Menu>
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const item = await screen.findByText('Copy');
    await user.click(item);

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('closes imperatively through the root ref handle', async () => {
    const user = userEvent.setup();
    const handle = React.createRef<MenuHandle>();

    renderWithTheme(
      <Menu ref={handle}>
        <Menu.Trigger>Menu</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Item</Menu.Item>
        </Menu.Content>
      </Menu>
    );

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await screen.findByText('Item');

    act(() => {
      handle.current?.close();
    });

    await waitFor(() =>
      expect(screen.queryByText('Item')).not.toBeInTheDocument()
    );
  });
});
