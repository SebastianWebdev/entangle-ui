'use client';

import React, { useCallback } from 'react';
import type { ChatAttachmentChipProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import {
  attachmentChipStyle,
  attachmentChipIconStyle,
  attachmentChipNameStyle,
  attachmentChipRemoveStyle,
  attachmentThumbnailStyle,
} from './ChatPanel.css';

// ─── Icons ───────────────────────────────────────────────────────

const FileIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 2H4.5A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V6L9 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 2v4h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const ImageIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="2"
      y="2"
      width="12"
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="5.5" cy="5.5" r="1.5" fill="currentColor" />
    <path
      d="M2 11l3-3 2 2 3-3 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CodeIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 4L1 8l4 4M11 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SelectionIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="2"
      y="2"
      width="5"
      height="5"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="9"
      y="9"
      width="5"
      height="5"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path
      d="M1 1l6 6M7 1L1 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const TYPE_ICONS: Record<string, React.FC> = {
  file: FileIcon,
  image: ImageIcon,
  code: CodeIcon,
  selection: SelectionIcon,
};

// ─── Component ───────────────────────────────────────────────────

export const ChatAttachmentChip =
  /*#__PURE__*/ React.memo<ChatAttachmentChipProps>(
    ({
      attachment,
      onRemove,
      onClick,
      removable = false,
      className,
      style,
      testId,
      ref,
      ...rest
    }) => {
      const handleClick = useCallback(() => {
        onClick?.(attachment);
      }, [onClick, attachment]);

      const handleRemove = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();
          onRemove?.(attachment.id);
        },
        [onRemove, attachment.id]
      );

      const TypeIcon = TYPE_ICONS[attachment.type] ?? FileIcon;
      const isClickable = !!onClick;

      return (
        <div
          ref={ref}
          className={cx(attachmentChipStyle, className)}
          style={style}
          data-testid={testId}
          data-clickable={isClickable || undefined}
          onClick={isClickable ? handleClick : undefined}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          {...rest}
        >
          {attachment.type === 'image' && attachment.thumbnailUrl ? (
            <img
              src={attachment.thumbnailUrl}
              alt={attachment.name}
              className={attachmentThumbnailStyle}
            />
          ) : (
            <span className={attachmentChipIconStyle}>
              <TypeIcon />
            </span>
          )}

          <span className={attachmentChipNameStyle}>{attachment.name}</span>

          {removable && (
            <button
              type="button"
              className={attachmentChipRemoveStyle}
              onClick={handleRemove}
              aria-label={`Remove ${attachment.name}`}
            >
              <CloseIcon />
            </button>
          )}
        </div>
      );
    }
  );

ChatAttachmentChip.displayName = 'ChatAttachmentChip';
