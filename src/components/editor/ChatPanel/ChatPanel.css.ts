import { style, createVar, keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// ─── ChatPanel ───────────────────────────────────────────────────

export const chatPanelRecipe = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    fontFamily: vars.typography.fontFamily.sans,
    color: vars.colors.text.primary,
    backgroundColor: vars.colors.background.primary,
  },
  variants: {
    density: {
      comfortable: {
        gap: vars.spacing.md,
      },
      compact: {
        gap: vars.spacing.sm,
      },
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
});

// ─── ChatMessageList ─────────────────────────────────────────────

export const messageListContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  padding: vars.spacing.md,
});

export const newMessagesBannerStyle = style({
  position: 'sticky',
  bottom: vars.spacing.md,
  alignSelf: 'center',
  padding: `${vars.spacing.xs} ${vars.spacing.lg}`,
  borderRadius: vars.borderRadius.lg,
  backgroundColor: vars.colors.accent.primary,
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.xs,
  fontWeight: vars.typography.fontWeight.medium,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  transition: `opacity ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
  },
});

// ─── ChatMessage ─────────────────────────────────────────────────

export const messageRecipe = recipe({
  base: {
    display: 'flex',
    gap: vars.spacing.md,
    maxWidth: '100%',
  },
  variants: {
    role: {
      user: {
        flexDirection: 'row-reverse',
      },
      assistant: {
        flexDirection: 'row',
      },
      system: {
        flexDirection: 'row',
        justifyContent: 'center',
      },
      tool: {
        flexDirection: 'row',
      },
    },
  },
  defaultVariants: {
    role: 'assistant',
  },
});

export const messageContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  minWidth: 0,
  maxWidth: '85%',
});

export const messageAvatarStyle = style({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.typography.fontSize.xs,
  fontWeight: vars.typography.fontWeight.semibold,
  backgroundColor: vars.colors.surface.default,
  color: vars.colors.text.secondary,
  overflow: 'hidden',
});

export const messageAvatarImgStyle = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const messageTimestampStyle = style({
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.text.muted,
  paddingLeft: vars.spacing.xs,
  paddingRight: vars.spacing.xs,
});

export const messageTextStyle = style({
  fontSize: vars.typography.fontSize.md,
  lineHeight: vars.typography.lineHeight.normal,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

// ─── ChatBubble ──────────────────────────────────────────────────

export const bubbleRecipe = recipe({
  base: {
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    borderRadius: vars.borderRadius.lg,
    fontSize: vars.typography.fontSize.md,
    lineHeight: vars.typography.lineHeight.normal,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    border: '1px solid',
  },
  variants: {
    role: {
      user: {
        backgroundColor: `color-mix(in srgb, ${vars.colors.accent.primary} 15%, ${vars.colors.background.primary})`,
        borderColor: `color-mix(in srgb, ${vars.colors.accent.primary} 25%, transparent)`,
        color: vars.colors.text.primary,
      },
      assistant: {
        backgroundColor: vars.colors.background.secondary,
        borderColor: vars.colors.border.default,
        color: vars.colors.text.primary,
      },
      system: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        color: vars.colors.text.muted,
        textAlign: 'center' as const,
        fontSize: vars.typography.fontSize.xs,
      },
      tool: {
        backgroundColor: vars.colors.background.primary,
        borderColor: vars.colors.border.default,
        color: vars.colors.text.primary,
        padding: vars.spacing.md,
      },
    },
  },
  defaultVariants: {
    role: 'assistant',
  },
});

export const bubbleErrorStyle = style({
  backgroundColor: `color-mix(in srgb, ${vars.colors.accent.error} 10%, ${vars.colors.background.secondary})`,
  borderColor: `color-mix(in srgb, ${vars.colors.accent.error} 35%, transparent)`,
});

export const messageErrorCaptionStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.accent.error,
  paddingLeft: vars.spacing.xs,
  paddingRight: vars.spacing.xs,
});

export const messageErrorIconStyle = style({
  width: '12px',
  height: '12px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// ─── ChatInput ───────────────────────────────────────────────────

export const inputMaxHeightVar = createVar();

export const inputContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
  padding: vars.spacing.md,
  borderTop: `1px solid ${vars.colors.border.default}`,
});

export const inputAttachmentsStyle = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
});

export const inputPrefixStyle = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
});

export const inputWrapperStyle = style({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: vars.colors.background.secondary,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  transition: `border-color ${vars.transitions.normal}`,
  selectors: {
    '&:focus-within': {
      borderColor: vars.colors.border.focus,
    },
  },
});

export const inputTextareaStyle = style({
  width: '100%',
  resize: 'none',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: vars.colors.text.primary,
  fontFamily: vars.typography.fontFamily.sans,
  fontSize: vars.typography.fontSize.md,
  lineHeight: vars.typography.lineHeight.normal,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  maxHeight: inputMaxHeightVar,
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: `${vars.colors.text.disabled} transparent`,
  boxSizing: 'border-box',
  selectors: {
    '&::placeholder': {
      color: vars.colors.text.disabled,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '4px',
      background: vars.colors.text.disabled,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: vars.colors.text.muted,
    },
  },
});

export const inputButtonStyle = style({
  flexShrink: 0,
  marginLeft: 'auto',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  outline: 'none',
  borderRadius: vars.borderRadius.sm,
  cursor: 'pointer',
  color: vars.colors.text.primary,
  backgroundColor: vars.colors.accent.primary,
  transition: `opacity ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      opacity: 0.85,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
});

