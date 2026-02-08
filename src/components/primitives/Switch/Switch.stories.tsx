import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';
import { Stack } from '@/components/layout';

const meta: Meta<typeof Switch> = {
  title: 'Primitives/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    label: 'Enable auto-save',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Switch size="sm" label="Small switch" />
      <Switch size="md" label="Medium switch (default)" />
      <Switch size="lg" label="Large switch" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Switch label="Off" />
      <Switch checked label="On" />
      <Switch disabled label="Disabled off" />
      <Switch checked disabled label="Disabled on" />
      <Switch error label="Error state" />
    </Stack>
  ),
};

export const LabelPositions: Story = {
  render: () => (
    <Stack direction="column" spacing={2}>
      <Switch label="Label on right (default)" labelPosition="right" />
      <Switch label="Label on left" labelPosition="left" />
    </Stack>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <Stack direction="column" spacing={3}>
      <Switch
        label="Auto-save"
        helperText="Saves your work automatically every 5 minutes"
      />
      <Switch
        label="Auto-save"
        error
        errorMessage="Cannot enable auto-save without storage permission"
      />
    </Stack>
  ),
};

export const ToolbarExample: Story = {
  name: 'Toolbar Example',
  render: () => {
    const [showGrid, setShowGrid] = useState(true);
    const [snap, setSnap] = useState(false);
    const [wireframe, setWireframe] = useState(false);

    return (
      <Stack direction="row" spacing={4}>
        <Switch
          size="sm"
          label="Show Grid"
          checked={showGrid}
          onChange={setShowGrid}
        />
        <Switch size="sm" label="Snap" checked={snap} onChange={setSnap} />
        <Switch
          size="sm"
          label="Wireframe"
          checked={wireframe}
          onChange={setWireframe}
        />
      </Stack>
    );
  },
};

export const SettingsPanel: Story = {
  name: 'Settings Panel',
  render: () => {
    const [autoSave, setAutoSave] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(false);
    const [telemetry, setTelemetry] = useState(false);

    return (
      <Stack direction="column" spacing={3}>
        <Switch
          label="Auto-save"
          checked={autoSave}
          onChange={setAutoSave}
          helperText="Automatically save changes"
        />
        <Switch
          label="Dark Mode"
          checked={darkMode}
          onChange={setDarkMode}
          helperText="Use dark color scheme"
        />
        <Switch
          label="Notifications"
          checked={notifications}
          onChange={setNotifications}
          helperText="Receive project notifications"
        />
        <Switch
          label="Send usage data"
          checked={telemetry}
          onChange={setTelemetry}
          helperText="Help us improve the application"
        />
      </Stack>
    );
  },
};
