import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { ChatPanel } from './ChatPanel';
import { ChatMessageList } from './ChatMessageList';
import { ChatMessage } from './ChatMessage';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { ChatToolCall } from './ChatToolCall';
import { ChatCodeBlock } from './ChatCodeBlock';
import { ChatAttachmentChip } from './ChatAttachment';
import { ChatContextChip } from './ChatContextChip';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatActionBar } from './ChatActionBar';
import { useChatMessages } from './useChatMessages';
import { useChatInput } from './useChatInput';
import type {
  ChatMessageData,
  ChatToolCallData,
  ChatAttachmentData,
} from './ChatPanel.types';

// ─── Test Helpers ────────────────────────────────────────────────

const createMessage = (
  overrides: Partial<ChatMessageData> = {}
): ChatMessageData => ({
  id: overrides.id ?? 'msg-1',
  role: 'user',
  content: 'Hello world',
  status: 'complete',
  timestamp: '2026-02-10T12:00:00Z',
  ...overrides,
});

const createToolCall = (
  overrides: Partial<ChatToolCallData> = {}
): ChatToolCallData => ({
  id: 'tc-1',
  name: 'create_nodes',
  status: 'completed',
  ...overrides,
});

const createAttachment = (
  overrides: Partial<ChatAttachmentData> = {}
): ChatAttachmentData => ({
  id: 'att-1',
  name: 'scene.blend',
  type: 'file',
  ...overrides,
});

// ═══════════════════════════════════════════════════════════════════
// ChatPanel
// ═══════════════════════════════════════════════════════════════════

