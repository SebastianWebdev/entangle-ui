import DemoWrapper from '../DemoWrapper';
import {
  ChatPanel,
  ChatMessageList,
  ChatInput,
} from '@/components/editor/ChatPanel';
import type { ChatMessageData } from '@/components/editor/ChatPanel';

const messages: ChatMessageData[] = [
  {
    id: '1',
    role: 'user',
    content: 'How do I create a button component?',
    status: 'complete',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    role: 'assistant',
    content:
      'Import Button from entangle-ui and use it like this:\n\n<Button variant="filled">Click me</Button>',
    status: 'complete',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    role: 'user',
    content: 'Can I add an icon?',
    status: 'complete',
    timestamp: new Date().toISOString(),
  },
];

export default function ChatPanelDemo() {
  return (
    <DemoWrapper padding="0">
      <div style={{ height: 450, width: '100%' }}>
        <ChatPanel>
          <ChatMessageList messages={messages} />
          <ChatInput placeholder="Ask me anything..." onSubmit={() => {}} />
        </ChatPanel>
      </div>
    </DemoWrapper>
  );
}
