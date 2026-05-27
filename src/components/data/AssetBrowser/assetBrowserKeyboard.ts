export interface GridNavParams {
  /** Number of columns currently laid out. */
  columns: number;
  /** Total item count. */
  count: number;
  /** Rows that fit in one viewport — used by PageUp/PageDown. */
  rowsPerPage: number;
}

/**
 * Pure 2D grid keyboard navigation. Given the focused index and a key, return
 * the next index. Returns the clamped target, or the original index when the
 * key is not a navigation key or the move would leave the grid.
 */
export function nextGridIndex(
  current: number,
  key: string,
  params: GridNavParams
): number {
  const { count } = params;
  if (count === 0) return -1;

  const columns = Math.max(1, params.columns);
  const rowsPerPage = Math.max(1, params.rowsPerPage);
  const last = count - 1;
  const clamp = (n: number): number => Math.min(last, Math.max(0, n));

  // Starting from "nothing focused", any nav key lands on the first item.
  if (current < 0) {
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Home':
      case 'PageUp':
        return 0;
      case 'End':
      case 'PageDown':
        return last;
      default:
        return current;
    }
  }

  switch (key) {
    case 'ArrowRight':
      return current < last ? current + 1 : current;
    case 'ArrowLeft':
      return current > 0 ? current - 1 : current;
    case 'ArrowDown': {
      const target = current + columns;
      return target <= last ? target : current;
    }
    case 'ArrowUp': {
      const target = current - columns;
      return target >= 0 ? target : current;
    }
    case 'Home':
      return 0;
    case 'End':
      return last;
    case 'PageDown':
      return clamp(current + columns * rowsPerPage);
    case 'PageUp':
      return clamp(current - columns * rowsPerPage);
    default:
      return current;
  }
}

/** Inclusive index range between two indices, regardless of order. */
export function indexRange(a: number, b: number): [number, number] {
  return a <= b ? [a, b] : [b, a];
}
