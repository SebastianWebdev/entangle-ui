import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Combobox } from '@/components/controls';
import type { ComboboxOption } from '@/components/controls';
import { Stack } from '@/components/layout';

const COUNTRIES: ComboboxOption[] = [
  { value: 'us', label: 'United States', description: 'USA' },
  { value: 'gb', label: 'United Kingdom', description: 'GBR' },
  { value: 'fr', label: 'France', description: 'FRA' },
  { value: 'de', label: 'Germany', description: 'DEU' },
  { value: 'jp', label: 'Japan', description: 'JPN' },
  { value: 'br', label: 'Brazil', description: 'BRA' },
  { value: 'au', label: 'Australia', description: 'AUS' },
  { value: 'ca', label: 'Canada', description: 'CAN' },
  { value: 'mx', label: 'Mexico', description: 'MEX' },
];

export default function ComboboxDemo() {
  const [value, setValue] = useState<string | null>('fr');
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          label="Country"
          placeholder="Search countries..."
          options={COUNTRIES}
          value={value}
          onChange={setValue}
          clearable
        />
      </div>
    </DemoWrapper>
  );
}

export function ComboboxBasic() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          label="Country"
          placeholder="Search countries..."
          options={COUNTRIES}
          defaultValue="us"
        />
      </div>
    </DemoWrapper>
  );
}

export function ComboboxSizes() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          size="sm"
          label="sm"
          options={COUNTRIES}
          placeholder="Small"
        />
        <Combobox
          size="md"
          label="md"
          options={COUNTRIES}
          placeholder="Medium"
        />
        <Combobox
          size="lg"
          label="lg"
          options={COUNTRIES}
          placeholder="Large"
        />
      </Stack>
    </DemoWrapper>
  );
}

export function ComboboxVariants() {
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={3} style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          variant="default"
          label="default"
          options={COUNTRIES}
          placeholder="Default"
        />
        <Combobox
          variant="ghost"
          label="ghost"
          options={COUNTRIES}
          placeholder="Ghost"
        />
        <Combobox
          variant="filled"
          label="filled"
          options={COUNTRIES}
          placeholder="Filled"
        />
      </Stack>
    </DemoWrapper>
  );
}

export function ComboboxFreeSolo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          label="Tag"
          options={COUNTRIES}
          value={value}
          onChange={setValue}
          freeSolo
          helperText="Type any value or pick from the list"
        />
      </div>
    </DemoWrapper>
  );
}

export function ComboboxCreatable() {
  const [value, setValue] = useState<string | null>(null);
  const [extras, setExtras] = useState<ComboboxOption[]>([]);
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          label="Country (creatable)"
          options={[...COUNTRIES, ...extras]}
          value={value}
          onChange={setValue}
          creatable
          onCreate={input => {
            const created: ComboboxOption = { value: input, label: input };
            setExtras(prev => [...prev, created]);
            setValue(input);
          }}
          helperText="Type a new value and press Enter to add"
        />
      </div>
    </DemoWrapper>
  );
}

export function ComboboxLoading() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          label="Country"
          options={[]}
          loading
          openOnFocus
          placeholder="Click to load..."
        />
      </div>
    </DemoWrapper>
  );
}

export function ComboboxOpenOnFocus() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          label="Country"
          options={COUNTRIES}
          openOnFocus
          placeholder="Click to browse"
        />
      </div>
    </DemoWrapper>
  );
}

export function ComboboxError() {
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Combobox
          label="Country"
          options={COUNTRIES}
          error
          errorMessage="Pick a country to continue"
          required
        />
      </div>
    </DemoWrapper>
  );
}
