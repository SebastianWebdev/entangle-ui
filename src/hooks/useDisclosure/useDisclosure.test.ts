import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDisclosure } from './useDisclosure';

describe('useDisclosure', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('uncontrolled mode', () => {
    it('defaults to isOpen=false', () => {
      const { result } = renderHook(() => useDisclosure());
      expect(result.current.isOpen).toBe(false);
    });

    it('respects defaultOpen=true', () => {
      const { result } = renderHook(() => useDisclosure({ defaultOpen: true }));
      expect(result.current.isOpen).toBe(true);
    });

    it('open() sets isOpen=true and calls onOpenChange(true)', () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() => useDisclosure({ onOpenChange }));

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('close() sets isOpen=false and calls onOpenChange(false)', () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDisclosure({ defaultOpen: true, onOpenChange })
      );

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('toggle() flips the current state', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('setOpen(true) opens the disclosure', () => {
      const { result } = renderHook(() => useDisclosure());

      act(() => {
        result.current.setOpen(true);
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('controlled mode', () => {
    it('isOpen follows the open prop', () => {
      const { result, rerender } = renderHook(
        ({ open }: { open: boolean }) => useDisclosure({ open }),
        { initialProps: { open: false } }
      );
      expect(result.current.isOpen).toBe(false);

      rerender({ open: true });
      expect(result.current.isOpen).toBe(true);
    });

    it('open() calls onOpenChange but does not mutate internal state', () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDisclosure({ open: false, onOpenChange })
      );

      act(() => {
        result.current.open();
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(result.current.isOpen).toBe(false);
    });

    it('toggle() in controlled mode calls onOpenChange with the inverted value', () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDisclosure({ open: true, onOpenChange })
      );

      act(() => {
        result.current.toggle();
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('callback stability', () => {
    it('open/close/toggle/setOpen identities are stable across renders', () => {
      const { result, rerender } = renderHook(() => useDisclosure());

      const first = {
        open: result.current.open,
        close: result.current.close,
        toggle: result.current.toggle,
        setOpen: result.current.setOpen,
      };

      rerender();

      expect(result.current.open).toBe(first.open);
      expect(result.current.close).toBe(first.close);
      expect(result.current.toggle).toBe(first.toggle);
      expect(result.current.setOpen).toBe(first.setOpen);
    });
  });
});