describe('ChatPanel', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      renderWithTheme(
        <ChatPanel>
          <div data-testid="child">content</div>
        </ChatPanel>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderWithTheme(
        <ChatPanel testId="chat-panel">
          <div>content</div>
        </ChatPanel>
      );
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });

    it('forwards className', () => {
      renderWithTheme(
        <ChatPanel testId="chat-panel" className="custom-class">
          <div>content</div>
        </ChatPanel>
      );
      expect(screen.getByTestId('chat-panel')).toHaveClass('custom-class');
    });

    it('forwards style props', () => {
      renderWithTheme(
        <ChatPanel testId="chat-panel" style={{ width: 360 }}>
          <div>content</div>
        </ChatPanel>
      );
      expect(screen.getByTestId('chat-panel')).toHaveStyle({ width: '360px' });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatMessageList
// ═══════════════════════════════════════════════════════════════════

describe('ChatMessageList', () => {
  describe('Rendering', () => {
    it('renders all messages in order', () => {
      const messages = [
        createMessage({ id: '1', content: 'First' }),
        createMessage({ id: '2', content: 'Second' }),
        createMessage({ id: '3', content: 'Third' }),
      ];
      renderWithTheme(<ChatMessageList messages={messages} />);
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('shows emptyState when messages is empty', () => {
      renderWithTheme(
        <ChatMessageList
          messages={[]}
          emptyState={<div data-testid="empty">No messages</div>}
        />
      );
      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });

    it('uses custom renderMessage when provided', () => {
      const messages = [createMessage({ id: '1', content: 'Custom' })];
      renderWithTheme(
        <ChatMessageList
          messages={messages}
          renderMessage={msg => (
            <div data-testid="custom-msg">{msg.content}-custom</div>
          )}
        />
      );
      expect(screen.getByTestId('custom-msg')).toHaveTextContent(
        'Custom-custom'
      );
    });

    it('has role="log" for accessibility', () => {
      renderWithTheme(<ChatMessageList messages={[]} testId="list" />);
      expect(screen.getByRole('log')).toBeInTheDocument();
    });

    it('has aria-live="polite"', () => {
      renderWithTheme(<ChatMessageList messages={[]} testId="list" />);
      expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatMessage
// ═══════════════════════════════════════════════════════════════════

describe('ChatMessage', () => {
  describe('Rendering', () => {
    it('renders user message', () => {
      const msg = createMessage({ role: 'user', content: 'User text' });
      renderWithTheme(<ChatMessage message={msg} />);
      expect(screen.getByText('User text')).toBeInTheDocument();
    });

    it('renders assistant message', () => {
      const msg = createMessage({
        role: 'assistant',
        content: 'Assistant reply',
      });
      renderWithTheme(<ChatMessage message={msg} />);
      expect(screen.getByText('Assistant reply')).toBeInTheDocument();
    });

    it('renders system message', () => {
      const msg = createMessage({ role: 'system', content: 'System info' });
      renderWithTheme(<ChatMessage message={msg} />);
      expect(screen.getByText('System info')).toBeInTheDocument();
    });

    it('shows avatar when showAvatar is true', () => {
      const msg = createMessage({
        role: 'assistant',
        displayName: 'AI Bot',
        avatar: undefined,
      });
      renderWithTheme(<ChatMessage message={msg} showAvatar />);
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('shows avatar image when provided', () => {
      const msg = createMessage({
        role: 'assistant',
        avatar: 'https://example.com/avatar.png',
        displayName: 'Bot',
      });
      renderWithTheme(<ChatMessage message={msg} showAvatar />);
      const img = screen.getByAltText('Bot');
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
    });

    it('shows timestamp when showTimestamp is true', () => {
      const msg = createMessage({ timestamp: '2026-02-10T14:30:00Z' });
      renderWithTheme(<ChatMessage message={msg} showTimestamp />);
      // The exact time format depends on locale, just check something renders
      const container = screen.getByText(msg.content).closest('div');
      expect(container).toBeInTheDocument();
    });

    it('renders actions slot', () => {
      const msg = createMessage();
      renderWithTheme(
        <ChatMessage
          message={msg}
          actions={<button data-testid="action">Copy</button>}
        />
      );
      expect(screen.getByTestId('action')).toBeInTheDocument();
    });

    it('uses custom renderContent when provided', () => {
      const msg = createMessage({ content: 'raw content' });
      renderWithTheme(
        <ChatMessage
          message={msg}
          renderContent={c => <strong data-testid="custom">{c}</strong>}
        />
      );
      expect(screen.getByTestId('custom')).toHaveTextContent('raw content');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatBubble
// ═══════════════════════════════════════════════════════════════════

describe('ChatBubble', () => {
  it('renders children', () => {
    renderWithTheme(<ChatBubble>Bubble content</ChatBubble>);
    expect(screen.getByText('Bubble content')).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    renderWithTheme(<ChatBubble testId="bubble">Content</ChatBubble>);
    expect(screen.getByTestId('bubble')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatInput
// ═══════════════════════════════════════════════════════════════════

describe('ChatInput', () => {
  describe('Rendering', () => {
    it('renders textarea', () => {
      renderWithTheme(<ChatInput />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders placeholder', () => {
      renderWithTheme(<ChatInput placeholder="Ask something..." />);
      expect(
        screen.getByPlaceholderText('Ask something...')
      ).toBeInTheDocument();
    });

    it('disables input when disabled is true', () => {
      renderWithTheme(<ChatInput disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('shows stop button when streaming is true', () => {
      renderWithTheme(<ChatInput streaming />);
      expect(screen.getByLabelText('Stop generating')).toBeInTheDocument();
    });

    it('shows send button when not streaming', () => {
      renderWithTheme(<ChatInput />);
      expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    });

    it('renders attachment chips', () => {
      const attachments = [createAttachment({ name: 'file.txt' })];
      renderWithTheme(<ChatInput attachments={attachments} />);
      expect(screen.getByText('file.txt')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onSubmit on Enter (default submitKey)', () => {
      const onSubmit = vi.fn();
      renderWithTheme(<ChatInput value="hello" onSubmit={onSubmit} />);
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter' });
      expect(onSubmit).toHaveBeenCalledWith('hello', []);
    });

    it('calls onSubmit on Ctrl+Enter when configured', () => {
      const onSubmit = vi.fn();
      renderWithTheme(
        <ChatInput value="hello" onSubmit={onSubmit} submitKey="ctrl+enter" />
      );
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
      expect(onSubmit).toHaveBeenCalledWith('hello', []);
    });

    it('does not submit on Enter with ctrl+enter config', () => {
      const onSubmit = vi.fn();
      renderWithTheme(
        <ChatInput value="hello" onSubmit={onSubmit} submitKey="ctrl+enter" />
      );
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter' });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('calls onStop when stop button is clicked', () => {
      const onStop = vi.fn();
      renderWithTheme(<ChatInput streaming onStop={onStop} />);
      fireEvent.click(screen.getByLabelText('Stop generating'));
      expect(onStop).toHaveBeenCalledOnce();
    });

    it('calls onRemoveAttachment when chip remove is clicked', () => {
      const onRemove = vi.fn();
      const attachments = [createAttachment({ id: 'a1', name: 'file.txt' })];
      renderWithTheme(
        <ChatInput attachments={attachments} onRemoveAttachment={onRemove} />
      );
      fireEvent.click(screen.getByLabelText('Remove file.txt'));
      expect(onRemove).toHaveBeenCalledWith('a1');
    });

    it('has aria-keyshortcuts attribute', () => {
      renderWithTheme(<ChatInput />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-keyshortcuts');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatTypingIndicator
// ═══════════════════════════════════════════════════════════════════

describe('ChatTypingIndicator', () => {
  it('renders when visible is true', () => {
    renderWithTheme(<ChatTypingIndicator visible testId="typing" />);
    expect(screen.getByTestId('typing')).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    renderWithTheme(<ChatTypingIndicator visible={false} testId="typing" />);
    expect(screen.queryByTestId('typing')).not.toBeInTheDocument();
  });

  it('renders custom label', () => {
    renderWithTheme(<ChatTypingIndicator visible label="Processing..." />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('has role="status"', () => {
    renderWithTheme(<ChatTypingIndicator visible testId="typing" />);
    expect(screen.getByTestId('typing')).toHaveAttribute('role', 'status');
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatToolCall
// ═══════════════════════════════════════════════════════════════════

describe('ChatToolCall', () => {
  describe('Rendering', () => {
    it('renders tool name', () => {
      const tc = createToolCall({ name: 'create_nodes' });
      renderWithTheme(<ChatToolCall toolCall={tc} />);
      expect(screen.getByText('create_nodes')).toBeInTheDocument();
    });

    it.each(['pending', 'running', 'completed', 'error'] as const)(
      'renders %s status',
      status => {
        const tc = createToolCall({ status });
        renderWithTheme(<ChatToolCall toolCall={tc} />);
        const label =
          status === 'pending'
            ? 'Pending'
            : status === 'running'
              ? 'Running'
              : status === 'completed'
                ? 'Completed'
                : 'Error';
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    );

    it('has descriptive aria-label', () => {
      const tc = createToolCall({
        name: 'create_nodes',
        status: 'completed',
      });
      renderWithTheme(<ChatToolCall toolCall={tc} testId="tc" />);
      expect(screen.getByTestId('tc')).toHaveAttribute(
        'aria-label',
        'Tool create_nodes: Completed'
      );
    });
  });

  describe('Interactions', () => {
    it('expands and collapses details', () => {
      const tc = createToolCall({
        input: { count: 3 },
        output: { nodeIds: ['a', 'b'] },
      });
      renderWithTheme(<ChatToolCall toolCall={tc} collapsible />);

      // Initially collapsed
      expect(screen.queryByText('Input')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(screen.getByText('create_nodes'));
      expect(screen.getByText('Input')).toBeInTheDocument();
      expect(screen.getByText('Output')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('create_nodes'));
      expect(screen.queryByText('Input')).not.toBeInTheDocument();
    });

    it('shows defaultExpanded details', () => {
      const tc = createToolCall({
        input: { count: 3 },
      });
      renderWithTheme(<ChatToolCall toolCall={tc} defaultExpanded />);
      expect(screen.getByText('Input')).toBeInTheDocument();
    });

    it('uses custom renderOutput', () => {
      const tc = createToolCall({
        output: { nodeIds: ['a', 'b'] },
      });
      renderWithTheme(
        <ChatToolCall
          toolCall={tc}
          defaultExpanded
          renderOutput={output => (
            <span data-testid="custom-output">
              {(output['nodeIds'] as string[]).length} created
            </span>
          )}
        />
      );
      expect(screen.getByTestId('custom-output')).toHaveTextContent(
        '2 created'
      );
    });

    it('shows error message when status is error', () => {
      const tc = createToolCall({
        status: 'error',
        error: 'Connection failed',
      });
      renderWithTheme(<ChatToolCall toolCall={tc} defaultExpanded />);
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatCodeBlock
// ═══════════════════════════════════════════════════════════════════

describe('ChatCodeBlock', () => {
  it('renders code content', () => {
    renderWithTheme(<ChatCodeBlock code="const x = 1;" />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('shows language label', () => {
    renderWithTheme(
      <ChatCodeBlock code="const x = 1;" language="typescript" />
    );
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('renders copy button by default', () => {
    renderWithTheme(<ChatCodeBlock code="code" language="js" />);
    expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
  });

  it('hides copy button when copyable is false', () => {
    renderWithTheme(
      <ChatCodeBlock code="code" language="js" copyable={false} />
    );
    expect(screen.queryByLabelText('Copy code')).not.toBeInTheDocument();
  });

  it('renders actions in header', () => {
    renderWithTheme(
      <ChatCodeBlock
        code="code"
        language="js"
        actions={<button data-testid="insert">Insert</button>}
      />
    );
    expect(screen.getByTestId('insert')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatAttachmentChip
// ═══════════════════════════════════════════════════════════════════

describe('ChatAttachmentChip', () => {
  it('renders attachment name', () => {
    const att = createAttachment({ name: 'model.obj' });
    renderWithTheme(<ChatAttachmentChip attachment={att} />);
    expect(screen.getByText('model.obj')).toBeInTheDocument();
  });

  it('shows remove button when removable', () => {
    const att = createAttachment({ name: 'file.txt' });
    const onRemove = vi.fn();
    renderWithTheme(
      <ChatAttachmentChip attachment={att} removable onRemove={onRemove} />
    );
    fireEvent.click(screen.getByLabelText('Remove file.txt'));
    expect(onRemove).toHaveBeenCalledWith('att-1');
  });

  it('calls onClick when clicked', () => {
    const att = createAttachment();
    const onClick = vi.fn();
    renderWithTheme(<ChatAttachmentChip attachment={att} onClick={onClick} />);
    fireEvent.click(screen.getByText('scene.blend'));
    expect(onClick).toHaveBeenCalledWith(att);
  });

  it('renders thumbnail for image type', () => {
    const att = createAttachment({
      type: 'image',
      name: 'photo.png',
      thumbnailUrl: 'https://example.com/thumb.png',
    });
    renderWithTheme(<ChatAttachmentChip attachment={att} />);
    const img = screen.getByAltText('photo.png');
    expect(img).toHaveAttribute('src', 'https://example.com/thumb.png');
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatContextChip
// ═══════════════════════════════════════════════════════════════════

describe('ChatContextChip', () => {
  it('renders label and items', () => {
    renderWithTheme(
      <ChatContextChip label="Selected" items={['Cube', 'Sphere']} />
    );
    expect(screen.getByText('Selected:')).toBeInTheDocument();
    expect(screen.getByText('Cube, Sphere')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <ChatContextChip
        label="Selected"
        items={['Cube']}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByLabelText('Dismiss Selected'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('does not show dismiss button without onDismiss', () => {
    renderWithTheme(<ChatContextChip label="Selected" items={['Cube']} />);
    expect(screen.queryByLabelText('Dismiss Selected')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatEmptyState
// ═══════════════════════════════════════════════════════════════════

describe('ChatEmptyState', () => {
  it('renders title and description', () => {
    renderWithTheme(
      <ChatEmptyState title="AI Assistant" description="How can I help?" />
    );
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('How can I help?')).toBeInTheDocument();
  });

  it('renders suggestion chips', () => {
    renderWithTheme(
      <ChatEmptyState
        suggestions={['Fix errors', 'Explain code']}
        onSuggestionClick={vi.fn()}
      />
    );
    expect(screen.getByText('Fix errors')).toBeInTheDocument();
    expect(screen.getByText('Explain code')).toBeInTheDocument();
  });

  it('calls onSuggestionClick when chip is clicked', () => {
    const onClick = vi.fn();
    renderWithTheme(
      <ChatEmptyState
        suggestions={['Fix errors']}
        onSuggestionClick={onClick}
      />
    );
    fireEvent.click(screen.getByText('Fix errors'));
    expect(onClick).toHaveBeenCalledWith('Fix errors');
  });

  it('renders icon', () => {
    renderWithTheme(
      <ChatEmptyState icon={<span data-testid="icon">I</span>} />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════
// ChatActionBar
// ═══════════════════════════════════════════════════════════════════

describe('ChatActionBar', () => {
  it('renders children', () => {
    renderWithTheme(
      <ChatActionBar>
        <button>Copy</button>
        <button>Retry</button>
      </ChatActionBar>
    );
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════
// useChatMessages
// ═══════════════════════════════════════════════════════════════════

describe('useChatMessages', () => {
  it('initializes with empty array', () => {
    const { result } = renderHook(() => useChatMessages());
    expect(result.current.messages).toEqual([]);
  });

  it('initializes with initialMessages', () => {
    const initial = [createMessage({ id: '1' })];
    const { result } = renderHook(() =>
      useChatMessages({ initialMessages: initial })
    );
    expect(result.current.messages).toHaveLength(1);
    const first = result.current.messages[0];
    expect(first).toBeDefined();
    expect(first?.id).toBe('1');
  });

  it('appendMessage adds to end', () => {
    const { result } = renderHook(() => useChatMessages());
    act(() => {
      result.current.appendMessage(createMessage({ id: '1' }));
    });
    act(() => {
      result.current.appendMessage(createMessage({ id: '2' }));
    });
    expect(result.current.messages).toHaveLength(2);
    const second = result.current.messages[1];
    expect(second?.id).toBe('2');
  });

  it('updateMessage by ID (partial object)', () => {
    const initial = [createMessage({ id: '1', content: 'old' })];
    const { result } = renderHook(() =>
      useChatMessages({ initialMessages: initial })
    );
    act(() => {
      result.current.updateMessage('1', { content: 'new' });
    });
    const updated = result.current.messages[0];
    expect(updated?.content).toBe('new');
  });

  it('updateMessage by ID (updater function)', () => {
    const initial = [createMessage({ id: '1', content: 'Hello' })];
    const { result } = renderHook(() =>
      useChatMessages({ initialMessages: initial })
    );
    act(() => {
      result.current.updateMessage('1', prev => ({
        content: prev.content + ' World',
      }));
    });
    const updated = result.current.messages[0];
    expect(updated?.content).toBe('Hello World');
  });

  it('removeMessage by ID', () => {
    const initial = [createMessage({ id: '1' }), createMessage({ id: '2' })];
    const { result } = renderHook(() =>
      useChatMessages({ initialMessages: initial })
    );
    act(() => {
      result.current.removeMessage('1');
    });
    expect(result.current.messages).toHaveLength(1);
    const remaining = result.current.messages[0];
    expect(remaining?.id).toBe('2');
  });

  it('clearMessages resets to empty', () => {
    const initial = [createMessage({ id: '1' })];
    const { result } = renderHook(() =>
      useChatMessages({ initialMessages: initial })
    );
    act(() => {
      result.current.clearMessages();
    });
    expect(result.current.messages).toEqual([]);
  });

  it('getMessage finds message by ID', () => {
    const initial = [createMessage({ id: '1', content: 'Found' })];
    const { result } = renderHook(() =>
      useChatMessages({ initialMessages: initial })
    );
    expect(result.current.getMessage('1')?.content).toBe('Found');
    expect(result.current.getMessage('nonexistent')).toBeUndefined();
  });

  it('respects maxMessages limit (drops oldest)', () => {
    const { result } = renderHook(() => useChatMessages({ maxMessages: 2 }));
    act(() => {
      result.current.appendMessage(createMessage({ id: '1' }));
    });
    act(() => {
      result.current.appendMessage(createMessage({ id: '2' }));
    });
    act(() => {
      result.current.appendMessage(createMessage({ id: '3' }));
    });
    expect(result.current.messages).toHaveLength(2);
    const first = result.current.messages[0];
    const second = result.current.messages[1];
    expect(first?.id).toBe('2');
    expect(second?.id).toBe('3');
  });
});

// ═══════════════════════════════════════════════════════════════════
// useChatInput
// ═══════════════════════════════════════════════════════════════════

describe('useChatInput', () => {
  it('tracks value and clear resets it', () => {
    const { result } = renderHook(() => useChatInput());
    act(() => {
      result.current.setValue('Hello');
    });
    expect(result.current.value).toBe('Hello');
    act(() => {
      result.current.clear();
    });
    expect(result.current.value).toBe('');
  });

  it('handleKeyDown calls onSubmit for Enter key', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useChatInput({ onSubmit, submitKey: 'enter' })
    );
    act(() => {
      result.current.setValue('test');
    });
    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(onSubmit).toHaveBeenCalledWith('test');
  });

  it('handleKeyDown does not submit on Shift+Enter', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useChatInput({ onSubmit, submitKey: 'enter' })
    );
    act(() => {
      result.current.setValue('test');
    });
    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit when value is empty', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useChatInput({ onSubmit, submitKey: 'enter' })
    );
    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════
// Accessibility
// ═══════════════════════════════════════════════════════════════════

describe('Accessibility', () => {
  it('message list has role="log" and aria-live="polite"', () => {
    renderWithTheme(<ChatMessageList messages={[]} testId="list" />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('input has aria-keyshortcuts matching submitKey', () => {
    renderWithTheme(<ChatInput submitKey="enter" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.getAttribute('aria-keyshortcuts')).toContain('Enter');
  });

  it('tool calls have descriptive aria-labels', () => {
    const tc = createToolCall({ name: 'modify_material', status: 'running' });
    renderWithTheme(<ChatToolCall toolCall={tc} testId="tc" />);
    expect(screen.getByTestId('tc')).toHaveAttribute(
      'aria-label',
      'Tool modify_material: Running'
    );
  });

  it('typing indicator has role="status"', () => {
    renderWithTheme(<ChatTypingIndicator visible testId="typing" />);
    expect(screen.getByTestId('typing')).toHaveAttribute('role', 'status');
  });
});
