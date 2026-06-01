import type { LogEntry, LogLevel, ResolvedLogEntry } from './LogView.types';

/** Per-level totals over the currently stored entries. */
export type LogLevelCounts = Readonly<Record<string, number>>;

type Listener = () => void;

const hasRaf = typeof requestAnimationFrame === 'function';

/**
 * Single source of truth for a LogView instance's entries.
 *
 * Two write paths feed it:
 *
 * - **Controlled mirror** — `setEntries` replaces the whole list from the
 *   `entries` prop (low frequency, consumer-driven).
 * - **Imperative append** — `append` / `appendMany` buffer entries and flush
 *   once per animation frame (`flush`), so a streaming source pushing thousands
 *   of lines per second collapses into one notification per frame. This mirrors
 *   the rAF-throttled store-write invariant in
 *   `docs/nodegraph-performance.md` (rule #1).
 *
 * Per-level `counts` are maintained incrementally so the level filter can show
 * live totals without an O(n) scan per frame. The entries array and the counts
 * snapshot are each replaced (never mutated in place) on change, so
 * `useSyncExternalStore` consumers see a fresh reference exactly when their
 * slice changes.
 */
export class LogViewStore {
  #entries: ResolvedLogEntry[] = [];
  #counts: Record<string, number> = {};
  #countsSnapshot: LogLevelCounts = {};
  #seq = 0;
  #maxEntries: number | undefined;
  #getEntryId: ((entry: LogEntry, index: number) => string) | undefined;

  #pending: LogEntry[] | null = null;
  #rafId = 0;

  #entryListeners = new Set<Listener>();
  #countListeners = new Set<Listener>();
  #scrollToBottomFn: (() => void) | null = null;
  #scrollToIndexFn: ((index: number) => void) | null = null;

