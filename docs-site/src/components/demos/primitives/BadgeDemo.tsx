import DemoWrapper from '../DemoWrapper';
import { Badge } from '@/components/primitives';
import { Flex } from '@/components/layout';

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
        <Flex gap={2} align="center" wrap="wrap">
          <Badge color="primary" removable onRemove={() => {}}>
            feature/foo
          </Badge>
          <Badge color="#9b59b6" variant="solid">
            #9b59b6
          </Badge>
        </Flex>
      </Flex>
    </DemoWrapper>
  );
}
