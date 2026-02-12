'use client';

import React, { useState, useCallback } from 'react';
import type { ChatToolCallProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import {
  toolCallContainerStyle,
  toolCallHeaderStyle,
  toolCallIconStyle,
  toolCallNameStyle,
  toolCallStatusRecipe,
  toolCallChevronRecipe,
  toolCallDetailsStyle,
  toolCallSectionLabelStyle,
  toolCallPreStyle,
  toolCallErrorStyle,
  toolCallDurationStyle,
} from './ChatPanel.css';
import { MiniWrenchIcon, MiniChevronIcon } from './ChatIcons';

// ─── Status label map ────────────────────────────────────────────

const STATUS_LABELS = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  error: 'Error',
} as const;

// ─── Component ───────────────────────────────────────────────────

export const ChatToolCall = /*#__PURE__*/ React.memo<ChatToolCallProps>(
  ({
    toolCall,
    collapsible = true,
    defaultExpanded = false,
    icon,
    renderOutput,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleToggle = useCallback(() => {
      if (collapsible) {
        setExpanded(prev => !prev);
      }
    }, [collapsible]);

    const statusLabel = STATUS_LABELS[toolCall.status];
    const ariaLabel = `Tool ${toolCall.name}: ${statusLabel}`;

    return (
      <div
        ref={ref}
        className={cx(toolCallContainerStyle, className)}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel}
        {...rest}
      >
        <button
          type="button"
          className={toolCallHeaderStyle}
          onClick={handleToggle}
          aria-expanded={collapsible ? expanded : undefined}
        >
          <span className={toolCallIconStyle}>
            {icon ?? <MiniWrenchIcon />}
          </span>

          <span className={toolCallNameStyle}>{toolCall.name}</span>

          <span className={toolCallStatusRecipe({ status: toolCall.status })}>
            {statusLabel}
          </span>

          {toolCall.durationMs !== undefined &&
            toolCall.status === 'completed' && (
              <span className={toolCallDurationStyle}>
                {toolCall.durationMs}ms
              </span>
            )}

          {collapsible && (
            <span
              className={toolCallChevronRecipe({
                open: expanded || undefined,
              })}
            >
              <MiniChevronIcon />
            </span>
          )}
        </button>

        {expanded && (
          <div className={toolCallDetailsStyle}>
            {toolCall.input && (
              <>
                <span className={toolCallSectionLabelStyle}>Input</span>
                <pre className={toolCallPreStyle}>
                  {JSON.stringify(toolCall.input, null, 2)}
                </pre>
              </>
            )}

            {toolCall.output && (
              <>
                <span className={toolCallSectionLabelStyle}>Output</span>
                {renderOutput ? (
                  renderOutput(toolCall.output)
                ) : (
                  <pre className={toolCallPreStyle}>
                    {JSON.stringify(toolCall.output, null, 2)}
                  </pre>
                )}
              </>
            )}

            {toolCall.error && (
              <>
                <span className={toolCallSectionLabelStyle}>Error</span>
                <span className={toolCallErrorStyle}>{toolCall.error}</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

ChatToolCall.displayName = 'ChatToolCall';
