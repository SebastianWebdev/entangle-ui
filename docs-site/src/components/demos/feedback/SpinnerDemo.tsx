import DemoWrapper from '../DemoWrapper';
import { Spinner } from '@/components/feedback';
import { Flex, Stack } from '@/components/layout';

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
