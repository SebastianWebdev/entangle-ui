import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Select } from '@/components/controls';
import type {
  SelectOptionItem,
  SelectOptionGroup,
} from '@/components/controls';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';
import { GridIcon, StarIcon, EyeIcon } from '@/components/Icons';

const FRAMEWORKS: SelectOptionItem<string>[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
];

const BLEND_GROUPS: SelectOptionGroup<string>[] = [
  {
    label: 'Normal',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'dissolve', label: 'Dissolve' },
    ],
  },
  {
    label: 'Darken',
    options: [
      { value: 'multiply', label: 'Multiply' },
      { value: 'darken', label: 'Darken' },
      { value: 'color-burn', label: 'Color Burn' },
    ],
  },
  {
    label: 'Lighten',
    options: [
      { value: 'screen', label: 'Screen' },
      { value: 'lighten', label: 'Lighten' },
      { value: 'color-dodge', label: 'Color Dodge' },
    ],
  },
];

const BLEND_MODES: SelectOptionItem<string>[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
];

const OBJECT_TYPES: SelectOptionItem<string>[] = [
  { value: 'mesh', label: 'Mesh', icon: <GridIcon /> },
  { value: 'light', label: 'Light', icon: <StarIcon /> },
  { value: 'camera', label: 'Camera', icon: <EyeIcon /> },
];

export default function SelectDemo() {
  const [value, setValue] = useState<string | null>('react');

  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 250 }}>
        <Select
          value={value}
          onChange={setValue}
          label="Framework"
          options={FRAMEWORKS}
        />
      </div>
    </DemoWrapper>
  );
}

export function SelectControlled() {
  const [value, setValue] = useState<string | null>('normal');
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2} style={{ maxWidth: 250 }}>
        <Select
          label="Blend Mode"
          options={BLEND_MODES}
          value={value}
          onChange={setValue}
        />
        <Text size="sm" color="muted">
          Selected: {value ?? 'none'}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function SelectGrouped() {
  const [mode, setMode] = useState<string | null>('multiply');
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 250 }}>
        <Select
          label="Blend Mode"
          options={BLEND_GROUPS}
          value={mode}
          onChange={setMode}
        />
      </div>
    </DemoWrapper>
  );
}

export function SelectSearchable() {
  const [mode, setMode] = useState<string | null>(null);
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 250 }}>
        <Select
          searchable
          searchPlaceholder="Filter blend modes..."
          emptyMessage="No matching modes"
          placeholder="Pick a blend mode"
          options={BLEND_MODES}
          value={mode}
          onChange={setMode}
        />
      </div>
    </DemoWrapper>
  );
}

export function SelectClearable() {
  const [value, setValue] = useState<string | null>('vue');
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 250 }}>
        <Select
          clearable
          label="Framework"
          placeholder="Choose a framework..."
          options={FRAMEWORKS}
          value={value}
          onChange={setValue}
        />
      </div>
    </DemoWrapper>
  );
}

export function SelectWithIcons() {
  const [objectType, setObjectType] = useState<string | null>('mesh');
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 250 }}>
        <Select
          label="Object Type"
          options={OBJECT_TYPES}
          value={objectType}
          onChange={setObjectType}
        />
      </div>
    </DemoWrapper>
  );
}

export function SelectVariants() {
  const [value, setValue] = useState<string | null>('react');
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ maxWidth: 250 }}>
        <Select
          variant="default"
          label="default"
          options={FRAMEWORKS}
          value={value}
          onChange={setValue}
        />
        <Select
          variant="ghost"
          label="ghost"
          options={FRAMEWORKS}
          value={value}
          onChange={setValue}
        />
        <Select
          variant="filled"
          label="filled"
          options={FRAMEWORKS}
          value={value}
          onChange={setValue}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function SelectSizes() {
  const [value, setValue] = useState<string | null>('react');
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ maxWidth: 250 }}>
        <Select
          size="sm"
          label="sm"
          options={FRAMEWORKS}
          value={value}
          onChange={setValue}
        />
        <Select
          size="md"
          label="md"
          options={FRAMEWORKS}
          value={value}
          onChange={setValue}
        />
        <Select
          size="lg"
          label="lg"
          options={FRAMEWORKS}
          value={value}
          onChange={setValue}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function SelectLabels() {
  const [engine, setEngine] = useState<string | null>(null);
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 250 }}>
        <Select
          label="Render Engine"
          helperText="Select the rendering backend"
          required
          placeholder="Choose an engine..."
          options={[
            { value: 'cycles', label: 'Cycles' },
            { value: 'eevee', label: 'EEVEE' },
            { value: 'workbench', label: 'Workbench' },
          ]}
          value={engine}
          onChange={setEngine}
        />
      </div>
    </DemoWrapper>
  );
}

export function SelectError() {
  const [material, setMaterial] = useState<string | null>(null);
  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 250 }}>
        <Select
          label="Material"
          error
          errorMessage="A material is required"
          placeholder="Choose a material..."
          options={[
            { value: 'metal', label: 'Metal' },
            { value: 'glass', label: 'Glass' },
            { value: 'plastic', label: 'Plastic' },
          ]}
          value={material}
          onChange={setMaterial}
        />
      </div>
    </DemoWrapper>
  );
}
