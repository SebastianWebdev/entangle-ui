import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/primitives/Text';
import type { MenuConfig, MenuSelection } from '../Menu';
import { ContextMenu } from './ContextMenu';
import type { ContextMenuTargetDetails } from './ContextMenu.types';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Right-click menu built on the same config model as Menu. Supports static configs and context-aware resolvers.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

const zoneStyle: CSSProperties = {
  border: '1px dashed rgba(255, 255, 255, 0.3)',
  borderRadius: 6,
  padding: 16,
  minHeight: 92,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.03)',
};

export const Basic: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('none');
    const [selectedItems, setSelectedItems] = useState<MenuSelection>({
      snap: ['grid'],
    });

    const config: MenuConfig = {
      groups: [
        {
          id: 'actions',
          label: 'Actions',
          itemSelectionType: 'none',
          items: [
            {
              id: 'copy',
              label: 'Copy',
              onClick: id => setLastAction(id),
            },
            {
              id: 'paste',
              label: 'Paste',
              onClick: id => setLastAction(id),
            },
          ],
        },
        {
          id: 'snap',
          label: 'Snap',
          itemSelectionType: 'radio',
          items: [
            {
              id: 'grid',
              label: 'Grid',
              onClick: id => setLastAction(id),
            },
            {
              id: 'surface',
              label: 'Surface',
              onClick: id => setLastAction(id),
            },
            {
              id: 'none',
              label: 'None',
              onClick: id => setLastAction(id),
            },
          ],
        },
      ],
    };

    return (
      <Stack spacing={3}>
        <ContextMenu
          config={config}
          selectedItems={selectedItems}
          onChange={setSelectedItems}
        >
          <div style={zoneStyle}>
            <Text size="sm">Right click this area</Text>
          </div>
        </ContextMenu>
        <Text size="xs" color="muted" mono>
          Last action: {lastAction}
        </Text>
      </Stack>
    );
  },
};

type SurfacePayload = {
  surface: 'assets' | 'viewport';
  id: string;
};

export const DynamicByPayload: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('none');

    const config = (
      context: ContextMenuTargetDetails<SurfacePayload>
    ): MenuConfig => {
      if (context.payload?.surface === 'assets') {
        return {
          groups: [
            {
              id: 'asset-actions',
              itemSelectionType: 'none',
              items: [
                {
                  id: 'rename',
                  label: `Rename ${context.payload.id}`,
                  onClick: id => setLastAction(id),
                },
                {
                  id: 'duplicate',
                  label: 'Duplicate',
                  onClick: id => setLastAction(id),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  onClick: id => setLastAction(id),
                },
              ],
            },
          ],
        };
      }

      return {
        groups: [
          {
            id: 'viewport-actions',
            itemSelectionType: 'none',
            items: [
              {
                id: 'focus',
                label: 'Focus Selection',
                onClick: id => setLastAction(id),
              },
              {
                id: 'frame-all',
                label: 'Frame All',
                onClick: id => setLastAction(id),
              },
              {
                id: 'reset-camera',
                label: 'Reset Camera',
                onClick: id => setLastAction(id),
              },
            ],
          },
        ],
      };
    };

    return (
      <Stack spacing={3}>
        <ContextMenu<SurfacePayload>
          config={config}
          payload={{ surface: 'assets', id: 'TreeNode_Asset_01' }}
        >
          <div style={zoneStyle}>
            <Text size="sm">Right click Asset Surface</Text>
          </div>
        </ContextMenu>

        <ContextMenu<SurfacePayload>
          config={config}
          payload={{ surface: 'viewport', id: 'viewport-main' }}
        >
          <div style={zoneStyle}>
            <Text size="sm">Right click Viewport Surface</Text>
          </div>
        </ContextMenu>

        <Text size="xs" color="muted" mono>
          Last action: {lastAction}
        </Text>
      </Stack>
    );
  },
};
