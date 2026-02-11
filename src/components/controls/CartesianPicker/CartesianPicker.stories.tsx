import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CartesianPicker } from './CartesianPicker';
import type { Point2D } from '@/components/primitives/canvas';

const meta: Meta<typeof CartesianPicker> = {
  title: 'Controls/CartesianPicker',
  component: CartesianPicker,
  tags: ['autodocs'],
  argTypes: {
    domainX: { control: false },
    domainY: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    renderBackground: { control: false },
    renderBottomBar: { control: false },
    onChange: { action: 'onChange' },
    onChangeComplete: { action: 'onChangeComplete' },
  },
};

export default meta;
type Story = StoryObj<typeof CartesianPicker>;

// ─── Default ───

export const Default: Story = {
  args: {
    defaultValue: { x: 0, y: 0 },
  },
};

// ─── Controlled ───

function ControlledExample() {
  const [point, setPoint] = useState<Point2D>({ x: 0.3, y: -0.5 });

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <CartesianPicker value={point} onChange={setPoint} />
      <div style={{ color: '#ccc', fontFamily: 'monospace', fontSize: 12 }}>
        <div>X: {point.x.toFixed(2)}</div>
        <div>Y: {point.y.toFixed(2)}</div>
      </div>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

// ─── Custom Domain ───

export const CustomDomain: Story = {
  args: {
    domainX: [0, 100],
    domainY: [0, 100],
    defaultValue: { x: 50, y: 50 },
    showOriginAxes: false,
    labelX: 'U',
    labelY: 'V',
  },
};

// ─── With Labels ───

export const WithLabels: Story = {
  args: {
    labelX: 'Pan',
    labelY: 'Tilt',
    defaultValue: { x: 0, y: 0 },
  },
};

// ─── Snap To Grid ───

export const SnapToGrid: Story = {
  args: {
    snapToGrid: true,
    gridSubdivisions: 4,
    defaultValue: { x: 0, y: 0 },
  },
};

// ─── Custom Step ───

export const CustomStep: Story = {
  args: {
    step: [0.25, 0.25],
    defaultValue: { x: 0, y: 0 },
  },
};

// ─── Disabled ───

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: { x: 0.5, y: -0.5 },
  },
};

// ─── Read Only ───

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: { x: 0.5, y: -0.5 },
  },
};

// ─── Responsive ───

export const Responsive: Story = {
  args: {
    responsive: true,
    defaultValue: { x: 0, y: 0 },
  },
  decorators: [
    Story => (
      <div style={{ width: '100%', height: 300 }}>
        <Story />
      </div>
    ),
  ],
};

// ─── With Bottom Bar ───

export const WithBottomBar: Story = {
  args: {
    defaultValue: { x: 0, y: 0 },
    renderBottomBar: info => (
      <div
        style={{
          display: 'flex',
          gap: 8,
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#ccc',
        }}
      >
        <span>X: {info.point.x.toFixed(2)}</span>
        <span>Y: {info.point.y.toFixed(2)}</span>
        {info.isDragging && <span style={{ color: '#007acc' }}>dragging</span>}
      </div>
    ),
  },
};

// ─── With Background ───

export const WithBackground: Story = {
  args: {
    defaultValue: { x: 0, y: 0 },
    renderBackground: (ctx, info) => {
      const { width, height } = info;
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 122, 204, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    },
  },
};

// ─── No Domain Origin ───

export const NoDomainOrigin: Story = {
  args: {
    domainX: [0, 1],
    domainY: [0, 1],
    showOriginAxes: false,
    defaultValue: { x: 0.5, y: 0.5 },
  },
};

// ─── Playground ───

export const Playground: Story = {
  args: {
    domainX: [-1, 1],
    domainY: [-1, 1],
    defaultValue: { x: 0, y: 0 },
    showGrid: true,
    gridSubdivisions: 4,
    showAxisLabels: true,
    showOriginAxes: true,
    showCrosshair: true,
    crosshairStyle: 'dashed',
    snapToGrid: false,
    clampToRange: true,
    precision: 2,
    width: 200,
    height: 200,
    disabled: false,
    readOnly: false,
    markerRadius: 6,
  },
};
