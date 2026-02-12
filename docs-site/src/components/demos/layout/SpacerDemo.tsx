import DemoWrapper from '../DemoWrapper';
import { Flex, Spacer } from '@/components/layout';
import { Button, Text } from '@/components/primitives';

export default function SpacerDemo() {
  return (
    <DemoWrapper>
      <Flex align="center">
        <Text size="sm">Logo</Text>
        <Spacer />
        <Button size="sm">Login</Button>
      </Flex>
    </DemoWrapper>
  );
}
