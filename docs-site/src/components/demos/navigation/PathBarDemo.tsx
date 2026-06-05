import { useState, type CSSProperties } from 'react';
import type React from 'react';
import DemoWrapper from '../DemoWrapper';
import { Stack } from '@/components/layout';
import { PathBar } from '@/components/navigation';
import type { PathSegment } from '@/components/navigation';
import { CodeIcon, FolderIcon, HomeIcon } from '@/components/Icons';

const Caption = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
    {children}
  </span>
);

const Status = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontSize: 12,
      fontFamily: 'var(--etui-font-family-mono, monospace)',
      color: 'var(--etui-color-text-secondary, #b8babf)',
    }}
  >
    {children}
  </span>
);

export default function PathBarDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        <PathBar
          value="src/components/Button/Button.tsx"
          rootIcon={<HomeIcon size="sm" decorative />}
        />
        <PathBar
          separator="/"
          value="usr/local/share/entangle/themes/dark.json"
          maxItems={4}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function PathBarBasic() {
  return (
    <DemoWrapper>
      <PathBar value="src/components/Button/Button.tsx" />
    </DemoWrapper>
  );
}

export function PathBarWithIcons() {
  const segments: PathSegment[] = [
    { label: 'workspace', icon: <HomeIcon size="sm" decorative /> },
    { label: 'src', icon: <FolderIcon size="sm" decorative /> },
    { label: 'components', icon: <FolderIcon size="sm" decorative /> },
    { label: 'Button.tsx', icon: <CodeIcon size="sm" decorative /> },
  ];
  return (
    <DemoWrapper>
      <PathBar value={segments} />
    </DemoWrapper>
  );
}

export function PathBarSeparators() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <PathBar value="src/components/PathBar/PathBar.tsx" />
          <Caption>Default chevron separator</Caption>
        </Stack>
        <Stack spacing={1}>
          <PathBar separator="/" value="src/components/PathBar/PathBar.tsx" />
          <Caption>String separator</Caption>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function PathBarCollapsed() {
  return (
    <DemoWrapper>
      <PathBar
        separator="/"
        maxItems={4}
        value="usr/local/share/entangle/packages/ui/dist/index.js"
      />
    </DemoWrapper>
  );
}

export function PathBarSizes() {
  const path = 'src/components/Button.tsx';
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <PathBar size="sm" value={path} />
          <Caption>sm</Caption>
        </Stack>
        <Stack spacing={1}>
          <PathBar size="md" value={path} />
          <Caption>md</Caption>
        </Stack>
        <Stack spacing={1}>
          <PathBar size="lg" value={path} />
          <Caption>lg</Caption>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

/**
 * Interactive: the current path is controlled, so clicking a folder navigates
 * (truncating the trail) and the status line reflects the new location.
 */
export function PathBarInteractive() {
  const [path, setPath] = useState('src/components/Button/Button.tsx');
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <PathBar
          value={path}
          rootIcon={<HomeIcon size="sm" decorative />}
          onNavigate={next => {
            setPath(next);
          }}
        />
        <Status>current path: {path}</Status>
        <Caption>Click any folder crumb to navigate up the tree.</Caption>
      </Stack>
    </DemoWrapper>
  );
}

// A localized accent palette applied purely by overriding the theme contract's
// `--etui-*` custom properties on an ancestor — no PathBar props involved.
const ACCENT_TOKENS: CSSProperties = {
  ['--etui-color-text-secondary' as string]: '#7dd3fc',
  ['--etui-color-text-primary' as string]: '#f0f9ff',
  ['--etui-color-text-muted' as string]: '#38bdf8',
  ['--etui-radius-sm' as string]: '6px',
};

/**
 * Re-skinning PathBar through theme tokens: both bars are the same component
 * with identical props — only the inherited `--etui-*` values differ.
 */
export function PathBarStyledViaTokens() {
  const path = 'src/components/Button/Button.tsx';
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <PathBar value={path} rootIcon={<HomeIcon size="sm" decorative />} />
          <Caption>Default theme tokens</Caption>
        </Stack>
        <Stack spacing={1}>
          <div style={ACCENT_TOKENS}>
            <PathBar
              value={path}
              rootIcon={<HomeIcon size="sm" decorative />}
            />
          </div>
          <Caption>Custom --etui-* overrides on an ancestor</Caption>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

// A tiny in-memory file tree powering the sibling dropdowns below.
const TREE: Record<string, string[]> = {
  '': ['src', 'public', 'package.json'],
  src: ['components', 'hooks', 'theme', 'index.ts'],
  'src/components': ['Button', 'Input', 'PathBar'],
  'src/components/PathBar': ['PathBar.tsx', 'PathBar.css.ts', 'index.ts'],
};

const isFolder = (segmentPath: string): boolean => segmentPath in TREE;

/**
 * VS-Code-style sibling picker: each crumb gets a dropdown listing the other
 * entries in its parent folder. Choosing one swaps that segment.
 */
export function PathBarSiblingDropdown() {
  const [path, setPath] = useState('src/components/PathBar/PathBar.tsx');

  const getSiblings = (segment: PathSegment): string[] => {
    const value = segment.value ?? segment.label;
    const slash = value.lastIndexOf('/');
    const parent = slash === -1 ? '' : value.slice(0, slash);
    return TREE[parent] ?? [];
  };

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <PathBar
          value={path}
          rootIcon={<HomeIcon size="sm" decorative />}
          getSiblings={getSiblings}
          onNavigate={next => {
            setPath(next);
          }}
        />
        <Status>
          {isFolder(path) ? 'folder' : 'file'}: {path}
        </Status>
        <Caption>
          Click the ▾ caret on a crumb to switch to a sibling entry; click a
          folder label to navigate into it.
        </Caption>
      </Stack>
    </DemoWrapper>
  );
}
