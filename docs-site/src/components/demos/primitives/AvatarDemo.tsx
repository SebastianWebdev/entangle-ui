import DemoWrapper from '../DemoWrapper';
import { Avatar, AvatarGroup } from '@/components/primitives';
import { Flex, Stack } from '@/components/layout';

const SAMPLE_IMAGE =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=4&w=160&h=160&q=80';

const captionStyle = {
  fontSize: 11,
  color: 'var(--etui-color-text-muted)',
};

export default function AvatarDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        <Flex gap={3} align="center">
          <Avatar size="sm" src={SAMPLE_IMAGE} name="Sebastian Kowalski" />
          <Avatar size="md" src={SAMPLE_IMAGE} name="Sebastian Kowalski" />
          <Avatar size="lg" src={SAMPLE_IMAGE} name="Sebastian Kowalski" />
          <Avatar size="xl" src={SAMPLE_IMAGE} name="Sebastian Kowalski" />
        </Flex>
        <AvatarGroup max={4}>
          <Avatar src={SAMPLE_IMAGE} name="Alice Wong" />
          <Avatar name="Bob Marley" />
          <Avatar name="Carol Danvers" />
          <Avatar name="Dave Grohl" />
          <Avatar name="Eve Polastri" />
          <Avatar name="Frank Ocean" />
        </AvatarGroup>
      </Stack>
    </DemoWrapper>
  );
}

export function AvatarSizes() {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
  return (
    <DemoWrapper>
      <Flex gap={4} align="flex-end" wrap="wrap">
        {sizes.map(size => (
          <Flex key={size} direction="column" align="center" gap={2}>
            <Avatar size={size} src={SAMPLE_IMAGE} name="Sebastian" />
            <span style={captionStyle}>{size}</span>
          </Flex>
        ))}
      </Flex>
    </DemoWrapper>
  );
}

export function AvatarShapes() {
  const shapes = ['circle', 'square', 'rounded'] as const;
  return (
    <DemoWrapper>
      <Flex gap={4} align="center">
        {shapes.map(shape => (
          <Flex key={shape} direction="column" align="center" gap={2}>
            <Avatar shape={shape} size="xl" src={SAMPLE_IMAGE} name="A" />
            <span style={captionStyle}>{shape}</span>
          </Flex>
        ))}
      </Flex>
    </DemoWrapper>
  );
}

export function AvatarInitials() {
  const names = [
    'Alice Wong',
    'Bob Marley',
    'Carol Danvers',
    'Dave Grohl',
    'Eve Polastri',
    'Frank Ocean',
    'Grace Hopper',
  ];
  return (
    <DemoWrapper>
      <Flex gap={3} align="center" wrap="wrap">
        {names.map(name => (
          <Flex key={name} direction="column" align="center" gap={2}>
            <Avatar size="xl" name={name} />
            <span style={captionStyle}>{name}</span>
          </Flex>
        ))}
      </Flex>
    </DemoWrapper>
  );
}

export function AvatarIconFallback() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center">
        <Avatar size="md" />
        <Avatar size="lg" />
        <Avatar size="xl" />
        <Avatar size="xxl" />
      </Flex>
    </DemoWrapper>
  );
}

export function AvatarStatuses() {
  const statuses = ['online', 'away', 'busy', 'offline'] as const;
  return (
    <DemoWrapper>
      <Flex gap={4} align="center">
        {statuses.map(status => (
          <Flex key={status} direction="column" align="center" gap={2}>
            <Avatar
              size="xl"
              src={SAMPLE_IMAGE}
              name="Sebastian"
              status={status}
            />
            <span style={captionStyle}>{status}</span>
          </Flex>
        ))}
      </Flex>
    </DemoWrapper>
  );
}

export function AvatarBrokenImage() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center">
        <Flex direction="column" align="center" gap={2}>
          <Avatar
            size="xl"
            src="https://example.invalid/missing.png"
            name="Alice Wong"
          />
          <span style={captionStyle}>broken src + name</span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Avatar
            size="xl"
            src="https://example.invalid/missing.png"
            alt="No name"
          />
          <span style={captionStyle}>broken src, no name</span>
        </Flex>
      </Flex>
    </DemoWrapper>
  );
}

export function AvatarClickable() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center">
        <Avatar
          size="xl"
          src={SAMPLE_IMAGE}
          name="Sebastian Kowalski"
          onClick={() => console.log('Avatar clicked')}
        />
        <Avatar
          size="xl"
          name="Click Me"
          onClick={() => console.log('Avatar clicked')}
        />
        <span style={captionStyle}>(open the console)</span>
      </Flex>
    </DemoWrapper>
  );
}

export function AvatarGroupOverview() {
  return (
    <DemoWrapper>
      <AvatarGroup max={4}>
        <Avatar src={SAMPLE_IMAGE} name="Alice Wong" />
        <Avatar name="Bob Marley" />
        <Avatar name="Carol Danvers" />
        <Avatar name="Dave Grohl" />
        <Avatar name="Eve Polastri" />
      </AvatarGroup>
    </DemoWrapper>
  );
}

export function AvatarGroupOverflow() {
  return (
    <DemoWrapper>
      <AvatarGroup max={4}>
        <Avatar src={SAMPLE_IMAGE} name="Alice Wong" />
        <Avatar name="Bob Marley" />
        <Avatar name="Carol Danvers" />
        <Avatar name="Dave Grohl" />
        <Avatar name="Eve Polastri" />
        <Avatar name="Frank Ocean" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Hank Williams" />
        <Avatar name="Ivy Wong" />
        <Avatar name="Jack Black" />
        <Avatar name="Karen Page" />
        <Avatar name="Liam Neeson" />
      </AvatarGroup>
    </DemoWrapper>
  );
}

export function AvatarGroupSizes() {
  const sizes = ['sm', 'md', 'lg', 'xl'] as const;
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        {sizes.map(size => (
          <Flex key={size} gap={3} align="center">
            <span style={{ ...captionStyle, width: 24 }}>{size}</span>
            <AvatarGroup size={size} max={3}>
              <Avatar name="Alice Wong" />
              <Avatar name="Bob Marley" />
              <Avatar name="Carol Danvers" />
              <Avatar name="Dave Grohl" />
            </AvatarGroup>
          </Flex>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function AvatarCollaborators() {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '8px 12px',
          background: 'var(--etui-color-bg-secondary)',
          border: '1px solid var(--etui-color-border-default)',
          borderRadius: 6,
          width: 360,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: 'var(--etui-color-text-secondary)',
          }}
        >
          scene-01.usd
        </span>
        <AvatarGroup size="sm" max={3}>
          <Avatar
            src={SAMPLE_IMAGE}
            name="Sebastian Kowalski"
            status="online"
          />
          <Avatar name="Alice Wong" status="online" />
          <Avatar name="Bob Marley" status="away" />
        </AvatarGroup>
      </div>
    </DemoWrapper>
  );
}
