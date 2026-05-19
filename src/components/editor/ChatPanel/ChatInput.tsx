'use client';

import React, { useCallback, useId } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { ChatInputProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import { SendIcon, StopIcon } from '@/components/Icons';
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
      attachmentsCount: attachments?.length ?? 0,
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

    const attachmentsCount = attachments?.length ?? 0;

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // In controlled mode, override the internal value check
        if (controlledValue !== undefined) {
          const isSubmitKey =
            submitKey === 'enter'
              ? e.key === 'Enter' && !e.shiftKey
              : e.key === 'Enter' && (e.ctrlKey || e.metaKey);

          if (isSubmitKey && (controlledValue.trim() || attachmentsCount > 0)) {
            e.preventDefault();
            onSubmit?.(controlledValue.trim(), attachments ?? []);
            return;
          }
        }
        chatInput.handleKeyDown(e);
      },
      [
        controlledValue,
        submitKey,
        onSubmit,
        attachments,
        attachmentsCount,
        chatInput,
      ]
    );

    const handleSendClick = useCallback(() => {
      const val = controlledValue ?? chatInput.value;
      const canSubmit = val.trim() || attachmentsCount > 0;
      if (canSubmit) {
        onSubmit?.(val.trim(), attachments ?? []);
        if (controlledValue === undefined) {
          chatInput.clear();
        }
      }
    }, [controlledValue, chatInput, onSubmit, attachments, attachmentsCount]);

    const canSubmit =
      (currentValue.trim().length > 0 || attachmentsCount > 0) && !disabled;

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
                <StopIcon size={12} decorative />
              </button>
            ) : (
              <button
                type="button"
                className={inputButtonStyle}
                onClick={handleSendClick}
                disabled={!canSubmit}
                aria-label="Send message"
              >
                <SendIcon size={14} decorative />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
