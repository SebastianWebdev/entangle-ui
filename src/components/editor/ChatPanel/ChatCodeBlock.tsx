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
  codeBlockBodyStyle,
  codeBlockPreStyle,
  codeBlockLineNumberStyle,
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
      void navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }, [code]);

    const lines = code.split('\n');

    return (
      <div
        ref={ref}
        className={cx(codeBlockContainerStyle, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {(language ?? copyable ?? actions) && (
          <div className={codeBlockHeaderStyle}>
            <span className={codeBlockLanguageStyle}>{language ?? ''}</span>
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
          className={codeBlockBodyStyle}
          style={assignInlineVars({
            [codeBlockMaxHeightVar]: `${maxHeight}px`,
          })}
        >
          <pre className={codeBlockPreStyle}>
            <code>
              {lineNumbers
                ? lines.map((line, i) => (
                    <React.Fragment key={i}>
                      <span className={codeBlockLineNumberStyle}>{i + 1}</span>
                      {line}
                      {i < lines.length - 1 ? '\n' : ''}
                    </React.Fragment>
                  ))
                : code}
            </code>
          </pre>
        </div>
      </div>
    );
  }
);

ChatCodeBlock.displayName = 'ChatCodeBlock';
