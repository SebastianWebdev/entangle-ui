# ChatPanel

> Complete chat interface system for AI assistant integration with messages, input, tool calls, code blocks, and attachments.

A comprehensive chat interface system designed for AI assistant integration in editor applications. ChatPanel is the layout container, and the module exports a full suite of components for building rich conversational UIs: message lists, chat bubbles, input with attachments, typing indicators, tool call displays, code blocks, and empty states. Also includes hooks for managing message state, input behavior, and auto-scroll.

**Live Preview**

## Import

```tsx
import {
  ChatPanel,
  ChatMessageList,
  ChatMessage,
  ChatBubble,
  ChatInput,
  ChatTypingIndicator,
  ChatToolCall,
  ChatCodeBlock,
  ChatMarkdownRenderer,
  ChatAttachmentChip,
  ChatContextChip,
  ChatEmptyState,
  ChatActionBar,
  ChatInputToolbar,
  useChatMessages,
  useChatInput,
  useChatScroll,
} from 'entangle-ui';
```

For consumers driving scroll imperatively, also import the API type:

```tsx
import type { ChatMessageListScrollApi } from 'entangle-ui';
```

## Usage

```tsx
const { messages, appendMessage, updateMessage } = useChatMessages();

<ChatPanel density="comfortable">
  <ChatMessageList
    messages={messages}
    emptyState={
      <ChatEmptyState
        title="How can I help?"
        description="Ask me anything about your scene."
        suggestions={['Create a cube', 'Change material', 'Add lighting']}
        onSuggestionClick={s => handleSend(s)}
      />
    }
  />
  <ChatInput
    onSubmit={value => handleSend(value)}
    placeholder="Ask the assistant..."
    streaming={isStreaming}
    onStop={handleStop}
  />
</ChatPanel>;
```

## Components

### ChatPanel

The root layout container that controls spacing density. Wrap all other chat components inside it.

```tsx
<ChatPanel density="comfortable">
  {/* ChatMessageList, ChatInput, etc. */}
</ChatPanel>
```

| Density       | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `comfortable` | More spacing and larger bubbles. Use for side panels and fullscreen. |
| `compact`     | Tight spacing. Use for bottom panels and constrained areas.          |

### ChatMessageList

Renders an array of messages with auto-scroll behavior. Accepts a custom `renderMessage` function for full control over individual message rendering.

```tsx
<ChatMessageList
  messages={messages}
  autoScroll={true}
  emptyState={<ChatEmptyState title="No messages yet" />}
  renderMessage={(message, index) => (
    <ChatMessage key={message.id} message={message} showTimestamp showAvatar />
  )}
/>
```

### ChatMessage

Renders a single message with avatar, timestamp, and action buttons. Supports a custom content renderer for markdown, LaTeX, or other rich formats.

```tsx
<ChatMessage
  message={message}
  showTimestamp
  showAvatar
  actions={
    <ChatActionBar>
      <button onClick={handleCopy}>Copy</button>
      <button onClick={handleRetry}>Retry</button>
    </ChatActionBar>
  }
  renderContent={content => <MarkdownRenderer>{content}</MarkdownRenderer>}
/>
```

### ChatBubble

Low-level bubble component with role-based alignment and coloring. Use for custom message layouts.

```tsx
<ChatBubble role="user">Hello, can you help?</ChatBubble>
<ChatBubble role="assistant">Of course! What do you need?</ChatBubble>
<ChatBubble role="system">Session started</ChatBubble>
```

### ChatInput

Multi-line input with submit/stop button, attachment chips, and configurable submit key. Auto-resizes from 1 line up to `maxLines`.

```tsx
<ChatInput
  value={input}
  onChange={setInput}
  onSubmit={handleSubmit}
  onStop={handleStop}
  streaming={isStreaming}
  placeholder="Type a message..."
  submitKey="enter"
  maxLines={6}
  attachments={attachments}
  onRemoveAttachment={handleRemoveAttachment}
  toolbar={
    <ChatInputToolbar>
      <button onClick={handleUpload}>Attach File</button>
    </ChatInputToolbar>
  }
/>
```

#### Attachments-only submit

When the textarea is empty, submit is allowed if at least one attachment is queued. The send button stays enabled and `onSubmit` fires with `('', attachments)`. Both controlled and uncontrolled modes honor this — no extra prop needed.

### ChatTypingIndicator

Animated indicator shown while the assistant is generating a response.

