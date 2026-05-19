import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { MultiSelect } from '@/components/controls';
import type { MultiSelectOption } from '@/components/controls';
import { Stack } from '@/components/layout';

const FRAMEWORKS: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'qwik', label: 'Qwik' },
];

const FRUITS = [
  {
    label: 'Citrus',
    options: [
      { value: 'lemon', label: 'Lemon' },
      { value: 'lime', label: 'Lime' },
      { value: 'orange', label: 'Orange' },
    ],
  },
  {
    label: 'Berries',
    options: [
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'blueberry', label: 'Blueberry' },
      { value: 'raspberry', label: 'Raspberry' },
    ],
  },
];

export default function MultiSelectDemo() {
  const [value, setValue] = useState<string[]>(['react', 'svelte']);
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          label="Frameworks"
          placeholder="Pick frameworks"
          options={FRAMEWORKS}
          value={value}
          onChange={setValue}
          clearable
        />
      </div>
    </DemoWrapper>
  );
}

export function MultiSelectBasic() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          label="Frameworks"
          placeholder="Pick frameworks"
          options={FRAMEWORKS}
        />
      </div>
    </DemoWrapper>
  );
}

export function MultiSelectSizes() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          size="sm"
          label="sm"
          options={FRAMEWORKS}
          defaultValue={['react']}
        />
        <MultiSelect
          size="md"
          label="md"
          options={FRAMEWORKS}
          defaultValue={['react', 'vue']}
        />
        <MultiSelect
          size="lg"
          label="lg"
          options={FRAMEWORKS}
          defaultValue={['react', 'vue', 'svelte']}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function MultiSelectVariants() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          variant="default"
          label="default"
          options={FRAMEWORKS}
          defaultValue={['react']}
        />
        <MultiSelect
          variant="ghost"
          label="ghost"
          options={FRAMEWORKS}
          defaultValue={['vue']}
        />
        <MultiSelect
          variant="filled"
          label="filled"
          options={FRAMEWORKS}
          defaultValue={['svelte']}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function MultiSelectSearchable() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          label="Frameworks"
          options={FRAMEWORKS}
          searchable
          searchPlaceholder="Filter..."
          clearable
        />
      </div>
    </DemoWrapper>
  );
}

export function MultiSelectGrouped() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          label="Fruits"
          options={FRUITS}
          searchable
          placeholder="Pick fruits"
        />
      </div>
    </DemoWrapper>
  );
}

export function MultiSelectMax() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          label="Pick up to 2"
          options={FRAMEWORKS}
          max={2}
          helperText="Maximum 2 frameworks"
        />
      </div>
    </DemoWrapper>
  );
}

export function MultiSelectManyChips() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          label="Lots of selections"
          options={FRAMEWORKS}
          defaultValue={['react', 'vue', 'svelte', 'angular']}
          maxInlineChips={2}
        />
      </div>
    </DemoWrapper>
  );
}

export function MultiSelectError() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <MultiSelect
          label="Frameworks"
          options={FRAMEWORKS}
          error
          errorMessage="Pick at least one framework"
          required
        />
      </div>
    </DemoWrapper>
  );
}
