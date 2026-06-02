import { useEffect, useMemo, useRef, useState } from 'react';

import DemoWrapper from '../DemoWrapper';
import { LogView, useLogViewStats } from '@/components/feedback';
import type {
  LogEntry,
  LogLevel,
  LogLevelConfig,
  LogViewHandle,
} from '@/components/feedback';
import { Button } from '@/components/primitives';
import { Stack } from '@/components/layout';
import { Badge, Text } from '@/components/primitives';

const SAMPLE: LogEntry[] = [
  { id: '1', level: 'info', message: 'Renderer initialized', source: 'gpu' },
  {
    id: '2',
    level: 'debug',
    message: 'Loaded 42 shaders in 18ms',
    source: 'gpu',
  },
  {
    id: '3',
    level: 'info',
    message: 'Scene "city_block" opened',
    source: 'scene',
  },
  {
    id: '4',
    level: 'warn',
    message: 'Texture "asphalt_2k" missing mipmaps',
    source: 'assets',
  },
  { id: '5', level: 'info', message: 'Autosave complete', source: 'io' },
  {
    id: '6',
    level: 'error',
    message: 'Failed to import mesh: unexpected EOF',
    source: 'assets',
  },
  {
    id: '7',
    level: 'debug',
    message: 'Frame 1042 · 4.1ms · 312 draw calls',
    source: 'gpu',
  },
  {
    id: '8',
    level: 'warn',
    message: 'Physics step exceeded budget (21ms)',
    source: 'sim',
  },
];

const MESSAGES: { level: LogLevel; message: string; source: string }[] = [
  { level: 'debug', message: 'Frame committed', source: 'gpu' },
  { level: 'info', message: 'Asset streamed in', source: 'assets' },
  { level: 'info', message: 'Selection changed', source: 'scene' },
  { level: 'warn', message: 'Dropped frame', source: 'gpu' },
  { level: 'warn', message: 'Late physics tick', source: 'sim' },
  { level: 'error', message: 'Shader compile failed', source: 'gpu' },
  { level: 'debug', message: 'GC pause 2.3ms', source: 'mem' },
];

let seq = 0;
function randomEntry(): LogEntry {
  const pick = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]!;
  seq += 1;
  return {
    id: `stream-${seq}`,
    level: pick.level,
    message: `${pick.message} #${seq}`,
    source: pick.source,
    timestamp: Date.now(),
  };
}

function makeBulk(count: number): LogEntry[] {
  return Array.from({ length: count }, () => randomEntry());
}

/** Batteries-included console with the default toolbar and row selection. */
export default function LogViewDemo() {
  return (
    <DemoWrapper>
      <LogView
        entries={SAMPLE}
        showTimestamps
        selectionMode="multiple"
        height={280}
      />
    </DemoWrapper>
  );
}

/** Footer content: "Streaming · N entries" on the left, a per-level breakdown on the right. */
function StreamFooter() {
  const { total, counts } = useLogViewStats();
  return (
    <>
      <span>Streaming · {total} entries</span>
      <span
        style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          gap: 'var(--etui-spacing-lg)',
        }}
      >
        <span>{counts['info'] ?? 0} info</span>
        <span style={{ color: 'var(--etui-color-accent-warning)' }}>
          {counts['warn'] ?? 0} warnings
        </span>
        <span style={{ color: 'var(--etui-color-accent-error)' }}>
          {counts['error'] ?? 0} errors
        </span>
      </span>
    </>
  );
}

/** Streaming append via the imperative handle — high-frequency, rAF-batched. */
export function LogViewStreaming() {
  const ref = useRef<LogViewHandle>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      // Imperative append — does not re-render this component; the store
      // batches writes to one commit per frame.
      ref.current?.appendMany(makeBulk(3));
    }, 120);
    return () => {
      clearInterval(id);
    };
  }, [running]);

  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button
            size="sm"
            variant={running ? 'filled' : 'default'}
            onClick={() => {
              setRunning(r => !r);
            }}
          >
            {running ? 'Stop stream' : 'Start stream'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              ref.current?.appendMany(makeBulk(500));
            }}
          >
            Burst +500
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              ref.current?.clear();
            }}
          >
            Clear
          </Button>
        </Stack>
        <LogView
          ref={ref}
          showTimestamps
          maxEntries={5000}
          height={300}
          aria-label="Streaming log"
          footer={<StreamFooter />}
        />
        <Text size="sm" color="muted">
          Scroll up to detach from the tail — a “jump to bottom” button appears
          with the count of new lines. Scroll back down (or click it) to
          re-attach.
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

/** Search + level filtering over a larger, virtualized dataset, with selection. */
export function LogViewFiltering() {
  const entries = useMemo(() => makeBulk(600), []);
  return (
    <DemoWrapper>
      <LogView entries={entries} selectionMode="multiple" height={320} />
    </DemoWrapper>
  );
}

