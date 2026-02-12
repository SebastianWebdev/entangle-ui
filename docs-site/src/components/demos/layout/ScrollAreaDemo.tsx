import DemoWrapper from '../DemoWrapper';
import { ScrollArea } from '@/components/layout';
import { Text } from '@/components/primitives';

export default function ScrollAreaDemo() {
  return (
    <DemoWrapper height="200px">
      <ScrollArea maxHeight={160}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{ padding: '6px 8px', borderBottom: '1px solid #333' }}
          >
            <Text size="sm">Item {i + 1}</Text>
          </div>
        ))}
      </ScrollArea>
    </DemoWrapper>
  );
}
