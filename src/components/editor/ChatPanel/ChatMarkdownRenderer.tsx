'use client';

import React, { useMemo } from 'react';
import { cx } from '@/utils/cx';
import { Code } from '@/components/primitives/Code';
import { ChatCodeBlock } from './ChatCodeBlock';
import type { ChatMarkdownRendererProps } from './ChatMarkdownRenderer.types';
import {
  markdownBlockquoteStyle,
  markdownHeadingStyle,
  markdownHrStyle,
  markdownLinkStyle,
  markdownListItemStyle,
  markdownListStyle,
  markdownParagraphStyle,
  markdownRootStyle,
  markdownTableStyle,
  markdownTdStyle,
  markdownThStyle,
} from './ChatPanel.css';

// ─────────────────────────────────────────────────────────────────
// Minimal markdown → React renderer.
//
// Covers what chat LLMs typically produce: paragraphs, headings,
// lists, blockquotes, horizontal rules, inline emphasis / code, links,
// fenced code blocks, and (with `gfm`) pipe tables.
//
// Intentionally lightweight — for advanced CommonMark edge cases or
// full AST control, consumers can supply their own `renderContent`
// function on `ChatMessage`.
// ─────────────────────────────────────────────────────────────────

interface InlineRenderOptions {
  linkTarget: '_self' | '_blank';
}

function escapeHtmlInText(text: string): string {
  return text;
}