```tsx
<ChatTypingIndicator visible={isStreaming} label="Thinking..." variant="dots" />
```

### ChatToolCall

Displays a tool/function invocation with expandable input/output details.

```tsx
<ChatToolCall
  toolCall={{
    id: '1',
    name: 'create_cube',
    status: 'completed',
    input: { size: 2 },
    output: { nodeId: 'cube_01' },
    durationMs: 120,
  }}
  collapsible
  defaultExpanded={false}
/>
```

### ChatCodeBlock

Code display with optional syntax highlighting, line numbers, copy button, and custom action buttons.

```tsx
<ChatCodeBlock
  code={`const mesh = new THREE.Mesh(geometry, material);`}
  language="typescript"
  copyable
  lineNumbers
  maxHeight={400}
  actions={<button onClick={handleInsert}>Insert</button>}
/>
```

### ChatMarkdownRenderer

Lightweight built-in markdown renderer designed to be passed to `ChatMessage.renderContent`. Covers what assistant LLMs typically produce: paragraphs, headings, lists, blockquotes, horizontal rules, inline emphasis / code, links (rendered with `rel="noopener noreferrer"` by default), fenced code blocks, and GFM pipe tables.

```tsx
<ChatMessage
  message={msg}
  renderContent={content => <ChatMarkdownRenderer content={content} />}
/>
```

| Prop         | Type                  | Default    | Description                                             |
| ------------ | --------------------- | ---------- | ------------------------------------------------------- |
| `content`    | `string`              | —          | Raw markdown content.                                   |
| `gfm`        | `boolean`             | `true`     | Enable GitHub-flavored markdown extensions (tables).    |
| `linkTarget` | `'_self' \| '_blank'` | `'_blank'` | Link target. `_blank` adds `rel="noopener noreferrer"`. |
| `components` | partial overrides     | —          | Replace `code` / `codeBlock` / `link` renderers.        |

Inline code uses the [`Code`](/components/primitives/code) primitive; fenced code blocks use `ChatCodeBlock`. Tables and headings pick up theme tokens automatically.

For full CommonMark / advanced GFM support, swap in your own renderer via `renderContent` — the API stays the same.

### ChatAttachmentChip

Displays an attached file, image, code snippet, or selection as a chip.

```tsx
<ChatAttachmentChip
  attachment={{ id: '1', name: 'scene.glb', type: 'file', size: 1024000 }}
  removable
  onRemove={id => handleRemove(id)}
  onClick={attachment => handlePreview(attachment)}
/>
```

### ChatContextChip

Displays editor context (e.g., selected objects, active file) as a labeled chip.

```tsx
<ChatContextChip
  label="Selected"
  items={['Cube', 'Sphere', 'Light']}
  icon={<SelectionIcon />}
  onDismiss={handleDismiss}
/>
```

### ChatEmptyState

Shown when the message list is empty. Includes optional suggestion chips.

```tsx
<ChatEmptyState
  title="Start a conversation"
  description="Ask me to modify your scene, generate code, or explain concepts."
  suggestions={['Add a spotlight', 'Optimize materials', 'Export scene']}
  onSuggestionClick={suggestion => handleSend(suggestion)}
/>
```

### ChatActionBar

Horizontal row of action buttons shown below a message.

```tsx
<ChatActionBar>
  <button>Copy</button>
  <button>Retry</button>
  <button>Apply to Scene</button>
</ChatActionBar>
```

### ChatInputToolbar

Horizontal row of action buttons rendered below the chat input area.

```tsx
<ChatInputToolbar>
  <button>Attach File</button>
  <button>Add Context</button>
</ChatInputToolbar>
```

## Customizing the message bubble width

Message bubbles default to `max-width: 85%` of the message row. You can change this at three levels:

```tsx
// Global default — set the public CSS variable in your own stylesheet:
:root { --etui-chat-message-max-width: 720px; }

// Panel-level cascade:
<ChatPanel messageMaxWidth="100%">…</ChatPanel>

// Per-message override:
<ChatMessage maxWidth={500} message={msg} />
```

Numbers are interpreted as pixels (`500` → `500px`); strings are passed through verbatim (`"60ch"`, `"70%"`, …). Per-message wins over the panel cascade, which wins over the global CSS variable, which wins over the library default.

## Hooks

### useChatMessages

Manages the chat message array state with convenience methods.

```tsx
const {
  messages,
  setMessages,
  appendMessage,
  updateMessage,
  removeMessage,
  clearMessages,
  getMessage,
} = useChatMessages({
  initialMessages: [],
  maxMessages: 200,
});
```

