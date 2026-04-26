import { fireEvent, render } from '@testing-library/react';
import { useRef, type RefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useClickOutside } from './useClickOutside';

interface HarnessProps {
  handler: (event: MouseEvent) => void;
  enabled?: boolean;
  event?: 'mousedown' | 'click' | 'pointerdown';
}

function SingleRefHarness({ handler, enabled, event }: HarnessProps) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, handler, { enabled, event });
  return (
    <div>
      <div data-testid="inside" ref={ref}>
        <button data-testid="inside-child">child</button>
      </div>
      <div data-testid="outside">outside</div>
    </div>
  );
}

interface MultiHarnessProps {
  handler: (event: MouseEvent) => void;
}

function MultiRefHarness({ handler }: MultiHarnessProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  useClickOutside(
    [
      triggerRef as RefObject<HTMLElement | null>,
      popoverRef as RefObject<HTMLElement | null>,
    ],
    handler
  );
  return (
    <div>
      <button data-testid="trigger" ref={triggerRef}>
        trigger
      </button>
      <div data-testid="popover" ref={popoverRef}>
        popover
      </div>
      <div data-testid="outside">outside</div>
    </div>
  );
}

describe('useClickOutside', () => {
  it('calls handler when clicking outside the ref', () => {
    const handler = vi.fn();
    const { getByTestId } = render(<SingleRefHarness handler={handler} />);

    fireEvent.mouseDown(getByTestId('outside'));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler when clicking on the ref element itself', () => {
    const handler = vi.fn();
    const { getByTestId } = render(<SingleRefHarness handler={handler} />);

    fireEvent.mouseDown(getByTestId('inside'));

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call handler when clicking on a descendant of the ref', () => {
    const handler = vi.fn();
    const { getByTestId } = render(<SingleRefHarness handler={handler} />);

    fireEvent.mouseDown(getByTestId('inside-child'));

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire when enabled=false', () => {
    const handler = vi.fn();
    const { getByTestId } = render(
      <SingleRefHarness handler={handler} enabled={false} />
    );

    fireEvent.mouseDown(getByTestId('outside'));

    expect(handler).not.toHaveBeenCalled();
  });

  it('re-attaches the listener when enabled toggles back to true', () => {
    const handler = vi.fn();
    const { getByTestId, rerender } = render(
      <SingleRefHarness handler={handler} enabled={false} />
    );

    fireEvent.mouseDown(getByTestId('outside'));
    expect(handler).not.toHaveBeenCalled();

    rerender(<SingleRefHarness handler={handler} enabled={true} />);
    fireEvent.mouseDown(getByTestId('outside'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('removes the listener on unmount', () => {
    const handler = vi.fn();
    const { unmount, baseElement } = render(
      <SingleRefHarness handler={handler} />
    );

    unmount();
    fireEvent.mouseDown(baseElement);

    expect(handler).not.toHaveBeenCalled();
  });

  it('responds to a custom event option', () => {
    const handler = vi.fn();
    const { getByTestId } = render(
      <SingleRefHarness handler={handler} event="click" />
    );

    fireEvent.mouseDown(getByTestId('outside'));
    expect(handler).not.toHaveBeenCalled();

    fireEvent.click(getByTestId('outside'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  describe('with array of refs', () => {
    it('does not fire when click lands inside any of the refs', () => {
      const handler = vi.fn();
      const { getByTestId } = render(<MultiRefHarness handler={handler} />);

      fireEvent.mouseDown(getByTestId('trigger'));
      expect(handler).not.toHaveBeenCalled();

      fireEvent.mouseDown(getByTestId('popover'));
      expect(handler).not.toHaveBeenCalled();
    });

    it('fires when click lands outside all refs', () => {
      const handler = vi.fn();
      const { getByTestId } = render(<MultiRefHarness handler={handler} />);

      fireEvent.mouseDown(getByTestId('outside'));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  it('always invokes the latest handler (handler ref pattern)', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { getByTestId, rerender } = render(
      <SingleRefHarness handler={first} />
    );

    rerender(<SingleRefHarness handler={second} />);
    fireEvent.mouseDown(getByTestId('outside'));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
