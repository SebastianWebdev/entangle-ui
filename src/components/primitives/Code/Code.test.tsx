import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Code } from './Code';

describe('Code', () => {
  describe('Rendering', () => {
    it('renders as a <code> element', () => {
      renderWithTheme(<Code testId="c">npm run build</Code>);
      const el = screen.getByTestId('c');
      expect(el.tagName).toBe('CODE');
    });

    it('renders children', () => {
      renderWithTheme(<Code>npm run build</Code>);
      expect(screen.getByText('npm run build')).toBeInTheDocument();
    });

    it('accepts each size without error', () => {
      const sizes = ['xs', 'sm', 'md'] as const;
      for (const size of sizes) {
        const { unmount } = renderWithTheme(
          <Code size={size} testId={size}>
            npm
          </Code>
        );
        expect(screen.getByTestId(size)).toBeInTheDocument();
        unmount();
      }
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Code className="custom" testId="c">
          x
        </Code>
      );
      expect(screen.getByTestId('c')).toHaveClass('custom');
    });
  });

  describe('Accessibility', () => {
    it('forwards ref to the code element', () => {
      const ref = React.createRef<HTMLElement>();
      renderWithTheme(<Code ref={ref}>x</Code>);
      expect(ref.current?.tagName).toBe('CODE');
    });
  });
});
