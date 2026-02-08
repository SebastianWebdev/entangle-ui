import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from './ColorPicker';
import { EyeDropper } from './EyeDropper';
import { ColorPalette } from './ColorPalette';
import { MATERIAL_PALETTE } from './palettes/material';
import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';
import type { ColorPreset } from './ColorPicker.types';

const meta: Meta<typeof ColorPicker> = {
  title: 'Controls/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

const MATERIAL_PRESETS: ColorPreset[] = [
  { color: '#f44336', label: 'Red' },
  { color: '#e91e63', label: 'Pink' },
  { color: '#9c27b0', label: 'Purple' },
  { color: '#673ab7', label: 'Deep Purple' },
  { color: '#3f51b5', label: 'Indigo' },
  { color: '#2196f3', label: 'Blue' },
  { color: '#03a9f4', label: 'Light Blue' },
  { color: '#00bcd4', label: 'Cyan' },
  { color: '#009688', label: 'Teal' },
  { color: '#4caf50', label: 'Green' },
  { color: '#8bc34a', label: 'Light Green' },
  { color: '#cddc39', label: 'Lime' },
  { color: '#ffeb3b', label: 'Yellow' },
  { color: '#ffc107', label: 'Amber' },
  { color: '#ff9800', label: 'Orange' },
  { color: '#ff5722', label: 'Deep Orange' },
];

export const Default: Story = {
  render: () => <ColorPicker defaultValue="#2196f3" label="Color" />,
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={3}>
      <ColorPicker size="sm" defaultValue="#f44336" label="Small" />
      <ColorPicker size="md" defaultValue="#4caf50" label="Medium" />
      <ColorPicker size="lg" defaultValue="#2196f3" label="Large" />
    </Stack>
  ),
};

export const WithAlpha: Story = {
  render: () => (
    <ColorPicker
      defaultValue="#2196f3"
      showAlpha
      format="rgba"
      label="With Alpha"
    />
  ),
};

export const WithPresets: Story = {
  render: () => (
    <ColorPicker
      defaultValue="#2196f3"
      presets={MATERIAL_PRESETS}
      label="Material Colors"
    />
  ),
};

export const Inline: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#9c27b0" inline presets={MATERIAL_PRESETS} />
    </div>
  ),
};

export const CircleSwatch: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <ColorPicker swatchShape="circle" defaultValue="#f44336" label="Circle" />
      <ColorPicker swatchShape="square" defaultValue="#2196f3" label="Square" />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [color, setColor] = useState('#2196f3');

    return (
      <Stack spacing={3}>
        <Text size="xs" color="muted">
          Current: {color}
        </Text>
        <ColorPicker value={color} onChange={setColor} label="Controlled" />
      </Stack>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <ColorPicker defaultValue="#808080" disabled label="Disabled" />
  ),
};

export const MaterialColorRow: Story = {
  name: 'Editor Example — Material Color',
  render: () => (
    <div
      style={{
        background: '#1a1a2e',
        padding: 12,
        borderRadius: 4,
        width: 260,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justify="space-between" align="center">
          <Text size="xs" color="muted">
            Albedo
          </Text>
          <ColorPicker
            size="sm"
            defaultValue="#c0392b"
            presets={MATERIAL_PRESETS}
          />
        </Stack>
        <Stack direction="row" justify="space-between" align="center">
          <Text size="xs" color="muted">
            Emission
          </Text>
          <ColorPicker size="sm" defaultValue="#000000" />
        </Stack>
        <Stack direction="row" justify="space-between" align="center">
          <Text size="xs" color="muted">
            Ambient
          </Text>
          <ColorPicker size="sm" defaultValue="#1a237e" showAlpha />
        </Stack>
      </Stack>
    </div>
  ),
};

export const WithEyeDropper: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#2196f3" showEyeDropper inline />
    </div>
  ),
};

export const MaterialPalette: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#f44336" palette="material" inline />
    </div>
  ),
};

export const TailwindPalette: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#3b82f6" palette="tailwind" inline />
    </div>
  ),
};

export const PaletteWithPresets: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker
        defaultValue="#2196f3"
        palette="material"
        presets={MATERIAL_PRESETS}
        inline
      />
    </div>
  ),
};

export const EyeDropperStandalone: Story = {
  render: () => (
    <Stack direction="row" spacing={3} align="center">
      <Stack spacing={1} align="center">
        <Text size="xs" color="muted">
          Small
        </Text>
        <EyeDropper size="sm" onColorPick={() => {}} />
      </Stack>
      <Stack spacing={1} align="center">
        <Text size="xs" color="muted">
          Medium
        </Text>
        <EyeDropper size="md" onColorPick={() => {}} />
      </Stack>
      <Stack spacing={1} align="center">
        <Text size="xs" color="muted">
          Large
        </Text>
        <EyeDropper size="lg" onColorPick={() => {}} />
      </Stack>
    </Stack>
  ),
};

export const ColorPaletteStandalone: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <ColorPalette
        palette={MATERIAL_PALETTE.colors}
        currentColor="#2196f3"
        onSelect={() => {}}
        title="Material Design"
        defaultExpanded
      />
    </div>
  ),
};

export const PastelPalette: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#f8b4c8" palette="pastel" inline />
    </div>
  ),
};

export const EarthTonesPalette: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#c0845c" palette="earth" inline />
    </div>
  ),
};

export const NeonPalette: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#00ccff" palette="neon" inline />
    </div>
  ),
};

export const MonochromePalette: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#808080" palette="monochrome" inline />
    </div>
  ),
};

export const SkinTonesPalette: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#d4a87c" palette="skin-tones" inline />
    </div>
  ),
};

export const VintagePalette: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ColorPicker defaultValue="#c0807a" palette="vintage" inline />
    </div>
  ),
};
