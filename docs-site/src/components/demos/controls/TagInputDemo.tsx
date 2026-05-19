import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { TagInput } from '@/components/controls';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

export default function TagInputDemo() {
  const [tags, setTags] = useState<string[]>(['react', 'typescript']);
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TagInput
          label="Keywords"
          placeholder="Add a keyword and press Enter"
          value={tags}
          onChange={setTags}
        />
      </div>
    </DemoWrapper>
  );
}

export function TagInputBasic() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TagInput
          label="Keywords"
          placeholder="Add a keyword and press Enter"
        />
      </div>
    </DemoWrapper>
  );
}

export function TagInputSizes() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
        <TagInput size="sm" label="sm" defaultValue={['small', 'compact']} />
        <TagInput size="md" label="md" defaultValue={['medium', 'standard']} />
        <TagInput size="lg" label="lg" defaultValue={['large', 'prominent']} />
      </Stack>
    </DemoWrapper>
  );
}

export function TagInputVariants() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
        <TagInput
          variant="default"
          label="default"
          defaultValue={['react', 'vue']}
        />
        <TagInput
          variant="ghost"
          label="ghost"
          defaultValue={['react', 'vue']}
        />
        <TagInput
          variant="filled"
          label="filled"
          defaultValue={['react', 'vue']}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function TagInputSeparators() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
        <TagInput
          label="Enter or Comma (default)"
          placeholder="Press Enter or type a comma"
        />
        <TagInput
          label="Enter, Comma, Space"
          placeholder="Spaces commit too"
          separators={['Enter', 'Comma', 'Space']}
        />
        <TagInput
          label="Tab to commit"
          placeholder="Press Tab"
          separators={['Enter', 'Tab']}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function TagInputAddOnBlur() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TagInput
          label="Auto-commit on blur"
          addOnBlur
          helperText="Type something, then click outside"
        />
      </div>
    </DemoWrapper>
  );
}

export function TagInputMax() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TagInput
          label="Up to 3 tags"
          max={3}
          defaultValue={['one', 'two']}
          helperText="Maximum 3 tags"
        />
      </div>
    </DemoWrapper>
  );
}

export function TagInputValidation() {
  const [error, setError] = useState<string | undefined>();
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TagInput
          label="Slug parts"
          placeholder="lowercase only"
          error={error !== undefined}
          errorMessage={error}
          validate={value =>
            /^[a-z0-9-]+$/.test(value) || 'lowercase, digits, hyphens'
          }
          onValidate={(_, reason) => {
            setError(typeof reason === 'string' ? reason : 'invalid');
            window.setTimeout(() => {
              setError(undefined);
            }, 1500);
          }}
        />
        <Text size="xs" color="muted" style={{ marginTop: 6 }}>
          Try typing an uppercase letter to see validation kick in.
        </Text>
      </div>
    </DemoWrapper>
  );
}

export function TagInputReadOnly() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <TagInput
          label="Read only"
          readOnly
          defaultValue={['locked', 'frozen', 'immutable']}
        />
      </div>
    </DemoWrapper>
  );
}