export const inputStopButtonStyle = style({
  flexShrink: 0,
  marginLeft: 'auto',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.colors.border.default}`,
  outline: 'none',
  borderRadius: vars.borderRadius.sm,
  cursor: 'pointer',
  color: vars.colors.text.primary,
  backgroundColor: vars.colors.surface.default,
  transition: `background-color ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.surface.hover,
    },
  },
});

// ─── ChatInput Bottom Bar ───────────────────────────────────────

export const inputBottomBarStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
});

export const inputToolbarStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flex: 1,
  minWidth: 0,
});

// ─── ChatTypingIndicator ─────────────────────────────────────────

const dotBounce = keyframes({
  '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
  '40%': { transform: 'scale(1)', opacity: '1' },
});

const pulseAnim = keyframes({
  '0%, 100%': { opacity: '0.3' },
  '50%': { opacity: '1' },
});

export const typingIndicatorStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `0 ${vars.spacing.md}`,
  height: '24px',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '0s',
    },
  },
});

export const typingDotsContainerStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
});

export const typingDotStyle = style({
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  backgroundColor: vars.colors.text.muted,
  animation: `${dotBounce} 1.2s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: '0.6',
    },
  },
  selectors: {
    '&:nth-child(2)': {
      animationDelay: '0.15s',
    },
    '&:nth-child(3)': {
      animationDelay: '0.3s',
    },
  },
});

export const typingPulseStyle = style({
  width: '32px',
  height: '4px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.colors.accent.primary,
  animation: `${pulseAnim} 1.5s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: '0.6',
    },
  },
});

export const typingLabelStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
});

// ─── ChatToolCall ────────────────────────────────────────────────

