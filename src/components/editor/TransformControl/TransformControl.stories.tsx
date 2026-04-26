import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import { PropertyPanel, PropertySection } from '../PropertyInspector';
import { TransformControl } from './TransformControl';
import type {
  CoordinateSpace,
  TransformControlProps,
  TransformValue,
} from './TransformControl.types';

const initialValue: TransformValue = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

const meta: Meta<TransformControlProps> = {
  title: 'Editor/TransformControl',
  component: TransformControl,
  decorators: [
    Story => (
      <KeyboardContextProvider>
        <div style={{ maxWidth: 360, padding: 12 }}>
          <Story />
        </div>
      </KeyboardContextProvider>
    ),
  ],
  args: {
    size: 'sm',
    showReset: false,
    disabled: false,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    showReset: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<TransformControlProps>;

// --- Stories ---

export const Default: Story = {
  args: {
    defaultValue: initialValue,
  },
};

export const WithReset: Story = {
  args: {
    defaultValue: {
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 15, y: 30, z: 0 },
      scale: { x: 2, y: 2, z: 2 },
    },
    showReset: true,
  },
};

export const LinkedScale: Story = {
  render: args => {
    const Inner = () => {
      const [value, setValue] = useState<TransformValue>({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      });
      return (
        <>
          <TransformControl
            {...args}
            value={value}
            onChange={setValue}
            defaultLinkedScale
          />
          <pre
            style={{
              marginTop: 12,
              fontSize: 11,
              color: 'var(--etui-color-text-secondary)',
            }}
          >
            scale = ({value.scale.x.toFixed(2)}, {value.scale.y.toFixed(2)},{' '}
            {value.scale.z.toFixed(2)})
          </pre>
        </>
      );
    };
    return <Inner />;
  },
};

export const UnlinkedScale: Story = {
  args: {
    defaultValue: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 2, z: 3 },
    },
    defaultLinkedScale: false,
  },
};

export const PositionOnly: Story = {
  args: {
    defaultValue: initialValue,
    show: { rotation: false, scale: false },
  },
};

export const CustomCoordinateSpaces: Story = {
  args: {
    defaultValue: initialValue,
    coordinateSpaceOptions: [
      { value: 'camera', label: 'Camera' },
      { value: 'screen', label: 'Screen' },
      { value: 'tangent', label: 'Tangent' },
    ],
    defaultCoordinateSpace: 'camera',
  },
};

export const CustomLabels: Story = {
  args: {
    defaultValue: initialValue,
    labels: {
      position: 'Translate',
      rotation: 'Rotate',
      scale: 'Scale',
      coordinateSpace: 'Frame',
    },
  },
};

export const CustomPrecision: Story = {
  args: {
    defaultValue: initialValue,
    precision: { position: 4, rotation: 2, scale: 5 },
    step: { position: 0.0001, rotation: 0.01, scale: 0.00001 },
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: initialValue,
    disabled: true,
  },
};

export const InPropertySection: Story = {
  render: args => (
    <PropertyPanel size="sm">
      <PropertySection title="Transform" defaultExpanded>
        <TransformControl {...args} defaultValue={initialValue} />
      </PropertySection>
    </PropertyPanel>
  ),
};

export const EditorExample: Story = {
  render: args => {
    const Inner = () => {
      const [transform, setTransform] = useState<TransformValue>(initialValue);
      const [space, setSpace] = useState<CoordinateSpace>('local');
      return (
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl
              {...args}
              value={transform}
              onChange={setTransform}
              coordinateSpace={space}
              onCoordinateSpaceChange={setSpace}
              showReset
            />
          </PropertySection>
          <PropertySection title="Material" defaultExpanded={false}>
            <div
              style={{
                padding: 8,
                fontSize: 12,
                color: 'var(--etui-color-text-muted)',
              }}
            >
              (placeholder section)
            </div>
          </PropertySection>
          <PropertySection title="Physics" defaultExpanded={false}>
            <div
              style={{
                padding: 8,
                fontSize: 12,
                color: 'var(--etui-color-text-muted)',
              }}
            >
              (placeholder section)
            </div>
          </PropertySection>
        </PropertyPanel>
      );
    };
    return <Inner />;
  },
};
