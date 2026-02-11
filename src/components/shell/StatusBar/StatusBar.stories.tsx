import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from './StatusBar';

const meta: Meta<typeof StatusBar> = {
  title: 'Shell/StatusBar',
  component: StatusBar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof StatusBar>;

export const Default: Story = {
  render: () => (
    <StatusBar>
      <StatusBar.Section side="left">
        <StatusBar.Item onClick={() => {}}>main</StatusBar.Item>
        <StatusBar.Item icon={<span>&#x2713;</span>}>0 errors</StatusBar.Item>
        <StatusBar.Item icon={<span>&#x26A0;</span>}>2 warnings</StatusBar.Item>
      </StatusBar.Section>
      <StatusBar.Section side="right">
        <StatusBar.Item onClick={() => {}}>Ln 42, Col 5</StatusBar.Item>
        <StatusBar.Item onClick={() => {}}>UTF-8</StatusBar.Item>
        <StatusBar.Item onClick={() => {}}>TypeScript</StatusBar.Item>
      </StatusBar.Section>
    </StatusBar>
  ),
};

export const ErrorVariant: Story = {
  render: () => (
    <StatusBar variant="error">
      <StatusBar.Section side="left">
        <StatusBar.Item icon={<span>&#x2717;</span>}>
          Build failed
        </StatusBar.Item>
      </StatusBar.Section>
      <StatusBar.Section side="right">
        <StatusBar.Item badge={3}>Errors</StatusBar.Item>
      </StatusBar.Section>
    </StatusBar>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <StatusBar>
      <StatusBar.Section side="left">
        <StatusBar.Item badge={12}>Errors</StatusBar.Item>
        <StatusBar.Item badge={3}>Warnings</StatusBar.Item>
        <StatusBar.Item badge={true}>Live</StatusBar.Item>
      </StatusBar.Section>
      <StatusBar.Section side="right">
        <StatusBar.Item onClick={() => {}}>Prettier</StatusBar.Item>
      </StatusBar.Section>
    </StatusBar>
  ),
};

export const MediumSize: Story = {
  render: () => (
    <StatusBar size="md">
      <StatusBar.Section side="left">
        <StatusBar.Item onClick={() => {}}>main</StatusBar.Item>
        <StatusBar.Item>Ready</StatusBar.Item>
      </StatusBar.Section>
      <StatusBar.Section side="right">
        <StatusBar.Item onClick={() => {}}>UTF-8</StatusBar.Item>
      </StatusBar.Section>
    </StatusBar>
  ),
};

export const LeftOnly: Story = {
  render: () => (
    <StatusBar>
      <StatusBar.Section side="left">
        <StatusBar.Item>Connected</StatusBar.Item>
        <StatusBar.Item>Port 3000</StatusBar.Item>
      </StatusBar.Section>
    </StatusBar>
  ),
};

export const Disabled: Story = {
  render: () => (
    <StatusBar>
      <StatusBar.Section side="left">
        <StatusBar.Item onClick={() => {}} disabled>
          Offline
        </StatusBar.Item>
        <StatusBar.Item onClick={() => {}}>Active</StatusBar.Item>
      </StatusBar.Section>
    </StatusBar>
  ),
};
