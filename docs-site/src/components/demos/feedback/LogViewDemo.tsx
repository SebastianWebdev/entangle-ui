import { useEffect, useMemo, useRef, useState } from 'react';

import DemoWrapper from '../DemoWrapper';
import { LogView } from '@/components/feedback';
import type {
  LogEntry,
  LogLevel,
  LogLevelConfig,
  LogViewHandle,
} from '@/components/feedback';
import { Button } from '@/components/primitives';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

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

/** Extensible levels: a custom "trace" level with its own color and label. */
export function LogViewCustomLevels() {
  const levelConfig: LogLevelConfig = {
    trace: {
      label: 'Trace',
      color: 'var(--etui-color-accent-primary, #ff6600)',
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
