import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export interface ChatMarkdownRendererBaseProps extends BaseComponent {
  /** Raw markdown content. */
  content: string;
  /**
   * Enable GitHub-flavored markdown extensions
   * (tables, task lists, autolinks).
   * @default true
   */
  gfm?: boolean;
  /**
   * Link `target` attribute. External links are always rendered with
   * `rel="noopener noreferrer"`.
   * @default "_blank"
   */
  linkTarget?: '_self' | '_blank';
  /**
   * Override individual node renderers. Keys match the node type:
   * `code`, `codeBlock`, `link`, `paragraph`, `heading`, `list`,
   * `listItem`, `blockquote`, `table`, `hr`, `text`.
   *
   * Rarely needed — use a custom `renderContent` on `ChatMessage` for
   * substantially different renderers.
   */
  components?: Partial<{
    code: React.ComponentType<{ children: React.ReactNode }>;
    codeBlock: React.ComponentType<{ code: string; language?: string }>;
    link: React.ComponentType<{
      href: string;
      target?: string;
      rel?: string;
      children: React.ReactNode;
    }>;
  }>;
}

export type ChatMarkdownRendererProps = Prettify<ChatMarkdownRendererBaseProps>;
