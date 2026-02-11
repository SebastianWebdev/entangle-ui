---
'entangle-ui': minor
---

Add ChatPanel component set for AI assistant chat interfaces.

**New components:**

- `ChatPanel` — top-level container with density variants (`compact` | `default` | `comfortable`)
- `ChatMessageList` — scrollable message list with auto-scroll and sticky date headers
- `ChatMessage` — single message row with role-based alignment, error state with red tint
- `ChatBubble` — styled message bubble (user / assistant / system)
- `ChatInput` — multiline input with bottom toolbar, themed scrollbar, and submit handling
- `ChatInputToolbar` — action bar below the input (attach, context, model picker)
- `ChatTypingIndicator` — animated dot indicator for assistant responses
- `ChatToolCall` — expandable tool/function call display with status badge
- `ChatCodeBlock` — syntax-highlighted code block with copy button
- `ChatAttachmentChip` — file attachment chip with icon, name, and remove action
- `ChatContextChip` — context reference chip (file, selection, symbol)
- `ChatEmptyState` — placeholder shown when conversation is empty
- `ChatActionBar` — per-message action bar (copy, retry, edit)

**New hooks:**

- `useChatMessages` — message list state management (add, update, remove, clear)
- `useChatInput` — input state with submit, history navigation, and composition handling
- `useChatScroll` — auto-scroll with scroll-to-bottom detection and manual override

**New icons:**

- `AiChatIcon` — chat bubble with sparkle accent
- `AiSparklesIcon` — three 4-pointed sparkle stars (enlarged for better visibility)
- `RobotIcon` — robot face icon
