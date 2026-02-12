import DemoWrapper from '../DemoWrapper';
import { StatusBar } from '@/components/shell';

export default function StatusBarDemo() {
  return (
    <DemoWrapper padding="0">
      <StatusBar>
        <StatusBar.Section side="left">
          <StatusBar.Item>Ready</StatusBar.Item>
          <StatusBar.Item>main</StatusBar.Item>
        </StatusBar.Section>
        <StatusBar.Section side="right">
          <StatusBar.Item>Ln 42, Col 18</StatusBar.Item>
          <StatusBar.Item>UTF-8</StatusBar.Item>
          <StatusBar.Item>TypeScript</StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>
    </DemoWrapper>
  );
}
