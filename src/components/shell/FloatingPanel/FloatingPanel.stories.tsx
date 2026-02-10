import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FloatingPanel, FloatingManager } from './FloatingPanel';

const meta: Meta<typeof FloatingPanel> = {
  title: 'Shell/FloatingPanel',
  component: FloatingPanel,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FloatingPanel>;

export const Default: Story = {
  render: () => (
    <FloatingPanel
      title="Properties"
      defaultPosition={{ x: 50, y: 50 }}
      onClose={() => {}}
    >
      <div style={{ padding: 8 }}>
        <p style={{ color: '#ccc', margin: '4px 0' }}>Width: 1920</p>
        <p style={{ color: '#ccc', margin: '4px 0' }}>Height: 1080</p>
        <p style={{ color: '#ccc', margin: '4px 0' }}>Scale: 1.0</p>
      </div>
    </FloatingPanel>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <FloatingPanel
      title="Collapsed Panel"
      defaultPosition={{ x: 50, y: 50 }}
      defaultCollapsed={true}
      onClose={() => {}}
    >
      <div style={{ padding: 8 }}>
        <p style={{ color: '#ccc' }}>Hidden content</p>
      </div>
    </FloatingPanel>
  ),
};

export const NonResizable: Story = {
  render: () => (
    <FloatingPanel
      title="Fixed Size"
      defaultPosition={{ x: 50, y: 50 }}
      resizable={false}
      onClose={() => {}}
    >
      <div style={{ padding: 8 }}>
        <p style={{ color: '#ccc' }}>This panel cannot be resized</p>
      </div>
    </FloatingPanel>
  ),
};

export const MultiplePanels: Story = {
  render: function Render() {
    const [panels, setPanels] = useState([
      { id: 'props', title: 'Properties', x: 50, y: 50 },
      { id: 'layers', title: 'Layers', x: 350, y: 50 },
      { id: 'colors', title: 'Colors', x: 200, y: 200 },
    ]);

    const closePanel = (id: string) => {
      setPanels(p => p.filter(panel => panel.id !== id));
    };

    return (
      <FloatingManager baseZIndex={100}>
        {panels.map(panel => (
          <FloatingPanel
            key={panel.id}
            panelId={panel.id}
            title={panel.title}
            defaultPosition={{ x: panel.x, y: panel.y }}
            onClose={() => closePanel(panel.id)}
          >
            <div style={{ padding: 8 }}>
              <p style={{ color: '#ccc' }}>{panel.title} content</p>
            </div>
          </FloatingPanel>
        ))}
      </FloatingManager>
    );
  },
};

export const CustomSize: Story = {
  render: () => (
    <FloatingPanel
      title="Custom Size"
      defaultPosition={{ x: 50, y: 50 }}
      defaultSize={{ width: 400, height: 300 }}
      minWidth={200}
      minHeight={150}
      maxWidth={600}
      maxHeight={500}
      onClose={() => {}}
    >
      <div style={{ padding: 8 }}>
        <p style={{ color: '#ccc' }}>Resizable between 200x150 and 600x500</p>
      </div>
    </FloatingPanel>
  ),
};

export const ControlledCollapse: Story = {
  render: function Render() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ marginBottom: 16 }}
        >
          Toggle from outside
        </button>
        <FloatingPanel
          title="Controlled"
          defaultPosition={{ x: 50, y: 80 }}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          onClose={() => {}}
        >
          <div style={{ padding: 8 }}>
            <p style={{ color: '#ccc' }}>Controlled collapse state</p>
          </div>
        </FloatingPanel>
      </div>
    );
  },
};

export const NoChromeClose: Story = {
  render: () => (
    <FloatingPanel
      title="No Close Button"
      defaultPosition={{ x: 50, y: 50 }}
      closable={false}
    >
      <div style={{ padding: 8 }}>
        <p style={{ color: '#ccc' }}>Cannot be closed via UI</p>
      </div>
    </FloatingPanel>
  ),
};
