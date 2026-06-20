'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, { useState, useCallback } from 'react';

import { CheckIcon, CopyIcon } from '@/components/Icons';
import { useIsMounted } from '@/hooks/useIsMounted';
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

import type { ChatCodeBlockProps } from './ChatPanel.types';

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
    const isMounted = useIsMounted();

    const handleCopy = useCallback(() => {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          // clipboard.writeText can't be cancelled, so guard the state writes:
          // the block may unmount before it resolves, or within the 2s reset.
          if (!isMounted()) return;
          setCopied(true);
          setTimeout(() => {
            if (isMounted()) setCopied(false);
          }, 2000);
        })
        .catch(() => {
          // Fallback: older browsers — no-op
        });
    }, [code, isMounted]);

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
                  {copied ? (
                    <CheckIcon size={12} decorative />
                  ) : (
                    <CopyIcon size={12} decorative />
                  )}
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
