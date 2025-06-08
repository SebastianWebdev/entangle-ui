// src/components/primitives/Tooltip/Tooltip.stories.tsx
import { ThemeProvider } from '@/theme';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Tooltip } from './Tooltip';
import { TooltipCollisionStrategy, TooltipPlacement } from './types';

import { AddIcon, SaveIcon, SettingsIcon, TrashIcon } from '@/components/Icons';

/**
 * Storybook configuration for Tooltip component
 *
 * Showcases contextual information display with intuitive placement,
 * intelligent collision handling, and advanced positioning features.
 */
const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{
            padding: '4rem',
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A powerful tooltip component with intuitive placement, intelligent collision handling, and advanced positioning options. Built on Base UI for robust accessibility and contextual information display.',
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
      description: 'Tooltip placement variant',
    },
    collision: {
      control: 'select',
      options: ['flip', 'shift', 'hide', 'flip-shift', 'smart', 'none'],
      description: 'Collision handling strategy',
    },
    delay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'Show delay in milliseconds',
    },
    closeDelay: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Hide delay in milliseconds',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the arrow',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled',
    },
    title: {
      control: 'text',
      description: 'Tooltip content',
    },
  },
  args: {
    title: 'This is a tooltip',
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

// Basic stories
export const Default: Story = {
  render: args => (
    <Tooltip {...args}>
      <Button>Hover for tooltip</Button>
    </Tooltip>
  ),
};

export const WithButton: Story = {
  args: {
    title: 'Save your work',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Save</Button>
    </Tooltip>
  ),
};

export const DebugTooltip: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
      <div style={{ padding: '4rem' }}>
        <button onClick={() => setIsOpen(!isOpen)}>
          Toggle Tooltip (Currently: {isOpen ? 'Open' : 'Closed'})
        </button>

        <div style={{ marginTop: '2rem' }}>
          <Tooltip
            title="Debug tooltip - stays open for styling"
            // Force tooltip to stay open
            rootProps={{
              open: isOpen,
              onOpenChange: setIsOpen,
            }}
          >
            <Button>Debug Target</Button>
          </Tooltip>
        </div>
      </div>
    );
  },
};

export const WithIconButton: Story = {
  args: {
    title: 'Open settings panel',
  },
  render: args => (
    <Tooltip {...args}>
      <IconButton aria-label="Settings">
        <SettingsIcon />
      </IconButton>
    </Tooltip>
  ),
};

// Placement variants
export const TopPlacement: Story = {
  args: {
    placement: 'top',
    title: 'Top placement',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Top</Button>
    </Tooltip>
  ),
};

export const BottomPlacement: Story = {
  args: {
    placement: 'bottom',
    title: 'Bottom placement',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Bottom</Button>
    </Tooltip>
  ),
};

export const LeftPlacement: Story = {
  args: {
    placement: 'left',
    title: 'Left placement',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Left</Button>
    </Tooltip>
  ),
};

export const RightPlacement: Story = {
  args: {
    placement: 'right',
    title: 'Right placement',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Right</Button>
    </Tooltip>
  ),
};

// Collision strategies
export const FlipCollision: Story = {
  args: {
    collision: 'flip',
    title: 'Flip collision strategy',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Flip</Button>
    </Tooltip>
  ),
};

export const ShiftCollision: Story = {
  args: {
    collision: 'shift',
    title: 'Shift collision strategy',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Shift</Button>
    </Tooltip>
  ),
};

export const SmartCollision: Story = {
  args: {
    collision: 'smart',
    title: 'Smart collision strategy',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Smart</Button>
    </Tooltip>
  ),
};

export const NoCollision: Story = {
  args: {
    collision: 'none',
    title: 'No collision handling',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>None</Button>
    </Tooltip>
  ),
};

// Animation variants
export const FastAnimation: Story = {
  args: {
    animation: {
      animated: true,
      duration: 100,
      easing: 'ease-in',
    },
    title: 'Fast animation (100ms)',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Fast</Button>
    </Tooltip>
  ),
};

export const SlowAnimation: Story = {
  args: {
    animation: {
      animated: true,
      duration: 500,
      easing: 'ease-out',
    },
    title: 'Slow animation (500ms)',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Slow</Button>
    </Tooltip>
  ),
};

