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

export function TextAreaControlled() {
  const [value, setValue] = useState('Typing updates the counter below.');
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
        <TextArea
          label="Controlled"
          value={value}
          onChange={setValue}
          rows={3}
        />
        <div
          style={{
            fontSize: 12,
            color: 'var(--etui-color-text-muted)',
          }}
        >
          Length: {value.length} characters
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function TextAreaSizes() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
        <TextArea size="sm" label="sm" placeholder="min-height 48px" />
        <TextArea
          size="md"
          label="md (default)"
          placeholder="min-height 64px"
        />
        <TextArea size="lg" label="lg" placeholder="min-height 88px" />
      </Stack>
    </DemoWrapper>
  );
}

export function TextAreaAutoResize() {
  const [value, setValue] = useState(
    'Start typing.\n\nPress Enter a few times.\n\nThe textarea grows up to 6 rows,\nthen scrolls.'
  );
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TextArea
          label="Auto-resize (minRows 2, maxRows 6)"
          value={value}
          onChange={setValue}
          minRows={2}
          maxRows={6}
        />
      </div>
    </DemoWrapper>
  );
}

export function TextAreaWithCharCount() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TextArea
          label="Bio"
          helperText="Keep it short."
          maxLength={140}
          showCount
          defaultValue="Builder of editor UIs."
          rows={3}
        />
      </div>
    </DemoWrapper>
  );
}

export function TextAreaMonospace() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <TextArea
          label="Snippet"
          monospace
          rows={5}
          defaultValue={
            "const greet = (name: string) => {\n  return `Hello, ${name}!`;\n};\n\nconsole.log(greet('world'));"
          }
        />
      </div>
    </DemoWrapper>
  );
}

export function TextAreaError() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TextArea
          label="Description"
          required
          error
          errorMessage="This field is required"
          defaultValue=""
          rows={3}
        />
      </div>
    </DemoWrapper>
  );
}

export function TextAreaDisabled() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
        <TextArea
          label="Disabled"
          disabled
          defaultValue="Cannot edit this field."
          rows={2}
        />
        <TextArea
          label="Read-only"
          readOnly
          defaultValue="Select me, but don't type."
          rows={2}
        />
      </Stack>
    </DemoWrapper>
  );
}