export const toolCallContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.colors.border.default}`,
  overflow: 'hidden',
  fontSize: vars.typography.fontSize.xs,
});

export const toolCallHeaderStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  backgroundColor: vars.colors.background.secondary,
  cursor: 'pointer',
  userSelect: 'none',
  border: 'none',
  outline: 'none',
  width: '100%',
  textAlign: 'left' as const,
  fontFamily: 'inherit',
  color: vars.colors.text.primary,
  selectors: {
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
    },
  },
});

export const toolCallIconStyle = style({
  width: '14px',
  height: '14px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.muted,
});

export const toolCallNameStyle = style({
  flex: 1,
  fontWeight: vars.typography.fontWeight.medium,
  fontFamily: vars.typography.fontFamily.mono,
  fontSize: vars.typography.fontSize.xs,
});

export const toolCallStatusRecipe = recipe({
  base: {
    fontSize: vars.typography.fontSize.xxs,
    fontWeight: vars.typography.fontWeight.medium,
    padding: `1px ${vars.spacing.sm}`,
    borderRadius: vars.borderRadius.sm,
  },
  variants: {
    status: {
      pending: {
        color: vars.colors.text.muted,
        backgroundColor: vars.colors.surface.default,
      },
      running: {
        color: vars.colors.accent.primary,
        backgroundColor: `color-mix(in srgb, ${vars.colors.accent.primary} 15%, transparent)`,
      },
      completed: {
        color: vars.colors.accent.success,
        backgroundColor: `color-mix(in srgb, ${vars.colors.accent.success} 15%, transparent)`,
      },
      error: {
        color: vars.colors.accent.error,
        backgroundColor: `color-mix(in srgb, ${vars.colors.accent.error} 15%, transparent)`,
      },
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});

export const toolCallChevronRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `transform ${vars.transitions.fast}`,
    color: vars.colors.text.muted,
    flexShrink: 0,
  },
  variants: {
    open: {
      true: { transform: 'rotate(90deg)' },
      false: { transform: 'rotate(0deg)' },
    },
  },
  defaultVariants: {
    open: false,
  },
});

export const toolCallDetailsStyle = style({
  padding: vars.spacing.md,
  borderTop: `1px solid ${vars.colors.border.default}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
});

export const toolCallSectionLabelStyle = style({
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.text.muted,
  fontWeight: vars.typography.fontWeight.medium,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const toolCallPreStyle = style({
  fontFamily: vars.typography.fontFamily.mono,
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.text.secondary,
  backgroundColor: vars.colors.background.primary,
  padding: vars.spacing.sm,
  borderRadius: vars.borderRadius.sm,
  overflow: 'auto',
  maxHeight: '120px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  margin: 0,
});

export const toolCallErrorStyle = style({
  color: vars.colors.accent.error,
  fontSize: vars.typography.fontSize.xs,
});

export const toolCallDurationStyle = style({
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.text.muted,
});

// ─── ChatCodeBlock ───────────────────────────────────────────────

export const codeBlockMaxHeightVar = createVar();

export const codeBlockContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.colors.border.default}`,
  overflow: 'hidden',
  background: vars.colors.background.primary,
});

export const codeBlockHeaderStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  backgroundColor: vars.colors.background.secondary,
  borderBottom: `1px solid ${vars.colors.border.default}`,
});

export const codeBlockLanguageStyle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

export const codeBlockActionsStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  marginLeft: 'auto',
});

export const codeBlockCopyButtonStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  border: 'none',
  outline: 'none',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: 'transparent',
  color: vars.colors.text.muted,
  cursor: 'pointer',
  transition: `color ${vars.transitions.fast}, background-color ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
      backgroundColor: vars.colors.surface.hover,
    },
  },
});

export const codeBlockContentStyle = style({
  maxHeight: codeBlockMaxHeightVar,
  overflow: 'auto',
  padding: vars.spacing.md,
});

export const codeBlockContentWithLineNumbersStyle = style({
  display: 'flex',
});

export const codeBlockLineNumbersColumnStyle = style({
  color: vars.colors.text.disabled,
  textAlign: 'right' as const,
  paddingRight: vars.spacing.md,
  borderRight: `1px solid ${vars.colors.border.default}`,
  marginRight: vars.spacing.md,
  userSelect: 'none',
  minWidth: '32px',
  fontFamily: vars.typography.fontFamily.mono,
  fontSize: vars.typography.fontSize.sm,
  lineHeight: vars.typography.lineHeight.relaxed,
  whiteSpace: 'pre',
});

