import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '@/theme';
import { SplitPane } from './SplitPane';
import { SplitPanePanel } from './SplitPanePanel';

/**
 * Storybook configuration for SplitPane component
 *
 * A resizable split-pane layout for dividing space between panels
 * with draggable dividers. The fundamental layout primitive for
 * editor applications.
 */
const meta: Meta<typeof SplitPane> = {
  title: 'Layout/SplitPane',
  component: SplitPane,
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{ width: '100%', height: '500px', backgroundColor: '#1a1a1a' }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A resizable split-pane layout component that divides space between two or more panels with draggable dividers.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Split direction',
    },
    dividerSize: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'Divider thickness in pixels',
    },
  },
  args: {
    direction: 'horizontal',
    dividerSize: 4,
  },
};

export default meta;
type Story = StoryObj<typeof SplitPane>;

// ---------------------------------------------------------------------------
// Helper panel content
// ---------------------------------------------------------------------------

const PanelContent: React.FC<{
  title: string;
  color?: string;
}> = ({ title, color = 'rgba(0, 122, 204, 0.08)' }) => (
  <div
    style={{
      padding: '16px',
      height: '100%',
      backgroundColor: color,
      boxSizing: 'border-box',
      color: '#ccc',
      fontFamily: 'sans-serif',
      fontSize: '13px',
    }}
  >
    <strong style={{ color: '#fff' }}>{title}</strong>
    <p style={{ marginTop: 8, opacity: 0.7 }}>
      Drag the divider to resize panels.
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default two-panel horizontal split. */
export const Default: Story = {
  render: () => (
    <SplitPane>
      <SplitPanePanel>
        <PanelContent title="Left Panel" />
      </SplitPanePanel>
      <SplitPanePanel>
        <PanelContent title="Right Panel" color="rgba(76, 175, 80, 0.08)" />
      </SplitPanePanel>
    </SplitPane>
  ),
};

/** Vertical (stacked) split. */
export const VerticalSplit: Story = {
  render: () => (
    <SplitPane direction="vertical">
      <SplitPanePanel>
        <PanelContent title="Top Panel" />
      </SplitPanePanel>
      <SplitPanePanel>
        <PanelContent title="Bottom Panel" color="rgba(244, 67, 54, 0.08)" />
      </SplitPanePanel>
    </SplitPane>
  ),
};

/** Three panels with two dividers. */
export const ThreePanels: Story = {
  render: () => (
    <SplitPane>
      <SplitPanePanel>
        <PanelContent title="Panel 1" />
      </SplitPanePanel>
      <SplitPanePanel>
        <PanelContent title="Panel 2" color="rgba(255, 152, 0, 0.08)" />
      </SplitPanePanel>
      <SplitPanePanel>
        <PanelContent title="Panel 3" color="rgba(76, 175, 80, 0.08)" />
      </SplitPanePanel>
    </SplitPane>
  ),
};

/** Custom initial sizes (30% / 70%). */
export const CustomSizes: Story = {
  render: () => (
    <SplitPane panels={[{ defaultSize: '30%' }, { defaultSize: '70%' }]}>
      <SplitPanePanel>
        <PanelContent title="Sidebar (30%)" />
      </SplitPanePanel>
      <SplitPanePanel>
        <PanelContent title="Main (70%)" color="rgba(76, 175, 80, 0.08)" />
      </SplitPanePanel>
    </SplitPane>
  ),
};

/** Collapsible left panel. */
export const Collapsible: Story = {
  render: () => (
    <SplitPane
      panels={[
        { collapsible: true, minSize: 100, collapseThreshold: 50 },
        { minSize: 100 },
      ]}
    >
      <SplitPanePanel>
        <PanelContent title="Collapsible Panel" />
      </SplitPanePanel>
      <SplitPanePanel>
        <PanelContent title="Main Content" color="rgba(76, 175, 80, 0.08)" />
      </SplitPanePanel>
    </SplitPane>
  ),
};

/** Nested splits: horizontal outer, vertical inner. */
export const NestedSplits: Story = {
  render: () => (
    <SplitPane panels={[{ defaultSize: '25%' }, { defaultSize: '75%' }]}>
      <SplitPanePanel>
        <PanelContent title="Sidebar" />
      </SplitPanePanel>
      <SplitPanePanel>
        <SplitPane direction="vertical">
          <SplitPanePanel>
            <PanelContent title="Viewport" color="rgba(76, 175, 80, 0.08)" />
          </SplitPanePanel>
          <SplitPanePanel>
            <PanelContent title="Timeline" color="rgba(255, 152, 0, 0.08)" />
          </SplitPanePanel>
        </SplitPane>
      </SplitPanePanel>
    </SplitPane>
  ),
};

/** Controlled mode with external state. */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [sizes, setSizes] = useState([300, 300]);

    return (
      <div>
        <div
          style={{
            padding: '8px 16px',
            color: '#ccc',
            fontFamily: 'monospace',
            fontSize: 12,
            borderBottom: '1px solid #4a4a4a',
          }}
        >
          Sizes: [{sizes.map(s => Math.round(s)).join(', ')}]
        </div>
        <div style={{ height: 'calc(100% - 33px)' }}>
          <SplitPane sizes={sizes} onResize={setSizes}>
            <SplitPanePanel>
              <PanelContent title="Controlled Left" />
            </SplitPanePanel>
            <SplitPanePanel>
              <PanelContent
                title="Controlled Right"
                color="rgba(76, 175, 80, 0.08)"
              />
            </SplitPanePanel>
          </SplitPane>
        </div>
      </div>
    );
  },
};

/** Editor layout: sidebar, viewport, inspector. */
export const EditorLayout: Story = {
  render: () => (
    <SplitPane
      panels={[
        { defaultSize: '20%', minSize: 150 },
        { defaultSize: '60%', minSize: 200 },
        { defaultSize: '20%', minSize: 150 },
      ]}
    >
      <SplitPanePanel>
        <PanelContent title="Hierarchy" />
      </SplitPanePanel>
      <SplitPanePanel>
        <PanelContent title="Viewport" color="rgba(0, 0, 0, 0.2)" />
      </SplitPanePanel>
      <SplitPanePanel>
        <PanelContent title="Inspector" color="rgba(255, 152, 0, 0.08)" />
      </SplitPanePanel>
    </SplitPane>
  ),
};
