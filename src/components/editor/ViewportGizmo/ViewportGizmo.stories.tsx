import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ViewportGizmo } from './ViewportGizmo';
import type { GizmoOrientation, OrbitDelta } from './ViewportGizmo.types';

const meta: Meta<typeof ViewportGizmo> = {
  title: 'Editor/ViewportGizmo',
  component: ViewportGizmo,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: false },
    onOrbit: { action: 'onOrbit' },
    onOrbitEnd: { action: 'onOrbitEnd' },
    onSnapToView: { action: 'onSnapToView' },
    onAxisClick: { action: 'onAxisClick' },
    onOriginClick: { action: 'onOriginClick' },
  },
};

export default meta;
type Story = StoryObj<typeof ViewportGizmo>;

// ─── Interactive Wrapper ───

function InteractiveGizmo(
  props: Omit<React.ComponentProps<typeof ViewportGizmo>, 'orientation' | 'onOrbit' | 'onOrbitEnd'>
) {
  const [orientation, setOrientation] = useState<GizmoOrientation>({
    yaw: 30,
    pitch: -20,
  });

  const handleOrbit = useCallback((delta: OrbitDelta) => {
    setOrientation((prev) => ({
      yaw: prev.yaw + delta.deltaYaw,
      pitch: Math.max(-90, Math.min(90, prev.pitch + delta.deltaPitch)),
    }));
  }, []);

  const handleSnapToView = useCallback((view: string) => {
    const views: Record<string, GizmoOrientation> = {
      front:  { yaw: 0,    pitch: 0 },
      back:   { yaw: 180,  pitch: 0 },
      right:  { yaw: 90,   pitch: 0 },
      left:   { yaw: -90,  pitch: 0 },
      top:    { yaw: 0,    pitch: 90 },
      bottom: { yaw: 0,    pitch: -90 },
    };
    const target = views[view];
    if (target) setOrientation(target);
  }, []);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <ViewportGizmo
        orientation={orientation}
        onOrbit={handleOrbit}
        onSnapToView={handleSnapToView}
        {...props}
      />
      <div style={{ color: '#ccc', fontFamily: 'monospace', fontSize: 12 }}>
        <div>Yaw: {orientation.yaw.toFixed(1)}</div>
        <div>Pitch: {orientation.pitch.toFixed(1)}</div>
      </div>
    </div>
  );
}

// ─── Default ───

export const Default: Story = {
  render: () => <InteractiveGizmo />,
};

// ─── All Sizes ───

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <InteractiveGizmo size="sm" diameter={80} />
      <InteractiveGizmo size="md" diameter={120} />
      <InteractiveGizmo size="lg" diameter={160} />
    </div>
  ),
};

// ─── Display Only ───

export const DisplayOnly: Story = {
  args: {
    orientation: { yaw: 45, pitch: -30 },
    interactionMode: 'display-only',
  },
};

// ─── Snap Only ───

export const SnapOnly: Story = {
  render: () => <InteractiveGizmo interactionMode="snap-only" />,
};

// ─── Z-Up ───

export const ZUp: Story = {
  render: () => <InteractiveGizmo upAxis="z-up" />,
};

// ─── Transparent Background ───

export const TransparentBackground: Story = {
  render: () => <InteractiveGizmo background="transparent" />,
  decorators: [
    (Story) => (
      <div style={{ background: '#1a1a2e', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

// ─── Solid Background ───

export const SolidBackground: Story = {
  render: () => <InteractiveGizmo background="solid" />,
};

// ─── Custom Axis Colors ───

export const CustomAxisColors: Story = {
  render: () => (
    <InteractiveGizmo
      axisColorPreset="custom"
      axisConfig={[
        { label: 'R', color: '#FF6B6B' },
        { label: 'G', color: '#51CF66' },
        { label: 'B', color: '#339AF0' },
      ]}
    />
  ),
};

// ─── No Negative Axes ───

export const NoNegativeAxes: Story = {
  render: () => <InteractiveGizmo showNegativeAxes={false} />,
};

// ─── No Orbit Ring ───

export const NoOrbitRing: Story = {
  render: () => <InteractiveGizmo showOrbitRing={false} />,
};

// ─── Disabled ───

export const Disabled: Story = {
  args: {
    orientation: { yaw: 30, pitch: -20 },
    disabled: true,
  },
};

// ─── Playground ───

export const Playground: Story = {
  args: {
    orientation: { yaw: 30, pitch: -20 },
    diameter: 120,
    size: 'md',
    upAxis: 'y-up',
    axisColorPreset: 'blender',
    showLabels: true,
    showNegativeAxes: true,
    showOrbitRing: true,
    showOriginHandle: true,
    background: 'subtle',
    interactionMode: 'full',
    orbitSpeed: 1,
    constrainPitch: true,
    disabled: false,
  },
};
