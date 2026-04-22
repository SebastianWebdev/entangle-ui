import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
import { Button } from '@/components/primitives/Button';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    bordered: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

const FolderGlyph = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

export const Default: Story = {
  args: { title: 'Project Assets' },
};

export const WithActions: Story = {
  args: {
    title: 'Project Assets',
    subtitle: '124 items',
    icon: <FolderGlyph />,
    actions: (
      <>
        <Button>Import</Button>
        <Button variant="filled">Upload</Button>
      </>
    ),
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    breadcrumbs: <span>Workspace / Project / Assets</span>,
    title: 'Textures',
    subtitle: 'Baked PBR materials',
    icon: <FolderGlyph />,
    actions: <Button variant="filled">New</Button>,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader size="sm" title="Small" />
      <PageHeader size="md" title="Medium" />
      <PageHeader size="lg" title="Large" />
    </div>
  ),
};