  constructor(
    options: {
      initial?: readonly LogEntry[];
      maxEntries?: number;
      getEntryId?: (entry: LogEntry, index: number) => string;
    } = {}
  ) {
    this.#maxEntries = options.maxEntries;
    this.#getEntryId = options.getEntryId;
    if (options.initial && options.initial.length > 0) {
      this.#entries = options.initial.map((entry, index) =>
        this.#normalize(entry, index)
      );
      this.#recomputeCounts();
      this.#trim();
    }
  }

  // ── Read API (arrow fns so they can be passed directly to subscribe hooks) ──

  getEntries = (): readonly ResolvedLogEntry[] => this.#entries;
  getCounts = (): LogLevelCounts => this.#countsSnapshot;

  subscribeEntries = (listener: Listener): (() => void) => {
    this.#entryListeners.add(listener);
    return () => {
      this.#entryListeners.delete(listener);
    };
  };

  subscribeCounts = (listener: Listener): (() => void) => {
    this.#countListeners.add(listener);
    return () => {
      this.#countListeners.delete(listener);
    };
  };

  // ── Configuration (re-applied by the root when props change) ──

  setMaxEntries(max: number | undefined): void {
    if (max === this.#maxEntries) return;
    this.#maxEntries = max;
    if (this.#trim()) this.#emit();
  }

  setGetEntryId(
    getEntryId: ((entry: LogEntry, index: number) => string) | undefined
  ): void {
    this.#getEntryId = getEntryId;
  }

  // ── Controlled mirror ──

  /** Replace all entries from the controlled `entries` prop. */
  setEntries(next: readonly LogEntry[]): void {
    // Cancel any buffered imperative appends — the controlled list wins.
    this.#pending = null;
    this.#entries = next.map((entry, index) => this.#normalize(entry, index));
    this.#recomputeCounts();
    this.#trim();
    this.#emit();
  }

  // ── Imperative (uncontrolled) writes — rAF-batched ──

  append(entry: LogEntry): void {
    (this.#pending ??= []).push(entry);
    this.#scheduleFlush();
  }

  appendMany(entries: readonly LogEntry[]): void {
    if (entries.length === 0) return;
    (this.#pending ??= []).push(...entries);
    this.#scheduleFlush();
  }

  clear(): void {
    this.#pending = null;
    if (this.#entries.length === 0) return;
    this.#entries = [];
    this.#counts = {};
    this.#countsSnapshot = {};
    this.#emit();
  }

  /** Flush buffered appends synchronously. Called on `pointerup`-style reads and in tests. */
  flush(): void {
    if (this.#rafId !== 0) {
      if (hasRaf) cancelAnimationFrame(this.#rafId);
      this.#rafId = 0;
    }
    const pending = this.#pending;
    if (!pending || pending.length === 0) {
      this.#pending = null;
      return;
    }
    this.#pending = null;

    const base = this.#entries.length;
    const appended = pending.map((entry, index) =>
      this.#normalize(entry, base + index)
    );
    this.#entries = this.#entries.concat(appended);
    for (const entry of appended) {
      this.#counts[entry.level] = (this.#counts[entry.level] ?? 0) + 1;
    }
    this.#trim();
    this.#publishCounts();
    this.#emit();
  }

  /** Cancel any scheduled flush. Call on unmount. */
  dispose(): void {
    if (this.#rafId !== 0 && hasRaf) cancelAnimationFrame(this.#rafId);
    this.#rafId = 0;
    this.#pending = null;
    this.#entryListeners.clear();
    this.#countListeners.clear();
    this.#scrollToBottomFn = null;
    this.#scrollToIndexFn = null;
  }

  // ── Scroll coordination (the Body registers its scroller) ──

  registerScroller(fn: () => void): () => void {
    this.#scrollToBottomFn = fn;
    return () => {
      if (this.#scrollToBottomFn === fn) this.#scrollToBottomFn = null;
    };
  }

  scrollToBottom(): void {
    this.#scrollToBottomFn?.();
  }

  registerScrollToIndex(fn: (index: number) => void): () => void {
    this.#scrollToIndexFn = fn;
    return () => {
      if (this.#scrollToIndexFn === fn) this.#scrollToIndexFn = null;
    };
  }

  scrollToIndex(index: number): void {
    this.#scrollToIndexFn?.(index);
  }

  // ── Internals ──

  #normalize(entry: LogEntry, index: number): ResolvedLogEntry {
    const seq = this.#seq++;
    const id = entry.id ?? this.#getEntryId?.(entry, index) ?? `__log_${seq}__`;
    const level: LogLevel = entry.level ?? 'info';
    return {
      id,
      level,
      message: entry.message,
      timestamp: entry.timestamp,
      source: entry.source,
      meta: entry.meta,
      seq,
    };
  }

  /** Drop oldest entries past the cap, decrementing counts. Returns true if trimmed. */
  #trim(): boolean {
    const max = this.#maxEntries;
    if (max === undefined || this.#entries.length <= max) return false;
    const removeCount = this.#entries.length - max;
    for (let i = 0; i < removeCount; i += 1) {
      const removed = this.#entries[i];
      if (removed) {
        const next = (this.#counts[removed.level] ?? 0) - 1;
        this.#counts[removed.level] = next > 0 ? next : 0;
      }
    }
    this.#entries = this.#entries.slice(removeCount);
    this.#publishCounts();
    return true;
  }

  #recomputeCounts(): void {
    const counts: Record<string, number> = {};
    for (const entry of this.#entries) {
      counts[entry.level] = (counts[entry.level] ?? 0) + 1;
    }
    this.#counts = counts;
    this.#publishCounts();
  }

  #publishCounts(): void {
    this.#countsSnapshot = { ...this.#counts };
  }

  #scheduleFlush(): void {
    if (this.#rafId !== 0) return;
    if (hasRaf) {
      this.#rafId = requestAnimationFrame(() => {
        this.#rafId = 0;
        this.flush();
      });
    } else {
      // SSR / non-DOM: flush on a microtask so behavior is still batched.
      this.#rafId = -1;
      queueMicrotask(() => {
        this.#rafId = 0;
        this.flush();
      });
    }
  }

  #emit(): void {
    this.#entryListeners.forEach(listener => {
      listener();
    });
    this.#countListeners.forEach(listener => {
      listener();
    });
  }
}
