import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';

// ─── Message Roles ───────────────────────────────────────────────

/**
 * Standard message roles in an LLM conversation.
 * - `user`: Human input
 * - `assistant`: LLM response
 * - `system`: Informational/status messages
 * - `tool`: Tool call invocation and result
 */
export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'tool';

// ─── Message Status ──────────────────────────────────────────────

/**
 * Visual status of a message.
 * - `complete`: Fully received / sent
 * - `streaming`: Currently receiving tokens
 * - `error`: Failed to send or receive
 * - `pending`: Queued, not yet sent
 */
export type ChatMessageStatus = 'complete' | 'streaming' | 'error' | 'pending';

// ─── Tool Call Status ────────────────────────────────────────────

/**
 * Execution status of a tool invocation.
 */
export type ChatToolCallStatus = 'pending' | 'running' | 'completed' | 'error';

// ─── Attachment ──────────────────────────────────────────────────

/**
 * File or editor context attached to a message.
 */
export interface ChatAttachmentData {
  /** Unique identifier */
  id: string;
  /** Display name shown in the chip */
  name: string;
  /**
   * Attachment category
   * - `file`: Generic file (document, config, etc.)
   * - `image`: Image with thumbnail preview
   * - `code`: Code snippet from the editor
   * - `selection`: Selected objects/entities from the editor scene
   */
  type: 'file' | 'image' | 'code' | 'selection';
  /** MIME type for file/image attachments */
  mimeType?: string;
  /** File size in bytes */
  size?: number;
  /** Thumbnail URL for image type */
  thumbnailUrl?: string;
  /** Raw content for code/selection type */
  content?: string;
  /** Additional metadata (consumer-defined) */
  meta?: Record<string, unknown>;
}

// ─── Tool Call ───────────────────────────────────────────────────

/**
 * Represents a single tool/function invocation within a message.
 */
export interface ChatToolCallData {
  /** Unique identifier */
  id: string;
  /** Tool/function name (e.g., "create_nodes", "modify_material") */
  name: string;
  /** Current execution status */
  status: ChatToolCallStatus;
  /** Input parameters passed to the tool */
  input?: Record<string, unknown>;
  /** Result returned by the tool */
  output?: Record<string, unknown>;
  /** Error message if status is 'error' */
  error?: string;
  /** Duration of execution in milliseconds */
  durationMs?: number;
}

// ─── Message ─────────────────────────────────────────────────────

/**
 * A single message in the chat conversation.
 *
 * This is a data type — the component library does not manage
 * message creation or persistence. The consumer provides messages
 * as props or via the `useChatMessages` UI state hook.
 */
export interface ChatMessageData {
  /** Unique message identifier */
  id: string;
  /** Who sent the message */
  role: ChatMessageRole;
  /** Text content (may contain markdown) */
  content: string;
  /** Visual/delivery status */
  status: ChatMessageStatus;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Attached files or editor context */
  attachments?: ChatAttachmentData[];
  /** Tool invocations within this message (assistant role only) */
  toolCalls?: ChatToolCallData[];
  /** Avatar URL or initials fallback */
  avatar?: string;
  /** Display name */
  displayName?: string;
}

// ─── Component Props ─────────────────────────────────────────────

// --- ChatPanel ---

export type ChatPanelDensity = 'comfortable' | 'compact';

interface ChatPanelBaseProps extends BaseComponent {
  /**
   * Visual density of the chat layout.
   * - `comfortable`: More spacing, larger bubbles (side panel, fullscreen)
   * - `compact`: Tight spacing for bottom panels and constrained areas
   * @default "comfortable"
   */
  density?: ChatPanelDensity;
  /** Panel content — typically ChatMessageList + ChatInput */
  children: React.ReactNode;
}

export type ChatPanelProps = Prettify<ChatPanelBaseProps>;

// --- ChatMessageList ---

interface ChatMessageListBaseProps extends BaseComponent {
  /** Array of messages to render */
  messages: ChatMessageData[];
  /**
   * Custom renderer for a single message.
   * Allows full control over message appearance while keeping
   * list behavior (scroll) managed by the component.
   */
  renderMessage?: (message: ChatMessageData, index: number) => React.ReactNode;
  /** Content shown when messages array is empty */
  emptyState?: React.ReactNode;
  /**
   * Enable auto-scroll to bottom on new messages.
   * Auto-scroll pauses when user scrolls up and resumes
   * when user scrolls back to bottom.
   * @default true
   */
  autoScroll?: boolean;
}

export type ChatMessageListProps = Prettify<ChatMessageListBaseProps>;

// --- ChatMessage ---

