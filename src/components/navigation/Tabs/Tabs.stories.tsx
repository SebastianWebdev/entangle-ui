import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';
import { TabList } from './TabList';
import { Tab } from './Tab';
import { TabPanel } from './TabPanel';
import { Stack } from '@/components/layout';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['underline', 'pills', 'enclosed'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    fullWidth: { control: 'boolean' },
    pillsFrame: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: args => (
    <Tabs defaultValue="properties" {...args}>
      <TabList>
        <Tab value="properties">Properties</Tab>
        <Tab value="materials">Materials</Tab>
        <Tab value="physics">Physics</Tab>
      </TabList>
      <TabPanel value="properties">
        <div style={{ padding: 16, color: '#ccc' }}>
          Transform, scale, rotation and other object properties.
        </div>
      </TabPanel>
      <TabPanel value="materials">
        <div style={{ padding: 16, color: '#ccc' }}>
          Diffuse, specular, normal maps and shader settings.
        </div>
      </TabPanel>
      <TabPanel value="physics">
        <div style={{ padding: 16, color: '#ccc' }}>
          Rigidbody, collider, and constraint settings.
        </div>
      </TabPanel>
    </Tabs>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="column" spacing={4}>
      <div>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Underline (default)
        </div>
        <Tabs defaultValue="tab1" variant="underline">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanel value="tab1">
            <div style={{ padding: 12, color: '#ccc' }}>Underline content</div>
          </TabPanel>
          <TabPanel value="tab2">
            <div style={{ padding: 12, color: '#ccc' }}>Tab 2 content</div>
          </TabPanel>
          <TabPanel value="tab3">
            <div style={{ padding: 12, color: '#ccc' }}>Tab 3 content</div>
          </TabPanel>
        </Tabs>
      </div>

      <div>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Pills
        </div>
        <Tabs defaultValue="tab1" variant="pills">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanel value="tab1">
            <div style={{ padding: 12, color: '#ccc' }}>Pills content</div>
          </TabPanel>
          <TabPanel value="tab2">
            <div style={{ padding: 12, color: '#ccc' }}>Tab 2 content</div>
          </TabPanel>
          <TabPanel value="tab3">
            <div style={{ padding: 12, color: '#ccc' }}>Tab 3 content</div>
          </TabPanel>
        </Tabs>
      </div>

      <div>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Enclosed
        </div>
        <Tabs defaultValue="tab1" variant="enclosed">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
            <Tab value="tab3">Tab 3</Tab>
          </TabList>
          <TabPanel value="tab1">
            <div style={{ padding: 12, color: '#ccc' }}>Enclosed content</div>
          </TabPanel>
          <TabPanel value="tab2">
            <div style={{ padding: 12, color: '#ccc' }}>Tab 2 content</div>
          </TabPanel>
          <TabPanel value="tab3">
            <div style={{ padding: 12, color: '#ccc' }}>Tab 3 content</div>
          </TabPanel>
        </Tabs>
      </div>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" spacing={4}>
      <Tabs defaultValue="tab1" size="sm">
        <TabList>
          <Tab value="tab1">Small</Tab>
          <Tab value="tab2">Tabs</Tab>
        </TabList>
        <TabPanel value="tab1">
          <div style={{ padding: 8, color: '#ccc', fontSize: 12 }}>
            Small tabs content
          </div>
        </TabPanel>
        <TabPanel value="tab2">
          <div style={{ padding: 8, color: '#ccc', fontSize: 12 }}>Tab 2</div>
        </TabPanel>
      </Tabs>

      <Tabs defaultValue="tab1" size="md">
        <TabList>
          <Tab value="tab1">Medium</Tab>
          <Tab value="tab2">Tabs</Tab>
        </TabList>
        <TabPanel value="tab1">
          <div style={{ padding: 12, color: '#ccc' }}>
            Medium tabs content (default)
          </div>
        </TabPanel>
        <TabPanel value="tab2">
          <div style={{ padding: 12, color: '#ccc' }}>Tab 2</div>
        </TabPanel>
      </Tabs>

      <Tabs defaultValue="tab1" size="lg">
        <TabList>
          <Tab value="tab1">Large</Tab>
          <Tab value="tab2">Tabs</Tab>
        </TabList>
        <TabPanel value="tab1">
          <div style={{ padding: 16, color: '#ccc' }}>Large tabs content</div>
        </TabPanel>
        <TabPanel value="tab2">
          <div style={{ padding: 16, color: '#ccc' }}>Tab 2</div>
        </TabPanel>
      </Tabs>
    </Stack>
  ),
};

export const ClosableTabs: Story = {
  name: 'Closable Tabs',
  render: () => {
    const [tabs, setTabs] = useState([
      { value: 'scene', label: 'Scene' },
      { value: 'game', label: 'Game' },
      { value: 'inspector', label: 'Inspector' },
      { value: 'console', label: 'Console' },
    ]);
    const [active, setActive] = useState('scene');

    const handleClose = (val: string) => {
      const remaining = tabs.filter(t => t.value !== val);
      setTabs(remaining);
      const firstRemaining = remaining[0];
      if (active === val && firstRemaining) {
        setActive(firstRemaining.value);
      }
    };

    return (
      <Tabs value={active} onChange={setActive}>
        <TabList>
          {tabs.map(t => (
            <Tab key={t.value} value={t.value} closable onClose={handleClose}>
              {t.label}
            </Tab>
          ))}
        </TabList>
        {tabs.map(t => (
          <TabPanel key={t.value} value={t.value}>
            <div style={{ padding: 16, color: '#ccc' }}>
              {t.label} panel content
            </div>
          </TabPanel>
        ))}
      </Tabs>
    );
  },
};

