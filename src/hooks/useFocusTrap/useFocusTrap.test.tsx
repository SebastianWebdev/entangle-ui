import { useRef } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

function Trap({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleKeyDown = useFocusTrap({ containerRef: ref, enabled });
  return (
    <div ref={ref} onKeyDown={handleKeyDown} data-testid="container">
      <button data-testid="first">first</button>
      <button data-testid="middle">middle</button>
      <button data-testid="last">last</button>
    </div>
  );
}

function EmptyTrap() {
  const ref = useRef<HTMLDivElement>(null);
  const handleKeyDown = useFocusTrap({ containerRef: ref });
  return (
    <div ref={ref} onKeyDown={handleKeyDown} data-testid="container">
      <span>no focusable here</span>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('Tab from last focusable wraps to first', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<Trap />);
    const last = getByTestId('last');
    last.focus();
    expect(document.activeElement).toBe(last);

    await user.tab();
    expect(document.activeElement).toBe(getByTestId('first'));
  });

  it('Shift+Tab from first focusable wraps to last', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<Trap />);
    const first = getByTestId('first');
    first.focus();
    expect(document.activeElement).toBe(first);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(getByTestId('last'));
  });

  it('disabled: Tab does not wrap (handler is a no-op)', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<Trap enabled={false} />);
    const last = getByTestId('last');
    last.focus();

    await user.tab();
    // With trap disabled the browser's natural behavior takes over —
    // focus leaves "last" and does NOT wrap back to "first".
    expect(document.activeElement).not.toBe(getByTestId('first'));
  });

  it('does not crash when container has no focusable elements', () => {
    expect(() => render(<EmptyTrap />)).not.toThrow();
  });
});
