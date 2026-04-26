import type React from 'react';
import DemoWrapper from '../DemoWrapper';
import { PageHeader, Stack } from '@/components/layout';
import { Button } from '@/components/primitives';
import { BreadcrumbItem, Breadcrumbs } from '@/components/navigation';
import {
  ArrowRightIcon,
  CodeIcon,
  FolderIcon,
  HomeIcon,
} from '@/components/Icons';

const Caption = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
    {children}
  </span>
);

export default function BreadcrumbsDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/components">Components</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
        </Breadcrumbs>
        <Breadcrumbs maxItems={4}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/workspace">Workspace</BreadcrumbItem>
          <BreadcrumbItem href="/workspace/project">Project</BreadcrumbItem>
          <BreadcrumbItem href="/workspace/project/src">src</BreadcrumbItem>
          <BreadcrumbItem href="/workspace/project/src/components">
            components
          </BreadcrumbItem>
          <BreadcrumbItem isCurrent>Breadcrumbs.tsx</BreadcrumbItem>
        </Breadcrumbs>
      </Stack>
    </DemoWrapper>
  );
}

export function BreadcrumbsBasic() {
  return (
    <DemoWrapper>
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/components">Components</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
      </Breadcrumbs>
    </DemoWrapper>
  );
}

export function BreadcrumbsWithIcons() {
  return (
    <DemoWrapper>
      <Breadcrumbs>
        <BreadcrumbItem href="/" icon={<HomeIcon size="sm" decorative />}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem
          href="/projects"
          icon={<FolderIcon size="sm" decorative />}
        >
          Projects
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent icon={<CodeIcon size="sm" decorative />}>
          Button.tsx
        </BreadcrumbItem>
      </Breadcrumbs>
    </DemoWrapper>
  );
}

export function BreadcrumbsCustomSeparator() {
  return (
    <DemoWrapper>
      <Breadcrumbs separator="/">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/components">Components</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
      </Breadcrumbs>
    </DemoWrapper>
  );
}

export function BreadcrumbsCustomSeparatorIcon() {
  return (
    <DemoWrapper>
      <Breadcrumbs separator={<ArrowRightIcon size="sm" decorative />}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/components">Components</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
      </Breadcrumbs>
    </DemoWrapper>
  );
}

export function BreadcrumbsSizes() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Breadcrumbs size="sm">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/components">Components</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Small</BreadcrumbItem>
          </Breadcrumbs>
          <Caption>sm</Caption>
        </Stack>
        <Stack spacing={1}>
          <Breadcrumbs size="md">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/components">Components</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Medium</BreadcrumbItem>
          </Breadcrumbs>
          <Caption>md</Caption>
        </Stack>
        <Stack spacing={1}>
          <Breadcrumbs size="lg">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/components">Components</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Large</BreadcrumbItem>
          </Breadcrumbs>
          <Caption>lg</Caption>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function BreadcrumbsCollapsed() {
  return (
    <DemoWrapper>
      <Breadcrumbs maxItems={4} expandable={false}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/workspace">Workspace</BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project">Project</BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project/src">src</BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project/src/components">
          components
        </BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project/src/components/navigation">
          navigation
        </BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project/src/components/navigation/breadcrumbs">
          Breadcrumbs
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>Breadcrumbs.tsx</BreadcrumbItem>
      </Breadcrumbs>
    </DemoWrapper>
  );
}

export function BreadcrumbsExpandable() {
  return (
    <DemoWrapper>
      <Breadcrumbs maxItems={4}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/workspace">Workspace</BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project">Project</BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project/src">src</BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project/src/components">
          components
        </BreadcrumbItem>
        <BreadcrumbItem href="/workspace/project/src/components/navigation">
          navigation
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>Breadcrumbs.tsx</BreadcrumbItem>
      </Breadcrumbs>
    </DemoWrapper>
  );
}

export function BreadcrumbsLongLabels() {
  return (
    <DemoWrapper>
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/captures" maxLength={16}>
          Photogrammetry capture workspace
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent maxLength={20}>
          Reconstructed environment material variants
        </BreadcrumbItem>
      </Breadcrumbs>
    </DemoWrapper>
  );
}

export function BreadcrumbsFilePath() {
  return (
    <DemoWrapper>
      <Breadcrumbs separator="/">
        <BreadcrumbItem href="/">project</BreadcrumbItem>
        <BreadcrumbItem href="/src">src</BreadcrumbItem>
        <BreadcrumbItem href="/src/components">components</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Button.tsx</BreadcrumbItem>
      </Breadcrumbs>
    </DemoWrapper>
  );
}

export function BreadcrumbsInPageHeader() {
  return (
    <DemoWrapper padding="0">
      <PageHeader
        icon={<FolderIcon size="lg" decorative />}
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbItem href="/">Workspace</BreadcrumbItem>
            <BreadcrumbItem href="/projects">Project</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Assets</BreadcrumbItem>
          </Breadcrumbs>
        }
        title="Textures"
        subtitle="Baked PBR materials"
        actions={<Button variant="filled">New</Button>}
      />
    </DemoWrapper>
  );
}
