import DemoWrapper from '../DemoWrapper';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  Button,
  Text,
} from '@/components/primitives';

export default function PopoverDemo() {
  return (
    <DemoWrapper>
      <Popover>
        <PopoverTrigger>
          <Button>Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <Text size="sm">This is popover content. Click the X to close.</Text>
          <PopoverClose />
        </PopoverContent>
      </Popover>
    </DemoWrapper>
  );
}
