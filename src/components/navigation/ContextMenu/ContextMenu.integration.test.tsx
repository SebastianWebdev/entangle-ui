import { screen } from '@testing-library/react';

import { renderWithTheme } from '@/tests/testUtils';

import { ContextMenu } from './ContextMenu';

// Runs against the real `@base-ui/react` ContextMenu (no mock) so the trigger
// wiring is exercised on dependency upgrades. The closed popup is portalled and
// not mounted, so these assertions avoid the floating-ui positioning path.

describe('ContextMenu (integration)', () => {
  it('renders the trigger area children by default', () => {
    renderWithTheme(
      <ContextMenu>
        <ContextMenu.Trigger>
          <div data-testid="area">Right-click me</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <div>Item</div>
        </ContextMenu.Content>
      </ContextMenu>
    );

    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.queryByText('Item')).not.toBeInTheDocument();
  });

  it('renders the trigger as the provided element via the render prop', () => {
    renderWithTheme(
      <ContextMenu>
        <ContextMenu.Trigger
          render={<section data-testid="rendered-trigger">Custom area</section>}
        />
        <ContextMenu.Content>
          <div>Item</div>
        </ContextMenu.Content>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('rendered-trigger');
    expect(trigger.tagName).toBe('SECTION');
    expect(trigger).toHaveTextContent('Custom area');
    // The render path skips the `display: contents` wrapper.
    expect(trigger.style.display).not.toBe('contents');
  });
});
