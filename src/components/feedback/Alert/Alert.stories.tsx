import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { Stack } from '@/components/layout/Stack';
import { Button } from '@/components/primitives/Button';
import { PropertyPanel } from '@/components/editor/PropertyInspector';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error', 'neutral'],
    },
    appearance: {
      control: 'select',
      options: ['subtle', 'solid', 'outline'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Heads up',
    children: 'This is a persistent inline alert.',
  },
  render: args => (
    <div style={{ width: 420 }}>
      <Alert {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={3} style={{ width: 420 }}>
      <Alert variant="info" title="Informational">
        New revisions are available. Pull the latest scene before editing.
      </Alert>
      <Alert variant="success" title="Saved">
        All asset overrides have been written to disk.
      </Alert>
      <Alert variant="warning" title="Read-only mode">
        This file is locked by another editor; switch modes to make changes.
      </Alert>
      <Alert variant="error" title="Connection lost">
        We can't reach the render farm. Retry once your network comes back.
      </Alert>
      <Alert variant="neutral" title="Note">
        Drag a node from the library to start a new graph.
      </Alert>
    </Stack>
  ),
};

export const Appearances: Story = {
  render: () => (
    <Stack spacing={3} style={{ width: 420 }}>
      <Alert variant="info" appearance="subtle" title="Subtle (default)">
        Tinted background, faint border. Use for inline status.
      </Alert>
      <Alert variant="info" appearance="solid" title="Solid">
        Filled accent background. Loud — reserve for primary calls.
      </Alert>
      <Alert variant="info" appearance="outline" title="Outline">
        Bordered, transparent background. Quietest treatment.
      </Alert>
    </Stack>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Alert variant="warning" icon={false} title="Read-only">
        Switch to edit mode to make changes.
      </Alert>
    </div>
  ),
};

export const Dismissible: Story = {
  render: function DismissibleStory() {
    const [open, setOpen] = useState(true);
    if (!open) {
      return <Button onClick={() => setOpen(true)}>Restore alert</Button>;
    }
    return (
      <div style={{ width: 420 }}>
        <Alert
          variant="success"
          title="Export complete"
          onClose={() => setOpen(false)}
        >
          The scene has been exported to <code>~/exports/scene.usd</code>.
        </Alert>
      </div>
    );
  },
};

export const Compact: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Alert variant="info">Auto-save is on.</Alert>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div style={{ width: 460 }}>
      <Alert variant="error" title="Couldn't reach the server">
        <Alert.Description>
          The request timed out after 30 seconds.
        </Alert.Description>
        <Alert.Actions align="right">
          <Button variant="filled">Retry</Button>
          <Button>Dismiss</Button>
        </Alert.Actions>
      </Alert>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Alert variant="warning" title="Pending migration">
        <Alert.Description>
          The shader graph format changed in version 0.9. Existing graphs will
          continue to load, but new features (procedural noise, world-space
          gradients) require the new schema.
        </Alert.Description>
        <Alert.Description style={{ marginTop: 8 }}>
          Run <code>npx entangle-ui migrate-graphs</code> from the project root
          to upgrade in place. The original files are written to{' '}
          <code>.entangle-backup/</code> first, so you can roll back at any
          time.
        </Alert.Description>
      </Alert>
    </div>
  ),
};

export const EditorExample: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Stack spacing={3}>
        <Alert variant="warning" title="Read-only file" appearance="subtle">
          <Alert.Description>
            <code>materials/asphalt.json</code> is checked out by another user.
          </Alert.Description>
        </Alert>
        <PropertyPanel size="sm">
          <div style={{ padding: 12, opacity: 0.6, fontSize: 12 }}>
            Inspector is read-only.
          </div>
        </PropertyPanel>
      </Stack>
    </div>
  ),
};