### useChatInput

Manages textarea input state with auto-resize and submit key handling.

```tsx
const { value, setValue, clear, textareaRef, handleKeyDown, handleChange } =
  useChatInput({
    submitKey: 'enter',
    maxLines: 6,
    onSubmit: value => handleSend(value),
    attachmentsCount: attachments.length, // allows attachments-only submit
  });
```

The optional `attachmentsCount` lets the submit gate fire `onSubmit('')` when the textarea is empty but attachments are queued. Defaults to `0`.

### useChatScroll

Manages auto-scroll behavior for the message list. Pauses when the user scrolls up and resumes when they scroll back to the bottom. Streaming-aware: an internal `ResizeObserver` watches the content element so the list stays pinned while a single message grows token-by-token (no `messages.length` change required).

```tsx
const {
  scrollContainerRef,
  scrollContentRef,
  isAtBottom,
  hasNewMessages,
  scrollToBottom,
  scrollTo,
  scrollToElement,
} = useChatScroll({
  messages,
  enabled: true,
  threshold: 100,
});
```

| Returned ref         | Where to attach                                                  |
| -------------------- | ---------------------------------------------------------------- |
| `scrollContainerRef` | The scroll container (the element with `overflow: auto`).        |
| `scrollContentRef`   | The inner content element whose height grows as content streams. |

`ChatMessageList` wires both refs internally — you only need this hook directly if you're building a custom message list shell.

### Imperative scroll API on ChatMessageList

Drive scroll position from outside the list by passing `scrollApiRef`:

```tsx
import type { ChatMessageListScrollApi } from 'entangle-ui';

const scrollApi = useRef<ChatMessageListScrollApi>(null);

<ChatMessageList scrollApiRef={scrollApi} messages={messages} />;

// Later — e.g., from a search panel:
scrollApi.current?.scrollToBottom('smooth');
scrollApi.current?.scrollToElement(messageEl, { block: 'center' });
const atBottom = scrollApi.current?.isAtBottom();
```

The DOM `ref` on `ChatMessageList` still points to the scroll container element — `scrollApiRef` is intentionally separate so methods don't overload the DOM ref.

## Props

### ChatPanel

| Prop                    | Type                         | Default         | Description                                                                                                                                                                          |
| ----------------------- | ---------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `density`               | `'comfortable' \| 'compact'` | `'comfortable'` | Visual density of the chat layout. Comfortable has more spacing for side panels; compact is for constrained areas.                                                                   |
| `messageMaxWidth`       | `number \| string`           | —               | Maximum width of message bubbles inside this panel. Cascades to every ChatMessage via the --etui-chat-message-max-width CSS variable. Numbers are pixels; strings are used verbatim. |
| `children` _(required)_ | `ReactNode`                  | —               | Panel content, typically ChatMessageList and ChatInput.                                                                                                                              |
| `className`             | `string`                     | —               | Additional CSS class names.                                                                                                                                                          |
| `style`                 | `CSSProperties`              | —               | Inline styles.                                                                                                                                                                       |
| `testId`                | `string`                     | —               | Test identifier for automated testing.                                                                                                                                               |
| `ref`                   | `Ref`                        | —               | Ref to the root element.                                                                                                                                                             |

### ChatMessageList

| Prop                    | Type                                                     | Default | Description                                                                                                      |
| ----------------------- | -------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `messages` _(required)_ | `ChatMessageData[]`                                      | —       | Array of messages to render.                                                                                     |
| `renderMessage`         | `(message: ChatMessageData, index: number) => ReactNode` | —       | Custom renderer for individual messages.                                                                         |
| `emptyState`            | `ReactNode`                                              | —       | Content shown when the messages array is empty.                                                                  |
| `autoScroll`            | `boolean`                                                | `true`  | Auto-scroll to bottom on new messages and during streaming. Pauses when user scrolls up, resumes at bottom.      |
| `scrollApiRef`          | `Ref`                                                    | —       | Imperative handle exposing scrollToBottom, scrollTo, scrollToElement, and isAtBottom. Separate from the DOM ref. |
| `className`             | `string`                                                 | —       | Additional CSS class names.                                                                                      |
| `style`                 | `CSSProperties`                                          | —       | Inline styles.                                                                                                   |
| `testId`                | `string`                                                 | —       | Test identifier for automated testing.                                                                           |

### ChatMessage

