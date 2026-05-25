import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateEdgeId, generateNodeId } from './nodeGraphIds';

const sourceRef = { node: 'a', port: 'out' };
const targetRef = { node: 'b', port: 'in' };

afterEach(() => {
  vi.useRealTimers();
});

describe('generateEdgeId', () => {
  it('embeds source and target in the id', () => {
    const id = generateEdgeId(sourceRef, targetRef);
    expect(id).toContain('a.out');
    expect(id).toContain('b.in');
    expect(id.startsWith('edge-')).toBe(true);
  });

  it('produces unique ids even when timestamps collide', () => {
    // Pin Date.now so both calls share the same timestamp segment. Without
    // a random / counter suffix the resulting ids would be identical and
    // collide as edge keys downstream.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    const a = generateEdgeId(sourceRef, targetRef);
    const b = generateEdgeId(sourceRef, targetRef);
    expect(a).not.toBe(b);
  });

  it('produces unique ids across a tight burst', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    const ids = new Set<string>();
    for (let i = 0; i < 200; i++) {
      ids.add(generateEdgeId(sourceRef, targetRef));
    }
    expect(ids.size).toBe(200);
  });
});

describe('generateNodeId', () => {
  it('embeds the template id', () => {
    const id = generateNodeId('add');
    expect(id.startsWith('add-')).toBe(true);
  });

  it('produces unique ids even when timestamps collide', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    const a = generateNodeId('add');
    const b = generateNodeId('add');
    expect(a).not.toBe(b);
  });
});
