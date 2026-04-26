import DemoWrapper from '../DemoWrapper';
import { IconButton, Text, VisuallyHidden } from '@/components/primitives';
import { Stack } from '@/components/layout';
import { SearchIcon } from '@/components/Icons/SearchIcon';
import { SettingsIcon } from '@/components/Icons/SettingsIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';

export default function VisuallyHiddenDemo() {
  return (
    <DemoWrapper>
      <Stack gap={4} style={{ maxWidth: 480 }}>
        <Text>
          The next words are visually hidden but present in the DOM —{' '}
          <VisuallyHidden>
            invisible to sighted users, audible to screen readers
          </VisuallyHidden>
          . Inspect the DOM to verify they exist.
        </Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Settings">
            <SettingsIcon />
          </IconButton>
          <IconButton aria-label="Delete">
            <TrashIcon />
          </IconButton>
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function VisuallyHiddenBasic() {
  return (
    <DemoWrapper>
      <Text>
        This sentence has{' '}
        <VisuallyHidden>extra context only screen readers hear</VisuallyHidden>{' '}
        invisible content embedded in it. Open devtools to see it.
      </Text>
    </DemoWrapper>
  );
}

export function VisuallyHiddenWithSibling() {
  return (
    <DemoWrapper>
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxWidth: 320,
        }}
      >
        <span style={{ fontSize: 12 }}>Email</span>
        <VisuallyHidden>
          We will only use your email to send password reset links.
        </VisuallyHidden>
        <input
          type="email"
          placeholder="you@example.com"
          style={{
            border: '1px solid var(--etui-color-border-default)',
            background: 'transparent',
            color: 'inherit',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        />
      </label>
    </DemoWrapper>
  );
}

export function VisuallyHiddenFocusable() {
  return (
    <DemoWrapper>
      <div style={{ position: 'relative', minHeight: 100, padding: 16 }}>
        <VisuallyHidden focusable>
          <a href="#main-content">Skip to main content</a>
        </VisuallyHidden>
        <Text>
          Click into this preview, then press{' '}
          <span style={{ fontFamily: 'var(--etui-font-mono)' }}>Tab</span> — the
          skip link will appear.
        </Text>
        <div id="main-content" style={{ marginTop: 24 }}>
          <Text size="sm" color="muted">
            Main content begins here.
          </Text>
        </div>
      </div>
    </DemoWrapper>
  );
}

export function VisuallyHiddenInIconButton() {
  return (
    <DemoWrapper>
      <Stack direction="row" gap={3}>
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            border: '1px solid var(--etui-color-border-default)',
            background: 'transparent',
            color: 'inherit',
            padding: '4px 8px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          <SearchIcon />
          <VisuallyHidden>Search the catalog</VisuallyHidden>
        </button>
        <Text size="sm" color="muted">
          Sighted users see the icon; screen readers announce "Search the
          catalog".
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