interface ChatMessageBaseProps extends BaseComponent {
  /** Message data */
  message: ChatMessageData;
  /** Show timestamp below the message */
  showTimestamp?: boolean;
  /** Show avatar next to the message */
  showAvatar?: boolean;
  /**
   * Actions rendered below the message content.
   * Typically: copy, retry, edit, "apply to scene", etc.
   */
  actions?: React.ReactNode;
  /**
   * Custom renderer for message content.
   * Receives raw content string, returns rendered output.
   * Use for custom markdown rendering, LaTeX, etc.
   */
  renderContent?: (content: string) => React.ReactNode;
}

export type ChatMessageProps = Prettify<ChatMessageBaseProps>;

// --- ChatBubble ---

interface ChatBubbleBaseProps extends BaseComponent {
  /**
   * Visual role determines alignment and color scheme.
   * @default "assistant"
   */
  role?: ChatMessageRole;
  /** Content inside the bubble */
  children: React.ReactNode;
}

export type ChatBubbleProps = Prettify<ChatBubbleBaseProps>;

// --- ChatInput ---

interface ChatInputBaseProps extends Omit<
  BaseComponent,
  'prefix' | 'onChange' | 'onSubmit'
> {
  /** Current input value (controlled) */
  value?: string;
  /** Change handler for controlled usage */
  onChange?: (value: string) => void;
  /** Called when user submits the message */
  onSubmit?: (value: string, attachments: ChatAttachmentData[]) => void;
  /** Called when user clicks "stop generation" */
  onStop?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /**
   * Whether the assistant is currently streaming a response.
   * When true, shows stop button instead of send button.
   * @default false
   */
  streaming?: boolean;
  /** Disable input (e.g. during connection issues) */
  disabled?: boolean;
  /**
   * Key combination that submits the message.
   * The other combination always inserts a newline.
   * - `enter`: Enter submits, Shift+Enter for newline
   * - `ctrl+enter`: Ctrl/Cmd+Enter submits, Enter for newline
   * @default "enter"
   */
  submitKey?: 'enter' | 'ctrl+enter';
  /**
   * Maximum number of visible lines before the input scrolls.
   * Input auto-resizes from 1 line up to this maximum.
   * @default 6
   */
  maxLines?: number;
  /** Currently attached items shown as chips above the input */
  attachments?: ChatAttachmentData[];
  /** Called when user removes an attachment chip */
  onRemoveAttachment?: (attachmentId: string) => void;
  /** Content rendered before the textarea (e.g., context chips) */
  prefix?: React.ReactNode;
  /** Content rendered after the textarea (e.g., additional action buttons) */
  suffix?: React.ReactNode;
  /**
   * Toolbar rendered below the input area.
   * Use `ChatInputToolbar` as a layout wrapper for action buttons
   * (e.g., file upload, menus, formatting options).
   */
  toolbar?: React.ReactNode;
}

export type ChatInputProps = Prettify<ChatInputBaseProps>;

// --- ChatTypingIndicator ---

interface ChatTypingIndicatorBaseProps extends BaseComponent {
  /**
   * Label shown alongside the animation.
   * @default "Thinking..."
   */
  label?: string;
  /**
   * Visual style of the indicator.
   * - `dots`: Three animated dots (default)
   * - `pulse`: Pulsing bar
   * @default "dots"
   */
  variant?: 'dots' | 'pulse';
  /** Whether the indicator is visible */
  visible?: boolean;
}

export type ChatTypingIndicatorProps = Prettify<ChatTypingIndicatorBaseProps>;

// --- ChatToolCall ---

interface ChatToolCallBaseProps extends BaseComponent {
  /** Tool call data */
  toolCall: ChatToolCallData;
  /**
   * Whether the input/output details can be expanded.
   * @default true
   */
  collapsible?: boolean;
  /**
   * Whether details are initially expanded.
   * @default false
   */
  defaultExpanded?: boolean;
  /** Custom icon for the tool (defaults to a wrench icon) */
  icon?: React.ReactNode;
  /**
   * Custom renderer for tool output.
   * Receives the output object, returns rendered visualization.
   */
  renderOutput?: (output: Record<string, unknown>) => React.ReactNode;
}

export type ChatToolCallProps = Prettify<ChatToolCallBaseProps>;

// --- ChatCodeBlock ---

interface ChatCodeBlockBaseProps extends BaseComponent {
  /** Code content */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /**
   * Show a copy-to-clipboard button.
   * @default true
   */
  copyable?: boolean;
  /**
   * Show line numbers.
   * @default false
   */
  lineNumbers?: boolean;
  /**
   * Maximum visible height in pixels before the block scrolls.
   * @default 400
   */
  maxHeight?: number;
  /**
   * Actions rendered in the code block header (e.g., "Insert", "Apply").
   * Rendered alongside the copy button and language label.
   */
  actions?: React.ReactNode;
}

