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
