import type { Meta, StoryObj } from '@storybook/react';
import { SaveIcon } from './SaveIcon';
import { TrashIcon } from './TrashIcon';
import { SettingsIcon } from './SettingsIcon';
import { SearchIcon } from './SearchIcon';
import { AddIcon } from './AddIcon';
import { CloseIcon } from './CloseIcon';
import { EditIcon } from './EditIcon';
import { PlayIcon } from './PlayIcon';
import { FolderIcon } from './FolderIcon';
import { EyeIcon } from './EyeIcon';
import type { IconProps } from '../primitives/Icon';

/**
 * Storybook configuration for Icon components
 * 
 * Showcases all available icons with different sizes and colors
 * for use in editor interfaces and applications.
 */
const meta: Meta<IconProps> = {
  title: 'Icons/All Icons',
  parameters: {
    docs: {
      description: {
        component: 'A collection of commonly used icons for editor interfaces. All icons are built using the base Icon component and support consistent sizing and coloring.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the icon',
      defaultValue: 'md',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'accent', 'success', 'warning', 'error'],
      description: 'Color variant of the icon',
      defaultValue: 'primary',
    },
  },
};

export default meta;
type Story = StoryObj<IconProps>;

/**
 * Overview of all available icons in the library
 */
export const AllIcons: Story = {
  render: (args) => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
      gap: '24px',
      padding: '24px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <SaveIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>SaveIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <TrashIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>TrashIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <SettingsIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>SettingsIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <SearchIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>SearchIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <AddIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>AddIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <CloseIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>CloseIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <EditIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>EditIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <PlayIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>PlayIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <FolderIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>FolderIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <EyeIcon {...args} />
        <span style={{ fontSize: '12px', color: '#666' }}>EyeIcon</span>
      </div>
    </div>
  ),
  args: {
    size: 'md',
    color: 'primary',
  },
};

/**
 * Size comparison showing all icons in different sizes
 */
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Small (sm)</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <SaveIcon size="sm" />
          <TrashIcon size="sm" />
          <SettingsIcon size="sm" />
          <SearchIcon size="sm" />
          <AddIcon size="sm" />
          <CloseIcon size="sm" />
          <EditIcon size="sm" />
          <PlayIcon size="sm" />
          <FolderIcon size="sm" />
          <EyeIcon size="sm" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Medium (md)</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <SaveIcon size="md" />
          <TrashIcon size="md" />
          <SettingsIcon size="md" />
          <SearchIcon size="md" />
          <AddIcon size="md" />
          <CloseIcon size="md" />
          <EditIcon size="md" />
          <PlayIcon size="md" />
          <FolderIcon size="md" />
          <EyeIcon size="md" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Large (lg)</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <SaveIcon size="lg" />
          <TrashIcon size="lg" />
          <SettingsIcon size="lg" />
          <SearchIcon size="lg" />
          <AddIcon size="lg" />
          <CloseIcon size="lg" />
          <EditIcon size="lg" />
          <PlayIcon size="lg" />
          <FolderIcon size="lg" />
          <EyeIcon size="lg" />
        </div>
      </div>
    </div>
  ),
};

/**
 * Color variants showing semantic color usage
 */
export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Action Colors</h3>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <SaveIcon color="success" size="lg" />
            <span style={{ fontSize: '12px', color: '#666' }}>Success</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <TrashIcon color="error" size="lg" />
            <span style={{ fontSize: '12px', color: '#666' }}>Error</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon color="warning" size="lg" />
            <span style={{ fontSize: '12px', color: '#666' }}>Warning</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <PlayIcon color="accent" size="lg" />
            <span style={{ fontSize: '12px', color: '#666' }}>Accent</span>
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Neutral Colors</h3>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <SearchIcon color="primary" size="lg" />
            <span style={{ fontSize: '12px', color: '#666' }}>Primary</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <EditIcon color="secondary" size="lg" />
            <span style={{ fontSize: '12px', color: '#666' }}>Secondary</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <CloseIcon color="muted" size="lg" />
            <span style={{ fontSize: '12px', color: '#666' }}>Muted</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Individual icon stories for detailed documentation
 */
export const SaveIconStory: Story = {
  render: (args) => <SaveIcon {...args} />,
  args: {
    size: 'md',
    color: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Save icon for save operations and data persistence actions.',
      },
    },
  },
};

export const TrashIconStory: Story = {
  render: (args) => <TrashIcon {...args} />,
  args: {
    size: 'md',
    color: 'error',
  },
  parameters: {
    docs: {
      description: {
        story: 'Trash icon for delete and remove operations.',
      },
    },
  },
};

export const SettingsIconStory: Story = {
  render: (args) => <SettingsIcon {...args} />,
  args: {
    size: 'md',
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Settings icon for configuration and preferences.',
      },
    },
  },
};

export const SearchIconStory: Story = {
  render: (args) => <SearchIcon {...args} />,
  args: {
    size: 'md',
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Search icon for search functionality and filters.',
      },
    },
  },
};

export const AddIconStory: Story = {
  render: (args) => <AddIcon {...args} />,
  args: {
    size: 'md',
    color: 'accent',
  },
  parameters: {
    docs: {
      description: {
        story: 'Add icon for creating new items and expanding content.',
      },
    },
  },
};

export const CloseIconStory: Story = {
  render: (args) => <CloseIcon {...args} />,
  args: {
    size: 'md',
    color: 'muted',
  },
  parameters: {
    docs: {
      description: {
        story: 'Close icon for closing dialogs and canceling operations.',
      },
    },
  },
};

export const EditIconStory: Story = {
  render: (args) => <EditIcon {...args} />,
  args: {
    size: 'md',
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Edit icon for editing content and modifying data.',
      },
    },
  },
};

export const PlayIconStory: Story = {
  render: (args) => <PlayIcon {...args} />,
  args: {
    size: 'md',
    color: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Play icon for starting playback and running processes.',
      },
    },
  },
};

export const FolderIconStory: Story = {
  render: (args) => <FolderIcon {...args} />,
  args: {
    size: 'md',
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Folder icon for file system navigation and organizing content.',
      },
    },
  },
};

export const EyeIconStory: Story = {
  render: (args) => <EyeIcon {...args} />,
  args: {
    size: 'md',
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Eye icon for visibility toggles and preview functionality.',
      },
    },
  },
};
