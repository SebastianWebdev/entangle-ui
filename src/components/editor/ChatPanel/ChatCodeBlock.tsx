'use client';

import React, { useState, useCallback } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { ChatCodeBlockProps } from './ChatPanel.types';
import { cx } from '@/utils/cx';
import {
  codeBlockContainerStyle,
  codeBlockHeaderStyle,
  codeBlockLanguageStyle,
  codeBlockActionsStyle,
  codeBlockCopyButtonStyle,
  codeBlockContentStyle,
  codeBlockContentWithLineNumbersStyle,
  codeBlockLineNumbersColumnStyle,
  codeBlockPreStyle,
  codeBlockMaxHeightVar,
} from './ChatPanel.css';

// ─── Icons ───────────────────────────────────────────────────────

const CopyIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="5"
      y="5"
      width="9"
      height="9"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M11 5V3.5A1.5 1.5 0 009.5 2H3.5A1.5 1.5 0 002 3.5V9.5A1.5 1.5 0 003.5 11H5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 8.5L6.5 12L13 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────

export const ChatCodeBlock = /*#__PURE__*/ React.memo<ChatCodeBlockProps>(
  ({
    code,
    language,
    copyable = true,
    lineNumbers = false,
    maxHeight = 400,
    actions,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback: older browsers — no-op
      });
    }, [code]);

    const lines = code.split('\n');
    const showHeader = language != null || copyable || actions != null;

    return (
      <div
        ref={ref}
        className={cx(codeBlockContainerStyle, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {showHeader && (
          <div className={codeBlockHeaderStyle}>
            {language != null && (
              <span className={codeBlockLanguageStyle}>{language}</span>
            )}
            <div className={codeBlockActionsStyle}>
              {actions}
              {copyable && (
                <button
                  type="button"
                  className={codeBlockCopyButtonStyle}
                  onClick={handleCopy}
                  aria-label={copied ? 'Copied' : 'Copy code'}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              )}
            </div>
          </div>
        )}

        <div
          className={cx(
            codeBlockContentStyle,
            lineNumbers && codeBlockContentWithLineNumbersStyle
          )}
          style={assignInlineVars({
            [codeBlockMaxHeightVar]: `${maxHeight}px`,
          })}
          data-testid={testId ? `${testId}-content` : undefined}
        >
          {lineNumbers && (
            <div
              className={codeBlockLineNumbersColumnStyle}
              aria-hidden="true"
              data-testid={testId ? `${testId}-line-numbers` : undefined}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre className={codeBlockPreStyle}>
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  }
);

ChatCodeBlock.displayName = 'ChatCodeBlock';
