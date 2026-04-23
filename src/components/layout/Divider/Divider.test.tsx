import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Divider } from './Divider';

describe('Divider', () => {
  describe('Rendering', () => {
    it('renders with role="separator"', () => {
      renderWithTheme(<Divider testId="d" />);
      const el = screen.getByTestId('d');
      expect(el).toHaveAttribute('role', 'separator');
    });

    it('defaults to horizontal orientation', () => {
      renderWithTheme(<Divider testId="d" />);
      expect(screen.getByTestId('d')).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      );
    });

    it('accepts vertical orientation', () => {
      renderWithTheme(<Divider orientation="vertical" testId="d" />);
      expect(screen.getByTestId('d')).toHaveAttribute(
        'aria-orientation',
        'vertical'
      );
    });

    it('renders a label when horizontal and label provided', () => {
      renderWithTheme(<Divider label="Advanced" testId="d" />);
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('ignores label when vertical', () => {
      renderWithTheme(
        <Divider orientation="vertical" label="ignored" testId="d" />
      );
      expect(screen.queryByText('ignored')).not.toBeInTheDocument();
    });
  });

  describe('Spacing', () => {
    it('maps number spacing to theme scale via CSS var', () => {
      renderWithTheme(<Divider spacing={3} testId="d" />);
      const el = screen.getByTestId('d');
      expect(el.style.marginTop).toContain('var(--etui-spacing-md)');
    });

    it('passes string spacing through verbatim', () => {
      renderWithTheme(<Divider spacing="1rem" testId="d" />);
      const el = screen.getByTestId('d');
      expect(el.style.marginTop).toBe('1rem');
    });
  });

  describe('Accessibility', () => {
    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithTheme(<Divider ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
