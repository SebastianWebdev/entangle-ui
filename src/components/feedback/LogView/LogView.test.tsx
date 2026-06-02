import { act, fireEvent, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { LogView } from './LogView';
import { useLogViewStats } from './LogViewContext';
import { DEFAULT_LOG_VIEW_LABELS } from './logViewLabels';
import { LogViewStore } from './LogViewStore';

import type { LogEntry, LogViewHandle } from './LogView.types';

const ENTRIES: LogEntry[] = [
  { id: '1', level: 'debug', message: 'booting kernel' },
  { id: '2', level: 'info', message: 'server ready', source: 'core' },
  { id: '3', level: 'warn', message: 'retrying connection' },
  { id: '4', level: 'error', message: 'connection refused' },
];

function rows(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-log-row]'));
}

describe('LogViewStore', () => {
  it('flushes buffered appends and reflects them in entries', () => {
    const store = new LogViewStore();
    store.append({ level: 'info', message: 'a' });
    store.append({ level: 'warn', message: 'b' });
    store.flush();
    const entries = store.getEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0]?.message).toBe('a');
    expect(entries[1]?.level).toBe('warn');
  });

  it('appendMany adds all entries on flush', () => {
    const store = new LogViewStore();
    store.appendMany([
      { level: 'info', message: 'x' },
      { level: 'info', message: 'y' },
    ]);
    store.flush();
    expect(store.getEntries()).toHaveLength(2);
  });

  it('assigns a stable id when omitted and honors getEntryId', () => {
    const store = new LogViewStore({
      getEntryId: entry => `custom-${entry.message}`,
    });
    store.append({ level: 'info', message: 'one' });
    store.flush();
    expect(store.getEntries()[0]?.id).toBe('custom-one');

    const plain = new LogViewStore();
    plain.append({ level: 'info', message: 'one' });
    plain.flush();
    expect(plain.getEntries()[0]?.id).toMatch(/^__log_\d+__$/);
  });

  it('defaults the level to info', () => {
    const store = new LogViewStore();
    store.append({ message: 'no level' });
    store.flush();
    expect(store.getEntries()[0]?.level).toBe('info');
  });

  it('maintains per-level counts incrementally', () => {
    const store = new LogViewStore();
    store.appendMany([
      { level: 'error', message: 'a' },
      { level: 'error', message: 'b' },
      { level: 'warn', message: 'c' },
    ]);
    store.flush();
    expect(store.getCounts()).toEqual({ error: 2, warn: 1 });
  });

  it('caps entries at maxEntries (ring buffer) and updates counts', () => {
    const store = new LogViewStore({ maxEntries: 2 });
    store.appendMany([
      { level: 'info', message: '1' },
      { level: 'info', message: '2' },
      { level: 'warn', message: '3' },
    ]);
    store.flush();
    const entries = store.getEntries();
    expect(entries).toHaveLength(2);
    expect(entries.map(e => e.message)).toEqual(['2', '3']);
    expect(store.getCounts()['info']).toBe(1);
    expect(store.getCounts()['warn']).toBe(1);
  });

  it('setEntries replaces the list and recomputes counts', () => {
    const store = new LogViewStore();
    store.append({ level: 'info', message: 'old' });
    store.flush();
    store.setEntries([
      { level: 'error', message: 'new-a' },
      { level: 'error', message: 'new-b' },
    ]);
    expect(store.getEntries()).toHaveLength(2);
    expect(store.getCounts()).toEqual({ error: 2 });
  });

  it('clear empties entries and counts', () => {
    const store = new LogViewStore();
    store.appendMany([{ level: 'info', message: 'a' }]);
    store.flush();
    store.clear();
    expect(store.getEntries()).toHaveLength(0);
    expect(store.getCounts()).toEqual({});
  });

  it('notifies entry subscribers on flush', () => {
    const store = new LogViewStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribeEntries(listener);
    store.append({ level: 'info', message: 'a' });
    store.flush();
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it('keeps stable ids for reused entry objects across setEntries', () => {
    // Controlled re-mirror: the consumer passes a new array each update but
    // reuses the prior entry objects. Id-less entries must keep their key so
    // rows are not remounted and selection-by-id survives.
    const store = new LogViewStore();
    const a: LogEntry = { message: 'a' };
    const b: LogEntry = { message: 'b' };
    store.setEntries([a, b]);
    const ids1 = store.getEntries().map(entry => entry.id);
    store.setEntries([a, b, { message: 'c' }]);
    const ids2 = store.getEntries().map(entry => entry.id);
    expect(ids2.slice(0, 2)).toEqual(ids1);
  });
});

