---
'entangle-ui': minor
---

**v0.7.0 release — addresses the agent-ui audit findings.**

### New components

- **Badge** (primitives): inline status indicator with `subtle`, `solid`, `outline`, and `dot` variants; named or raw colors; optional icon and remove button.
- **TextArea** (primitives): multi-line input with label / helper text / auto-resize (`minRows`/`maxRows`), char counter, and monospace mode. Visual parity with `Input`.
- **Divider** (layout): horizontal/vertical rule with `solid` / `dashed` / `dotted` variants and an optional centered label.
- **Spinner** (feedback): `ring` / `dots` / `pulse` variants; `xs`–`lg` sizes; honors `prefers-reduced-motion`.
- **EmptyState** (feedback): title + description + icon + action slots, `default`/`compact` variants, and a `loading` swap that renders a `Spinner`.
- **PageHeader** (layout): semantic `<header>` with icon, title, subtitle, breadcrumbs, and right-aligned actions.
- **Code** (primitives): small inline `<code>` primitive backed by the new `background.inset` token.
- **ListItem** (layout): list row with leading/trailing slots, selected/active/disabled states, keyboard-activatable when `onClick` is provided.
- **ChatMarkdownRenderer**: opt-in markdown renderer for `ChatMessage.renderContent` (bold/italic/code, lists, blockquotes, fenced code, GFM tables, safe links).

### Bug fixes

- `ChatInput` now allows attachments-only submit — both controlled and uncontrolled paths check `attachments.length` in addition to the trimmed value; the send button stays enabled when attachments are queued.
- `ChatMessageList` auto-scroll is now streaming-aware: `useChatScroll` observes the content element's height via `ResizeObserver`, so the list stays pinned to the bottom when the last message grows token-by-token.
- `SplitPanePanel` now fills its wrapper (`width: 100%; height: 100%; minWidth: 0; minHeight: 0; box-sizing: border-box`) so nested `PanelSurface` / `ScrollArea` children with `height: 100%` lay out correctly.

### New props & APIs

- `ChatMessage.maxWidth` and `ChatPanel.messageMaxWidth` — per-message and panel-level bubble width control via the new public `--etui-chat-message-max-width` CSS variable.
- `ChatMessageList.scrollApiRef` — imperative handle exposing `scrollToBottom`, `scrollTo`, `scrollToElement`, and `isAtBottom` for driving scroll from outside (search results, "jump to top" actions, etc.).
- `useChatScroll` now returns `scrollContentRef`, `scrollTo`, and `scrollToElement` alongside the existing API.
- `useChatInput` accepts `attachmentsCount` for attachments-only submit support.
- `Tabs.keepMounted` — parent-level cascade so every `TabPanel` stays mounted unless a child explicitly sets `keepMounted={false}`.

### New theme tokens

- `colors.background.inset` — sunken surface for inline code, textarea backgrounds, and recessed preview areas.
- `colors.surface.row` / `colors.surface.rowHover` — list-row backgrounds that are lighter than `surface.hover` (which is reserved for interactive controls like buttons).

### Developer experience

- `ThemeProvider` now accepts `globalScrollbars` (opt-in) which toggles consistent dark-theme scrollbar styling on `document.body`.
- Shared animation utilities (`animSpin`, `animPulse`, `animBlink`, `animFadeIn`) and keyframes (`spinKeyframe`, `pulseKeyframe`, `blinkKeyframe`, `fadeInKeyframe`) exported from the root. Each utility honors `prefers-reduced-motion`.

No breaking changes.
