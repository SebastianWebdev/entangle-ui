import DemoWrapper from '../DemoWrapper';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/primitives';
import { Stack } from '@/components/layout';

const FolderGlyph = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

const CogGlyph = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export default function PageHeaderDemo() {
  return (
    <DemoWrapper padding="0">
      <Stack gap={0}>
        <PageHeader
          icon={<FolderGlyph />}
          title="Project Assets"
          subtitle="124 items"
          breadcrumbs={<span>Workspace / Project / Assets</span>}
          actions={
            <>
              <Button>Import</Button>
              <Button variant="filled">Upload</Button>
            </>
          }
        />
        <PageHeader size="sm" title="Compact header" bordered={false} />
        <PageHeader size="lg" title="Large header" />
      </Stack>
    </DemoWrapper>
  );
}

export function PageHeaderBasic() {
  return (
    <DemoWrapper padding="0">
      <PageHeader title="Project Assets" />
    </DemoWrapper>
  );
}

export function PageHeaderWithActions() {
  return (
    <DemoWrapper padding="0">
      <PageHeader
        icon={<FolderGlyph />}
        title="Project Assets"
        subtitle="124 items"
        actions={
          <>
            <Button>Import</Button>
            <Button variant="filled">Upload</Button>
          </>
        }
      />
    </DemoWrapper>
  );
}

export function PageHeaderWithBreadcrumbs() {
  return (
    <DemoWrapper padding="0">
      <PageHeader
        icon={<FolderGlyph />}
        breadcrumbs={
          <span
            style={{
              color: 'var(--etui-color-text-muted)',
              fontSize: 'var(--etui-font-size-xs)',
            }}
          >
            Workspace / Project / Assets
          </span>
        }
        title="Textures"
        subtitle="Baked PBR materials"
        actions={<Button variant="filled">New</Button>}
      />
    </DemoWrapper>
  );
}

export function PageHeaderSizes() {
  return (
    <DemoWrapper padding="0">
      <Stack gap={0}>
        <PageHeader size="sm" title="Small" subtitle="12px title" />
        <PageHeader size="md" title="Medium" subtitle="14px title (default)" />
        <PageHeader size="lg" title="Large" subtitle="16px title" />
      </Stack>
    </DemoWrapper>
  );
}

export function PageHeaderBorderless() {
  return (
    <DemoWrapper padding="0">
      <div
        style={{
          background: 'var(--etui-color-background-secondary)',
          padding: 16,
        }}
      >
        <div
          style={{
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <PageHeader
            icon={<CogGlyph />}
            title="Settings"
            subtitle="Panel header inside a bordered container"
            bordered={false}
            actions={<Button>Save</Button>}
          />
          <div
            style={{
              padding: '12px 16px',
              color: 'var(--etui-color-text-secondary)',
              fontSize: 12,
            }}
          >
            (panel body content goes here)
          </div>
        </div>
      </div>
    </DemoWrapper>
  );
}