describe('LogView', () => {
  describe('Rendering', () => {
    it('renders one row per entry', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} />
      );
      expect(rows(container)).toHaveLength(4);
    });

    it('renders the message text', () => {
      renderWithTheme(<LogView entries={ENTRIES} virtualized={false} />);
      expect(screen.getByText('connection refused')).toBeInTheDocument();
    });

    it('applies height to the root so the body scrolls internally rather than growing the page', () => {
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          height={300}
          aria-label="Sized log"
        />
      );
      // The height lands on the root container (a fixed-height flex column),
      // not on each row — this is what keeps the scroll inside the component.
      expect(screen.getByLabelText('Sized log')).toHaveStyle({
        height: '300px',
      });
    });

    it('renders the default toolbar (search, level chips, copy, clear)', () => {
      renderWithTheme(<LogView entries={ENTRIES} virtualized={false} />);
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /error/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Clear logs' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Copy logs' })
      ).toBeInTheDocument();
    });

    it('hides the toolbar when showToolbar is false', () => {
      renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} showToolbar={false} />
      );
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });

    it('renders a source tag when present', () => {
      renderWithTheme(<LogView entries={ENTRIES} virtualized={false} />);
      expect(screen.getByText('core')).toBeInTheDocument();
    });

    it('reserves the source column on rows without a source (table alignment)', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={[
            { id: 'a', level: 'info', message: 'with source', source: 'core' },
            { id: 'b', level: 'info', message: 'no source' },
          ]}
          virtualized={false}
        />
      );
      // At least one entry has a source, so every row renders a (possibly empty)
      // source cell — that reservation is what keeps the message text aligned.
      expect(container.querySelectorAll('[data-log-source]')).toHaveLength(2);
      expect(screen.getByText('core')).toBeInTheDocument();
      expect(screen.getByText('no source')).toBeInTheDocument();
    });

    it('renders no source column when no entry has a source', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={[
            { id: 'a', level: 'info', message: 'one' },
            { id: 'b', level: 'warn', message: 'two' },
          ]}
          virtualized={false}
        />
      );
      // showSource defaults true, but nothing has a source → no column at all,
      // so the layout looks column-less (message right after the icon).
      expect(container.querySelectorAll('[data-log-source]')).toHaveLength(0);
    });

    it('reserves the timestamp column when at least one entry has a timestamp', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={[
            { id: 'a', level: 'info', message: 'a', timestamp: Date.now() },
            { id: 'b', level: 'info', message: 'b' },
          ]}
          virtualized={false}
          showTimestamps
        />
      );
      expect(container.querySelectorAll('[data-log-time]')).toHaveLength(2);
    });

    it('renders no timestamp column when showTimestamps is on but no entry has one', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={[
            { id: 'a', level: 'info', message: 'a' },
            { id: 'b', level: 'info', message: 'b' },
          ]}
          virtualized={false}
          showTimestamps
        />
      );
      expect(container.querySelectorAll('[data-log-time]')).toHaveLength(0);
    });

    it('renders timestamps when enabled', () => {
      renderWithTheme(
        <LogView
          entries={[
            {
              id: 't',
              level: 'info',
              message: 'tick',
              timestamp: new Date(2026, 0, 1, 12, 30, 45, 123),
            },
          ]}
          virtualized={false}
          showTimestamps
        />
      );
      expect(screen.getByText('12:30:45.123')).toBeInTheDocument();
    });

    it('renders an empty state when there are no entries', () => {
      renderWithTheme(
        <LogView entries={[]} virtualized={false} emptyState="Nothing here" />
      );
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('renders a footer whose content can read live stats', () => {
      function Footer() {
        const { total, counts } = useLogViewStats();
        return <span>{`total=${total} err=${counts['error'] ?? 0}`}</span>;
      }
      renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} footer={<Footer />} />
      );
      expect(screen.getByText('total=4 err=1')).toBeInTheDocument();
    });

    it('supports a custom renderEntry', () => {
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          renderEntry={({ entry }) => (
            <span data-testid={`row-${entry.id}`}>custom:{entry.message}</span>
          )}
        />
      );
      expect(screen.getByTestId('row-4')).toHaveTextContent(
        'custom:connection refused'
      );
    });
  });

  describe('Filtering', () => {
    it('filters by search query', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} />
      );
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'connection' },
      });
      const visible = rows(container);
      expect(visible).toHaveLength(2);
      // The matched substring is split across <mark> nodes, so assert on the
      // row's combined text content rather than a single text node.
      expect(
        visible.some(row => row.textContent?.includes('connection refused'))
      ).toBe(true);
      expect(screen.queryByText('booting kernel')).not.toBeInTheDocument();
    });

    it('matches the source tag in search', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} />
      );
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'core' },
      });
      expect(rows(container)).toHaveLength(1);
      expect(screen.getByText('server ready')).toBeInTheDocument();
    });

    it('highlights matched substrings', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} />
      );
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'refused' },
      });
      const marks = container.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
      expect(marks[0]).toHaveTextContent('refused');
    });

    it('toggles a level off to hide its rows', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} />
      );
      expect(rows(container)).toHaveLength(4);
      fireEvent.click(screen.getByRole('button', { name: /error/i }));
      expect(screen.queryByText('connection refused')).not.toBeInTheDocument();
      expect(rows(container)).toHaveLength(3);
    });

    it('shows live per-level counts in the chips', () => {
      renderWithTheme(<LogView entries={ENTRIES} virtualized={false} />);
      const errorChip = screen.getByRole('button', { name: /error/i });
      expect(errorChip).toHaveTextContent('1');
    });
  });

  describe('Controlled state', () => {
    it('calls onQueryChange when typing', () => {
      const onQueryChange = vi.fn();
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          query=""
          onQueryChange={onQueryChange}
        />
      );
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'abc' },
      });
      expect(onQueryChange).toHaveBeenCalledWith('abc');
    });

    it('calls onLevelsChange when toggling a chip', () => {
      const onLevelsChange = vi.fn();
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          levels={['debug', 'info', 'warn', 'error']}
          onLevelsChange={onLevelsChange}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /warn/i }));
      expect(onLevelsChange).toHaveBeenCalledWith(['debug', 'info', 'error']);
    });

    it('respects a controlled levels prop', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} levels={['error']} />
      );
      // Only error is an active known level → debug/info/warn hidden.
      expect(rows(container)).toHaveLength(1);
      expect(screen.getByText('connection refused')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('fires onClear when the clear button is pressed', () => {
      const onClear = vi.fn();
      renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} onClear={onClear} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Clear logs' }));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('fires onCopy with all visible lines from copy-all', () => {
      const onCopy = vi.fn();
      renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} onCopy={onCopy} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Copy logs' }));
      expect(onCopy).toHaveBeenCalledTimes(1);
      const copied = onCopy.mock.calls[0]?.[0] as string;
      expect(copied).toContain('connection refused');
      expect(copied.split('\n')).toHaveLength(4);
    });

    it('fires onEntryClick when a row is activated', () => {
      const onEntryClick = vi.fn();
      const { container } = renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          onEntryClick={onEntryClick}
        />
      );
      const firstRow = rows(container)[0];
      expect(firstRow).toBeDefined();
      fireEvent.click(firstRow as HTMLElement);
      expect(onEntryClick).toHaveBeenCalledTimes(1);
      expect(onEntryClick.mock.calls[0]?.[0]).toMatchObject({ id: '1' });
    });
  });

  describe('Selection', () => {
    it('does not select on click by default (selectionMode false)', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} />
      );
      fireEvent.click(rows(container)[0] as HTMLElement);
      expect(
        container.querySelector('[data-log-row][data-selected]')
      ).toBeNull();
    });

    it('selects a single row on click in multiple mode', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          selectionMode="multiple"
        />
      );
      fireEvent.click(rows(container)[1] as HTMLElement);
      const selected = container.querySelectorAll('[data-selected]');
      expect(selected).toHaveLength(1);
      expect(rows(container)[1]).toHaveAttribute('aria-pressed', 'true');
    });

    it('replaces selection on a plain second click', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          selectionMode="multiple"
        />
      );
      fireEvent.click(rows(container)[0] as HTMLElement);
      fireEvent.click(rows(container)[2] as HTMLElement);
      const selected = container.querySelectorAll('[data-selected]');
      expect(selected).toHaveLength(1);
      expect(rows(container)[2]).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggles rows with Cmd/Ctrl+click', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          selectionMode="multiple"
        />
      );
      fireEvent.click(rows(container)[0] as HTMLElement);
      fireEvent.click(rows(container)[2] as HTMLElement, { ctrlKey: true });
      expect(container.querySelectorAll('[data-selected]')).toHaveLength(2);
      fireEvent.click(rows(container)[0] as HTMLElement, { ctrlKey: true });
      expect(container.querySelectorAll('[data-selected]')).toHaveLength(1);
    });

    it('selects a range with Shift+click', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          selectionMode="multiple"
        />
      );
      fireEvent.click(rows(container)[0] as HTMLElement);
      fireEvent.click(rows(container)[2] as HTMLElement, { shiftKey: true });
      expect(container.querySelectorAll('[data-selected]')).toHaveLength(3);
    });

    it('reports selection via onSelectionChange', () => {
      const onSelectionChange = vi.fn();
      const { container } = renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        />
      );
      fireEvent.click(rows(container)[3] as HTMLElement);
      expect(onSelectionChange).toHaveBeenCalledWith(['4']);
    });

    it('copy button copies the selection when present, else all', () => {
      const onCopy = vi.fn();
      const { container } = renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          selectionMode="multiple"
          onCopy={onCopy}
        />
      );
      // No selection → copies all four lines.
      fireEvent.click(screen.getByRole('button', { name: 'Copy logs' }));
      expect((onCopy.mock.calls[0]?.[0] as string).split('\n')).toHaveLength(4);

      // Select one row → copies just that line.
      fireEvent.click(rows(container)[3] as HTMLElement);
      fireEvent.click(screen.getByRole('button', { name: 'Copy logs' }));
      const copied = onCopy.mock.calls[1]?.[0] as string;
      expect(copied).toContain('connection refused');
      expect(copied.split('\n')).toHaveLength(1);
    });
  });

  describe('Imperative handle (uncontrolled)', () => {
    it('appends entries through the ref', () => {
      // Drive the store's rAF flush synchronously so the commit happens inside
      // act() rather than on a later frame.
      const raf = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation(cb => {
          cb(0);
          return 0;
        });
      const ref = createRef<LogViewHandle>();
      const { container } = renderWithTheme(
        <LogView ref={ref} virtualized={false} />
      );
      act(() => {
        ref.current?.append({ level: 'info', message: 'streamed line' });
      });
      expect(screen.getByText('streamed line')).toBeInTheDocument();
      expect(rows(container)).toHaveLength(1);
      expect(ref.current?.getEntries()).toHaveLength(1);
      raf.mockRestore();
    });

    it('append is a no-op while entries is controlled', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const ref = createRef<LogViewHandle>();
      renderWithTheme(
        <LogView ref={ref} entries={ENTRIES} virtualized={false} />
      );
      ref.current?.append({ level: 'info', message: 'should not appear' });
      expect(screen.queryByText('should not appear')).not.toBeInTheDocument();
      warn.mockRestore();
    });

    it('clear empties an uncontrolled log', () => {
      const raf = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation(cb => {
          cb(0);
          return 0;
        });
      const ref = createRef<LogViewHandle>();
      const { container } = renderWithTheme(
        <LogView ref={ref} virtualized={false} />
      );
      act(() => {
        ref.current?.appendMany([
          { level: 'info', message: 'a' },
          { level: 'info', message: 'b' },
        ]);
      });
      expect(rows(container)).toHaveLength(2);
      act(() => {
        ref.current?.clear();
      });
      expect(rows(container)).toHaveLength(0);
      raf.mockRestore();
    });
  });

  describe('Compound composition', () => {
    it('renders explicit slots and skips the default toolbar', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false}>
          <LogView.Toolbar>
            <LogView.LevelFilter />
          </LogView.Toolbar>
          <LogView.Body />
        </LogView>
      );
      // No search slot was composed.
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
      // Level chips and rows still render.
      expect(
        screen.getByRole('button', { name: /error/i })
      ).toBeInTheDocument();
      expect(rows(container)).toHaveLength(4);
    });

    it('throws when a slot is used outside LogView', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderWithTheme(<LogView.Body />)).toThrow(
        /must be rendered inside <LogView>/
      );
      spy.mockRestore();
    });
  });

  describe('slotProps (default composition)', () => {
    it('forwards props to the default-composition slots', () => {
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          slotProps={{
            search: { placeholder: 'Find…' },
            body: { testId: 'log-body' },
            clear: { 'aria-label': 'Wipe it' },
          }}
        />
      );
      expect(screen.getByPlaceholderText('Find…')).toBeInTheDocument();
      expect(screen.getByTestId('log-body')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Wipe it' })
      ).toBeInTheDocument();
    });

    it('merges a slot className onto the slot base styles', () => {
      const { container } = renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          slotProps={{ body: { className: 'custom-body' } }}
        />
      );
      // The custom class is added alongside the body's own (hashed) base class.
      const body = container.querySelector('.custom-body');
      expect(body).toBeInTheDocument();
      expect(body?.className.split(' ').length).toBeGreaterThan(1);
    });

    it('is ignored when children (manual composition) are provided', () => {
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          slotProps={{ search: { placeholder: 'Should not apply' } }}
        >
          <LogView.Body />
        </LogView>
      );
      // Manual composition renders no default toolbar/search, so the slotProps
      // never reach the DOM.
      expect(
        screen.queryByPlaceholderText('Should not apply')
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });
  });

  describe('Labels (i18n)', () => {
    it('overrides built-in UI strings', () => {
      renderWithTheme(
        <LogView
          entries={[]}
          virtualized={false}
          follow={false}
          labels={{
            emptyLabel: 'Brak wpisów',
            levelFilterLabel: 'Poziomy',
            searchLabel: 'Szukaj',
            clearLabel: 'Wyczyść',
            copyLabel: 'Kopiuj',
            jumpToBottomLabel: 'Na dół',
          }}
        />
      );
      expect(screen.getByText('Brak wpisów')).toBeInTheDocument();
      expect(
        screen.getByRole('group', { name: 'Poziomy' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('searchbox', { name: 'Szukaj' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Wyczyść' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Kopiuj' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Na dół' })
      ).toBeInTheDocument();
    });

    it('localizes the per-line copy label', () => {
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          labels={{ copyLineLabel: 'Kopiuj linię' }}
        />
      );
      expect(screen.getAllByLabelText('Kopiuj linię').length).toBeGreaterThan(
        0
      );
    });

    it('uses the search placeholder from labels', () => {
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          labels={{ searchPlaceholder: 'Filtruj…' }}
        />
      );
      expect(screen.getByPlaceholderText('Filtruj…')).toBeInTheDocument();
    });

    it('falls back to English defaults for keys left unset', () => {
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          labels={{ clearLabel: 'X' }}
        />
      );
      expect(screen.getByRole('button', { name: 'X' })).toBeInTheDocument();
      // copyLabel untouched → English default.
      expect(
        screen.getByRole('button', { name: 'Copy logs' })
      ).toBeInTheDocument();
    });

    it('lets an explicit slot prop win over labels', () => {
      renderWithTheme(
        <LogView
          entries={ENTRIES}
          virtualized={false}
          labels={{ clearLabel: 'FromLabels' }}
          slotProps={{ clear: { 'aria-label': 'FromSlot' } }}
        />
      );
      expect(
        screen.getByRole('button', { name: 'FromSlot' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'FromLabels' })
      ).not.toBeInTheDocument();
    });

    it('formats the new-line counter via newLinesLabel', () => {
      expect(DEFAULT_LOG_VIEW_LABELS.newLinesLabel(3)).toBe('3 new');
    });
  });

  describe('Accessibility', () => {
    it('exposes the log region role and a labelled level group', () => {
      renderWithTheme(<LogView entries={ENTRIES} virtualized={false} />);
      expect(screen.getByRole('log')).toBeInTheDocument();
      expect(
        screen.getByRole('group', { name: 'Filter by level' })
      ).toBeInTheDocument();
    });

    it('marks level chips with aria-pressed reflecting active state', () => {
      renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} levels={['error']} />
      );
      const errorChip = screen.getByRole('button', { name: /error/i });
      expect(errorChip).toHaveAttribute('aria-pressed', 'true');
      const warnChip = screen.getByRole('button', { name: /warn/i });
      expect(warnChip).toHaveAttribute('aria-pressed', 'false');
    });

    it('hides the jump-to-bottom control while following', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} />
      );
      // The wrapper carries the visibility state; aria-hidden removes the
      // inner Button from the a11y tree while attached.
      const jump = container.querySelector('[data-log-jump]');
      expect(jump).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows the jump-to-bottom control when detached (follow=false)', () => {
      const { container } = renderWithTheme(
        <LogView entries={ENTRIES} virtualized={false} follow={false} />
      );
      expect(container.querySelector('[data-log-jump]')).toHaveAttribute(
        'aria-hidden',
        'false'
      );
      // The Button is reachable by its accessible name when visible.
      expect(
        screen.getByRole('button', { name: /jump to bottom/i })
      ).toBeInTheDocument();
    });
  });
});
