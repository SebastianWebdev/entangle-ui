import { fireEvent, render } from '@testing-library/react';
import { useRef, type RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useHotkey } from './useHotkey';
import type { UseHotkeyOptions } from './useHotkey.types';

interface HarnessProps {
  combo: string;
  handler: (event: KeyboardEvent) => void;
  options?: UseHotkeyOptions;
}

function Harness({ combo, handler, options }: HarnessProps) {
  useHotkey(combo, handler, options);
  return (
    <div>
      <input data-testid="text-input" />
      <textarea data-testid="textarea" />
      <input data-testid="checkbox" type="checkbox" />
    </div>
  );
}

const ORIGINAL_USER_AGENT = Object.getOwnPropertyDescriptor(
  globalThis.navigator,
  'userAgent'
);

function setUserAgent(ua: string) {
  Object.defineProperty(globalThis.navigator, 'userAgent', {
    configurable: true,
    get: () => ua,
  });
}

function restoreUserAgent() {
  if (ORIGINAL_USER_AGENT) {
    Object.defineProperty(
      globalThis.navigator,
      'userAgent',
      ORIGINAL_USER_AGENT
    );
  }
}

describe('useHotkey', () => {
  afterEach(() => {
    restoreUserAgent();
  });

  describe('basic combos', () => {
    it('fires when Ctrl+S is pressed', () => {
      const handler = vi.fn();
      render(<Harness combo="Ctrl+S" handler={handler} />);

      fireEvent.keyDown(window, { key: 's', ctrlKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does not fire when Ctrl is missing', () => {
      const handler = vi.fn();
      render(<Harness combo="Ctrl+S" handler={handler} />);

      fireEvent.keyDown(window, { key: 's' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('does not fire on plain S (no modifiers)', () => {
      const handler = vi.fn();
      render(<Harness combo="Ctrl+S" handler={handler} />);

      fireEvent.keyDown(window, { key: 's' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('fires for Escape with no modifiers', () => {
      const handler = vi.fn();
      render(<Harness combo="Escape" handler={handler} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('fires for Ctrl+Shift+P only when both modifiers + P are pressed', () => {
      const handler = vi.fn();
      render(<Harness combo="Ctrl+Shift+P" handler={handler} />);

      fireEvent.keyDown(window, { key: 'p', ctrlKey: true });
      expect(handler).not.toHaveBeenCalled();

      fireEvent.keyDown(window, { key: 'p', ctrlKey: true, shiftKey: true });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does not fire when extra modifiers are pressed', () => {
      const handler = vi.fn();
      render(<Harness combo="Ctrl+S" handler={handler} />);

      fireEvent.keyDown(window, { key: 's', ctrlKey: true, shiftKey: true });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Cmd platform mapping', () => {
    it('on Mac, Cmd+S fires on Meta+S (not Ctrl+S)', () => {
      setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
      );

      const handler = vi.fn();
      render(<Harness combo="Cmd+S" handler={handler} />);

      fireEvent.keyDown(window, { key: 's', metaKey: true });
      expect(handler).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 's', ctrlKey: true });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('on non-Mac, Cmd+S fires on Ctrl+S', () => {
      setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

      const handler = vi.fn();
      render(<Harness combo="Cmd+S" handler={handler} />);

      fireEvent.keyDown(window, { key: 's', ctrlKey: true });
      expect(handler).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 's', metaKey: true });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('editable element handling', () => {
    it('does not fire when focus is in an <input> by default', () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <Harness combo="Ctrl+S" handler={handler} />
      );
      const input = getByTestId('text-input') as HTMLInputElement;

      fireEvent.keyDown(input, {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('does not fire when focus is in a <textarea> by default', () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <Harness combo="Ctrl+S" handler={handler} />
      );
      const textarea = getByTestId('textarea') as HTMLTextAreaElement;

      fireEvent.keyDown(textarea, {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('fires when focus is in a non-editable input (e.g. checkbox)', () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <Harness combo="Ctrl+S" handler={handler} />
      );
      const checkbox = getByTestId('checkbox') as HTMLInputElement;

      fireEvent.keyDown(checkbox, {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('fires when enableInInputs is true', () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <Harness
          combo="Ctrl+S"
          handler={handler}
          options={{ enableInInputs: true }}
        />
      );
      const input = getByTestId('text-input') as HTMLInputElement;

      fireEvent.keyDown(input, {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('options', () => {
    it('preventDefault: true (default) prevents the event default', () => {
      const handler = vi.fn();
      render(<Harness combo="Ctrl+S" handler={handler} />);

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        cancelable: true,
      });
      const prevented = !window.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(prevented).toBe(true);
    });

    it('preventDefault: false leaves the event default intact', () => {
      const handler = vi.fn();
      render(
        <Harness
          combo="Ctrl+S"
          handler={handler}
          options={{ preventDefault: false }}
        />
      );

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        cancelable: true,
      });
      const prevented = !window.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(prevented).toBe(false);
    });

    it('does not fire when enabled=false', () => {
      const handler = vi.fn();
      render(
        <Harness
          combo="Ctrl+S"
          handler={handler}
          options={{ enabled: false }}
        />
      );

      fireEvent.keyDown(window, { key: 's', ctrlKey: true });

      expect(handler).not.toHaveBeenCalled();
    });

    it('always invokes the latest handler (handler ref pattern)', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { rerender } = render(<Harness combo="Ctrl+S" handler={first} />);

      rerender(<Harness combo="Ctrl+S" handler={second} />);

      fireEvent.keyDown(window, { key: 's', ctrlKey: true });

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('removes the listener on unmount', () => {
      const handler = vi.fn();
      const { unmount } = render(<Harness combo="Ctrl+S" handler={handler} />);

      unmount();

      fireEvent.keyDown(window, { key: 's', ctrlKey: true });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('target option', () => {
    it('attaches to a direct EventTarget', () => {
      const handler = vi.fn();
      render(
        <Harness
          combo="Ctrl+S"
          handler={handler}
          options={{ target: document }}
        />
      );

      // Document, not window — but the event still bubbles, so dispatching
      // on the body should reach the document listener.
      fireEvent.keyDown(document.body, { key: 's', ctrlKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('attaches via a RefObject once the element mounts', () => {
      const handler = vi.fn();

      function ScopedHarness() {
        const ref = useRef<HTMLDivElement>(null);
        useHotkey('Ctrl+S', handler, { target: ref });
        return (
          <div ref={ref} data-testid="scope" tabIndex={-1}>
            content
          </div>
        );
      }

      const { getByTestId } = render(<ScopedHarness />);

      // Window-level press should NOT match — listener is scoped.
      fireEvent.keyDown(window, { key: 's', ctrlKey: true });
      expect(handler).not.toHaveBeenCalled();

      fireEvent.keyDown(getByTestId('scope'), {
        key: 's',
        ctrlKey: true,
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('attaches once the ref target mounts after the hook initializes', () => {
      const handler = vi.fn();

      function LateMountHarness({ show }: { show: boolean }) {
        const ref = useRef<HTMLDivElement>(null);
        useHotkey('Ctrl+S', handler, { target: ref });
        return show ? (
          <div ref={ref} data-testid="scope" tabIndex={-1}>
            content
          </div>
        ) : null;
      }

      const { rerender, getByTestId } = render(
        <LateMountHarness show={false} />
      );

      // Hook initialized with ref.current === null — listener not attached.
      fireEvent.keyDown(window, { key: 's', ctrlKey: true });
      expect(handler).not.toHaveBeenCalled();

      rerender(<LateMountHarness show={true} />);

      fireEvent.keyDown(getByTestId('scope'), { key: 's', ctrlKey: true });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the RefObject is still null', () => {
      const handler = vi.fn();
      const ref: RefObject<HTMLElement | null> = { current: null };

      function NeverMountsHarness() {
        useHotkey('Ctrl+S', handler, { target: ref });
        return null;
      }

      render(<NeverMountsHarness />);

      fireEvent.keyDown(window, { key: 's', ctrlKey: true });

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
