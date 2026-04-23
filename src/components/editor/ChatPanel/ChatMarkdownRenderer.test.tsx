import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { ChatMarkdownRenderer } from './ChatMarkdownRenderer';

describe('ChatMarkdownRenderer', () => {
  describe('Inline formatting', () => {
    it('renders bold text', () => {
      renderWithTheme(<ChatMarkdownRenderer content="Hello **world**" />);
      expect(screen.getByText('world').tagName).toBe('STRONG');
    });

    it('renders italic text', () => {
      renderWithTheme(<ChatMarkdownRenderer content="This is *italic*" />);
      expect(screen.getByText('italic').tagName).toBe('EM');
    });

    it('renders inline code inside <code>', () => {
      renderWithTheme(<ChatMarkdownRenderer content="Use `npm install`" />);
      expect(screen.getByText('npm install').tagName).toBe('CODE');
    });

    it('renders links with rel="noopener noreferrer"', () => {
      renderWithTheme(
        <ChatMarkdownRenderer content="[home](https://example.com)" />
      );
      const link = screen.getByRole('link', { name: 'home' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Blocks', () => {
    it('renders headings', () => {
      renderWithTheme(
        <ChatMarkdownRenderer content={'# Title\n## Subtitle'} />
      );
      expect(
        screen.getByRole('heading', { level: 1, name: 'Title' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: 'Subtitle' })
      ).toBeInTheDocument();
    });

    it('renders unordered lists', () => {
      renderWithTheme(
        <ChatMarkdownRenderer content={'- one\n- two\n- three'} />
      );
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('renders blockquotes', () => {
      renderWithTheme(<ChatMarkdownRenderer content={'> quoted text'} />);
      expect(screen.getByText('quoted text').tagName).toBe('BLOCKQUOTE');
    });

    it('renders fenced code blocks', () => {
      renderWithTheme(
        <ChatMarkdownRenderer content={'```ts\nconst x = 1;\n```'} />
      );
      expect(screen.getByText(/const x = 1/)).toBeInTheDocument();
    });

    it('renders horizontal rules', () => {
      const { container } = renderWithTheme(
        <ChatMarkdownRenderer content={'a\n\n---\n\nb'} />
      );
      expect(container.querySelector('hr')).toBeInTheDocument();
    });

    it('renders GFM tables', () => {
      renderWithTheme(
        <ChatMarkdownRenderer content={'| a | b |\n|---|---|\n| 1 | 2 |'} />
      );
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithTheme(<ChatMarkdownRenderer ref={ref} content="x" />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
