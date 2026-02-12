import DemoWrapper from '../DemoWrapper';
import { Tooltip, Button } from '@/components/primitives';
import { Flex } from '@/components/layout';

export default function TooltipDemo() {
  return (
    <DemoWrapper>
      <Flex gap={4} align="center">
        <Tooltip title="Top tooltip" placement="top">
          <Button>Hover (Top)</Button>
        </Tooltip>
        <Tooltip title="Right tooltip" placement="right">
          <Button>Hover (Right)</Button>
        </Tooltip>
        <Tooltip title="Bottom tooltip" placement="bottom">
          <Button>Hover (Bottom)</Button>
        </Tooltip>
      </Flex>
    </DemoWrapper>
  );
}
