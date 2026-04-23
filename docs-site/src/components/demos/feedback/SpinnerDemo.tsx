import DemoWrapper from '../DemoWrapper';
import { Spinner } from '@/components/feedback';
import { Button } from '@/components/primitives';
import { Flex, Stack } from '@/components/layout';
import { useState } from 'react';

export default function SpinnerDemo() {
  return (
    <DemoWrapper>
      <Stack gap={4}>
        <Flex gap={4} align="center">
          <Spinner variant="ring" />
          <Spinner variant="dots" />
          <Spinner variant="pulse" />
        </Flex>
        <Flex gap={4} align="center">
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Flex>
        <Flex gap={4} align="center">
          <Spinner color="accent" />
          <Spinner color="primary" />
          <Spinner color="secondary" />
          <Spinner color="muted" />
        </Flex>
        <Spinner showLabel label="Fetching results..." />
      </Stack>
    </DemoWrapper>
  );
}

export function SpinnerVariants() {
  return (
    <DemoWrapper>
      <Flex gap={5} align="center" wrap="wrap">
        <Flex direction="column" align="center" gap={2}>
          <Spinner variant="ring" size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            ring
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner variant="dots" size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            dots
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner variant="pulse" size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            pulse
          </span>
        </Flex>
      </Flex>
    </DemoWrapper>
  );
}

export function SpinnerSizes() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center" wrap="wrap">
        <Flex direction="column" align="center" gap={2}>
          <Spinner size="xs" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            xs
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner size="sm" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            sm
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner size="md" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            md
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            lg
          </span>
        </Flex>
      </Flex>
    </DemoWrapper>
  );
}

export function SpinnerColors() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center" wrap="wrap">
        <Flex direction="column" align="center" gap={2}>
          <Spinner color="accent" size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            accent
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner color="primary" size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            primary
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner color="secondary" size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            secondary
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner color="muted" size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            muted
          </span>
        </Flex>
        <Flex direction="column" align="center" gap={2}>
          <Spinner color="#9b59b6" size="lg" />
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            #9b59b6
          </span>
        </Flex>
      </Flex>
    </DemoWrapper>
  );
}

export function SpinnerWithLabel() {
  return (
    <DemoWrapper>
      <Stack gap={3}>
        <Spinner showLabel label="Fetching results..." />
        <Spinner variant="dots" showLabel label="Syncing" />
        <Spinner variant="pulse" showLabel label="Exporting" color="muted" />
      </Stack>
    </DemoWrapper>
  );
}

export function SpinnerInButton() {
  const [loading, setLoading] = useState(false);
  return (
    <DemoWrapper>
      <Flex gap={3} align="center">
        <Button
          variant="filled"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" color="primary" /> Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
        <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
          Click to simulate a 1.5s async operation.
        </span>
      </Flex>
    </DemoWrapper>
  );
}
