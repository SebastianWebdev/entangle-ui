import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import { VectorInput } from './VectorInput';
import type { VectorInputProps } from './VectorInput.types';

const meta: Meta<VectorInputProps> = {
  title: 'Controls/VectorInput',
  component: VectorInput,
  decorators: [
    Story => (
      <KeyboardContextProvider>
        <div style={{ maxWidth: 400 }}>
          <Story />
        </div>
      </KeyboardContextProvider>
    ),
  ],
  args: {
    dimension: 3,
    labelPreset: 'xyz',
    colorPreset: 'spatial',
    size: 'md',
    direction: 'row',
    gap: 2,
  },
  argTypes: {
    dimension: {
      control: { type: 'select' },
      options: [2, 3, 4],
    },
    labelPreset: {
      control: { type: 'select' },
      options: ['xyz', 'rgba', 'uvw', 'custom'],
    },
    colorPreset: {
      control: { type: 'select' },
      options: ['spatial', 'color', 'none', 'custom'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    direction: {
      control: { type: 'select' },
      options: ['row', 'column'],
    },
    gap: {
      control: { type: 'number', min: 0, max: 24, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<VectorInputProps>;

export const Default: Story = {
  args: {
    label: 'Position',
    defaultValue: [0, 0, 0],
  },
};

export const Dimensions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VectorInput dimension={2} label="Vec2" defaultValue={[0, 0]} />
      <VectorInput dimension={3} label="Vec3" defaultValue={[0, 0, 0]} />
      <VectorInput dimension={4} label="Vec4" defaultValue={[0, 0, 0, 0]} />
    </div>
  ),
};

export const LabelPresets: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VectorInput
        label="Position (XYZ)"
        labelPreset="xyz"
        defaultValue={[0, 0, 0]}
      />
      <VectorInput
        label="Color (RGBA)"
        dimension={4}
        labelPreset="rgba"
        colorPreset="color"
        defaultValue={[255, 128, 0, 255]}
      />
      <VectorInput
        label="UV Coords (UVW)"
        labelPreset="uvw"
        defaultValue={[0, 0, 0]}
      />
    </div>
  ),
};

export const ColorPresets: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VectorInput
        label="Spatial"
        colorPreset="spatial"
        defaultValue={[0, 0, 0]}
      />
      <VectorInput label="Color" colorPreset="color" defaultValue={[0, 0, 0]} />
      <VectorInput label="None" colorPreset="none" defaultValue={[0, 0, 0]} />
    </div>
  ),
};

export const CustomLabels: Story = {
  args: {
    dimension: 2,
    labelPreset: 'custom',
    axisLabels: ['Min', 'Max'],
    label: 'Range',
    defaultValue: [0, 100],
    colorPreset: 'none',
  },
};

export const WithLink: Story = {
  render: () => {
    const [value, setValue] = useState([1, 1, 1]);
    return (
      <VectorInput
        label="Scale"
        value={value}
        onChange={setValue}
        showLink
        defaultLinked
        step={0.1}
        precision={2}
      />
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VectorInput label="Small" size="sm" defaultValue={[0, 0, 0]} />
      <VectorInput label="Medium" size="md" defaultValue={[0, 0, 0]} />
      <VectorInput label="Large" size="lg" defaultValue={[0, 0, 0]} />
    </div>
  ),
};

export const ColumnLayout: Story = {
  args: {
    label: 'Position',
    direction: 'column',
    defaultValue: [0, 0, 0],
  },
};

export const GapSizes: Story = {
  name: 'Gap Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VectorInput label="gap=0" gap={0} defaultValue={[0, 0, 0]} />
      <VectorInput label="gap=2 (default)" gap={2} defaultValue={[0, 0, 0]} />
      <VectorInput label="gap=4" gap={4} defaultValue={[0, 0, 0]} />
      <VectorInput label="gap=8" gap={8} defaultValue={[0, 0, 0]} />
    </div>
  ),
};

export const WithUnit: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VectorInput
        label="Rotation"
        defaultValue={[0, 0, 0]}
        unit="°"
        step={1}
        precision={1}
      />
      <VectorInput
        label="Position"
        defaultValue={[0, 0, 0]}
        unit="px"
        step={1}
        precision={0}
      />
    </div>
  ),
};

export const TransformPanel: Story = {
  name: 'Editor — Transform Panel',
  render: () => {
    const [position, setPosition] = useState([0, 0, 0]);
    const [rotation, setRotation] = useState([0, 0, 0]);
    const [scale, setScale] = useState([1, 1, 1]);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: 320,
          padding: 12,
          background: '#1e1e1e',
          borderRadius: 8,
        }}
      >
        <VectorInput
          label="Position"
          value={position}
          onChange={setPosition}
          unit="m"
          step={0.1}
          precision={2}
          size="sm"
        />
        <VectorInput
          label="Rotation"
          value={rotation}
          onChange={setRotation}
          unit="°"
          step={1}
          precision={1}
          size="sm"
        />
        <VectorInput
          label="Scale"
          value={scale}
          onChange={setScale}
          showLink
          defaultLinked
          step={0.01}
          precision={3}
          size="sm"
        />
      </div>
    );
  },
};

export const ColorChannels: Story = {
  name: 'Editor — Color Channels',
  render: () => {
    const [color, setColor] = useState([255, 128, 0, 255]);
    return (
      <VectorInput
        label="Color"
        dimension={4}
        labelPreset="rgba"
        colorPreset="color"
        value={color}
        onChange={setColor}
        min={0}
        max={255}
        step={1}
        precision={0}
      />
    );
  },
};

export const UVCoordinates: Story = {
  name: 'Editor — UV Coordinates',
  render: () => {
    const [uv, setUV] = useState([0, 0]);
    return (
      <VectorInput
        label="UV Offset"
        dimension={2}
        labelPreset="uvw"
        value={uv}
        onChange={setUV}
        step={0.01}
        precision={3}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    label: 'Locked Position',
    defaultValue: [10, 20, 30],
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState([0, 0, 0]);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <VectorInput
          label="Position"
          value={value}
          onChange={setValue}
          step={0.1}
          precision={2}
        />
        <div style={{ color: '#999', fontSize: 12 }}>
          Value: [{value.map(v => v.toFixed(2)).join(', ')}]
        </div>
      </div>
    );
  },
};
