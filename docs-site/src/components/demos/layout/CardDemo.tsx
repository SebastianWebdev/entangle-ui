import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Card, Flex, Stack } from '@/components/layout';
import { Button, Text } from '@/components/primitives';

const MoreIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden
  >
    <circle cx="4" cy="8" r="1.4" />
    <circle cx="8" cy="8" r="1.4" />
    <circle cx="12" cy="8" r="1.4" />
  </svg>
);

const FolderGlyph = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path
      d="M3 6 L8 6 L9.5 4.5 L17 4.5 L17 15 L3 15 Z"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CardDemo() {
  return (
    <DemoWrapper>
      <div style={{ width: 320 }}>
        <Card variant="elevated">
          <Card.Media
            src="https://picsum.photos/seed/entangle-card/640/360"
            alt="Asset preview"
            aspectRatio={16 / 9}
          />
          <Card.Header
            title="Asphalt 02"
            subtitle="Updated 2 hours ago"
            trailing={
              <button
                type="button"
                aria-label="More"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--etui-color-text-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MoreIcon />
              </button>
            }
          />
          <Card.Body>
            4K PBR material with roughness and normal maps. Tags: outdoor,
            road, weathered.
          </Card.Body>
          <Card.Footer align="space-between">
            <Text size="sm" color="muted">
              12.4 MB
            </Text>
            <Button variant="filled">Open</Button>
          </Card.Footer>
        </Card>
      </div>
    </DemoWrapper>
  );
}

export function CardVariants() {
  return (
    <DemoWrapper>
      <Flex gap={4} wrap="wrap">
        {(['outlined', 'filled', 'elevated'] as const).map(variant => (
          <div key={variant} style={{ width: 240 }}>
            <Card variant={variant}>
              <Card.Header title={variant} subtitle="Variant" />
              <Card.Body>
                Same composition, different surface treatment.
              </Card.Body>
            </Card>
          </div>
        ))}
      </Flex>
    </DemoWrapper>
  );
}

export function CardInteractive() {
  const [selected, setSelected] = useState<string | null>('beta');
  const items = [
    {
      id: 'alpha',
      title: 'Alpha preset',
      subtitle: 'Soft shadows, warm lighting',
    },
    {
      id: 'beta',
      title: 'Beta preset',
      subtitle: 'High contrast, cool lighting',
    },
    {
      id: 'gamma',
      title: 'Gamma preset',
      subtitle: 'Studio neutral',
    },
  ];
  return (
    <DemoWrapper>
      <Flex gap={3} wrap="wrap">
        {items.map(item => (
          <div key={item.id} style={{ width: 200 }}>
            <Card
              variant="elevated"
              onClick={() => setSelected(item.id)}
              selected={selected === item.id}
            >
              <Card.Header title={item.title} subtitle={item.subtitle} />
            </Card>
          </div>
        ))}
      </Flex>
    </DemoWrapper>
  );
}

export function CardWithMedia() {
  return (
    <DemoWrapper>
      <div style={{ width: 320 }}>
        <Card variant="elevated">
          <Card.Media
            src="https://picsum.photos/seed/entangle-media/640/360"
            alt="Scene preview"
            aspectRatio={16 / 9}
          />
          <Card.Header title="Lobby render" subtitle="Saved 5 min ago" />
          <Card.Body>
            Media renders edge-to-edge above the header. Aspect ratio is
            configurable per instance.
          </Card.Body>
          <Card.Footer>
            <Button>Open</Button>
          </Card.Footer>
        </Card>
      </div>
    </DemoWrapper>
  );
}

export function CardListItem() {
  const rows = [
    { name: 'Concrete 04', subtitle: 'PBR material — 8.2 MB' },
    { name: 'Brick wall 12', subtitle: 'PBR material — 14.7 MB' },
    { name: 'Wood plank 03', subtitle: 'PBR material — 6.1 MB' },
  ];
  return (
    <DemoWrapper>
      <Stack gap={2} style={{ width: 360 }}>
        {rows.map(row => (
          <Card key={row.name} variant="outlined" onClick={() => {}}>
            <Card.Header
              leading={<FolderGlyph />}
              title={row.name}
              subtitle={row.subtitle}
              trailing={
                <Text size="xs" color="muted">
                  Open
                </Text>
              }
            />
          </Card>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function CardDisabled() {
  return (
    <DemoWrapper>
      <div style={{ width: 320 }}>
        <Card variant="elevated" disabled onClick={() => {}}>
          <Card.Header title="Locked preset" subtitle="Pointer events off" />
          <Card.Body>Body text is dimmed and the card cannot be activated.</Card.Body>
        </Card>
      </div>
    </DemoWrapper>
  );
}

export function CardFooterAlignments() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: 320 }}>
        {(['left', 'center', 'right', 'space-between'] as const).map(align => (
          <Card key={align} variant="filled">
            <Card.Header title={`align="${align}"`} />
            <Card.Footer align={align}>
              <Button>Cancel</Button>
              <Button variant="filled">Confirm</Button>
            </Card.Footer>
          </Card>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function CardCustomHeader() {
  return (
    <DemoWrapper>
      <div style={{ width: 320 }}>
        <Card variant="elevated">
          <Card.Header>
            <Flex justify="space-between" align="center">
              <Text weight="semibold">Custom header layout</Text>
              <Text size="xs" color="muted">
                Free-form children
              </Text>
            </Flex>
          </Card.Header>
          <Card.Body>
            When <code>children</code> is passed to <code>Card.Header</code>{' '}
            the default title/subtitle layout is bypassed.
          </Card.Body>
        </Card>
      </div>
    </DemoWrapper>
  );
}