| Prop                   | Type                             | Default | Description                                                                                                                           |
| ---------------------- | -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `message` _(required)_ | `ChatMessageData`                | —       | Message data object.                                                                                                                  |
| `showTimestamp`        | `boolean`                        | —       | Show timestamp below the message content.                                                                                             |
| `showAvatar`           | `boolean`                        | —       | Show avatar next to the message.                                                                                                      |
| `actions`              | `ReactNode`                      | —       | Action buttons rendered below the message (typically a ChatActionBar).                                                                |
| `renderContent`        | `(content: string) => ReactNode` | —       | Custom content renderer for markdown, LaTeX, or other rich formats. Pair with ChatMarkdownRenderer for built-in markdown support.     |
| `maxWidth`             | `number \| string`               | —       | Per-message bubble max width. Overrides ChatPanel.messageMaxWidth and the 85% default. Numbers are pixels; strings are used verbatim. |
| `className`            | `string`                         | —       | Additional CSS class names.                                                                                                           |
| `style`                | `CSSProperties`                  | —       | Inline styles.                                                                                                                        |
| `testId`               | `string`                         | —       | Test identifier for automated testing.                                                                                                |

### ChatInput

| Prop                 | Type                                                         | Default   | Description                                                                        |
| -------------------- | ------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------- |
| `value`              | `string`                                                     | —         | Current input value (controlled).                                                  |
| `onChange`           | `(value: string) => void`                                    | —         | Change handler for controlled usage.                                               |
| `onSubmit`           | `(value: string, attachments: ChatAttachmentData[]) => void` | —         | Called when the user submits the message.                                          |
| `onStop`             | `() => void`                                                 | —         | Called when the user clicks the stop generation button.                            |
| `placeholder`        | `string`                                                     | —         | Placeholder text for the input.                                                    |
| `streaming`          | `boolean`                                                    | `false`   | Whether the assistant is currently streaming. Shows stop button instead of send.   |
| `disabled`           | `boolean`                                                    | —         | Disable the input.                                                                 |
| `submitKey`          | `'enter' \| 'ctrl+enter'`                                    | `'enter'` | Key combination that submits the message. The other combination inserts a newline. |
| `maxLines`           | `number`                                                     | `6`       | Maximum visible lines before the input scrolls.                                    |
| `attachments`        | `ChatAttachmentData[]`                                       | —         | Currently attached items shown as chips above the input.                           |
| `onRemoveAttachment` | `(attachmentId: string) => void`                             | —         | Called when user removes an attachment chip.                                       |
| `prefix`             | `ReactNode`                                                  | —         | Content rendered before the textarea (e.g., context chips).                        |
| `suffix`             | `ReactNode`                                                  | —         | Content rendered after the textarea (e.g., additional action buttons).             |
| `toolbar`            | `ReactNode`                                                  | —         | Toolbar rendered below the input area (use ChatInputToolbar as the wrapper).       |
| `className`          | `string`                                                     | —         | Additional CSS class names.                                                        |
| `style`              | `CSSProperties`                                              | —         | Inline styles.                                                                     |
| `testId`             | `string`                                                     | —         | Test identifier for automated testing.                                             |

### ChatTypingIndicator

| Prop        | Type                | Default         | Description                                            |
| ----------- | ------------------- | --------------- | ------------------------------------------------------ |
| `label`     | `string`            | `'Thinking...'` | Label shown alongside the animation.                   |
| `variant`   | `'dots' \| 'pulse'` | `'dots'`        | Animation style: three animated dots or a pulsing bar. |
| `visible`   | `boolean`           | —               | Whether the indicator is visible.                      |
| `className` | `string`            | —               | Additional CSS class names.                            |
| `style`     | `CSSProperties`     | —               | Inline styles.                                         |
| `testId`    | `string`            | —               | Test identifier for automated testing.                 |

### ChatToolCall

| Prop                    | Type                                             | Default | Description                                                                      |
| ----------------------- | ------------------------------------------------ | ------- | -------------------------------------------------------------------------------- |
| `toolCall` _(required)_ | `ChatToolCallData`                               | —       | Tool call data object with id, name, status, input, output, error, and duration. |
| `collapsible`           | `boolean`                                        | `true`  | Whether the input/output details can be expanded.                                |
| `defaultExpanded`       | `boolean`                                        | `false` | Whether details are initially expanded.                                          |
| `icon`                  | `ReactNode`                                      | —       | Custom icon for the tool (defaults to a wrench icon).                            |
| `renderOutput`          | `(output: Record<string, unknown>) => ReactNode` | —       | Custom renderer for the tool output.                                             |
| `className`             | `string`                                         | —       | Additional CSS class names.                                                      |
| `style`                 | `CSSProperties`                                  | —       | Inline styles.                                                                   |
| `testId`                | `string`                                         | —       | Test identifier for automated testing.                                           |

