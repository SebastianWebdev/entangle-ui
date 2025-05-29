// src/components/controls/Slider/Slider.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';
import { ThemeProvider } from '@/theme';

/**
 * Storybook configuration for Slider component
 * 
 * A professional slider component with drag interaction and keyboard support
 * for precise value control in editor interfaces.
 */
const meta: Meta<typeof Slider> = {
  title: 'Controls/Slider',
  component: Slider,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'var(--background-primary)',
          color: 'var(--text-primary)',
          minWidth: '300px',
          maxWidth: '400px'
        }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A professional slider component optimized for editor interfaces.

**Features:**
- **Drag interaction:** Click and drag thumb or track to adjust values
- **Keyboard navigation:** Arrow keys, Home/End, Page Up/Down
- **Modifier keys:** Ctrl (large steps), Shift (precision steps)
- **Visual feedback:** Tooltips, hover effects, focus states

**Keyboard shortcuts:**
- \`Arrow Left/Right/Up/Down\`: Increment/decrement by step
- \`Home/End\`: Jump to min/max values
- \`Page Up/Down\`: Large steps
- \`Ctrl + Arrow\`: Large steps
- \`Shift + Arrow\`: Precision steps
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Current slider value',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
      table: { defaultValue: { summary: '0' } },
    },
    max: {
      control: 'number',
      description: 'Maximum value', 
      table: { defaultValue: { summary: '100' } },
    },
    step: {
      control: 'number',
      description: 'Step size for increments',
      table: { defaultValue: { summary: '1' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Slider size variant',
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled',
      table: { defaultValue: { summary: 'false' } },
    },
    showTooltip: {
      control: 'boolean',
      description: 'Show value tooltip while dragging',
      table: { defaultValue: { summary: 'true' } },
    },
    showTicks: {
      control: 'boolean',
      description: 'Show tick marks along track',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

// Basic stories
export const Default: Story = {
  args: {
    value: 50,
    label: 'Volume',
    min: 0,
    max: 100,
  },
};

export const WithUnit: Story = {
  args: {
    value: 75,
    label: 'Opacity',
    min: 0,
    max: 100,
    unit: '%',
  },
};

export const WithTicks: Story = {
  args: {
    value: 45,
    label: 'Brightness',
    min: 0,
    max: 100,
    showTicks: true,
    tickCount: 6,
    step: 20,
  },
};

// Size variants
export const Sizes: Story = {
  render: () => {
    const [small, setSmall] = React.useState(25);
    const [medium, setMedium] = React.useState(50);
    const [large, setLarge] = React.useState(75);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Slider
          size="sm"
          value={small}
          onChange={setSmall}
          label="Small Size"
          min={0}
          max={100}
        />
        <Slider
          size="md"
          value={medium}
          onChange={setMedium}
          label="Medium Size (default)"
          min={0}
          max={100}
        />
        <Slider
          size="lg"
          value={large}
          onChange={setLarge}
          label="Large Size"
          min={0}
          max={100}
        />
      </div>
    );
  },
};

// Precision control
export const PrecisionControl: Story = {
  render: () => {
    const [value, setValue] = React.useState(2.5);
    
    return (
      <Slider
        value={value}
        onChange={setValue}
        label="Scale Factor"
        min={0.1}
        max={5}
        step={0.1}
        precisionStep={0.01}
        largeStep={1}
        precision={2}
        helperText="Use Ctrl for large steps (1.0), Shift for precision (0.01)"
      />
    );
  },
};

// States
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Slider
        value={60}
        onChange={() => {}}
        label="Normal State"
        min={0}
        max={100}
      />
      <Slider
        value={40}
        onChange={() => {}}
        label="Disabled State"
        min={0}
        max={100}
        disabled
        helperText="Cannot be modified"
      />
      <Slider
        value={80}
        onChange={() => {}}
        label="Read Only State"
        min={0}
        max={100}
        readOnly
        helperText="Value is read-only"
      />
      <Slider
        value={20}
        onChange={() => {}}
        label="Error State"
        min={0}
        max={100}
        error
        errorMessage="Value is too low"
      />
    </div>
  ),
};

// Real-world examples
export const ColorEditor: Story = {
  render: () => {
    const [h, setH] = React.useState(210);
    const [s, setS] = React.useState(75);
    const [l, setL] = React.useState(50);
    
    const color = `hsl(${h}, ${s}%, ${l}%)`;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          HSL Color Editor
        </h3>
        
        <Slider
          value={h}
          onChange={setH}
          label="Hue"
          min={0}
          max={360}
          step={1}
          unit="°"
          showTicks
          tickCount={13}
        />
        
        <Slider
          value={s}
          onChange={setS}
          label="Saturation"
          min={0}
          max={100}
          step={1}
          unit="%"
        />
        
        <Slider
          value={l}
          onChange={setL}
          label="Lightness"
          min={0}
          max={100}
          step={1}
          unit="%"
        />
        
        <div style={{ 
          height: '60px',
          backgroundColor: color,
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: l > 50 ? 'black' : 'white',
          fontWeight: '600',
          marginTop: '0.5rem'
        }}>
          {color}
        </div>
      </div>
    );
  },
};

export const AudioMixer: Story = {
  render: () => {
    const [master, setMaster] = React.useState(75);
    const [bass, setBass] = React.useState(50);
    const [mid, setMid] = React.useState(60);
    const [treble, setTreble] = React.useState(55);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          Audio Mixer
        </h3>
        
        <Slider
          value={master}
          onChange={setMaster}
          label="Master Volume"
          min={0}
          max={100}
          step={5}
          unit="%"
          size="lg"
          showTicks
          tickCount={6}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Slider
            value={bass}
            onChange={setBass}
            label="Bass"
            min={0}
            max={100}
            step={1}
            size="sm"
          />
          <Slider
            value={mid}
            onChange={setMid}
            label="Mid"
            min={0}
            max={100}
            step={1}
            size="sm"
          />
          <Slider
            value={treble}
            onChange={setTreble}
            label="Treble"
            min={0}
            max={100}
            step={1}
            size="sm"
          />
        </div>
      </div>
    );
  },
};