/** Soft-wrapping long lines (measured variable-height rows). */
export function LogViewWrap() {
  const entries: LogEntry[] = [
    {
      id: 'w1',
      level: 'error',
      message:
        'Uncaught TypeError: Cannot read properties of undefined (reading "transform") at applyConstraint (solver.ts:412:19) at Array.forEach (<anonymous>) at step (solver.ts:388:7)',
      source: 'sim',
    },
    {
      id: 'w2',
      level: 'info',
      message:
        'GET https://assets.example.com/v2/textures/asphalt_diffuse_2k.ktx2?cache=1 → 200 OK in 84ms (cached, 6.1 MB)',
      source: 'net',
    },
    { id: 'w3', level: 'debug', message: 'Short line.', source: 'gpu' },
  ];
  return (
    <DemoWrapper>
      <LogView entries={entries} wrap density="comfortable" height={220} />
    </DemoWrapper>
  );
}

/** Custom composition with the compound slots. */
export function LogViewCompound() {
  return (
    <DemoWrapper>
      <LogView entries={SAMPLE} height={260}>
        <LogView.Toolbar>
          <LogView.LevelFilter />
          <LogView.Search placeholder="Search output…" />
        </LogView.Toolbar>
        <LogView.Body />
      </LogView>
    </DemoWrapper>
  );
}

/** Tweak single slots of the default layout via `slotProps` (no rebuild). */
export function LogViewSlotProps() {
  return (
    <DemoWrapper>
      <LogView
        entries={SAMPLE}
        showTimestamps
        height={280}
        slotProps={{
          // Reconfigure the search input.
          search: { placeholder: 'Filter output…', size: 'lg' },
          // Restyle the toolbar and body containers (className/style merge with
          // each slot's own styles).
          toolbar: {
            style: {
              background:
                'color-mix(in srgb, var(--etui-color-accent-primary) 8%, transparent)',
            },
          },
          body: {
            style: {
              background:
                'color-mix(in srgb, var(--etui-color-accent-primary) 4%, transparent)',
            },
          },
          // Relabel an action button.
          clear: { 'aria-label': 'Discard log' },
        }}
      />
    </DemoWrapper>
  );
}

/** Extensible levels: a custom "trace" level with its own color and label. */
export function LogViewCustomLevels() {
  const levelConfig: LogLevelConfig = {
    trace: {
      label: 'Trace',
      color: 'var(--etui-color-accent-primary)',
    },
  };
  const entries: LogEntry[] = [
    { id: 'c1', level: 'trace', message: 'enter renderFrame()', source: 'gpu' },
    { id: 'c2', level: 'info', message: 'frame ready', source: 'gpu' },
    { id: 'c3', level: 'trace', message: 'exit renderFrame()', source: 'gpu' },
    { id: 'c4', level: 'warn', message: 'vsync skipped', source: 'gpu' },
  ];
  return (
    <DemoWrapper>
      <LogView
        entries={entries}
        levelConfig={levelConfig}
        levelOrder={['trace', 'debug', 'info', 'warn', 'error']}
        height={220}
      />
    </DemoWrapper>
  );
}

interface RequestMeta {
  method?: string;
  ok?: boolean;
}

/** Custom line rendering via `renderEntry` — here an HTTP access log. */
export function LogViewCustomRender() {
  const entries: LogEntry[] = [
    {
      id: 'h1',
      level: 'info',
      source: 'http',
      message: '/api/users → 200 (12ms)',
      meta: { method: 'GET', ok: true },
    },
    {
      id: 'h2',
      level: 'info',
      source: 'http',
      message: '/api/login → 201 (44ms)',
      meta: { method: 'POST', ok: true },
    },
    {
      id: 'h3',
      level: 'warn',
      source: 'http',
      message: '/api/cart → 404 (8ms)',
      meta: { method: 'GET', ok: false },
    },
    {
      id: 'h4',
      level: 'error',
      source: 'http',
      message: '/api/orders → 500 (120ms)',
      meta: { method: 'DELETE', ok: false },
    },
  ];
  return (
    <DemoWrapper>
      <LogView
        entries={entries}
        showTimestamps
        height={220}
        renderEntry={({ entry }) => {
          const meta = entry.meta as RequestMeta | undefined;
          return (
            <span
              style={{
                display: 'inline-flex',
                gap: 'var(--etui-spacing-sm)',
                alignItems: 'center',
              }}
            >
              {meta?.method ? (
                <Badge
                  size="xs"
                  variant="outline"
                  color={meta.ok ? 'success' : 'error'}
                >
                  {meta.method}
                </Badge>
              ) : null}
              <span>{entry.message}</span>
            </span>
          );
        }}
      />
    </DemoWrapper>
  );
}
