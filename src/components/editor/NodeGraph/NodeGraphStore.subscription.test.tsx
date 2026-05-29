import React, { useSyncExternalStore } from 'react';
import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { NodeGraphStore } from './NodeGraphStore';

// Guards against regression of the "stable null snapshot" bug —
// `useSyncExternalStore` compares snapshots with `Object.is`, so a notify-
// only subscription with a constant snapshot getter never re-renders the
// consumer (even though the underlying store changed). The version getters
// exposed by the store return a monotonically increasing number that flips
// on every real mutation, restoring the expected re-render behavior.

describe('NodeGraphStore subscription seam — useSyncExternalStore', () => {
  it('re-renders a consumer when port positions change', () => {
    const store = new NodeGraphStore();
    let renderCount = 0;
    function Probe(): React.ReactElement {
      renderCount++;
      useSyncExternalStore(
        store.subscribePortPositions,
        store.getPortPositionsVersion
      );
      const pos = store.getPortPosition('a', 'out');
      return (
        <div data-testid="probe">{pos ? `${pos.x},${pos.y}` : 'unset'}</div>
      );
    }
    const { getByTestId } = renderWithTheme(<Probe />);
    expect(renderCount).toBe(1);
    expect(getByTestId('probe').textContent).toBe('unset');
    act(() => {
      store.setPortPosition('a', 'out', { x: 42, y: 7, side: 'right' });
    });
    expect(renderCount).toBe(2);
    expect(getByTestId('probe').textContent).toBe('42,7');
  });

  it('does not re-render on no-op port position writes', () => {
    const store = new NodeGraphStore();
    store.setPortPosition('a', 'out', { x: 1, y: 2, side: 'right' });
    let renderCount = 0;
    function Probe(): React.ReactElement | null {
      renderCount++;
      useSyncExternalStore(
        store.subscribePortPositions,
        store.getPortPositionsVersion
      );
      return null;
    }
    renderWithTheme(<Probe />);
    expect(renderCount).toBe(1);
    act(() => {
      store.setPortPosition('a', 'out', { x: 1, y: 2, side: 'right' });
    });
    expect(renderCount).toBe(1);
  });

  it('re-renders a consumer when measured sizes change', () => {
    const store = new NodeGraphStore();
    let renderCount = 0;
    function Probe(): React.ReactElement {
      renderCount++;
      useSyncExternalStore(
        store.subscribeMeasuredSizes,
        store.getMeasuredSizesVersion
      );
      const size = store.getMeasuredSize('a');
      return (
        <div data-testid="probe">
          {size ? `${size.width}x${size.height}` : 'unset'}
        </div>
      );
    }
    const { getByTestId } = renderWithTheme(<Probe />);
    expect(renderCount).toBe(1);
    expect(getByTestId('probe').textContent).toBe('unset');
    act(() => {
      store.setMeasuredSize('a', { width: 200, height: 80 });
    });
    expect(renderCount).toBe(2);
    expect(getByTestId('probe').textContent).toBe('200x80');
  });
});
