import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Select } from '@/components/controls';

export default function SelectDemo() {
  const [value, setValue] = useState<string | null>('react');

  return (
    <DemoWrapper withKeyboard>
      <div style={{ maxWidth: 250 }}>
        <Select
          value={value}
          onChange={setValue}
          label="Framework"
          options={[
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue' },
            { value: 'angular', label: 'Angular' },
            { value: 'svelte', label: 'Svelte' },
            { value: 'solid', label: 'SolidJS' },
          ]}
        />
      </div>
    </DemoWrapper>
  );
}