export type ChatCodeBlockProps = Prettify<ChatCodeBlockBaseProps>;

// --- ChatAttachment (chip) ---

interface ChatAttachmentBaseProps extends Omit<BaseComponent, 'onClick'> {
  /** Attachment data */
  attachment: ChatAttachmentData;
  /** Called when the remove button is clicked */
  onRemove?: (id: string) => void;
  /** Called when the chip itself is clicked (e.g., to preview) */
  onClick?: (attachment: ChatAttachmentData) => void;
  /**
   * Whether to show the remove (×) button.
   * @default false
   */
  removable?: boolean;
}

export type ChatAttachmentChipProps = Prettify<ChatAttachmentBaseProps>;

// --- ChatContextChip ---

interface ChatContextChipBaseProps extends BaseComponent {
  /** Label describing the context (e.g., "Selected", "Active file") */
  label: string;
  /** Items in this context group */
  items: string[];
  /** Icon shown before the label */
  icon?: React.ReactNode;
  /** Called when the chip is dismissed */
  onDismiss?: () => void;
}

export type ChatContextChipProps = Prettify<ChatContextChipBaseProps>;

// --- ChatEmptyState ---

interface ChatEmptyStateBaseProps extends BaseComponent {
  /** Main heading */
  title?: string;
  /** Supporting description */
  description?: string;
  /** Icon or illustration */
  icon?: React.ReactNode;
  /**
   * Quick-start suggestion chips.
   * Each string becomes a clickable chip that populates the input.
   */
  suggestions?: string[];
  /** Called when a suggestion chip is clicked */
  onSuggestionClick?: (suggestion: string) => void;
}

export type ChatEmptyStateProps = Prettify<ChatEmptyStateBaseProps>;

// --- ChatActionBar ---

interface ChatActionBarBaseProps extends BaseComponent {
  /** Action buttons rendered in a horizontal row */
  children: React.ReactNode;
}

export type ChatActionBarProps = Prettify<ChatActionBarBaseProps>;

// --- ChatInputToolbar ---

interface ChatInputToolbarBaseProps extends BaseComponent {
  /** Action buttons rendered in a horizontal row below the input */
  children: React.ReactNode;
}

export type ChatInputToolbarProps = Prettify<ChatInputToolbarBaseProps>;

// ─── Hook Types ──────────────────────────────────────────────────

export interface UseChatMessagesOptions {
  /** Initial messages to populate the list */
  initialMessages?: ChatMessageData[];
  /**
   * Maximum number of messages to keep in state.
   * Oldest messages are dropped when limit is exceeded.
   * @default undefined (no limit)
   */
  maxMessages?: number;
}

export interface UseChatMessagesReturn {
  /** Current message array */
  messages: ChatMessageData[];
  /** Replace the entire message array */
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageData[]>>;
  /** Append a new message to the end */
  appendMessage: (message: ChatMessageData) => void;
  /**
   * Update a message by ID.
   * Accepts a partial update or an updater function.
   */
  updateMessage: (
    id: string,
    update:
      | Partial<ChatMessageData>
      | ((prev: ChatMessageData) => Partial<ChatMessageData>)
  ) => void;
  /** Remove a message by ID */
  removeMessage: (id: string) => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Find a message by ID */
  getMessage: (id: string) => ChatMessageData | undefined;
}

export interface UseChatInputOptions {
  /**
   * Key combo that triggers submit.
   * @default "enter"
   */
  submitKey?: 'enter' | 'ctrl+enter';
  /** Called when submit key is pressed and input is non-empty */
  onSubmit?: (value: string) => void;
  /**
   * Maximum visible rows before scrolling.
   * @default 6
   */
  maxLines?: number;
}

export interface UseChatInputReturn {
  /** Current input value */
  value: string;
  /** Update input value */
  setValue: (value: string) => void;
  /** Clear input and reset height */
  clear: () => void;
  /** Ref to attach to the textarea element */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Keyboard event handler — attach to textarea's onKeyDown */
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Change event handler — attach to textarea's onChange */
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface UseChatScrollOptions {
  /** Message array — scroll triggers when length changes */
  messages: ChatMessageData[];
  /**
   * Enable auto-scroll to bottom on new messages.
   * @default true
   */
  enabled?: boolean;
  /**
   * Pixel threshold from the bottom to consider "at bottom".
   * @default 100
   */
  threshold?: number;
}

export interface UseChatScrollReturn {
  /** Ref to attach to the scrollable container element */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Whether the user is currently scrolled to the bottom */
  isAtBottom: boolean;
  /** Whether there are new messages below the current scroll position */
  hasNewMessages: boolean;
  /** Programmatically scroll to the bottom */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}
