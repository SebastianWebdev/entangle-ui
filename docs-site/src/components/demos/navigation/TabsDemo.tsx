import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Tabs, TabList, Tab, TabPanel } from '@/components/navigation';
import { Text } from '@/components/primitives';
import { Stack } from '@/components/layout';
import { FolderIcon } from '@/components/Icons/FolderIcon';
import { SettingsIcon } from '@/components/Icons/SettingsIcon';
import { StarIcon } from '@/components/Icons/StarIcon';

function TabsVariant({
  variant,
}: {
  variant: 'underline' | 'pills' | 'enclosed';
}) {
  return (
    <div>
      <Text size="xs" color="muted">
        {variant}
      </Text>
      <Tabs defaultValue="tab1" variant={variant}>
        <TabList>
          <Tab value="tab1">Overview</Tab>
          <Tab value="tab2">Features</Tab>
          <Tab value="tab3">API</Tab>
        </TabList>
        <TabPanel value="tab1">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Overview panel content</Text>
          </div>
        </TabPanel>
        <TabPanel value="tab2">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Features panel content</Text>
          </div>
        </TabPanel>
        <TabPanel value="tab3">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">API panel content</Text>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default function TabsDemo() {
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={5}>
        <TabsVariant variant="underline" />
        <TabsVariant variant="pills" />
        <TabsVariant variant="enclosed" />
      </Stack>
    </DemoWrapper>
  );
}

export function TabsControlled() {
  const [activeTab, setActiveTab] = useState('properties');
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={2}>
        <Text size="xs" color="muted">
          Active: {activeTab}
        </Text>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab value="properties">Properties</Tab>
            <Tab value="materials">Materials</Tab>
            <Tab value="modifiers">Modifiers</Tab>
          </TabList>
          <TabPanel value="properties">
            <div style={{ padding: '12px 0' }}>
              <Text size="sm">Properties panel</Text>
            </div>
          </TabPanel>
          <TabPanel value="materials">
            <div style={{ padding: '12px 0' }}>
              <Text size="sm">Materials panel</Text>
            </div>
          </TabPanel>
          <TabPanel value="modifiers">
            <div style={{ padding: '12px 0' }}>
              <Text size="sm">Modifiers panel</Text>
            </div>
          </TabPanel>
        </Tabs>
      </Stack>
    </DemoWrapper>
  );
}

export function TabsUnderline() {
  return (
    <DemoWrapper withKeyboard>
      <TabsVariant variant="underline" />
    </DemoWrapper>
  );
}

