import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Alert } from '@/components/feedback';
import { Button } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function AlertDemo() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 480 }}>
        <Alert variant="info" title="Heads up">
          A new render has been queued. You can keep editing while it runs.
        </Alert>
        <Alert variant="success" title="Saved">
          All overrides have been written to disk.
        </Alert>
        <Alert variant="warning" title="Read-only mode">
          Switch to edit mode to make changes.
        </Alert>
        <Alert variant="error" title="Connection lost">
          We can&apos;t reach the render farm. Retry once you&apos;re back
          online.
        </Alert>
        <Alert variant="neutral" title="Note">
          Drag a node from the library to start a new graph.
        </Alert>
      </Stack>
    </DemoWrapper>
  );
}

export function AlertVariants() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 480 }}>
        <Alert variant="info">Informational alert.</Alert>
        <Alert variant="success">Success alert.</Alert>
        <Alert variant="warning">Warning alert.</Alert>
        <Alert variant="error">Error alert.</Alert>
        <Alert variant="neutral">Neutral alert.</Alert>
      </Stack>
    </DemoWrapper>
  );
}

export function AlertAppearances() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 480 }}>
        <Alert variant="info" appearance="subtle" title="Subtle">
          Tinted background, faint border. Recommended default.
        </Alert>
        <Alert variant="info" appearance="solid" title="Solid">
          Filled accent background. Use sparingly — high attention.
        </Alert>
        <Alert variant="info" appearance="outline" title="Outline">
          Bordered, transparent background. Quietest treatment.
        </Alert>
      </Stack>
    </DemoWrapper>
  );
}

export function AlertWithoutIcon() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Alert variant="warning" icon={false} title="Read-only">
          Switch to edit mode to make changes.
        </Alert>
      </div>
    </DemoWrapper>
  );
}

export function AlertDismissible() {
  const [open, setOpen] = useState(true);
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {open ? (
          <Alert
            variant="success"
            title="Export complete"
            onClose={() => setOpen(false)}
          >
            The scene was exported successfully.
          </Alert>
        ) : (
          <Button onClick={() => setOpen(true)}>Restore alert</Button>
        )}
      </div>
    </DemoWrapper>
  );
}

export function AlertCompact() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Alert variant="info">Auto-save is on.</Alert>
      </div>
    </DemoWrapper>
  );
}

export function AlertWithActions() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Alert variant="error" title="Couldn't reach the server">
          <Alert.Description>
            The request timed out after 30 seconds.
          </Alert.Description>
          <Alert.Actions align="right">
            <Button variant="filled">Retry</Button>
            <Button>Dismiss</Button>
          </Alert.Actions>
        </Alert>
      </div>
    </DemoWrapper>
  );
}

export function AlertLongContent() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <Alert variant="warning" title="Pending migration">
          <Alert.Description>
            The shader graph format changed in version 0.9. Existing graphs will
            continue to load, but new features require the new schema.
          </Alert.Description>
          <Alert.Description style={{ marginTop: 8 }}>
            Run{' '}
            <code style={{ fontSize: 11 }}>npx entangle-ui migrate-graphs</code>{' '}
            from the project root to upgrade in place. Original files are
            written to <code style={{ fontSize: 11 }}>.entangle-backup/</code>{' '}
            first.
          </Alert.Description>
        </Alert>
      </div>
    </DemoWrapper>
  );
}

export function AlertReadOnlyFile() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
        <Alert variant="warning" title="Read-only file">
          <Alert.Description>
            <code style={{ fontSize: 11 }}>materials/asphalt.json</code> is
            checked out by another user.
          </Alert.Description>
        </Alert>
        <div
          style={{
            padding: 12,
            border:
              '1px solid color-mix(in srgb, var(--etui-color-border-default) 60%, transparent)',
            borderRadius: 6,
            background: 'var(--etui-color-bg-elevated)',
            fontSize: 12,
            color: 'var(--etui-color-text-muted)',
          }}
        >
          Inspector is read-only.
        </div>
      </Stack>
    </DemoWrapper>
  );
}
