import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { CircularProgress } from './CircularProgress';

const meta: Meta<typeof ProgressBar> = {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'error'],
    },
    showLabel: {
      control: 'select',
      options: [false, 'inline', 'overlay'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: { value: 60 },
  render: args => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}
    >
      <ProgressBar value={60} size="sm" />
      <ProgressBar value={60} size="md" />
      <ProgressBar value={60} size="lg" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}
    >
      <ProgressBar value={60} color="primary" />
      <ProgressBar value={60} color="success" />
      <ProgressBar value={60} color="warning" />
      <ProgressBar value={60} color="error" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}
    >
      <ProgressBar value={60} showLabel="inline" />
      <ProgressBar value={60} size="lg" showLabel="overlay" />
      <ProgressBar value={24} showLabel="inline" label="12 / 50 files" />
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}
    >
      <ProgressBar />
      <ProgressBar size="lg" color="success" />
    </div>
  ),
};

export const Striped: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}
    >
      <ProgressBar value={60} size="lg" striped />
      <ProgressBar value={60} size="lg" striped animated />
    </div>
  ),
};

export const LiveProgress: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const id = setInterval(() => {
        setValue(v => (v >= 100 ? 0 : v + 5));
      }, 250);
      return () => clearInterval(id);
    }, []);
    return (
      <div style={{ width: 320 }}>
        <ProgressBar value={value} showLabel="inline" />
      </div>
    );
  },
};

export const Circular: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <CircularProgress value={75} size="xs" />
      <CircularProgress value={75} size="sm" />
      <CircularProgress value={75} size="md" />
      <CircularProgress value={75} size="lg" />
      <CircularProgress value={75} size="xl" />
    </div>
  ),
};

export const CircularWithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <CircularProgress value={42} size="lg" showLabel />
      <CircularProgress value={42} size="xl" showLabel />
      <CircularProgress size="xl" />
    </div>
  ),
};

export const EditorExample: Story = {
  name: 'Editor Example',
  render: () => {
    const [frame, setFrame] = useState(0);
    useEffect(() => {
      const id = setInterval(() => {
        setFrame(f => (f >= 120 ? 0 : f + 1));
      }, 100);
      return () => clearInterval(id);
    }, []);
    return (
      <div style={{ width: 360 }}>
        <ProgressBar
          value={frame}
          max={120}
          size="lg"
          color="success"
          showLabel="inline"
          label={`Exporting frame ${frame} / 120`}
        />
      </div>
    );
  },
};
