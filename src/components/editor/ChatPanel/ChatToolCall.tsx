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

// ─── Icons ───────────────────────────────────────────────────────

const WrenchIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M14.25 1.75L12.5 3.5L13 5L11.5 6.5L10.5 5.5L5.5 10.5L6.5 11.5L5 13L3.5 12.5L1.75 14.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 2.5L10 4L8 6L6.5 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon: React.FC<{ size?: number }> = ({ size = 10 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.5 3L7.5 6L4.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
          <span className={toolCallIconStyle}>{icon ?? <WrenchIcon />}</span>

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
              <ChevronIcon />
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
