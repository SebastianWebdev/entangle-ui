import DemoWrapper from '../DemoWrapper';
import { Link, Text } from '@/components/primitives';
import { Stack } from '@/components/layout';

export default function LinkDemo() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ maxWidth: 480 }}>
        <Link href="/docs">Read the docs</Link>
        <Link href="/docs" variant="subtle">
          Subtle link
        </Link>
        <Text>
          Read the{' '}
          <Link href="/guide" variant="inline">
            getting-started guide
          </Link>{' '}
          first, then explore the{' '}
          <Link href="https://example.com" variant="inline">
            external reference
          </Link>{' '}
          for the full API.
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function LinkVariants() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Link href="/foo" variant="default">
          Default — accent color
        </Link>
        <Link href="/foo" variant="subtle">
          Subtle — secondary text
        </Link>
        <Text>
          Inline variant{' '}
          <Link href="/foo" variant="inline">
            inherits surrounding color
          </Link>{' '}
          and is always underlined.
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function LinkUnderline() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Link href="/foo" underline="always">
          Always underlined
        </Link>
        <Link href="/foo" underline="hover">
          Underlined on hover (default)
        </Link>
        <Link href="/foo" underline="never">
          Never underlined
        </Link>
      </Stack>
    </DemoWrapper>
  );
}

export function LinkSizes() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Link href="/foo" size="sm">
          Small link
        </Link>
        <Link href="/foo" size="md">
          Medium link (default)
        </Link>
        <Link href="/foo" size="lg">
          Large link
        </Link>
      </Stack>
    </DemoWrapper>
  );
}

export function LinkExternal() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Link href="https://example.com">Auto-detected from https://</Link>
        <Link href="/internal" external>
          Forced external on a relative URL
        </Link>
        <Link href="https://example.com" external={false}>
          Same-tab override on an absolute URL
        </Link>
      </Stack>
    </DemoWrapper>
  );
}

export function LinkDisabled() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Link href="/foo" disabled>
          Disabled link
        </Link>
        <Link href="https://example.com" disabled>
          Disabled external link
        </Link>
      </Stack>
    </DemoWrapper>
  );
}

export function LinkPolymorphic() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Link
          as="button"
          onClick={() => {
            // Demo only — replace with router navigation in real apps.
          }}
        >
          Rendered as a &lt;button&gt;
        </Link>
        <Text size="sm" color="muted">
          In a real app, pass your router&apos;s link component:{' '}
          <code>{`<Link as={RouterLink} to="/foo" />`}</code>.
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function LinkInProse() {
  return (
    <DemoWrapper>
      <Text>
        Read the{' '}
        <Link href="/guide" variant="inline">
          getting-started guide
        </Link>{' '}
        first, then explore the{' '}
        <Link href="https://example.com" variant="inline">
          external API reference
        </Link>{' '}
        for the full surface area. Inline links inherit color from their parent
        text and are always underlined to stay distinguishable.
      </Text>
    </DemoWrapper>
  );
}

export function LinkInStatusBar() {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          padding: '4px 8px',
          background: 'var(--etui-color-background-elevated)',
          borderRadius: 4,
          fontSize: 11,
          width: 'fit-content',
        }}
      >
        <span>main</span>
        <Link href="/changes" size="sm" variant="subtle">
          12 unstaged changes
        </Link>
        <Link href="https://docs.example.com" size="sm" variant="subtle">
          Docs
        </Link>
      </div>
    </DemoWrapper>
  );
}
