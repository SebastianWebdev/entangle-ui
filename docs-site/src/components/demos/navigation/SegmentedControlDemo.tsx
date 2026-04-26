import { useState } from 'react';
import type React from 'react';
import DemoWrapper from '../DemoWrapper';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation';
import {
  CircleIcon,
  CodeIcon,
  EyeIcon,
  GridIcon,
  ListIcon,
  TangentAlignedIcon,
  TangentLinearIcon,
  TangentMirroredIcon,
} from '@/components/Icons';

const Caption = ({ children }: { children: React.ReactNode }) => (
  <Text size="xs" color="muted">
    {children}
  </Text>
);

export default function SegmentedControlDemo() {
  return (
    <DemoWrapper>
      <SegmentedControl defaultValue="week" aria-label="Schedule range">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
    </DemoWrapper>
  );
}

export function SegmentedControlVariants() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        {(['subtle', 'solid', 'outline'] as const).map(variant => (
          <Stack key={variant} spacing={1}>
            <SegmentedControl defaultValue="b" variant={variant}>
              <SegmentedControlItem value="a">First</SegmentedControlItem>
              <SegmentedControlItem value="b">Second</SegmentedControlItem>
              <SegmentedControlItem value="c">Third</SegmentedControlItem>
            </SegmentedControl>
            <Caption>{variant}</Caption>
          </Stack>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function SegmentedControlSizes() {
  return (
    <DemoWrapper>
      <Stack spacing={3}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <Stack key={size} spacing={1}>
            <SegmentedControl defaultValue="b" size={size}>
              <SegmentedControlItem value="a">Day</SegmentedControlItem>
              <SegmentedControlItem value="b">Week</SegmentedControlItem>
              <SegmentedControlItem value="c">Month</SegmentedControlItem>
            </SegmentedControl>
            <Caption>{size}</Caption>
          </Stack>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function SegmentedControlVertical() {
  return (
    <DemoWrapper>
      <SegmentedControl defaultValue="b" orientation="vertical">
        <SegmentedControlItem value="a">Top</SegmentedControlItem>
        <SegmentedControlItem value="b">Middle</SegmentedControlItem>
        <SegmentedControlItem value="c">Bottom</SegmentedControlItem>
      </SegmentedControl>
    </DemoWrapper>
  );
}

export function SegmentedControlWithIcons() {
  return (
    <DemoWrapper>
      <SegmentedControl defaultValue="grid">
        <SegmentedControlItem value="list" icon={<ListIcon />}>
          List
        </SegmentedControlItem>
        <SegmentedControlItem value="grid" icon={<GridIcon />}>
          Grid
        </SegmentedControlItem>
        <SegmentedControlItem value="card" icon={<CodeIcon />}>
          Card
        </SegmentedControlItem>
      </SegmentedControl>
    </DemoWrapper>
  );
}

export function SegmentedControlIconOnly() {
  return (
    <DemoWrapper>
      <SegmentedControl defaultValue="center" aria-label="Text alignment">
        <SegmentedControlItem
          value="left"
          icon={<TangentLinearIcon />}
          tooltip="Align left"
        />
        <SegmentedControlItem
          value="center"
          icon={<TangentAlignedIcon />}
          tooltip="Align center"
        />
        <SegmentedControlItem
          value="right"
          icon={<TangentMirroredIcon />}
          tooltip="Align right"
        />
      </SegmentedControl>
    </DemoWrapper>
  );
}

export function SegmentedControlDisabled() {
  return (
    <DemoWrapper>
      <SegmentedControl defaultValue="b" disabled>
        <SegmentedControlItem value="a">Day</SegmentedControlItem>
        <SegmentedControlItem value="b">Week</SegmentedControlItem>
        <SegmentedControlItem value="c">Month</SegmentedControlItem>
      </SegmentedControl>
    </DemoWrapper>
  );
}

export function SegmentedControlDisabledItem() {
  return (
    <DemoWrapper>
      <SegmentedControl defaultValue="a">
        <SegmentedControlItem value="a">Day</SegmentedControlItem>
        <SegmentedControlItem value="b" disabled>
          Week
        </SegmentedControlItem>
        <SegmentedControlItem value="c">Month</SegmentedControlItem>
      </SegmentedControl>
    </DemoWrapper>
  );
}

export function SegmentedControlFullWidth() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <SegmentedControl defaultValue="b" fullWidth>
          <SegmentedControlItem value="a">First</SegmentedControlItem>
          <SegmentedControlItem value="b">Second</SegmentedControlItem>
          <SegmentedControlItem value="c">Third</SegmentedControlItem>
          <SegmentedControlItem value="d">Fourth</SegmentedControlItem>
        </SegmentedControl>
      </div>
    </DemoWrapper>
  );
}

export function SegmentedControlControlled() {
  const [value, setValue] = useState('week');
  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <SegmentedControl
          value={value}
          onChange={next => {
            setValue(next);
            console.log('SegmentedControl change:', next);
          }}
        >
          <SegmentedControlItem value="day">Day</SegmentedControlItem>
          <SegmentedControlItem value="week">Week</SegmentedControlItem>
          <SegmentedControlItem value="month">Month</SegmentedControlItem>
        </SegmentedControl>
        <Caption>Selected: {value}</Caption>
      </Stack>
    </DemoWrapper>
  );
}

export function SegmentedControlViewportShading() {
  return (
    <DemoWrapper>
      <SegmentedControl
        defaultValue="solid"
        size="sm"
        variant="subtle"
        aria-label="Viewport shading"
      >
        <SegmentedControlItem
          value="wireframe"
          icon={<CircleIcon />}
          tooltip="Wireframe"
        />
        <SegmentedControlItem
          value="solid"
          icon={<EyeIcon />}
          tooltip="Solid"
        />
        <SegmentedControlItem
          value="material"
          icon={<GridIcon />}
          tooltip="Material preview"
        />
        <SegmentedControlItem
          value="rendered"
          icon={<CodeIcon />}
          tooltip="Rendered"
        />
      </SegmentedControl>
    </DemoWrapper>
  );
}
