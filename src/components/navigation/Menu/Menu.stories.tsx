import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';
import {
  EditIcon,
  EyeIcon,
  SettingsIcon,
  StarIcon,
  SaveIcon,
  CheckIcon,
  CircleIcon,
} from '@/components/Icons';

import { ThemeProvider } from '@/theme';

import { Menu, type MenuConfig, type MenuSelection } from './Menu';

/**
 * Storybook configuration for Menu component.
 *
 * Demonstrates configuration-driven menu system with automatic
 * radio/checkbox selection handling and nested submenus.
 */
const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--background-primary)',
            color: 'var(--text-primary)',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
A configuration-driven menu component that automatically handles selection states, 
grouping, and nested submenus based on the provided configuration object.

Features:
- **Automatic selection handling**: Radio, checkbox, or no selection based on group type
- **Visual grouping**: Groups with optional labels and separators  
- **Nested submenus**: Full recursive menu support
- **Controlled state**: Pass selected items and handle changes via onChange
- **Custom icons**: Configurable selection indicators with sensible defaults
        `,
      },
    },
  },
  argTypes: {
    config: {
      control: false,
      description: 'Menu configuration object defining structure and behavior',
    },
    selectedItems: {
      control: false,
      description: 'Currently selected items organized by group ID',
    },
    onChange: {
      control: false,
      description: 'Callback when selection changes',
    },
    checkboxIcon: {
      control: false,
      description: 'Custom icon for checkbox selected state',
    },
    radioIcon: {
      control: false,
      description: 'Custom icon for radio selected state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the menu trigger is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

// Mock handlers for stories
const createMockHandler = (action: string) => (id: string) => {
  console.log(`${action}: ${id}`);
};

/**
 * Basic menu with simple action items.
 * No selection state, just click handlers.
 */
export const BasicActions: Story = {
  render: () => {
    const config: MenuConfig = {
      groups: [
        {
          id: 'file-actions',
          items: [
            {
              id: 'new',
              label: 'New File',
              onClick: createMockHandler('New file'),
            },
            {
              id: 'open',
              label: 'Open File',
              onClick: createMockHandler('Open file'),
            },
            {
              id: 'save',
              label: 'Save',
              onClick: createMockHandler('Save'),
            },
            {
              id: 'save-as',
              label: 'Save As...',
              onClick: createMockHandler('Save as'),
              disabled: true,
            },
          ],
          itemSelectionType: 'none',
        },
      ],
    };

    return (
      <Menu config={config}>
        <Stack spacing={1} direction="row" align="center">
          <SaveIcon size="sm" />
          <Text variant="caption">File Menu</Text>
        </Stack>
      </Menu>
    );
  },
};

/**
 * Menu with radio button selection for themes.
 * Only one theme can be selected at a time.
 */
export const RadioSelection: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<MenuSelection>({
      theme: ['light'],
    });

    const config: MenuConfig = {
      groups: [
        {
          id: 'theme',
          label: 'Theme',
          items: [
            {
              id: 'light',
              label: 'Light Theme',
              onClick: createMockHandler('Light theme selected'),
            },
            {
              id: 'dark',
              label: 'Dark Theme',
              onClick: createMockHandler('Dark theme selected'),
            },
            {
              id: 'auto',
              label: 'Auto (System)',
              onClick: createMockHandler('Auto theme selected'),
            },
          ],
          itemSelectionType: 'radio',
        },
      ],
    };

    return (
      <Stack spacing={4} direction="column">
        <Menu
          config={config}
          selectedItems={selectedItems}
          onChange={setSelectedItems}
          radioIcon={<CircleIcon size="sm" />}
        >
          <Stack spacing={1} direction="row" align="center">
            <SettingsIcon size="sm" />
            <Text variant="caption">Theme Settings</Text>
          </Stack>
        </Menu>
        <div
          style={{
            padding: '12px',
            background: '#2d2d2d',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        >
          <Text variant="caption" color="muted">
            <strong>Selected:</strong> {JSON.stringify(selectedItems, null, 2)}
          </Text>
        </div>
      </Stack>
    );
  },
};

/**
 * Menu with checkbox selection for view options.
 * Multiple items can be selected simultaneously.
 */
export const CheckboxSelection: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<MenuSelection>({
      'view-options': ['sidebar', 'minimap'],
    });

    const config: MenuConfig = {
      groups: [
        {
          id: 'view-options',
          label: 'View Options',
          items: [
            {
              id: 'sidebar',
              label: 'Show Sidebar',
              onClick: createMockHandler('Toggle sidebar'),
            },
            {
              id: 'minimap',
              label: 'Show Minimap',
              onClick: createMockHandler('Toggle minimap'),
            },
            {
              id: 'breadcrumbs',
              label: 'Show Breadcrumbs',
              onClick: createMockHandler('Toggle breadcrumbs'),
            },
            {
              id: 'line-numbers',
              label: 'Show Line Numbers',
              onClick: createMockHandler('Toggle line numbers'),
            },
          ],
          itemSelectionType: 'checkbox',
        },
      ],
    };

    return (
      <Stack spacing={4} direction="column">
        <Menu
          config={config}
          selectedItems={selectedItems}
          onChange={setSelectedItems}
          checkboxIcon={<CheckIcon size="sm" />}
        >
          <Stack spacing={1} direction="row" align="center">
            <EyeIcon size="sm" />
            <Text variant="caption">View Options</Text>
          </Stack>
        </Menu>
        <div
          style={{
            padding: '12px',
            background: '#2d2d2d',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        >
          <Text variant="caption" color="muted">
            <strong>Selected:</strong> {JSON.stringify(selectedItems, null, 2)}
          </Text>
        </div>
      </Stack>
    );
  },
};

/**
 * Complex menu with multiple groups and different selection types.
 * Demonstrates grouping, separators, and mixed selection behaviors.
 */
export const MultipleGroups: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<MenuSelection>({
      'view-options': ['sidebar'],
      theme: ['dark'],
    });

    const config: MenuConfig = {
      groups: [
        {
          id: 'file-actions',
          label: 'File Actions',
          items: [
            {
              id: 'copy',
              label: 'Copy',
              onClick: createMockHandler('Copy'),
            },
            {
              id: 'cut',
              label: 'Cut',
              onClick: createMockHandler('Cut'),
            },
            {
              id: 'paste',
              label: 'Paste',
              onClick: createMockHandler('Paste'),
              disabled: true,
            },
            {
              id: 'delete',
              label: 'Delete',
              onClick: createMockHandler('Delete'),
            },
          ],
          itemSelectionType: 'none',
        },
        {
          id: 'view-options',
          label: 'View Options',
          items: [
            {
              id: 'sidebar',
              label: 'Show Sidebar',
              onClick: createMockHandler('Toggle sidebar'),
            },
            {
              id: 'minimap',
              label: 'Show Minimap',
              onClick: createMockHandler('Toggle minimap'),
            },
          ],
          itemSelectionType: 'checkbox',
        },
        {
          id: 'theme',
          label: 'Theme',
          items: [
            {
              id: 'light',
              label: 'Light',
              onClick: createMockHandler('Light theme'),
            },
            {
              id: 'dark',
              label: 'Dark',
              onClick: createMockHandler('Dark theme'),
            },
            {
              id: 'auto',
              label: 'Auto',
              onClick: createMockHandler('Auto theme'),
            },
          ],
          itemSelectionType: 'radio',
        },
      ],
    };

    return (
      <Stack spacing={4} direction="column">
        <Menu
          config={config}
          selectedItems={selectedItems}
          onChange={setSelectedItems}
        >
          <Stack spacing={1} direction="row" align="center">
            <SettingsIcon size="sm" />
            <Text variant="caption">Editor Options</Text>
          </Stack>
        </Menu>
        <div
          style={{
            padding: '12px',
            background: '#2d2d2d',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        >
          <Text variant="caption" color="muted">
            <strong>Selected:</strong> {JSON.stringify(selectedItems, null, 2)}
          </Text>
        </div>
      </Stack>
    );
  },
};

/**
 * Menu with nested submenus.
 * Demonstrates recursive menu structure and submenu navigation.
 */
export const NestedSubmenus: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<MenuSelection>({
      'text-size': ['medium'],
      'text-family': ['inter'],
    });

    const config: MenuConfig = {
      groups: [
        {
          id: 'edit-actions',
          items: [
            {
              id: 'copy',
              label: 'Copy',
              onClick: createMockHandler('Copy'),
            },
            {
              id: 'paste',
              label: 'Paste',
              onClick: createMockHandler('Paste'),
            },
            {
              id: 'format',
              label: 'Format',
              onClick: createMockHandler('Format menu'),
              subMenu: {
                groups: [
                  {
                    id: 'text-size',
                    label: 'Text Size',
                    items: [
                      {
                        id: 'small',
                        label: 'Small',
                        onClick: createMockHandler('Small text'),
                      },
                      {
                        id: 'medium',
                        label: 'Medium',
                        onClick: createMockHandler('Medium text'),
                      },
                      {
                        id: 'large',
                        label: 'Large',
                        onClick: createMockHandler('Large text'),
                      },
                    ],
                    itemSelectionType: 'radio',
                  },
                  {
                    id: 'text-family',
                    label: 'Font Family',
                    items: [
                      {
                        id: 'inter',
                        label: 'Inter',
                        onClick: createMockHandler('Inter font'),
                      },
                      {
                        id: 'roboto',
                        label: 'Roboto',
                        onClick: createMockHandler('Roboto font'),
                      },
                      {
                        id: 'system',
                        label: 'System Default',
                        onClick: createMockHandler('System font'),
                      },
                    ],
                    itemSelectionType: 'radio',
                  },
                ],
              },
            },
          ],
          itemSelectionType: 'none',
        },
      ],
    };

    return (
      <Stack spacing={4} direction="column">
        <Menu
          config={config}
          selectedItems={selectedItems}
          onChange={setSelectedItems}
        >
          <Stack spacing={1} direction="row" align="center">
            <EditIcon size="sm" />
            <Text variant="caption">Edit Menu</Text>
          </Stack>
        </Menu>
        <div
          style={{
            padding: '12px',
            background: '#2d2d2d',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        >
          <Text variant="caption" color="muted">
            <strong>Selected:</strong> {JSON.stringify(selectedItems, null, 2)}
          </Text>
        </div>
      </Stack>
    );
  },
};

/**
 * Menu that opens on hover instead of click.
 * Useful for toolbar buttons and quick access menus.
 */
export const HoverMenu: Story = {
  render: () => {
    const config: MenuConfig = {
      openOnHover: true,
      groups: [
        {
          id: 'quick-actions',
          items: [
            {
              id: 'star',
              label: 'Add to Favorites',
              onClick: createMockHandler('Add to favorites'),
            },
            {
              id: 'share',
              label: 'Share',
              onClick: createMockHandler('Share'),
            },
            {
              id: 'download',
              label: 'Download',
              onClick: createMockHandler('Download'),
            },
          ],
          itemSelectionType: 'none',
        },
      ],
    };

    return (
      <Stack spacing={4} direction="column">
        <Text variant="caption" color="muted">
          Hover over the button to open the menu
        </Text>
        <Menu config={config}>
          <Stack spacing={1} direction="row" align="center">
            <StarIcon size="sm" />
            <Text variant="caption">Quick Actions</Text>
          </Stack>
        </Menu>
      </Stack>
    );
  },
};

/**
 * Disabled menu state.
 * Shows how the menu behaves when disabled.
 */
export const DisabledMenu: Story = {
  render: () => {
    const config: MenuConfig = {
      groups: [
        {
          id: 'actions',
          items: [
            {
              id: 'action1',
              label: 'Action 1',
              onClick: createMockHandler('Action 1'),
            },
            {
              id: 'action2',
              label: 'Action 2',
              onClick: createMockHandler('Action 2'),
            },
          ],
          itemSelectionType: 'none',
        },
      ],
    };

    return (
      <Stack spacing={4} direction="row" align="center">
        <Menu config={config} disabled={false}>
          <Text variant="caption">Enabled Menu</Text>
        </Menu>
        <Menu config={config} disabled={true}>
          <Text variant="caption">Disabled Menu</Text>
        </Menu>
      </Stack>
    );
  },
};

/**
 * Menu with custom selection icons.
 * Demonstrates how to customize the checkbox and radio indicators.
 */
export const CustomIcons: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<MenuSelection>({
      visibility: ['visible'],
      priority: ['high'],
    });

    const config: MenuConfig = {
      groups: [
        {
          id: 'visibility',
          label: 'Visibility',
          items: [
            {
              id: 'visible',
              label: 'Visible',
              onClick: createMockHandler('Set visible'),
            },
            {
              id: 'hidden',
              label: 'Hidden',
              onClick: createMockHandler('Set hidden'),
            },
          ],
          itemSelectionType: 'radio',
        },
        {
          id: 'priority',
          label: 'Priority Level',
          items: [
            {
              id: 'low',
              label: 'Low Priority',
              onClick: createMockHandler('Low priority'),
            },
            {
              id: 'medium',
              label: 'Medium Priority',
              onClick: createMockHandler('Medium priority'),
            },
            {
              id: 'high',
              label: 'High Priority',
              onClick: createMockHandler('High priority'),
            },
          ],
          itemSelectionType: 'checkbox',
        },
      ],
    };

    return (
      <Stack spacing={4} direction="column">
        <Menu
          config={config}
          selectedItems={selectedItems}
          onChange={setSelectedItems}
          radioIcon={<EyeIcon size="sm" />}
          checkboxIcon={<StarIcon size="sm" />}
        >
          <Stack spacing={1} direction="row" align="center">
            <SettingsIcon size="sm" />
            <Text variant="caption">Custom Icons</Text>
          </Stack>
        </Menu>
        <div
          style={{
            padding: '12px',
            background: '#2d2d2d',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        >
          <Text variant="caption" color="muted">
            <strong>Selected:</strong> {JSON.stringify(selectedItems, null, 2)}
          </Text>
        </div>
      </Stack>
    );
  },
};