export const NoAnimation: Story = {
  args: {
    animation: {
      animated: false,
    },
    title: 'No animation - instant',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>No Animation</Button>
    </Tooltip>
  ),
};

// Arrow variants
export const WithArrow: Story = {
  args: {
    arrow: true,
    title: 'Tooltip with arrow',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>With Arrow</Button>
    </Tooltip>
  ),
};

export const WithoutArrow: Story = {
  args: {
    arrow: false,
    title: 'Clean tooltip without arrow',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>No Arrow</Button>
    </Tooltip>
  ),
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    title: 'This tooltip will not show',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Disabled Tooltip</Button>
    </Tooltip>
  ),
};

export const ComplexContent: Story = {
  args: {
    title: (
      <div>
        <strong>Save Project</strong>
        <br />
        <small>Ctrl+S</small>
        <br />
        <em>Last saved: 2 minutes ago</em>
      </div>
    ),
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Complex Content</Button>
    </Tooltip>
  ),
};

export const InstantDelay: Story = {
  args: {
    delay: 0,
    title: 'Instant tooltip (no delay)',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Instant</Button>
    </Tooltip>
  ),
};

export const LongDelay: Story = {
  args: {
    delay: 1500,
    title: 'Long delay tooltip (1.5s)',
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Long Delay</Button>
    </Tooltip>
  ),
};

// Showcase all placements
export const AllPlacements: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '1rem',
        width: '400px',
        height: '300px',
      }}
    >
      <Tooltip placement="top-start" title="top-start">
        <Button size="sm">top-start</Button>
      </Tooltip>
      <Tooltip placement="top" title="top">
        <Button size="sm">top</Button>
      </Tooltip>
      <Tooltip placement="top-end" title="top-end">
        <Button size="sm">top-end</Button>
      </Tooltip>

      <Tooltip placement="left-start" title="left-start">
        <Button size="sm">left-start</Button>
      </Tooltip>
      <div />
      <Tooltip placement="right-start" title="right-start">
        <Button size="sm">right-start</Button>
      </Tooltip>

      <Tooltip placement="left" title="left">
        <Button size="sm">left</Button>
      </Tooltip>
      <div />
      <Tooltip placement="right" title="right">
        <Button size="sm">right</Button>
      </Tooltip>

      <Tooltip placement="left-end" title="left-end">
        <Button size="sm">left-end</Button>
      </Tooltip>
      <div />
      <Tooltip placement="right-end" title="right-end">
        <Button size="sm">right-end</Button>
      </Tooltip>

      <Tooltip placement="bottom-start" title="bottom-start">
        <Button size="sm">bottom-start</Button>
      </Tooltip>
      <Tooltip placement="bottom" title="bottom">
        <Button size="sm">bottom</Button>
      </Tooltip>
      <Tooltip placement="bottom-end" title="bottom-end">
        <Button size="sm">bottom-end</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 12 placement options demonstrated in a grid layout.',
      },
    },
  },
};

// Toolbar example
export const ToolbarExample: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        padding: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Tooltip title="Save project" placement="bottom">
        <IconButton size="sm" radius="sm" aria-label="Save">
          <SaveIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add new item" placement="bottom">
        <IconButton size="sm" radius="sm" aria-label="Add">
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Settings" placement="bottom">
        <IconButton size="sm" radius="sm" aria-label="Settings">
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <div
        style={{
          width: '1px',
          height: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          margin: '0 4px',
        }}
      />

      <Tooltip
        title={
          <div>
            <strong>Delete</strong>
            <br />
            <small>Cannot be undone</small>
          </div>
        }
        placement="bottom"
      >
        <IconButton size="sm" radius="sm" aria-label="Delete">
          <TrashIcon />
        </IconButton>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world toolbar example with multiple icon tooltips.',
      },
    },
  },
};

