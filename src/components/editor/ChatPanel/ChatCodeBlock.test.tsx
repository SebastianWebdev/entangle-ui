import { screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { ChatCodeBlock } from './ChatCodeBlock';

// ─── Clipboard mock ─────────────────────────────────────────────

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ═══════════════════════════════════════════════════════════════════
// ChatCodeBlock
// ═══════════════════════════════════════════════════════════════════

describe('ChatCodeBlock', () => {
  describe('Rendering', () => {
    it('renders code content', () => {
      renderWithTheme(<ChatCodeBlock code="const x = 1;" />);
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });

    it('renders language label when provided', () => {
      renderWithTheme(
        <ChatCodeBlock code="const x = 1;" language="typescript" />
      );
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });

    it('hides language label when language is undefined', () => {
      renderWithTheme(<ChatCodeBlock code="hello" testId="cb" />);
      // Header still shows (copyable is true by default), but no language label
      const container = screen.getByTestId('cb');
      expect(container).not.toHaveTextContent('undefined');
    });

    it('applies data-testid', () => {
      renderWithTheme(<ChatCodeBlock code="code" testId="my-code" />);
      expect(screen.getByTestId('my-code')).toBeInTheDocument();
    });

    it('renders in pre/code elements', () => {
      renderWithTheme(<ChatCodeBlock code="fn main()" testId="cb" />);
      const container = screen.getByTestId('cb');
      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();
      const code = pre?.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code).toHaveTextContent('fn main()');
    });
  });

  describe('Copy Button', () => {
    it('renders copy button when copyable is true (default)', () => {
      renderWithTheme(<ChatCodeBlock code="code" language="js" />);
      expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
    });

    it('hides copy button when copyable is false', () => {
      renderWithTheme(
        <ChatCodeBlock code="code" language="js" copyable={false} />
      );
      expect(screen.queryByLabelText('Copy code')).not.toBeInTheDocument();
    });

    it('calls navigator.clipboard.writeText on click', () => {
      renderWithTheme(<ChatCodeBlock code="hello world" />);
      fireEvent.click(screen.getByLabelText('Copy code'));
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world');
    });

    it('shows check icon after successful copy', async () => {
      renderWithTheme(<ChatCodeBlock code="copied" />);
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Copy code'));
        // Flush the resolved clipboard promise microtask
        await Promise.resolve();
      });
      expect(screen.getByLabelText('Copied')).toBeInTheDocument();
    });

    it('reverts to copy icon after 2 seconds', async () => {
      renderWithTheme(<ChatCodeBlock code="copied" />);
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Copy code'));
        await Promise.resolve();
      });
      expect(screen.getByLabelText('Copied')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
    });
  });

  describe('Line Numbers', () => {
    it('shows line numbers when lineNumbers is true', () => {
      renderWithTheme(
        <ChatCodeBlock code={'line1\nline2\nline3'} lineNumbers testId="cb" />
      );
      const lineNumbers = screen.getByTestId('cb-line-numbers');
      expect(lineNumbers).toBeInTheDocument();
    });

    it('hides line numbers when lineNumbers is false (default)', () => {
      renderWithTheme(<ChatCodeBlock code={'line1\nline2'} testId="cb" />);
      expect(screen.queryByTestId('cb-line-numbers')).not.toBeInTheDocument();
    });

    it('renders correct count of line numbers', () => {
      renderWithTheme(
        <ChatCodeBlock code={'a\nb\nc\nd\ne'} lineNumbers testId="cb" />
      );
      const lineNumbers = screen.getByTestId('cb-line-numbers');
      expect(lineNumbers).toHaveTextContent('1');
      expect(lineNumbers).toHaveTextContent('5');
      // Should have exactly 5 child divs
      expect(lineNumbers.children).toHaveLength(5);
    });
  });

  describe('Max Height', () => {
    it('applies maxHeight style to content container', () => {
      renderWithTheme(
        <ChatCodeBlock code="code" maxHeight={200} testId="cb" />
      );
      const content = screen.getByTestId('cb-content');
      const styleStr = content.getAttribute('style') ?? '';
      expect(styleStr).toContain('200px');
    });

    it('defaults to 400px', () => {
      renderWithTheme(<ChatCodeBlock code="code" testId="cb" />);
      const content = screen.getByTestId('cb-content');
      // The inline var should contain 400px
      const styleStr = content.getAttribute('style') ?? '';
      expect(styleStr).toContain('400px');
    });
  });

  describe('Actions Slot', () => {
    it('renders custom actions in the header', () => {
      renderWithTheme(
        <ChatCodeBlock
          code="code"
          language="js"
          actions={<button data-testid="insert-btn">Insert</button>}
        />
      );
      expect(screen.getByTestId('insert-btn')).toBeInTheDocument();
    });

    it('renders nothing when actions is undefined', () => {
      renderWithTheme(<ChatCodeBlock code="code" language="js" testId="cb" />);
      // No custom action buttons
      expect(screen.queryByTestId('insert-btn')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('code element has appropriate role', () => {
      renderWithTheme(<ChatCodeBlock code="x = 1" testId="cb" />);
      const container = screen.getByTestId('cb');
      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
    });

    it('copy button has aria-label', () => {
      renderWithTheme(<ChatCodeBlock code="code" />);
      const btn = screen.getByLabelText('Copy code');
      expect(btn).toHaveAttribute('aria-label', 'Copy code');
    });
  });
});