### ChatCodeBlock

| Prop                | Type            | Default | Description                                                          |
| ------------------- | --------------- | ------- | -------------------------------------------------------------------- |
| `code` _(required)_ | `string`        | —       | Code content to display.                                             |
| `language`          | `string`        | —       | Programming language for syntax highlighting.                        |
| `copyable`          | `boolean`       | `true`  | Show a copy-to-clipboard button.                                     |
| `lineNumbers`       | `boolean`       | `false` | Show line numbers.                                                   |
| `maxHeight`         | `number`        | `400`   | Maximum visible height in pixels before the block scrolls.           |
| `actions`           | `ReactNode`     | —       | Actions rendered in the code block header alongside the copy button. |
| `className`         | `string`        | —       | Additional CSS class names.                                          |
| `style`             | `CSSProperties` | —       | Inline styles.                                                       |
| `testId`            | `string`        | —       | Test identifier for automated testing.                               |

### ChatAttachmentChip

| Prop                      | Type                                       | Default | Description                                                |
| ------------------------- | ------------------------------------------ | ------- | ---------------------------------------------------------- |
| `attachment` _(required)_ | `ChatAttachmentData`                       | —       | Attachment data object.                                    |
| `onRemove`                | `(id: string) => void`                     | —       | Called when the remove button is clicked.                  |
| `onClick`                 | `(attachment: ChatAttachmentData) => void` | —       | Called when the chip itself is clicked (e.g., to preview). |
| `removable`               | `boolean`                                  | `false` | Whether to show the remove button.                         |
| `className`               | `string`                                   | —       | Additional CSS class names.                                |
| `style`                   | `CSSProperties`                            | —       | Inline styles.                                             |
| `testId`                  | `string`                                   | —       | Test identifier for automated testing.                     |

### ChatContextChip

| Prop                 | Type            | Default | Description                                                     |
| -------------------- | --------------- | ------- | --------------------------------------------------------------- |
| `label` _(required)_ | `string`        | —       | Label describing the context (e.g., "Selected", "Active file"). |
| `items` _(required)_ | `string[]`      | —       | Items in this context group.                                    |
| `icon`               | `ReactNode`     | —       | Icon shown before the label.                                    |
| `onDismiss`          | `() => void`    | —       | Called when the chip is dismissed.                              |
| `className`          | `string`        | —       | Additional CSS class names.                                     |
| `style`              | `CSSProperties` | —       | Inline styles.                                                  |
| `testId`             | `string`        | —       | Test identifier for automated testing.                          |

### ChatEmptyState

| Prop                | Type                           | Default | Description                                                        |
| ------------------- | ------------------------------ | ------- | ------------------------------------------------------------------ |
| `title`             | `string`                       | —       | Main heading text.                                                 |
| `description`       | `string`                       | —       | Supporting description text.                                       |
| `icon`              | `ReactNode`                    | —       | Icon or illustration.                                              |
| `suggestions`       | `string[]`                     | —       | Quick-start suggestion chips that populate the input when clicked. |
| `onSuggestionClick` | `(suggestion: string) => void` | —       | Called when a suggestion chip is clicked.                          |
| `className`         | `string`                       | —       | Additional CSS class names.                                        |
| `style`             | `CSSProperties`                | —       | Inline styles.                                                     |
| `testId`            | `string`                       | —       | Test identifier for automated testing.                             |

## Data Types

### ChatMessageData

```tsx
interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  status: 'complete' | 'streaming' | 'error' | 'pending';
  timestamp: string; // ISO 8601
  attachments?: ChatAttachmentData[];
  toolCalls?: ChatToolCallData[];
  avatar?: string;
  displayName?: string;
}
```

### ChatAttachmentData

```tsx
interface ChatAttachmentData {
  id: string;
  name: string;
  type: 'file' | 'image' | 'code' | 'selection';
  mimeType?: string;
  size?: number;
  thumbnailUrl?: string;
  content?: string;
  meta?: Record<string, unknown>;
}
```

### ChatToolCallData

```tsx
interface ChatToolCallData {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
}
```
