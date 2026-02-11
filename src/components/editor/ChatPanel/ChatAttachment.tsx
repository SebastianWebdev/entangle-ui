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

import {
  MiniCloseIcon,
  MiniFileIcon,
  MiniImageIcon,
  MiniCodeIcon,
  MiniSelectionIcon,
} from './ChatIcons';

const TYPE_ICONS: Record<string, React.FC> = {
  file: MiniFileIcon,
  image: MiniImageIcon,
  code: MiniCodeIcon,
  selection: MiniSelectionIcon,
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

      const TypeIcon = TYPE_ICONS[attachment.type] ?? MiniFileIcon;
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
              <MiniCloseIcon />
            </button>
          )}
        </div>
      );
    }
  );

ChatAttachmentChip.displayName = 'ChatAttachmentChip';
