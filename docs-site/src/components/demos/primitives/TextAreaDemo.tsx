import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { TextArea } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function TextAreaDemo() {
  const [value, setValue] = useState('');
  const [autoValue, setAutoValue] = useState(
    'Type to see auto-resize between 2 and 6 rows...'
  );
  return (
    <DemoWrapper>
      <Stack gap={4} style={{ width: '100%', maxWidth: 360 }}>
        <TextArea
          label="Description"
          placeholder="Brief description"
          helperText="Markdown is supported"
          value={value}
          onChange={setValue}
          rows={3}
        />
        <TextArea
          label="Notes (auto-resize)"
          value={autoValue}
          onChange={setAutoValue}
          minRows={2}
          maxRows={6}
        />
        <TextArea
          label="Bio"
          maxLength={140}
          showCount
          defaultValue="Hello world!"
        />
        <TextArea
          label="Snippet"
          monospace
          rows={4}
          defaultValue={'const x = 1;\nconst y = 2;'}
        />
        <TextArea
          label="Required"
          required
          error
          errorMessage="This field is required"
        />
      </Stack>
    </DemoWrapper>
  );
}
