import type { Meta, StoryObj } from '@storybook/react';
import { PanelSurface } from './PanelSurface';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { Stack } from '@/components/layout/Stack';

const meta: Meta<typeof PanelSurface> = {
  title: 'Layout/PanelSurface',
  component: PanelSurface,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PanelSurface>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 320, height: 260 }}>
      <PanelSurface>
        <PanelSurface.Header
          actions={
            <Button size="sm" variant="ghost" onClick={() => {}}>
              Action
            </Button>
          }
        >
          Properties
        </PanelSurface.Header>
        <PanelSurface.Body padding={8}>
          <Stack spacing={2}>
            <Text size="xs">Position X: 0.00</Text>
            <Text size="xs">Position Y: 1.25</Text>
            <Text size="xs">Position Z: 0.00</Text>
          </Stack>
        </PanelSurface.Body>
        <PanelSurface.Footer>3 items selected</PanelSurface.Footer>
      </PanelSurface>
    </div>
  ),
};

export const GradientBackground: Story = {
  render: () => (
    <div style={{ width: 320, height: 260 }}>
      <PanelSurface
        background="linear-gradient(180deg, #2d3444 0%, #1b212d 100%)"
      >
        <PanelSurface.Header>Gradient Panel</PanelSurface.Header>
        <PanelSurface.Body padding={10}>
          <Text size="xs" color="secondary">
            PanelSurface supports gradient backgrounds via the `background` prop.
          </Text>
        </PanelSurface.Body>
      </PanelSurface>
    </div>
  ),
};

export const ScrollableBody: Story = {
  render: () => (
    <div style={{ width: 320, height: 260 }}>
      <PanelSurface>
        <PanelSurface.Header>Console</PanelSurface.Header>
        <PanelSurface.Body scroll padding={8}>
          <Stack spacing={1}>
            {Array.from({ length: 32 }).map((_, i) => (
              <Text key={i} size="xs" mono color="muted">
                [{String(i + 1).padStart(2, '0')}] Log line {i + 1}
              </Text>
            ))}
          </Stack>
        </PanelSurface.Body>
      </PanelSurface>
    </div>
  ),
};