function renderInline(
  text: string,
  options: InlineRenderOptions,
  keyPrefix: string
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let rest = text;
  let index = 0;

  // Ordered by precedence. Each pattern captures the full match so we
  // can slice around it, and the content(s) we want to render.
  const patterns: Array<{
    regex: RegExp;
    render: (match: RegExpExecArray, key: string) => React.ReactNode;
  }> = [
    {
      regex: /`([^`]+)`/,
      render: (m, key) => <Code key={key}>{m[1]}</Code>,
    },
    {
      regex: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/,
      render: (m, key) => (
        <img
          key={key}
          src={m[2]}
          alt={m[1] ?? ''}
          style={{ maxWidth: '100%' }}
        />
      ),
    },
    {
      regex: /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/,
      render: (m, key) => (
        <a
          key={key}
          href={m[2]}
          target={options.linkTarget}
          rel={
            options.linkTarget === '_blank' ? 'noopener noreferrer' : undefined
          }
          className={markdownLinkStyle}
        >
          {m[1]}
        </a>
      ),
    },
    {
      regex: /\*\*([^*]+)\*\*/,
      render: (m, key) => <strong key={key}>{m[1]}</strong>,
    },
    {
      regex: /__([^_]+)__/,
      render: (m, key) => <strong key={key}>{m[1]}</strong>,
    },
    {
      regex: /(?<![*\w])\*([^*\n]+)\*(?![*\w])/,
      render: (m, key) => <em key={key}>{m[1]}</em>,
    },
    {
      regex: /(?<![_\w])_([^_\n]+)_(?![_\w])/,
      render: (m, key) => <em key={key}>{m[1]}</em>,
    },
    {
      regex: /~~([^~]+)~~/,
      render: (m, key) => <del key={key}>{m[1]}</del>,
    },
  ];

  while (rest.length > 0) {
    let best: { start: number; length: number; node: React.ReactNode } | null =
      null;

    for (const { regex, render } of patterns) {
      const match = regex.exec(rest);
      if (!match) continue;
      if (best === null || match.index < best.start) {
        best = {
          start: match.index,
          length: match[0].length,
          node: render(match, `${keyPrefix}-i-${index++}`),
        };
      }
    }

    if (!best) {
      parts.push(escapeHtmlInText(rest));
      break;
    }

    if (best.start > 0) {
      parts.push(escapeHtmlInText(rest.slice(0, best.start)));
    }
    parts.push(best.node);
    rest = rest.slice(best.start + best.length);
  }

  return parts;
}

interface Block {
  type:
    | 'paragraph'
    | 'heading'
    | 'list'
    | 'orderedList'
    | 'blockquote'
    | 'codeBlock'
    | 'hr'
    | 'table';
  content?: string;
  level?: number;
  items?: string[];
  language?: string;
  rows?: string[][];
  align?: Array<'left' | 'right' | 'center' | null>;
}

function parseBlocks(source: string, gfm: boolean): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';

    // Skip blank lines between blocks.
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // Fenced code block
    const fenceMatch = /^```(\w+)?\s*$/.exec(line);
    if (fenceMatch) {
      const language = fenceMatch[1];
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? '')) {
        codeLines.push(lines[i] ?? '');
        i++;
      }
      i++; // skip closing fence
      blocks.push({
        type: 'codeBlock',
        content: codeLines.join('\n'),
        language,
      });
      continue;
    }

    // Horizontal rule
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Heading (# through ######)
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const hashes = headingMatch[1] ?? '';
      const headingContent = headingMatch[2] ?? '';
      blocks.push({
        type: 'heading',
        level: hashes.length,
        content: headingContent.trim(),
      });
      i++;
      continue;
    }

    // Blockquote — consecutive `> ` lines
    if (/^\s*>/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i] ?? '')) {
        quoteLines.push((lines[i] ?? '').replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
      continue;
    }

    // Unordered list — lines beginning with `- `, `* `, or `+ `
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // Ordered list — `1. ...`
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'orderedList', items });
      continue;
    }

    // GFM pipe table — a header row, a separator `---|---`, then rows.
    if (
      gfm &&
      /\|/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1] ?? '')
    ) {
      const split = (row: string) =>
        row
          .replace(/^\s*\|/, '')
          .replace(/\|\s*$/, '')
          .split('|')
          .map(cell => cell.trim());

      const header = split(line);
      const rawAlign = split(lines[i + 1] ?? '');
      const align = rawAlign.map(cell => {
        const left = cell.startsWith(':');
        const right = cell.endsWith(':');
        if (left && right) return 'center' as const;
        if (right) return 'right' as const;
        if (left) return 'left' as const;
        return null;
      });

      const rows: string[][] = [header];
      i += 2;
      while (i < lines.length && /\|/.test(lines[i] ?? '')) {
        rows.push(split(lines[i] ?? ''));
        i++;
      }
      blocks.push({ type: 'table', rows, align });
      continue;
    }

    // Paragraph — consecutive non-blank non-block-starting lines.
    const paraLines: string[] = [];
    while (i < lines.length) {
      const ln = lines[i] ?? '';
      if (
        /^\s*$/.test(ln) ||
        /^```/.test(ln) ||
        /^(#{1,6})\s+/.test(ln) ||
        /^\s*>/.test(ln) ||
        /^\s*[-*+]\s+/.test(ln) ||
        /^\s*\d+\.\s+/.test(ln) ||
        /^\s*(---|\*\*\*|___)\s*$/.test(ln)
      ) {
        break;
      }
      paraLines.push(ln);
      i++;
    }
    blocks.push({ type: 'paragraph', content: paraLines.join('\n') });
  }

  return blocks;
}

/**
 * Lightweight markdown renderer for chat messages.
 *
 * Pass it to `ChatMessage.renderContent` to render assistant responses
 * with bold / italic / inline code, links, fenced code blocks, lists,
 * blockquotes, horizontal rules, and GFM pipe tables.
 *
 * For advanced markdown features, supply a custom `renderContent`
 * function that uses your markdown library of choice.
 *
 * @example
 * ```tsx
 * <ChatMessage
 *   message={msg}
 *   renderContent={content => <ChatMarkdownRenderer content={content} />}
 * />
 * ```
 */
export const ChatMarkdownRenderer =
  /*#__PURE__*/ React.memo<ChatMarkdownRendererProps>(
    ({
      content,
      gfm = true,
      linkTarget = '_blank',
      components,
      className,
      style,
      testId,
      ref,
      ...rest
    }) => {
      const blocks = useMemo(() => parseBlocks(content, gfm), [content, gfm]);

      const CodeBlock =
        components?.codeBlock ??
        (({ code, language }: { code: string; language?: string }) => (
          <ChatCodeBlock code={code} language={language} />
        ));

      return (
        <div
          ref={ref}
          className={cx(markdownRootStyle, className)}
          style={style}
          data-testid={testId}
          {...rest}
        >
          {blocks.map((block, idx) => {
            const key = `b-${idx}`;
            switch (block.type) {
              case 'paragraph':
                return (
                  <p key={key} className={markdownParagraphStyle}>
                    {renderInline(block.content ?? '', { linkTarget }, key)}
                  </p>
                );
              case 'heading': {
                const level = Math.min(Math.max(block.level ?? 1, 1), 6) as
                  | 1
                  | 2
                  | 3
                  | 4
                  | 5
                  | 6;
                const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
                return (
                  <Tag key={key} className={markdownHeadingStyle}>
                    {renderInline(block.content ?? '', { linkTarget }, key)}
                  </Tag>
                );
              }
              case 'list':
                return (
                  <ul key={key} className={markdownListStyle}>
                    {(block.items ?? []).map((item, j) => (
                      <li key={`${key}-${j}`} className={markdownListItemStyle}>
                        {renderInline(item, { linkTarget }, `${key}-${j}`)}
                      </li>
                    ))}
                  </ul>
                );
              case 'orderedList':
                return (
                  <ol key={key} className={markdownListStyle}>
                    {(block.items ?? []).map((item, j) => (
                      <li key={`${key}-${j}`} className={markdownListItemStyle}>
                        {renderInline(item, { linkTarget }, `${key}-${j}`)}
                      </li>
                    ))}
                  </ol>
                );
              case 'blockquote':
                return (
                  <blockquote key={key} className={markdownBlockquoteStyle}>
                    {renderInline(block.content ?? '', { linkTarget }, key)}
                  </blockquote>
                );
              case 'codeBlock':
                return (
                  <CodeBlock
                    key={key}
                    code={block.content ?? ''}
                    language={block.language}
                  />
                );
              case 'hr':
                return <hr key={key} className={markdownHrStyle} />;
              case 'table': {
                const [header, ...rows] = block.rows ?? [];
                const align = block.align ?? [];
                return (
                  <table key={key} className={markdownTableStyle}>
                    <thead>
                      <tr>
                        {(header ?? []).map((cell, j) => (
                          <th
                            key={`${key}-h-${j}`}
                            className={markdownThStyle}
                            style={
                              align[j]
                                ? { textAlign: align[j] ?? undefined }
                                : undefined
                            }
                          >
                            {renderInline(
                              cell,
                              { linkTarget },
                              `${key}-h-${j}`
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rIdx) => (
                        <tr key={`${key}-r-${rIdx}`}>
                          {row.map((cell, j) => (
                            <td
                              key={`${key}-r-${rIdx}-${j}`}
                              className={markdownTdStyle}
                              style={
                                align[j]
                                  ? { textAlign: align[j] ?? undefined }
                                  : undefined
                              }
                            >
                              {renderInline(
                                cell,
                                { linkTarget },
                                `${key}-r-${rIdx}-${j}`
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              }
              default:
                return null;
            }
          })}
        </div>
      );
    }
  );

ChatMarkdownRenderer.displayName = 'ChatMarkdownRenderer';
