import { useState } from 'react';
import type { ReactNode } from 'react';
import '@/theme/darkTheme.css';
import { lightThemeClass } from './lightTheme.css';
import { VanillaThemeProvider } from '@/theme';
import { Button, Checkbox, Input, Switch, Text } from '@/components/primitives';
import { Select, NumberInput } from '@/components/controls';
import { Stack, PanelSurface } from '@/components/layout';
import {
  Alert,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@/components/feedback';
import {
  PropertyPanel,
  PropertySection,
  PropertyRow,
} from '@/components/editor/PropertyInspector';

const SELECT_OPTIONS = [
  { value: 'cube', label: 'Cube' },
  { value: 'sphere', label: 'Sphere' },
  { value: 'cylinder', label: 'Cylinder' },
];

interface ThemeFrameProps {
  theme: 'dark' | 'light';
  label: string;
  children: ReactNode;
}

function ThemeFrame({ theme, label, children }: ThemeFrameProps) {
  const className = theme === 'light' ? lightThemeClass : undefined;
  return (
    <VanillaThemeProvider className={className}>
      <div
        style={{
          background: 'var(--etui-color-bg-primary)',
          border: '1px solid var(--etui-color-border-default)',
          borderRadius: 6,
          padding: 16,
          color: 'var(--etui-color-text-primary)',
          fontFamily: 'var(--etui-font-family-sans)',
          fontSize: 'var(--etui-font-size-md)',
        }}
      >
        <Text
          size="xs"
          style={{
            display: 'block',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--etui-color-text-muted)',
          }}
        >
          {label}
        </Text>
        {children}
      </div>
    </VanillaThemeProvider>
  );
}

function StaticDemoCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: '#121212',
        borderRadius: '6px',
        padding: '1.5rem',
        fontSize: 'var(--etui-font-size-md)',
        fontFamily: 'var(--etui-font-family-sans)',
      }}
    >
      {children}
    </div>
  );
}

function MiniEditor() {
  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState('Untitled scene');
  return (
    <PanelSurface>
      <Stack gap={3} style={{ padding: 12 }}>
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Scene name"
        />
        <div
          style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
        >
          <Text size="sm">Auto-save</Text>
          <Switch checked={enabled} onChange={setEnabled} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="filled">Save</Button>
          <Button variant="outline">Discard</Button>
        </div>
      </Stack>
    </PanelSurface>
  );
}

export default function LightThemeOverview() {
  return (
    <StaticDemoCanvas>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        <ThemeFrame theme="dark" label="Dark theme (default)">
          <MiniEditor />
        </ThemeFrame>
        <ThemeFrame theme="light" label="Light theme">
          <MiniEditor />
        </ThemeFrame>
      </div>
    </StaticDemoCanvas>
  );
}

export function LightThemeBasicComponents() {
  const [agree, setAgree] = useState(false);
  const [notify, setNotify] = useState(true);
  const [shape, setShape] = useState<string>('cube');
  const [text, setText] = useState('Hello');
  return (
    <StaticDemoCanvas>
      <ThemeFrame theme="light" label="Light theme — basic components">
        <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
          <Input
            value={text}
            onChange={event => setText(event.target.value)}
            placeholder="Type here…"
          />
          <Select
            options={SELECT_OPTIONS}
            value={shape}
            onChange={value => {
              if (value !== null) setShape(value);
            }}
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Checkbox checked={agree} onChange={setAgree} label="I agree" />
            <Switch checked={notify} onChange={setNotify} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="filled">Filled</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Stack>
      </ThemeFrame>
    </StaticDemoCanvas>
  );
}

export function LightThemePanel() {
  const [x, setX] = useState(100);
  const [y, setY] = useState(200);
  const [visible, setVisible] = useState(true);
  return (
    <StaticDemoCanvas>
      <ThemeFrame theme="light" label="Light theme — property panel">
        <div style={{ maxWidth: 320 }}>
          <PropertyPanel>
            <PropertySection title="Transform" defaultExpanded>
              <PropertyRow label="X">
                <NumberInput value={x} onChange={setX} />
              </PropertyRow>
              <PropertyRow label="Y">
                <NumberInput value={y} onChange={setY} />
              </PropertyRow>
            </PropertySection>
            <PropertySection title="Appearance" defaultExpanded>
              <PropertyRow label="Visible">
                <Checkbox checked={visible} onChange={setVisible} />
              </PropertyRow>
            </PropertySection>
          </PropertyPanel>
        </div>
      </ThemeFrame>
    </StaticDemoCanvas>
  );
}

export function LightThemeAlerts() {
  return (
    <StaticDemoCanvas>
      <ThemeFrame theme="light" label="Light theme — alerts">
        <Stack gap={3} style={{ width: '100%', maxWidth: 480 }}>
          <Alert variant="info" title="Heads up">
            A new render has been queued.
          </Alert>
          <Alert variant="success" title="Saved">
            All overrides have been written to disk.
          </Alert>
          <Alert variant="warning" title="Read-only mode">
            Switch to edit mode to make changes.
          </Alert>
          <Alert variant="error" title="Connection lost">
            We can&apos;t reach the render farm. Retry once you&apos;re back
            online.
          </Alert>
        </Stack>
      </ThemeFrame>
    </StaticDemoCanvas>
  );
}

export function LightThemeMixed() {
  const [open, setOpen] = useState(false);
  return (
    <StaticDemoCanvas>
      <ThemeFrame theme="dark" label="Dark app + scoped light dialog">
        <Stack gap={3}>
          <Text size="sm">
            The app stays dark. Open the dialog to see a single light-themed
            subtree, scoped via <code>VanillaThemeProvider</code>.
          </Text>
          <div>
            <Button variant="filled" onClick={() => setOpen(true)}>
              Open settings
            </Button>
          </div>
          <VanillaThemeProvider className={lightThemeClass}>
            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogHeader>Settings</DialogHeader>
              <DialogBody>
                <Text size="sm">
                  This dialog is rendered with the light theme even though the
                  surrounding app is dark.
                </Text>
              </DialogBody>
              <DialogFooter align="right">
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="filled" onClick={() => setOpen(false)}>
                  Save
                </Button>
              </DialogFooter>
            </Dialog>
          </VanillaThemeProvider>
        </Stack>
      </ThemeFrame>
    </StaticDemoCanvas>
  );
}