// Collision strategies showcase
export const CollisionStrategies: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Flip Strategy
        </h3>
        <Tooltip collision="flip" title="Flips to opposite side">
          <Button size="sm">Flip</Button>
        </Tooltip>
      </div>

      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Shift Strategy
        </h3>
        <Tooltip collision="shift" title="Shifts within bounds">
          <Button size="sm">Shift</Button>
        </Tooltip>
      </div>

      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Smart Strategy
        </h3>
        <Tooltip collision="smart" title="Intelligent positioning">
          <Button size="sm">Smart</Button>
        </Tooltip>
      </div>

      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Hide Strategy
        </h3>
        <Tooltip collision="hide" title="Hides when no space">
          <Button size="sm">Hide</Button>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different collision handling strategies for edge positioning.',
      },
    },
  },
};

// Animation showcase
export const AnimationShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Animation Variants
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Tooltip
            animation={{ animated: false }}
            title="No animation - instant"
          >
            <Button size="sm">No Animation</Button>
          </Tooltip>

          <Tooltip
            animation={{ duration: 100, easing: 'ease-in' }}
            title="Fast animation (100ms)"
          >
            <Button size="sm">Fast</Button>
          </Tooltip>

          <Tooltip
            animation={{ duration: 500, easing: 'ease-out' }}
            title="Slow animation (500ms)"
          >
            <Button size="sm">Slow</Button>
          </Tooltip>

          <Tooltip
            animation={{
              duration: 300,
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
            title="Bouncy animation"
          >
            <Button size="sm">Bouncy</Button>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different animation configurations and timing options.',
      },
    },
  },
};

// Advanced positioning example
export const AdvancedPositioning: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Custom Positioning
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Tooltip positioner={{ offset: 2 }} title="Very close (2px offset)">
            <Button size="sm">Close</Button>
          </Tooltip>

          <Tooltip positioner={{ offset: 20 }} title="Far away (20px offset)">
            <Button size="sm">Far</Button>
          </Tooltip>

          <Tooltip
            positioner={{ offset: 12, padding: 20, sticky: true }}
            title="Custom with sticky behavior"
          >
            <Button size="sm">Custom</Button>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Advanced positioning with custom offsets and behaviors.',
      },
    },
  },
};
const placements: TooltipPlacement[] = [
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
];
const collisionStrategies: TooltipCollisionStrategy[] = [
  'flip',
  'shift',
  'hide',
  'flip-shift',
  'smart',
  'none',
];
// Interactive example
export const InteractiveExample: Story = {
  render: () => {
    const [placement, setPlacement] = React.useState<TooltipPlacement>('top');
    const [collision, setCollision] =
      React.useState<TooltipCollisionStrategy>('smart');
    const [showArrow, setShowArrow] = React.useState(true);
    const [delay, setDelay] = React.useState(600);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
          Interactive Configuration
        </h3>

        <Tooltip
          placement={placement}
          collision={collision}
          arrow={showArrow}
          delay={delay}
          title={`Placement: ${placement}, Collision: ${collision}`}
        >
          <Button>Interactive Tooltip</Button>
        </Tooltip>

        <div
          style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '14px',
              }}
            >
              Placement:
            </label>
            <select
              value={placement}
              onChange={e => setPlacement(e.target.value as TooltipPlacement)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                background: '#2d2d2d',
                color: 'white',
                border: '1px solid #4a4a4a',
              }}
            >
              {placements.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '14px',
              }}
            >
              Collision:
            </label>
            <select
              value={collision}
              onChange={e =>
                setCollision(e.target.value as TooltipCollisionStrategy)
              }
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                background: '#2d2d2d',
                color: 'white',
                border: '1px solid #4a4a4a',
              }}
            >
              {collisionStrategies.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '14px',
              }}
            >
              Arrow:
            </label>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <input
                type="checkbox"
                checked={showArrow}
                onChange={e => setShowArrow(e.target.checked)}
              />
              Show Arrow
            </label>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '14px',
              }}
            >
              Delay: {delay}ms
            </label>
            <input
              type="range"
              min="0"
              max="2000"
              step="100"
              value={delay}
              onChange={e => setDelay(Number(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          Current configuration: placement={placement}, collision={collision},
          arrow={showArrow ? 'true' : 'false'}, delay={delay}ms
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to experiment with different tooltip configurations.',
      },
    },
  },
};
