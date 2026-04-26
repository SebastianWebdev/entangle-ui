import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader, Stack } from '@/components/layout';
import { Button } from '@/components/primitives';
import {
  ArrowRightIcon,
  CodeIcon,
  FolderIcon,
  HomeIcon,
} from '@/components/Icons';
import { BreadcrumbItem } from './BreadcrumbItem';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    maxItems: { control: 'number' },
    expandable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/components">Components</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/" icon={<HomeIcon size="sm" decorative />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem
        href="/projects"
        icon={<FolderIcon size="sm" decorative />}
      >
        Projects
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent icon={<CodeIcon size="sm" decorative />}>
        Button.tsx
      </BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumbs separator="/">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/components">Components</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const CustomSeparatorIcon: Story = {
  render: () => (
    <Breadcrumbs separator={<ArrowRightIcon size="sm" decorative />}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/components">Components</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={3}>
      <Breadcrumbs size="sm">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/components">Components</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Small</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs size="md">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/components">Components</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Medium</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs size="lg">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/components">Components</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Large</BreadcrumbItem>
      </Breadcrumbs>
    </Stack>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Breadcrumbs maxItems={4} expandable={false}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/workspace">Workspace</BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project">Project</BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project/src">src</BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project/src/components">
        components
      </BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project/src/components/navigation">
        navigation
      </BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project/src/components/navigation/breadcrumbs">
        Breadcrumbs
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Breadcrumbs.tsx</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const Expandable: Story = {
  render: () => (
    <Breadcrumbs maxItems={4}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/workspace">Workspace</BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project">Project</BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project/src">src</BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project/src/components">
        components
      </BreadcrumbItem>
      <BreadcrumbItem href="/workspace/project/src/components/navigation">
        navigation
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Breadcrumbs.tsx</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const LongLabels: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects" maxLength={14}>
        Photogrammetry capture workspace
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent maxLength={18}>
        Reconstructed environment material variants
      </BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const EditorExample: Story = {
  render: () => (
    <Breadcrumbs separator="/">
      <BreadcrumbItem href="/">project</BreadcrumbItem>
      <BreadcrumbItem href="/src">src</BreadcrumbItem>
      <BreadcrumbItem href="/src/components">components</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Button.tsx</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const InPageHeader: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <PageHeader
      icon={<FolderIcon size="lg" decorative />}
      breadcrumbs={
        <Breadcrumbs>
          <BreadcrumbItem href="/">Workspace</BreadcrumbItem>
          <BreadcrumbItem href="/projects">Project</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Assets</BreadcrumbItem>
        </Breadcrumbs>
      }
      title="Textures"
      subtitle="Baked PBR materials"
      actions={<Button variant="filled">New</Button>}
    />
  ),
};
