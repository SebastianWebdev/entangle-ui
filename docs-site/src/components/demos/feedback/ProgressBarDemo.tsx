import DemoWrapper from '../DemoWrapper';
import { useEffect, useState } from 'react';
import { CircularProgress, ProgressBar } from '@/components/feedback';
import { Flex, Stack } from '@/components/layout';

const captionStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--etui-color-text-muted)',
};

export default function ProgressBarDemo() {
  return (
    <DemoWrapper>
      <Stack spacing={4} style={{ width: 360 }}>
        <ProgressBar value={60} showLabel="inline" />
        <ProgressBar value={42} size="lg" striped animated />
        <Flex gap={4} align="center">
          <CircularProgress value={75} size="lg" />
          <CircularProgress value={42} size="xl" showLabel />
          <CircularProgress size="xl" />
        </Flex>
      </Stack>
    </DemoWrapper>
  );
}

export function ProgressBarSizes() {
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: 360 }}>
        <Stack spacing={1}>
          <ProgressBar value={60} size="sm" />
          <span style={captionStyle}>sm — 2px</span>
        </Stack>
        <Stack spacing={1}>
          <ProgressBar value={60} size="md" />
          <span style={captionStyle}>md — 4px (default)</span>
        </Stack>
        <Stack spacing={1}>
          <ProgressBar value={60} size="lg" />
          <span style={captionStyle}>lg — 8px</span>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function ProgressBarColors() {
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: 360 }}>
        <Stack spacing={1}>
          <ProgressBar value={60} color="primary" />
          <span style={captionStyle}>primary</span>
        </Stack>
        <Stack spacing={1}>
          <ProgressBar value={60} color="success" />
          <span style={captionStyle}>success</span>
        </Stack>
        <Stack spacing={1}>
          <ProgressBar value={60} color="warning" />
          <span style={captionStyle}>warning</span>
        </Stack>
        <Stack spacing={1}>
          <ProgressBar value={60} color="error" />
          <span style={captionStyle}>error</span>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function ProgressBarLabels() {
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: 360 }}>
        <Stack spacing={1}>
          <ProgressBar value={60} showLabel="inline" />
          <span style={captionStyle}>inline percentage</span>
        </Stack>
        <Stack spacing={1}>
          <ProgressBar value={60} size="lg" showLabel="overlay" />
          <span style={captionStyle}>overlay percentage (lg)</span>
        </Stack>
        <Stack spacing={1}>
          <ProgressBar
            value={24}
            max={50}
            showLabel="inline"
            label="12 / 50 files"
          />
          <span style={captionStyle}>custom label</span>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function ProgressBarIndeterminate() {
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: 360 }}>
        <ProgressBar />
        <ProgressBar size="lg" color="success" />
      </Stack>
    </DemoWrapper>
  );
}

export function ProgressBarStriped() {
  return (
    <DemoWrapper>
      <Stack spacing={3} style={{ width: 360 }}>
        <Stack spacing={1}>
          <ProgressBar value={60} size="lg" striped />
          <span style={captionStyle}>striped</span>
        </Stack>
        <Stack spacing={1}>
          <ProgressBar value={60} size="lg" striped animated />
          <span style={captionStyle}>striped + animated</span>
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function ProgressBarLive() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setValue(v => (v >= 100 ? 0 : v + 5));
    }, 250);
    return () => clearInterval(id);
  }, []);
  return (
    <DemoWrapper>
      <div style={{ width: 360 }}>
        <ProgressBar value={value} showLabel="inline" />
      </div>
    </DemoWrapper>
  );
}

export function CircularSizes() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center">
        <Stack spacing={2} align="center">
          <CircularProgress value={75} size="xs" />
          <span style={captionStyle}>xs</span>
        </Stack>
        <Stack spacing={2} align="center">
          <CircularProgress value={75} size="sm" />
          <span style={captionStyle}>sm</span>
        </Stack>
        <Stack spacing={2} align="center">
          <CircularProgress value={75} size="md" />
          <span style={captionStyle}>md</span>
        </Stack>
        <Stack spacing={2} align="center">
          <CircularProgress value={75} size="lg" />
          <span style={captionStyle}>lg</span>
        </Stack>
        <Stack spacing={2} align="center">
          <CircularProgress value={75} size="xl" />
          <span style={captionStyle}>xl</span>
        </Stack>
      </Flex>
    </DemoWrapper>
  );
}

export function CircularWithLabel() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center">
        <CircularProgress value={42} size="lg" showLabel />
        <CircularProgress value={42} size="xl" showLabel />
        <CircularProgress value={75} size="xl" color="success" showLabel />
        <CircularProgress size="xl" />
      </Flex>
    </DemoWrapper>
  );
}

export function ProgressBarExportFlow() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setFrame(f => (f >= 120 ? 0 : f + 1));
    }, 100);
    return () => clearInterval(id);
  }, []);
  return (
    <DemoWrapper>
      <div style={{ width: 360 }}>
        <ProgressBar
          value={frame}
          max={120}
          size="lg"
          color="success"
          showLabel="inline"
          label={`Exporting frame ${frame} / 120`}
        />
      </div>
    </DemoWrapper>
  );
}
