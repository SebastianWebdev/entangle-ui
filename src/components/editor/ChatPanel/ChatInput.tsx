'use client';

import React, { useCallback, useId } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { ChatInputProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { useChatInput } from './useChatInput';
import { ChatAttachmentChip } from './ChatAttachment';
import {
  inputContainerStyle,
  inputAttachmentsStyle,
  inputPrefixStyle,
  inputWrapperStyle,
  inputTextareaStyle,
  inputButtonStyle,
  inputStopButtonStyle,
  inputMaxHeightVar,
  inputBottomBarStyle,
} from './ChatPanel.css';

// ─── Icons ───────────────────────────────────────────────────────

const SendIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StopIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────

export const ChatInput = /*#__PURE__*/ React.memo<ChatInputProps>(
  ({
    value: controlledValue,
    onChange: controlledOnChange,
    onSubmit,
    onStop,
    placeholder = 'Type a message...',
    streaming = false,
    disabled = false,
    submitKey = 'enter',
    maxLines = 6,
    attachments,
    onRemoveAttachment,
    prefix,
    suffix,
    toolbar,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const inputId = useId();

    const handleSubmit = useCallback(
      (text: string) => {
        onSubmit?.(text, attachments ?? []);
      },
      [onSubmit, attachments]
    );

    const chatInput = useChatInput({
      submitKey,
      onSubmit: handleSubmit,
      maxLines,
    });

    // Support controlled mode
    const currentValue = controlledValue ?? chatInput.value;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (controlledOnChange) {
          controlledOnChange(e.target.value);
        }
        chatInput.handleChange(e);
      },
      [controlledOnChange, chatInput]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // In controlled mode, override the internal value check
        if (controlledValue !== undefined) {
          const isSubmitKey =
            submitKey === 'enter'
              ? e.key === 'Enter' && !e.shiftKey
              : e.key === 'Enter' && (e.ctrlKey || e.metaKey);

          if (isSubmitKey && controlledValue.trim()) {
            e.preventDefault();
            onSubmit?.(controlledValue, attachments ?? []);
            return;
          }
        }
        chatInput.handleKeyDown(e);
      },
      [controlledValue, submitKey, onSubmit, attachments, chatInput]
    );

    const handleSendClick = useCallback(() => {
      const val = controlledValue ?? chatInput.value;
      if (val.trim()) {
        onSubmit?.(val, attachments ?? []);
        if (controlledValue === undefined) {
          chatInput.clear();
        }
      }
    }, [controlledValue, chatInput, onSubmit, attachments]);

    const lineHeight = 18; // approximate line-height in px
    const maxHeightPx = `${maxLines * lineHeight}px`;

    const shortcutLabel =
      submitKey === 'enter'
        ? 'Enter to send, Shift+Enter for newline'
        : 'Ctrl+Enter to send, Enter for newline';

    return (
      <div
        ref={ref}
        className={cx(inputContainerStyle, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {prefix && <div className={inputPrefixStyle}>{prefix}</div>}

        {attachments && attachments.length > 0 && (
          <div className={inputAttachmentsStyle}>
            {attachments.map(att => (
              <ChatAttachmentChip
                key={att.id}
                attachment={att}
                removable={!!onRemoveAttachment}
                onRemove={onRemoveAttachment}
              />
            ))}
          </div>
        )}

        <div className={inputWrapperStyle}>
          <textarea
            ref={chatInput.textareaRef}
            id={`chat-input-${inputId}`}
            className={inputTextareaStyle}
            style={assignInlineVars({
              [inputMaxHeightVar]: maxHeightPx,
            })}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Chat message input"
            aria-keyshortcuts={shortcutLabel}
          />

          {suffix}

          <div className={inputBottomBarStyle}>
            {toolbar}

            {streaming ? (
              <button
                type="button"
                className={inputStopButtonStyle}
                onClick={onStop}
                aria-label="Stop generating"
              >
                <StopIcon />
              </button>
            ) : (
              <button
                type="button"
                className={inputButtonStyle}
                onClick={handleSendClick}
                disabled={disabled || !currentValue.trim()}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
