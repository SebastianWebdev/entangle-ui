import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Link } from './Link';

describe('Link', () => {
  describe('Rendering', () => {
    it('renders as <a> by default', () => {
      renderWithTheme(
        <Link href="/foo" testId="link">
          Foo
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el.tagName).toBe('A');
      expect(el).toHaveAttribute('href', '/foo');
    });

    it('renders children', () => {
      renderWithTheme(<Link href="/foo">Hello world</Link>);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('forwards className and style', () => {
      renderWithTheme(
        <Link
          href="/foo"
          className="custom"
          style={{ marginTop: 4 }}
          testId="link"
        >
          x
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el).toHaveClass('custom');
      expect(el.getAttribute('style')).toContain('margin-top');
    });

    it('forwards ref to the underlying anchor', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      renderWithTheme(
        <Link href="/foo" ref={ref}>
          Foo
        </Link>
      );
      expect(ref.current?.tagName).toBe('A');
    });
  });

  describe('Polymorphism (`as`)', () => {
    it('renders the element passed via `as`', () => {
      renderWithTheme(
        <Link as="button" testId="link">
          As button
        </Link>
      );
      expect(screen.getByTestId('link').tagName).toBe('BUTTON');
    });

    it('renders a custom component passed via `as`', () => {
      const RouterLink = (
        props: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
          to?: string;
        }
      ) => {
        const { to, href, ...rest } = props;
        return <a data-router="yes" href={to ?? href} {...rest} />;
      };
      renderWithTheme(
        <Link as={RouterLink} testId="link">
          Custom
        </Link>
      );
      expect(screen.getByTestId('link')).toHaveAttribute('data-router', 'yes');
    });
  });

  describe('Disabled', () => {
    it('renders as <span> when disabled', () => {
      renderWithTheme(
        <Link href="/foo" disabled testId="link">
          Foo
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el.tagName).toBe('SPAN');
      expect(el).not.toHaveAttribute('href');
    });

    it('sets aria-disabled when disabled', () => {
      renderWithTheme(
        <Link href="/foo" disabled testId="link">
          Foo
        </Link>
      );
      expect(screen.getByTestId('link')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });

  describe('Underline', () => {
    it('accepts each underline value without error', () => {
      const values = ['always', 'hover', 'never'] as const;
      for (const u of values) {
        const { unmount } = renderWithTheme(
          <Link href="/foo" underline={u} testId={`link-${u}`}>
            x
          </Link>
        );
        expect(screen.getByTestId(`link-${u}`)).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('Sizes', () => {
    it('accepts each size without error', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      for (const size of sizes) {
        const { unmount } = renderWithTheme(
          <Link href="/foo" size={size} testId={size}>
            x
          </Link>
        );
        expect(screen.getByTestId(size)).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('Variants', () => {
    it('accepts each variant without error', () => {
      const variants = ['default', 'subtle', 'inline'] as const;
      for (const variant of variants) {
        const { unmount } = renderWithTheme(
          <Link href="/foo" variant={variant} testId={variant}>
            x
          </Link>
        );
        expect(screen.getByTestId(variant)).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('External', () => {
    it('auto-detects external links from http href', () => {
      renderWithTheme(
        <Link href="http://example.com" testId="link">
          Site
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el).toHaveAttribute('target', '_blank');
      expect(el).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('auto-detects external links from https href', () => {
      renderWithTheme(
        <Link href="https://example.com" testId="link">
          Site
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el).toHaveAttribute('target', '_blank');
    });

    it('does not mark relative URLs as external', () => {
      renderWithTheme(
        <Link href="/docs" testId="link">
          Docs
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el).not.toHaveAttribute('target');
      expect(el).not.toHaveAttribute('rel');
    });

    it('explicit external prop overrides auto-detection', () => {
      renderWithTheme(
        <Link href="https://example.com" external={false} testId="link">
          Same tab
        </Link>
      );
      expect(screen.getByTestId('link')).not.toHaveAttribute('target');
    });

    it('explicit external=true forces external behavior on relative href', () => {
      renderWithTheme(
        <Link href="/foo" external testId="link">
          Forced
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el).toHaveAttribute('target', '_blank');
      expect(el).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders an external icon when external', () => {
      renderWithTheme(
        <Link href="https://example.com" testId="link">
          Site
        </Link>
      );
      const svg = screen.getByTestId('link').querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('appends "(opens in new tab)" SR-only text when no aria-label', () => {
      renderWithTheme(
        <Link href="https://example.com" testId="link">
          Site
        </Link>
      );
      expect(screen.getByText(/\(opens in new tab\)/i)).toBeInTheDocument();
    });

    it('augments aria-label with "(opens in new tab)" when aria-label is set', () => {
      renderWithTheme(
        <Link
          href="https://example.com"
          aria-label="Visit example"
          testId="link"
        >
          Site
        </Link>
      );
      expect(screen.getByTestId('link')).toHaveAttribute(
        'aria-label',
        'Visit example (opens in new tab)'
      );
    });

    it('disabled external link does not get target/rel', () => {
      renderWithTheme(
        <Link href="https://example.com" disabled testId="link">
          Site
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el).not.toHaveAttribute('target');
      expect(el).not.toHaveAttribute('rel');
    });
  });

  describe('Interactions', () => {
    it('fires onClick for SPA-style usage', async () => {
      const handleClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
      const user = userEvent.setup();
      renderWithTheme(
        <Link href="/foo" onClick={handleClick}>
          Click
        </Link>
      );
      await user.click(screen.getByText('Click'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders disabled links as a non-anchor span without href', () => {
      renderWithTheme(
        <Link href="/foo" disabled testId="link">
          Click
        </Link>
      );
      const el = screen.getByTestId('link');
      expect(el.tagName).toBe('SPAN');
      expect(el).not.toHaveAttribute('href');
      expect(el).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Color override', () => {
    it('accepts a custom CSS color string', () => {
      renderWithTheme(
        <Link href="/foo" color="#ff00ff" testId="link">
          Custom
        </Link>
      );
      expect(screen.getByTestId('link')).toBeInTheDocument();
    });
  });
});
