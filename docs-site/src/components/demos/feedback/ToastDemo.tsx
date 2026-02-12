import ToastDemoWrapper from '../ToastDemoWrapper';
import { useToast } from '@/components/feedback';
import { Button } from '@/components/primitives';
import { Flex } from '@/components/layout';

export default function ToastDemo() {
  return (
    <ToastDemoWrapper>
      <ToastButtons />
    </ToastDemoWrapper>
  );
}

function ToastButtons() {
  const { info, success, warning, error } = useToast();

  return (
    <Flex gap={3} wrap="wrap">
      <Button onClick={() => info('This is an informational message')}>
        Info
      </Button>
      <Button onClick={() => success('Operation completed successfully')}>
        Success
      </Button>
      <Button onClick={() => warning('Please check your settings')}>
        Warning
      </Button>
      <Button onClick={() => error('An error occurred')}>Error</Button>
    </Flex>
  );
}
