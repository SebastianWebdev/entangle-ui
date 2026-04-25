import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Skeleton } from './Skeleton';
import { SkeletonGroup } from './SkeletonGroup';

describe('SkeletonGroup', () => {
  describe('Item generation', () => {
    it('renders `count` skeletons when no children are provided', () => {
      renderWithTheme(
        <SkeletonGroup testId="group" count={3} itemProps={{ shape: 'line' }} />
      );
      const group = screen.getByTestId('group');
      expect(group.children).toHaveLength(3);
      Array.from(group.children).forEach(child => {
        expect(child).toHaveAttribute('data-shape', 'line');
      });
    });

    it('renders nothing when count is 0 and no children', () => {
      renderWithTheme(<SkeletonGroup testId="group" count={0} />);
      expect(screen.getByTestId('group').children).toHaveLength(0);
    });

    it('ignores `count` when children are provided', () => {
      renderWithTheme(
        <SkeletonGroup testId="group" count={5}>
          <Skeleton testId="child-a" />
          <Skeleton testId="child-b" />
        </SkeletonGroup>
      );
      expect(screen.getByTestId('group').children).toHaveLength(2);
      expect(screen.getByTestId('child-a')).toBeInTheDocument();
      expect(screen.getByTestId('child-b')).toBeInTheDocument();
    });

    it('forwards itemProps to every auto-generated Skeleton', () => {
      renderWithTheme(
        <SkeletonGroup
          testId="group"
          count={2}
          itemProps={{ shape: 'circle', width: 24, animation: 'wave' }}
        />
      );
      const group = screen.getByTestId('group');
      Array.from(group.children).forEach(child => {
        expect(child).toHaveAttribute('data-shape', 'circle');
        expect(child).toHaveAttribute('data-animation', 'wave');
        expect(child.getAttribute('style')).toContain('24px');
      });
    });
  });

  describe('Layout', () => {
    it('uses column direction by default', () => {
      const { rerender } = renderWithTheme(
        <SkeletonGroup testId="group" count={1} />
      );
      const columnClass = screen.getByTestId('group').className;
      rerender(<SkeletonGroup testId="group" direction="row" count={1} />);
      const rowClass = screen.getByTestId('group').className;
      expect(columnClass).not.toBe(rowClass);
    });

    it('applies row direction when specified', () => {
      renderWithTheme(
        <SkeletonGroup testId="group" direction="row" count={1} />
      );
      // Recipe class differs from column; we already cover diff in the test above.
      // Here we just check the element exists and renders without crashing.
      expect(screen.getByTestId('group')).toBeInTheDocument();
    });

    it('maps spacing number to spacing scale via inline gap variable', () => {
      renderWithTheme(<SkeletonGroup testId="group" spacing={3} count={1} />);
      const styleStr = screen.getByTestId('group').getAttribute('style') ?? '';
      // The spacing scale resolves to a CSS var like var(--etui-spacing-md);
      // assigning it to a CSS variable yields a substring with `etui-spacing`.
      expect(styleStr).toContain('etui-spacing');
    });

    it('passes string spacing through as raw CSS gap', () => {
      renderWithTheme(
        <SkeletonGroup testId="group" spacing="20px" count={1} />
      );
      const styleStr = screen.getByTestId('group').getAttribute('style') ?? '';
      expect(styleStr).toContain('20px');
    });

    it('floors fractional spacing values to the nearest scale step', () => {
      renderWithTheme(<SkeletonGroup testId="group" spacing={2.7} count={1} />);
      // 2.7 → floor to 2 → spacing.sm; the var name maps to etui-spacing-sm.
      const styleStr = screen.getByTestId('group').getAttribute('style') ?? '';
      expect(styleStr).toContain('etui-spacing-sm');
    });

    it('clamps out-of-range spacing values to the scale bounds', () => {
      const { rerender } = renderWithTheme(
        <SkeletonGroup testId="group" spacing={100} count={1} />
      );
      const upperStyle =
        screen.getByTestId('group').getAttribute('style') ?? '';
      expect(upperStyle).toContain('etui-spacing-xxxl');

      rerender(<SkeletonGroup testId="group" spacing={-5} count={1} />);
      const lowerStyle =
        screen.getByTestId('group').getAttribute('style') ?? '';
      // 0 maps to the literal '0' string, not a token.
      expect(lowerStyle).not.toContain('etui-spacing');
      expect(lowerStyle).toMatch(/:\s*0[;\s]/);
    });
  });

  describe('Accessibility', () => {
    it('sets aria-hidden="true" and aria-busy="true"', () => {
      renderWithTheme(<SkeletonGroup testId="group" count={1} />);
      const group = screen.getByTestId('group');
      expect(group).toHaveAttribute('aria-hidden', 'true');
      expect(group).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Pass-through', () => {
    it('forwards className', () => {
      renderWithTheme(
        <SkeletonGroup testId="group" className="my-group" count={1} />
      );
      expect(screen.getByTestId('group').className).toContain('my-group');
    });

    it('merges user style with inline gap variable', () => {
      renderWithTheme(
        <SkeletonGroup testId="group" count={1} style={{ marginTop: '8px' }} />
      );
      const styleStr = screen.getByTestId('group').getAttribute('style') ?? '';
      expect(styleStr).toContain('margin-top');
    });
  });
});
