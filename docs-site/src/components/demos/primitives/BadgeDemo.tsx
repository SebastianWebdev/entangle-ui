import DemoWrapper from '../DemoWrapper';
import { Badge } from '@/components/primitives';
import { Flex } from '@/components/layout';
import { useState } from 'react';

export default function BadgeDemo() {
  return (
    <DemoWrapper>
      <Flex direction="column" gap={4}>
        <Flex gap={2} align="center" wrap="wrap">
          <Badge>Neutral</Badge>
          <Badge color="primary">Primary</Badge>
          <Badge color="success">Success</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="error">Error</Badge>
          <Badge color="info">Info</Badge>
        </Flex>
        <Flex gap={2} align="center" wrap="wrap">
          <Badge variant="solid" color="primary">
            Solid
          </Badge>
          <Badge variant="outline" color="success">
            Outline
          </Badge>
          <Badge variant="dot" color="warning">
            Dot
          </Badge>
          <Badge color="error" uppercase>
            Critical
          </Badge>
        </Flex>
        <Flex gap={2} align="center" wrap="wrap">
          <Badge size="xs">XS</Badge>
          <Badge size="sm">SM</Badge>
          <Badge size="md">MD</Badge>
          <Badge size="lg">LG</Badge>
        </Flex>
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeVariantSubtle() {
  return (
    <DemoWrapper>
      <Flex gap={2} wrap="wrap">
        <Badge variant="subtle" color="neutral">
          Neutral
        </Badge>
        <Badge variant="subtle" color="primary">
          Primary
        </Badge>
        <Badge variant="subtle" color="success">
          Success
        </Badge>
        <Badge variant="subtle" color="warning">
          Warning
        </Badge>
        <Badge variant="subtle" color="error">
          Error
        </Badge>
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeVariantSolid() {
  return (
    <DemoWrapper>
      <Flex gap={2} wrap="wrap">
        <Badge variant="solid" color="neutral">
          Neutral
        </Badge>
        <Badge variant="solid" color="primary">
          Primary
        </Badge>
        <Badge variant="solid" color="success">
          Success
        </Badge>
        <Badge variant="solid" color="warning">
          Warning
        </Badge>
        <Badge variant="solid" color="error">
          Error
        </Badge>
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeVariantOutline() {
  return (
    <DemoWrapper>
      <Flex gap={2} wrap="wrap">
        <Badge variant="outline" color="neutral">
          Neutral
        </Badge>
        <Badge variant="outline" color="primary">
          Primary
        </Badge>
        <Badge variant="outline" color="success">
          Success
        </Badge>
        <Badge variant="outline" color="warning">
          Warning
        </Badge>
        <Badge variant="outline" color="error">
          Error
        </Badge>
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeVariantDot() {
  return (
    <DemoWrapper>
      <Flex gap={3} wrap="wrap" align="center">
        <Badge variant="dot" color="success">
          Online
        </Badge>
        <Badge variant="dot" color="warning">
          Idle
        </Badge>
        <Badge variant="dot" color="error">
          Offline
        </Badge>
        <Badge variant="dot" color="neutral">
          Unknown
        </Badge>
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeSizes() {
  return (
    <DemoWrapper>
      <Flex gap={3} align="center" wrap="wrap">
        <Badge size="xs" color="primary">
          xs — 14px
        </Badge>
        <Badge size="sm" color="primary">
          sm — 16px
        </Badge>
        <Badge size="md" color="primary">
          md — 20px
        </Badge>
        <Badge size="lg" color="primary">
          lg — 24px
        </Badge>
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeUppercase() {
  return (
    <DemoWrapper>
      <Flex gap={2} align="center" wrap="wrap">
        <Badge color="warning" uppercase>
          draft
        </Badge>
        <Badge color="error" uppercase>
          blocked
        </Badge>
        <Badge color="success" uppercase>
          shipped
        </Badge>
      </Flex>
    </DemoWrapper>
  );
}

const CheckGlyph = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden focusable="false">
    <path
      d="M2 5 L4 7 L8 3"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
const StarGlyph = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden focusable="false">
    <path
      d="M5 1 L6 4 L9 4 L7 6 L8 9 L5 7.5 L2 9 L3 6 L1 4 L4 4 Z"
      fill="currentColor"
    />
  </svg>
);

export function BadgeWithIcon() {
  return (
    <DemoWrapper>
      <Flex gap={2} align="center" wrap="wrap">
        <Badge color="success" icon={<CheckGlyph />}>
          Saved
        </Badge>
        <Badge color="warning" icon={<StarGlyph />}>
          Featured
        </Badge>
        <Badge variant="solid" color="primary" icon={<StarGlyph />}>
          Pro
        </Badge>
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeRemovable() {
  const [tags, setTags] = useState([
    'feature/auth',
    'feature/payments',
    'bug/ui-glitch',
    'chore/deps',
  ]);
  return (
    <DemoWrapper>
      <Flex gap={2} wrap="wrap" align="center">
        {tags.map(tag => (
          <Badge
            key={tag}
            color="primary"
            removable
            onRemove={() => setTags(prev => prev.filter(t => t !== tag))}
          >
            {tag}
          </Badge>
        ))}
        {tags.length === 0 && (
          <Badge
            color="neutral"
            onClick={() =>
              setTags([
                'feature/auth',
                'feature/payments',
                'bug/ui-glitch',
                'chore/deps',
              ])
            }
          >
            (all removed — click to reset)
          </Badge>
        )}
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeCustomColors() {
  return (
    <DemoWrapper>
      <Flex gap={2} wrap="wrap" align="center">
        <Badge color="#ff6600">orange hex</Badge>
        <Badge color="#9b59b6" variant="solid">
          purple solid
        </Badge>
        <Badge color="rgb(0, 180, 200)" variant="outline">
          teal rgb
        </Badge>
        <Badge color="hsl(320, 70%, 55%)" variant="dot">
          pink hsl
        </Badge>
      </Flex>
    </DemoWrapper>
  );
}

export function BadgeInList() {
  const rows = [
    { name: 'Bake meshes', tag: 'done', color: 'success' as const },
    { name: 'Normalize UVs', tag: 'running', color: 'warning' as const },
    { name: 'Compile shaders', tag: 'queued', color: 'neutral' as const },
    { name: 'Export GLB', tag: 'failed', color: 'error' as const },
  ];
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: '100%',
          maxWidth: 320,
        }}
      >
        {rows.map(row => (
          <div
            key={row.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              background: 'var(--etui-color-surface-default)',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            <span>{row.name}</span>
            <Badge color={row.color} uppercase>
              {row.tag}
            </Badge>
          </div>
        ))}
      </div>
    </DemoWrapper>
  );
}