export const DisabledTab: Story = {
  name: 'Disabled Tab',
  render: () => (
    <Tabs defaultValue="tab1">
      <TabList>
        <Tab value="tab1">Available</Tab>
        <Tab value="tab2" disabled>
          Disabled
        </Tab>
        <Tab value="tab3">Also Available</Tab>
      </TabList>
      <TabPanel value="tab1">
        <div style={{ padding: 16, color: '#ccc' }}>First tab content</div>
      </TabPanel>
      <TabPanel value="tab2">
        <div style={{ padding: 16, color: '#ccc' }}>This cannot be reached</div>
      </TabPanel>
      <TabPanel value="tab3">
        <div style={{ padding: 16, color: '#ccc' }}>Third tab content</div>
      </TabPanel>
    </Tabs>
  ),
};

export const FullWidth: Story = {
  name: 'Full Width',
  render: () => (
    <div style={{ width: 400 }}>
      <Tabs defaultValue="tab1" fullWidth>
        <TabList>
          <Tab value="tab1">Properties</Tab>
          <Tab value="tab2">Materials</Tab>
          <Tab value="tab3">Physics</Tab>
        </TabList>
        <TabPanel value="tab1">
          <div style={{ padding: 16, color: '#ccc' }}>Properties panel</div>
        </TabPanel>
        <TabPanel value="tab2">
          <div style={{ padding: 16, color: '#ccc' }}>Materials panel</div>
        </TabPanel>
        <TabPanel value="tab3">
          <div style={{ padding: 16, color: '#ccc' }}>Physics panel</div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: 400, height: 200 }}>
      <Tabs defaultValue="tab1" orientation="vertical">
        <TabList>
          <Tab value="tab1">General</Tab>
          <Tab value="tab2">Display</Tab>
          <Tab value="tab3">Audio</Tab>
        </TabList>
        <TabPanel value="tab1">
          <div style={{ padding: 16, color: '#ccc' }}>General settings</div>
        </TabPanel>
        <TabPanel value="tab2">
          <div style={{ padding: 16, color: '#ccc' }}>Display settings</div>
        </TabPanel>
        <TabPanel value="tab3">
          <div style={{ padding: 16, color: '#ccc' }}>Audio settings</div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

export const InspectorExample: Story = {
  name: 'Editor — Inspector',
  render: () => {
    const [active, setActive] = useState('properties');

    return (
      <div
        style={{
          width: 300,
          background: '#1e1e1e',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Tabs value={active} onChange={setActive} size="sm" variant="underline">
          <TabList>
            <Tab value="properties">Properties</Tab>
            <Tab value="materials">Materials</Tab>
            <Tab value="physics">Physics</Tab>
          </TabList>
          <TabPanel value="properties">
            <div style={{ padding: 12, color: '#aaa', fontSize: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#ddd' }}>Transform</strong>
              </div>
              <div>Position: (0, 0, 0)</div>
              <div>Rotation: (0, 0, 0)</div>
              <div>Scale: (1, 1, 1)</div>
            </div>
          </TabPanel>
          <TabPanel value="materials">
            <div style={{ padding: 12, color: '#aaa', fontSize: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#ddd' }}>Standard Material</strong>
              </div>
              <div>Albedo: #ffffff</div>
              <div>Metallic: 0.0</div>
              <div>Roughness: 0.5</div>
            </div>
          </TabPanel>
          <TabPanel value="physics">
            <div style={{ padding: 12, color: '#aaa', fontSize: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#ddd' }}>Rigidbody</strong>
              </div>
              <div>Mass: 1.0 kg</div>
              <div>Drag: 0.0</div>
              <div>Use Gravity: Yes</div>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    );
  },
};

export const OutputPanel: Story = {
  name: 'Editor — Output Panel',
  render: () => (
    <div
      style={{
        width: 500,
        background: '#1e1e1e',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <Tabs defaultValue="console" size="sm" variant="pills">
        <TabList>
          <Tab value="console">Console</Tab>
          <Tab value="errors">Errors (3)</Tab>
          <Tab value="warnings">Warnings (7)</Tab>
        </TabList>
        <TabPanel value="console">
          <div
            style={{
              padding: 12,
              color: '#aaa',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            <div>[INFO] Application started</div>
            <div>[INFO] Loading scene...</div>
            <div>[INFO] Scene loaded (245ms)</div>
          </div>
        </TabPanel>
        <TabPanel value="errors">
          <div
            style={{
              padding: 12,
              color: '#f44',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            <div>[ERROR] Missing texture: floor.png</div>
            <div>[ERROR] Shader compilation failed</div>
            <div>[ERROR] Audio source not found</div>
          </div>
        </TabPanel>
        <TabPanel value="warnings">
          <div
            style={{
              padding: 12,
              color: '#fa0',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            <div>[WARN] Deprecated API usage in script.js</div>
            <div>[WARN] Large texture detected (4096x4096)</div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

export const PillsNoFrame: Story = {
  name: 'Pills Without Frame',
  render: () => (
    <div style={{ width: 420 }}>
      <Tabs defaultValue="tab1" variant="pills" pillsFrame={false}>
        <TabList>
          <Tab value="tab1">Overview</Tab>
          <Tab value="tab2">Metrics</Tab>
          <Tab value="tab3">Logs</Tab>
        </TabList>
        <TabPanel value="tab1">
          <div style={{ padding: 12, color: '#ccc' }}>Overview content</div>
        </TabPanel>
        <TabPanel value="tab2">
          <div style={{ padding: 12, color: '#ccc' }}>Metrics content</div>
        </TabPanel>
        <TabPanel value="tab3">
          <div style={{ padding: 12, color: '#ccc' }}>Logs content</div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};
