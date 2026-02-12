import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Input } from '@/components/primitives';
import { Stack } from '@/components/layout';
import { SearchIcon } from '@/components/Icons/SearchIcon';

export default function InputDemo() {
  const [value, setValue] = useState('Hello world');
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ maxWidth: 300 }}>
        <Input
          placeholder="Default input"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <Input label="Username" helperText="Enter your display name" />
        <Input
          error
          errorMessage="This field is required"
          placeholder="Required field"
        />
        <Input startIcon={<SearchIcon />} placeholder="Search..." />
        <Input placeholder="Disabled" disabled />
        <Input placeholder="With size sm" size="sm" />
        <Input placeholder="With size lg" size="lg" />
      </Stack>
    </DemoWrapper>
  );
}
