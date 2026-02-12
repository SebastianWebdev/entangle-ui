import DemoWrapper from '../DemoWrapper';
import { Flex } from '@/components/layout';

const Box = ({
  color,
  children,
}: {
  color: string;
  children?: React.ReactNode;
}) => (
  <div
    style={{
      background: color,
      padding: '8px 16px',
      borderRadius: 4,
      color: '#fff',
      fontSize: 12,
      minWidth: 60,
      textAlign: 'center' as const,
    }}
  >
    {children}
  </div>
);

export default function FlexDemo() {
  return (
    <DemoWrapper>
      <Flex gap={3} justify="space-between" align="center" wrap="wrap">
        <Box color="#007acc">Item 1</Box>
        <Box color="#005a9e">Item 2</Box>
        <Box color="#4caf50">Item 3</Box>
        <Box color="#ff9800">Item 4</Box>
        <Box color="#f44336">Item 5</Box>
      </Flex>
    </DemoWrapper>
  );
}
