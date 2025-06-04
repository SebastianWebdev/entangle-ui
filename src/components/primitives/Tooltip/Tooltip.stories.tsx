import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from '@emotion/styled';

import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import { Flex } from '@/components/layout/Flex/Flex';
import { Stack } from '@/components/layout/Stack/Stack';

/**
 * Storybook configuration for Tooltip component
 */
const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'A tooltip component that displays contextual information on hover. Supports both simple text and complex React nodes for advanced tooltip content.',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ],
      description: 'Tooltip placement relative to the trigger element',
    },
    collision: {
      control: 'select',
      options: ['flip', 'shift', 'hide', 'flip-shift', 'smart'],
      description: 'Strategy for handling collisions with viewport edges',
    },
    delay: {
      control: 'number',
      description: 'Delay in milliseconds before showing the tooltip',
    },
    closeDelay: {
      control: 'number',
      description: 'Delay in milliseconds before hiding the tooltip',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the arrow pointing to the trigger',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled',
    },
  },
  args: {
    placement: 'top',
    collision: 'smart',
    delay: 600,
    closeDelay: 0,
    arrow: true,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * Basic tooltip with simple text content
 */
export const Basic: Story = {
  args: {
    title: 'This is a basic tooltip',
    children: <Button>Hover me</Button>,
  },
};

/**
 * Tooltip with different placements
 */
export const Placements: Story = {
  render: args => (
    <Flex
      direction="column"
      align="center"
      justify="center"
      style={{ minHeight: '400px', gap: '32px' }}
    >
      <Flex justify="space-between" style={{ width: '300px' }}>
        <Tooltip {...args} placement="top-start" title="Top Start">
          <Button size="sm">Top Start</Button>
        </Tooltip>
        <Tooltip {...args} placement="top" title="Top">
          <Button size="sm">Top</Button>
        </Tooltip>
        <Tooltip {...args} placement="top-end" title="Top End">
          <Button size="sm">Top End</Button>
        </Tooltip>
      </Flex>

      <Flex justify="space-between" style={{ width: '300px' }}>
        <Tooltip {...args} placement="left-start" title="Left Start">
          <Button size="sm">Left Start</Button>
        </Tooltip>
        <div style={{ width: '80px' }} />
        <Tooltip {...args} placement="right-start" title="Right Start">
          <Button size="sm">Right Start</Button>
        </Tooltip>
      </Flex>

      <Flex justify="space-between" style={{ width: '300px' }}>
        <Tooltip {...args} placement="left" title="Left">
          <Button size="sm">Left</Button>
        </Tooltip>
        <div style={{ width: '80px' }} />
        <Tooltip {...args} placement="right" title="Right">
          <Button size="sm">Right</Button>
        </Tooltip>
      </Flex>

      <Flex justify="space-between" style={{ width: '300px' }}>
        <Tooltip {...args} placement="left-end" title="Left End">
          <Button size="sm">Left End</Button>
        </Tooltip>
        <div style={{ width: '80px' }} />
        <Tooltip {...args} placement="right-end" title="Right End">
          <Button size="sm">Right End</Button>
        </Tooltip>
      </Flex>

      <Flex justify="space-between" style={{ width: '300px' }}>
        <Tooltip {...args} placement="bottom-start" title="Bottom Start">
          <Button size="sm">Bottom Start</Button>
        </Tooltip>
        <Tooltip {...args} placement="bottom" title="Bottom">
          <Button size="sm">Bottom</Button>
        </Tooltip>
        <Tooltip {...args} placement="bottom-end" title="Bottom End">
          <Button size="sm">Bottom End</Button>
        </Tooltip>
      </Flex>
    </Flex>
  ),
};

/**
 * Tooltip with rich content
 */
export const RichContent: Story = {
  args: {
    title: (
      <div>
        <strong>Rich Content</strong>
        <div style={{ marginTop: '4px' }}>
          This tooltip contains <em>formatted</em> text and{' '}
          <span style={{ color: '#ff5555' }}>custom styling</span>.
        </div>
      </div>
    ),
    children: <Button>Rich Content</Button>,
  },
};

/**
 * Tooltip with icon button
 */
export const WithIconButton: Story = {
  args: {
    title: 'Save your work',
    children: (
      <IconButton aria-label="Save">
        <Icon name="save" />
      </IconButton>
    ),
  },
};

/**
 * Tooltip with different collision strategies
 */
export const CollisionStrategies: Story = {
  render: args => (
    <Stack direction="column" spacing={4} style={{ padding: '16px' }}>
      <Tooltip {...args} collision="flip" title="Flip to opposite side">
        <Button>Flip Strategy</Button>
      </Tooltip>
      <Tooltip {...args} collision="shift" title="Shift within viewport bounds">
        <Button>Shift Strategy</Button>
      </Tooltip>
      <Tooltip {...args} collision="hide" title="Hide when no space available">
        <Button>Hide Strategy</Button>
      </Tooltip>
      <Tooltip
        {...args}
        collision="flip-shift"
        title="Flip first, then shift if needed"
      >
        <Button>Flip-Shift Strategy</Button>
      </Tooltip>
      <Tooltip
        {...args}
        collision="smart"
        title="Intelligent positioning with axis switching"
      >
        <Button>Smart Strategy (Default)</Button>
      </Tooltip>
    </Stack>
  ),
};

/**
 * Tooltip with custom animation
 */
export const CustomAnimation: Story = {
  args: {
    title: 'Custom animation with longer duration',
    animation: {
      duration: 400,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    children: <Button>Custom Animation</Button>,
  },
};

/**
 * Tooltip with custom positioning
 */
export const CustomPositioning: Story = {
  args: {
    title: 'Custom offset of 16px from trigger',
    positioner: {
      offset: 16,
      padding: 12,
    },
    children: <Button>Custom Positioning</Button>,
  },
};

/**
 * Tooltip with custom collision configuration
 */
export const CustomCollision: Story = {
  args: {
    title: 'Custom collision handling',
    collisionConfig: {
      side: 'flip',
      align: 'shift',
      fallbackAxisSide: 'start',
    },
    children: <Button>Custom Collision</Button>,
  },
};

/**
 * Tooltip without arrow
 */
export const NoArrow: Story = {
  args: {
    title: 'Tooltip without arrow',
    arrow: false,
    children: <Button>No Arrow</Button>,
  },
};

/**
 * Tooltip with different delays
 */
export const Delays: Story = {
  render: args => (
    <Stack direction="column" spacing={4} style={{ padding: '16px' }}>
      <Tooltip {...args} delay={0} title="No delay (instant)">
        <Button>No Delay</Button>
      </Tooltip>
      <Tooltip {...args} delay={300} title="Short delay (300ms)">
        <Button>Short Delay</Button>
      </Tooltip>
      <Tooltip {...args} delay={1000} title="Long delay (1000ms)">
        <Button>Long Delay</Button>
      </Tooltip>
      <Tooltip
        {...args}
        delay={600}
        closeDelay={500}
        title="Close delay (500ms)"
      >
        <Button>Close Delay</Button>
      </Tooltip>
    </Stack>
  ),
};

const BoundaryContainer = styled.div`
  width: 300px;
  height: 200px;
  border: 1px dashed #666;
  padding: 16px;
  overflow: hidden;
  position: relative;
`;

/**
 * Tooltip with boundary constraint
 */
export const BoundaryConstraint: Story = {
  render: args => {
    const [containerId] = useState('boundary-container');
    
    return (
      <div style={{ padding: '16px' }}>
        <p style={{ marginBottom: '16px' }}>
          The tooltip will stay within the dashed boundary
        </p>
        <BoundaryContainer id={containerId}>
          <Tooltip
            {...args}
            title="This tooltip stays within the boundary container"
            positioner={{
              boundary: `#${containerId}`,
              padding: 5,
            }}
          >
            <Button style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
              Boundary Constrained
            </Button>
          </Tooltip>
        </BoundaryContainer>
      </div>
    );
  },
};

/**
 * Disabled tooltip
 */
export const Disabled: Story = {
  args: {
    title: "This tooltip won't appear",
    disabled: true,
    children: <Button>Disabled Tooltip</Button>,
  },
};
