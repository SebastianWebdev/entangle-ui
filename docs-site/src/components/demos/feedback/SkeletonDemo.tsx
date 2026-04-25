import DemoWrapper from '../DemoWrapper';
import { Skeleton, SkeletonGroup } from '@/components/feedback';
import { Flex, Stack } from '@/components/layout';
import { PropertyPanel, PropertySection } from '@/components/editor';

const captionStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--etui-color-text-muted)',
};

export default function SkeletonDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={4}>
        <Flex gap={4} align="center">
          <Skeleton shape="circle" width={40} />
          <Stack spacing={2} style={{ flex: 1, maxWidth: 280 }}>
            <Skeleton shape="line" width="80%" />
            <Skeleton shape="line" width="100%" />
            <Skeleton shape="line" width="60%" />
          </Stack>
        </Flex>
        <Skeleton width="100%" height={80} animation="wave" />
      </Stack>
    </DemoWrapper>
  );
}

export function SkeletonShapes() {
  return (
    <DemoWrapper>
      <Flex gap={5} align="flex-start">
        <Stack spacing={2} align="center">
          <Skeleton shape="rect" width={120} height={48} />
          <span style={captionStyle}>rect</span>
        </Stack>
        <Stack spacing={2} align="center">
          <Skeleton shape="circle" width={48} />
          <span style={captionStyle}>circle</span>
        </Stack>
        <Stack spacing={2} align="center" style={{ width: 160 }}>
          <Skeleton shape="line" width="100%" />
          <span style={captionStyle}>line</span>
        </Stack>
      </Flex>
    </DemoWrapper>
  );
}

export function SkeletonAnimations() {
  return (
    <DemoWrapper>
      <Flex gap={5} align="flex-start">
        <Stack spacing={2} align="center">
          <Skeleton width={120} height={48} animation="pulse" />
          <span style={captionStyle}>pulse</span>
        </Stack>
        <Stack spacing={2} align="center">
          <Skeleton width={120} height={48} animation="wave" />
          <span style={captionStyle}>wave</span>
        </Stack>
        <Stack spacing={2} align="center">
          <Skeleton width={120} height={48} animation="none" />
          <span style={captionStyle}>none</span>
        </Stack>
      </Flex>
    </DemoWrapper>
  );
}

export function SkeletonParagraph() {
  return (
    <DemoWrapper>
      <Stack spacing={2} style={{ width: 360 }}>
        <Skeleton shape="line" width="60%" />
        <Skeleton shape="line" width="100%" />
        <Skeleton shape="line" width="90%" />
        <Skeleton shape="line" width="75%" />
        <Skeleton shape="line" width="40%" />
      </Stack>
    </DemoWrapper>
  );
}

export function SkeletonCard() {
  return (
    <DemoWrapper>
      <Flex
        gap={3}
        align="flex-start"
        style={{
          width: 360,
          padding: 12,
          borderRadius: 6,
          background: 'var(--etui-color-bg-elevated)',
        }}
      >
        <Skeleton shape="circle" width={40} />
        <Stack spacing={2} style={{ flex: 1 }}>
          <Skeleton shape="line" width="70%" />
          <Skeleton shape="line" width="100%" />
          <Skeleton shape="line" width="50%" />
          <Skeleton width="100%" height={80} />
        </Stack>
      </Flex>
    </DemoWrapper>
  );
}

export function SkeletonList() {
  return (
    <DemoWrapper>
      <SkeletonGroup
        count={5}
        spacing={2}
        itemProps={{ shape: 'line', width: '100%' }}
        style={{ width: 360 }}
      />
    </DemoWrapper>
  );
}

export function SkeletonGrid() {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 80px)',
          gap: 12,
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} width={80} height={80} animation="none" />
        ))}
      </div>
    </DemoWrapper>
  );
}

export function SkeletonInPropertyPanel() {
  return (
    <DemoWrapper>
      <div style={{ width: 280 }}>
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <Stack spacing={2} style={{ padding: 8 }}>
              <Skeleton shape="line" width="100%" />
              <Skeleton shape="line" width="80%" />
              <Skeleton shape="line" width="65%" />
            </Stack>
          </PropertySection>
          <PropertySection title="Material" defaultExpanded>
            <Stack spacing={2} style={{ padding: 8 }}>
              <Skeleton shape="line" width="90%" />
              <Skeleton shape="line" width="55%" />
            </Stack>
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}
