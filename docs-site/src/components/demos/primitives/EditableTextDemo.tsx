import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { EditableText, Text } from '@/components/primitives';
import { Stack, Flex } from '@/components/layout';

export default function EditableTextDemo() {
  const [name, setName] = useState('Untitled Layer');
  return (
    <DemoWrapper>
      <Stack spacing={4} style={{ width: '100%', maxWidth: 360 }}>
        <div>
          <Text variant="caption" color="muted">
            Click the text to rename it
          </Text>
          <EditableText value={name} onChange={setName} variant="heading" />
        </div>
        <EditableText defaultValue="" placeholder="Click to name this node…" />
        <EditableText
          defaultValue="const gravity = 9.81"
          mono
          onChange={() => {}}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function EditableTextControlled() {
  const [value, setValue] = useState('Camera_01');
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: '100%', maxWidth: 360 }}>
        <EditableText value={value} onChange={setValue} />
        <div style={{ fontSize: 12, color: 'var(--etui-color-text-muted)' }}>
          Committed value: <code>{value}</code>
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function EditableTextActivation() {
  return (
    <DemoWrapper>
      <Stack spacing={4} style={{ width: '100%', maxWidth: 360 }}>
        <div>
          <Text variant="caption" color="muted">
            Single click (default)
          </Text>
          <EditableText defaultValue="Click me once" />
        </div>
        <div>
          <Text variant="caption" color="muted">
            Double click (rename convention)
          </Text>
          <EditableText
            defaultValue="Double-click me"
            activationMode="double"
          />
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function EditableTextTypography() {
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: '100%', maxWidth: 360 }}>
        <EditableText variant="display" defaultValue="Display heading" />
        <EditableText variant="heading" defaultValue="Section heading" />
        <EditableText variant="body" defaultValue="Body text" />
        <EditableText
          variant="caption"
          color="muted"
          defaultValue="Caption text"
        />
        <EditableText variant="code" defaultValue="inline_code()" />
      </Stack>
    </DemoWrapper>
  );
}

interface Row {
  label: string;
  value: string;
}

export function EditableTextInPropertyRows() {
  const [rows, setRows] = useState<Row[]>([
    { label: 'Object name', value: 'Cube.001' },
    { label: 'Material', value: 'Metal_Brushed' },
    { label: 'Collection', value: 'Scene' },
  ]);

  const update = (index: number, value: string) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, value } : r)));
  };

  return (
    <DemoWrapper>
      <Stack spacing={2} style={{ width: '100%', maxWidth: 360 }}>
        {rows.map((row, index) => (
          <Flex key={row.label} justify="space-between" align="center" gap={3}>
            <Text variant="caption" color="secondary">
              {row.label}
            </Text>
            <EditableText
              value={row.value}
              onChange={value => update(index, value)}
              variant="body"
              mono
              activationMode="double"
            />
          </Flex>
        ))}
        <Text variant="caption" color="muted">
          Double-click any value to edit it in place.
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function EditableTextDisabled() {
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: '100%', maxWidth: 360 }}>
        <EditableText defaultValue="Read-only value" readOnly />
        <EditableText defaultValue="Disabled value" disabled />
      </Stack>
    </DemoWrapper>
  );
}

const PL_LABELS = { editLabel: 'Edytuj tekst' };

export function EditableTextI18n() {
  const [value, setValue] = useState('Nazwa warstwy');
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: '100%', maxWidth: 360 }}>
        <EditableText
          value={value}
          onChange={setValue}
          labels={PL_LABELS}
          placeholder="Kliknij, aby nazwać…"
          aria-label="Zmień nazwę warstwy"
        />
        <Text variant="caption" color="muted">
          The edit field is announced as “Edytuj tekst”; the explicit
          <code> aria-label</code> overrides it here.
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