export const codeBlockPreStyle = style({
  margin: 0,
  fontFamily: vars.typography.fontFamily.mono,
  fontSize: vars.typography.fontSize.sm,
  lineHeight: vars.typography.lineHeight.relaxed,
  color: vars.colors.text.primary,
  whiteSpace: 'pre',
  tabSize: 2,
  flex: 1,
  minWidth: 0,
});

// ─── ChatAttachment (chip) ───────────────────────────────────────

export const attachmentChipStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  height: '28px',
  padding: `0 ${vars.spacing.md}`,
  borderRadius: vars.borderRadius.md,
  backgroundColor: vars.colors.surface.default,
  border: `1px solid ${vars.colors.border.default}`,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  cursor: 'default',
  maxWidth: '200px',
  transition: `background-color ${vars.transitions.fast}`,
  selectors: {
    '&[data-clickable="true"]': {
      cursor: 'pointer',
    },
    '&[data-clickable="true"]:hover': {
      backgroundColor: vars.colors.surface.hover,
    },
  },
});

export const attachmentChipIconStyle = style({
  width: '14px',
  height: '14px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.muted,
});

export const attachmentChipNameStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const attachmentChipRemoveStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  border: 'none',
  outline: 'none',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: 'transparent',
  color: vars.colors.text.muted,
  cursor: 'pointer',
  flexShrink: 0,
  padding: 0,
  transition: `color ${vars.transitions.fast}, background-color ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
      backgroundColor: vars.colors.surface.hover,
    },
  },
});

export const attachmentThumbnailStyle = style({
  width: '20px',
  height: '20px',
  borderRadius: vars.borderRadius.sm,
  objectFit: 'cover',
  flexShrink: 0,
});

// ─── ChatContextChip ─────────────────────────────────────────────

export const contextChipStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  height: '24px',
  padding: `0 ${vars.spacing.md}`,
  borderRadius: vars.borderRadius.md,
  backgroundColor: `color-mix(in srgb, ${vars.colors.accent.primary} 10%, transparent)`,
  border: `1px solid color-mix(in srgb, ${vars.colors.accent.primary} 25%, transparent)`,
  fontSize: vars.typography.fontSize.xxs,
  color: vars.colors.text.secondary,
});

export const contextChipIconStyle = style({
  width: '12px',
  height: '12px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.accent.primary,
});

export const contextChipLabelStyle = style({
  fontWeight: vars.typography.fontWeight.medium,
  color: vars.colors.text.muted,
});

export const contextChipItemsStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px',
});

export const contextChipDismissStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '14px',
  height: '14px',
  border: 'none',
  outline: 'none',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: 'transparent',
  color: vars.colors.text.muted,
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
  transition: `color ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
    },
  },
});

// ─── ChatEmptyState ──────────────────────────────────────────────

export const emptyStateStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing.lg,
  padding: vars.spacing.xxl,
  textAlign: 'center',
  flex: 1,
});

export const emptyStateIconStyle = style({
  color: vars.colors.text.disabled,
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const emptyStateTitleStyle = style({
  fontSize: vars.typography.fontSize.lg,
  fontWeight: vars.typography.fontWeight.semibold,
  color: vars.colors.text.primary,
});

export const emptyStateDescriptionStyle = style({
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.muted,
  lineHeight: vars.typography.lineHeight.normal,
  maxWidth: '280px',
});

export const emptyStateSuggestionsStyle = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: vars.spacing.sm,
});

export const emptyStateSuggestionStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: '28px',
  padding: `0 ${vars.spacing.lg}`,
  borderRadius: vars.borderRadius.lg,
  border: `1px solid ${vars.colors.border.default}`,
  backgroundColor: 'transparent',
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.xs,
  cursor: 'pointer',
  fontFamily: 'inherit',
  outline: 'none',
  transition: `background-color ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.surface.hover,
      borderColor: vars.colors.border.focus,
    },
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
    },
  },
});

// ─── ChatActionBar ───────────────────────────────────────────────

export const actionBarStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  paddingTop: vars.spacing.xs,
});
