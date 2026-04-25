import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Skeleton testId="skel" />);
      const el = screen.getByTestId('skel');
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('data-shape', 'rect');
      expect(el).toHaveAttribute('data-animation', 'pulse');
      expect(el.getAttribute('style')).toContain('100%');
    });

    it('renders shape="rect"', () => {
      renderWithTheme(<Skeleton testId="skel" shape="rect" />);
      expect(screen.getByTestId('skel')).toHaveAttribute('data-shape', 'rect');
    });

    it('renders shape="circle"', () => {
      renderWithTheme(<Skeleton testId="skel" shape="circle" width={32} />);
      expect(screen.getByTestId('skel')).toHaveAttribute(
        'data-shape',
        'circle'
      );
    });

    it('renders shape="line"', () => {
      renderWithTheme(<Skeleton testId="skel" shape="line" />);
      expect(screen.getByTestId('skel')).toHaveAttribute('data-shape', 'line');
    });

    it('uses default height of 12px for shape="line"', () => {
      renderWithTheme(<Skeleton testId="skel" shape="line" />);
      expect(screen.getByTestId('skel').getAttribute('style')).toContain(
        '12px'
      );
    });

    it('forwards custom className', () => {
      renderWithTheme(<Skeleton testId="skel" className="my-skel" />);
      expect(screen.getByTestId('skel').className).toContain('my-skel');
    });

    it('merges user style with inline CSS variables', () => {
      renderWithTheme(
        <Skeleton testId="skel" width={120} style={{ marginTop: '4px' }} />
      );
      const styleStr = screen.getByTestId('skel').getAttribute('style') ?? '';
      expect(styleStr).toContain('120px');
      expect(styleStr).toContain('margin-top');
    });
  });

  describe('Dimensions', () => {
    it('resolves width as number to px', () => {
      renderWithTheme(<Skeleton testId="skel" width={200} />);
      expect(screen.getByTestId('skel').getAttribute('style')).toContain(
        '200px'
      );
    });

    it('resolves height as number to px', () => {
      renderWithTheme(<Skeleton testId="skel" width={200} height={48} />);
      expect(screen.getByTestId('skel').getAttribute('style')).toContain(
        '48px'
      );
    });

    it('passes width as string through unchanged', () => {
      renderWithTheme(<Skeleton testId="skel" width="60%" />);
      expect(screen.getByTestId('skel').getAttribute('style')).toContain('60%');
    });

    it('passes height as string through unchanged', () => {
      renderWithTheme(<Skeleton testId="skel" height="10rem" />);
      expect(screen.getByTestId('skel').getAttribute('style')).toContain(
        '10rem'
      );
    });

    it('shape="circle" with only width sets height equal to width', () => {
      renderWithTheme(<Skeleton testId="skel" shape="circle" width={48} />);
      const styleStr = screen.getByTestId('skel').getAttribute('style') ?? '';
      // both width and height variables should resolve to 48px
      const occurrences = styleStr.match(/48px/g)?.length ?? 0;
      expect(occurrences).toBeGreaterThanOrEqual(2);
    });

    it('applies borderRadius override (number → px)', () => {
      renderWithTheme(<Skeleton testId="skel" borderRadius={8} />);
      expect(screen.getByTestId('skel').getAttribute('style')).toContain('8px');
    });

    it('applies borderRadius override (string passes through)', () => {
      renderWithTheme(<Skeleton testId="skel" borderRadius="999px" />);
      expect(screen.getByTestId('skel').getAttribute('style')).toContain(
        '999px'
      );
    });
  });

  describe('Animations', () => {
    it('applies pulse animation by default', () => {
      renderWithTheme(<Skeleton testId="skel" />);
      expect(screen.getByTestId('skel')).toHaveAttribute(
        'data-animation',
        'pulse'
      );
    });

    it('applies wave animation', () => {
      renderWithTheme(<Skeleton testId="skel" animation="wave" />);
      expect(screen.getByTestId('skel')).toHaveAttribute(
        'data-animation',
        'wave'
      );
    });

    it('applies no animation class with animation="none"', () => {
      renderWithTheme(<Skeleton testId="skel" animation="none" />);
      expect(screen.getByTestId('skel')).toHaveAttribute(
        'data-animation',
        'none'
      );
    });

    it('applies different recipe classes for different animations', () => {
      const { rerender } = renderWithTheme(
        <Skeleton testId="skel" animation="pulse" />
      );
      const pulseClass = screen.getByTestId('skel').className;
      rerender(<Skeleton testId="skel" animation="wave" />);
      const waveClass = screen.getByTestId('skel').className;
      expect(pulseClass).not.toBe(waveClass);
    });
  });

  describe('Accessibility', () => {
    it('sets aria-hidden="true"', () => {
      renderWithTheme(<Skeleton testId="skel" />);
      expect(screen.getByTestId('skel')).toHaveAttribute('aria-hidden', 'true');
    });

    it('sets aria-busy="true"', () => {
      renderWithTheme(<Skeleton testId="skel" />);
      expect(screen.getByTestId('skel')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Dev warnings', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns when shape="circle" has unequal width and height', () => {
      renderWithTheme(<Skeleton shape="circle" width={32} height={16} />);
      expect(warnSpy).toHaveBeenCalled();
      const firstArg = warnSpy.mock.calls[0]?.[0];
      expect(typeof firstArg).toBe('string');
      expect(firstArg as string).toContain('shape="circle"');
    });

    it('does not warn when shape="circle" has equal width and height', () => {
      renderWithTheme(<Skeleton shape="circle" width={32} height={32} />);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('does not warn when shape="circle" has only width', () => {
      renderWithTheme(<Skeleton shape="circle" width={32} />);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
