import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from '@emotion/styled';
import { Button } from '@/components/primitives/Button/Button';
import { IconButton } from '@/components/primitives/IconButton/IconButton';
import { Icon } from '@/components/primitives/Icon/Icon';
import { Flex } from '@/components/layout/Flex/Flex';
import { Stack } from '@/components/layout/Stack/Stack';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  SimpleTooltip,
  TooltipPlacement,
} from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip component for displaying additional information on hover or focus.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * Basic tooltip example with default settings
 */
export const Basic: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button>Hover Me</Button>
      </TooltipTrigger>
      <TooltipContent>
        This is a tooltip that appears when you hover over the button
      </TooltipContent>
    </Tooltip>
  ),
};

/**
 * Simple tooltip wrapper for common use cases
 */
export const Simple: Story = {
  render: () => (
    <SimpleTooltip content="This is a simple tooltip">
      <Button>Hover Me</Button>
    </SimpleTooltip>
  ),
};

/**
 * Tooltip with different placements
 */
export const Placements: Story = {
  render: () => {
    const placements: TooltipPlacement[] = [
      'top',
      'top-start',
      'top-end',
      'right',
      'right-start',
      'right-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
    ];

    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ padding: '100px 0' }}
      >
        <Stack spacing={4} wrap="wrap" justify="center">
          {placements.map(placement => (
            <SimpleTooltip
              key={placement}
              content={`Placement: ${placement}`}
              placement={placement}
            >
              <Button size="sm">{placement}</Button>
            </SimpleTooltip>
          ))}
        </Stack>
      </Flex>
    );
  },
};

/**
 * Tooltip with different variants
 */
export const Variants: Story = {
  render: () => (
    <Stack spacing={4}>
      <SimpleTooltip content="Dark variant tooltip (default)" variant="dark">
        <Button>Dark Variant</Button>
      </SimpleTooltip>
      <SimpleTooltip content="Light variant tooltip" variant="light">
        <Button>Light Variant</Button>
      </SimpleTooltip>
    </Stack>
  ),
};

/**
 * Tooltip with custom delay
 */
export const CustomDelay: Story = {
  render: () => (
    <Stack spacing={4}>
      <SimpleTooltip content="Appears quickly (200ms)" delay={200}>
        <Button>Quick Tooltip</Button>
      </SimpleTooltip>
      <SimpleTooltip content="Appears with default delay (600ms)">
        <Button>Default Delay</Button>
      </SimpleTooltip>
      <SimpleTooltip content="Appears slowly (1500ms)" delay={1500}>
        <Button>Slow Tooltip</Button>
      </SimpleTooltip>
    </Stack>
  ),
};

/**
 * Tooltip with rich content
 */
export const RichContent: Story = {
  render: () => {
    const RichTooltipContent = styled.div`
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      h4 {
        margin: 0;
        font-size: 14px;
      }
      
      p {
        margin: 0;
        font-size: 12px;
      }
      
      code {
        background: rgba(0, 0, 0, 0.2);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
      }
    `;

    return (
      <SimpleTooltip
        content={
          <RichTooltipContent>
            <h4>Rich Tooltip Content</h4>
            <p>
              Tooltips can contain <strong>formatted text</strong>, 
              <code>code snippets</code>, and other elements.
            </p>
          </RichTooltipContent>
        }
      >
        <Button>Rich Content</Button>
      </SimpleTooltip>
    );
  },
};

/**
 * Tooltip with icon buttons
 */
export const WithIconButtons: Story = {
  render: () => (
    <Flex gap={3}>
      <SimpleTooltip content="Save document">
        <IconButton
          aria-label="Save"
          icon={<Icon name="save" />}
          variant="ghost"
        />
      </SimpleTooltip>
      <SimpleTooltip content="Delete item">
        <IconButton
          aria-label="Delete"
          icon={<Icon name="trash" />}
          variant="ghost"
        />
      </SimpleTooltip>
      <SimpleTooltip content="Add to favorites">
        <IconButton
          aria-label="Favorite"
          icon={<Icon name="star" />}
          variant="ghost"
        />
      </SimpleTooltip>
    </Flex>
  ),
};

/**
 * Controlled tooltip example
 */
export const Controlled: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);

    return (
      <Stack spacing={4}>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger>
            <Button>Controlled Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>
            This tooltip is controlled programmatically
          </TooltipContent>
        </Tooltip>

        <Button
          variant="ghost"
          onClick={() => setOpen(prev => !prev)}
        >
          {open ? 'Hide' : 'Show'} Tooltip
        </Button>
      </Stack>
    );
  },
};

/**
 * Tooltip without arrow
 */
export const WithoutArrow: Story = {
  render: () => (
    <SimpleTooltip content="Tooltip without arrow" showArrow={false}>
      <Button>No Arrow</Button>
    </SimpleTooltip>
  ),
};