export function TabsPills() {
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={4}>
        <TabsVariant variant="pills" />
        <div>
          <Text size="xs" color="muted">
            pillsFrame=false
          </Text>
          <Tabs variant="pills" pillsFrame={false} defaultValue="edit">
            <TabList>
              <Tab value="edit">Edit</Tab>
              <Tab value="object">Object</Tab>
              <Tab value="sculpt">Sculpt</Tab>
            </TabList>
            <TabPanel value="edit">
              <div style={{ padding: '12px 0' }}>
                <Text size="sm">Edit mode</Text>
              </div>
            </TabPanel>
            <TabPanel value="object">
              <div style={{ padding: '12px 0' }}>
                <Text size="sm">Object mode</Text>
              </div>
            </TabPanel>
            <TabPanel value="sculpt">
              <div style={{ padding: '12px 0' }}>
                <Text size="sm">Sculpt mode</Text>
              </div>
            </TabPanel>
          </Tabs>
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function TabsEnclosed() {
  return (
    <DemoWrapper withKeyboard>
      <TabsVariant variant="enclosed" />
    </DemoWrapper>
  );
}

function SizedTabs({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <div>
      <Text size="xs" color="muted">
        {size}
      </Text>
      <Tabs size={size} defaultValue="a">
        <TabList>
          <Tab value="a">Scene</Tab>
          <Tab value="b">World</Tab>
          <Tab value="c">Render</Tab>
        </TabList>
        <TabPanel value="a">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Scene settings</Text>
          </div>
        </TabPanel>
        <TabPanel value="b">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">World settings</Text>
          </div>
        </TabPanel>
        <TabPanel value="c">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Render settings</Text>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export function TabsSizes() {
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={5}>
        <SizedTabs size="sm" />
        <SizedTabs size="md" />
        <SizedTabs size="lg" />
      </Stack>
    </DemoWrapper>
  );
}

export function TabsFullWidth() {
  return (
    <DemoWrapper withKeyboard>
      <Tabs fullWidth defaultValue="a">
        <TabList>
          <Tab value="a">Tab A</Tab>
          <Tab value="b">Tab B</Tab>
          <Tab value="c">Tab C</Tab>
        </TabList>
        <TabPanel value="a">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Panel A</Text>
          </div>
        </TabPanel>
        <TabPanel value="b">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Panel B</Text>
          </div>
        </TabPanel>
        <TabPanel value="c">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Panel C</Text>
          </div>
        </TabPanel>
      </Tabs>
    </DemoWrapper>
  );
}

export function TabsVertical() {
  return (
    <DemoWrapper withKeyboard>
      <Tabs orientation="vertical" defaultValue="general">
        <TabList>
          <Tab value="general">General</Tab>
          <Tab value="render">Render</Tab>
          <Tab value="output">Output</Tab>
        </TabList>
        <TabPanel value="general">
          <div style={{ padding: '0 12px' }}>
            <Text size="sm">General settings</Text>
          </div>
        </TabPanel>
        <TabPanel value="render">
          <div style={{ padding: '0 12px' }}>
            <Text size="sm">Render settings</Text>
          </div>
        </TabPanel>
        <TabPanel value="output">
          <div style={{ padding: '0 12px' }}>
            <Text size="sm">Output settings</Text>
          </div>
        </TabPanel>
      </Tabs>
    </DemoWrapper>
  );
}

export function TabsIcons() {
  return (
    <DemoWrapper withKeyboard>
      <Tabs defaultValue="scene">
        <TabList>
          <Tab value="scene" icon={<FolderIcon />}>
            Scene
          </Tab>
          <Tab value="render" icon={<StarIcon />}>
            Render
          </Tab>
          <Tab value="settings" icon={<SettingsIcon />}>
            Settings
          </Tab>
        </TabList>
        <TabPanel value="scene">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Scene contents</Text>
          </div>
        </TabPanel>
        <TabPanel value="render">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Render output</Text>
          </div>
        </TabPanel>
        <TabPanel value="settings">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Settings</Text>
          </div>
        </TabPanel>
      </Tabs>
    </DemoWrapper>
  );
}

export function TabsClosable() {
  const [files, setFiles] = useState([
    { value: 'file1', label: 'main.ts' },
    { value: 'file2', label: 'styles.css' },
    { value: 'file3', label: 'index.html' },
  ]);
  const [active, setActive] = useState('file1');

  const closeFile = (value: string) => {
    setFiles(prev => {
      const next = prev.filter(f => f.value !== value);
      if (value === active && next.length > 0) setActive(next[0].value);
      return next;
    });
  };

  return (
    <DemoWrapper withKeyboard>
      {files.length > 0 ? (
        <Tabs value={active} onChange={setActive}>
          <TabList>
            {files.map(file => (
              <Tab
                key={file.value}
                value={file.value}
                closable
                onClose={closeFile}
              >
                {file.label}
              </Tab>
            ))}
          </TabList>
          {files.map(file => (
            <TabPanel key={file.value} value={file.value}>
              <div style={{ padding: '12px 0' }}>
                <Text size="sm">Editing {file.label}</Text>
              </div>
            </TabPanel>
          ))}
        </Tabs>
      ) : (
        <Text size="sm" color="muted">
          All tabs closed.
        </Text>
      )}
    </DemoWrapper>
  );
}

export function TabsDisabled() {
  return (
    <DemoWrapper withKeyboard>
      <Tabs defaultValue="a">
        <TabList>
          <Tab value="a">Active</Tab>
          <Tab value="b" disabled>
            Disabled
          </Tab>
          <Tab value="c">Another</Tab>
        </TabList>
        <TabPanel value="a">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">First panel</Text>
          </div>
        </TabPanel>
        <TabPanel value="c">
          <div style={{ padding: '12px 0' }}>
            <Text size="sm">Third panel</Text>
          </div>
        </TabPanel>
      </Tabs>
    </DemoWrapper>
  );
}

function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: '12px 0' }}>
      <Stack spacing={2}>
        <Text size="sm">
          {label} count: {count}
        </Text>
        <button
          type="button"
          onClick={() => setCount(c => c + 1)}
          style={{
            alignSelf: 'flex-start',
            padding: '4px 10px',
            background: '#2a2a2a',
            color: '#eee',
            border: '1px solid #444',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Increment
        </button>
      </Stack>
    </div>
  );
}

export function TabsKeepMounted() {
  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={2}>
        <Text size="xs" color="muted">
          Increment a counter, switch tabs, and return — the value persists.
        </Text>
        <Tabs defaultValue="terminal" keepMounted>
          <TabList>
            <Tab value="terminal">Terminal</Tab>
            <Tab value="editor">Editor</Tab>
            <Tab value="preview">Preview</Tab>
          </TabList>
          <TabPanel value="terminal">
            <Counter label="Terminal" />
          </TabPanel>
          <TabPanel value="editor">
            <Counter label="Editor" />
          </TabPanel>
          <TabPanel value="preview">
            <Counter label="Preview" />
          </TabPanel>
        </Tabs>
      </Stack>
    </DemoWrapper>
  );
}
