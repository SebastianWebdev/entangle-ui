import React, { useCallback } from 'react';
import type { ChatEmptyStateProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import {
  emptyStateStyle,
  emptyStateIconStyle,
  emptyStateTitleStyle,
  emptyStateDescriptionStyle,
  emptyStateSuggestionsStyle,
  emptyStateSuggestionStyle,
} from './ChatPanel.css';

export const ChatEmptyState = /*#__PURE__*/ React.memo<ChatEmptyStateProps>(
  ({
    title,
    description,
    icon,
    suggestions,
    onSuggestionClick,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const handleSuggestionClick = useCallback(
      (suggestion: string) => {
        onSuggestionClick?.(suggestion);
      },
      [onSuggestionClick]
    );

    return (
      <div
        ref={ref}
        className={cx(emptyStateStyle, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {icon && <div className={emptyStateIconStyle}>{icon}</div>}
        {title && <div className={emptyStateTitleStyle}>{title}</div>}
        {description && (
          <div className={emptyStateDescriptionStyle}>{description}</div>
        )}
        {suggestions && suggestions.length > 0 && (
          <div className={emptyStateSuggestionsStyle}>
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                className={emptyStateSuggestionStyle}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ChatEmptyState.displayName = 'ChatEmptyState';
