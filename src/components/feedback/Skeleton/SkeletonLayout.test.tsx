import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { SkeletonLayout } from './SkeletonLayout';

describe('SkeletonLayout', () => {
  describe('Rendering', () => {
    it('sets the variant on a data attribute', () => {
      renderWithTheme(<SkeletonLayout variant="card" testId="layout" />);
      expect(screen.getByTestId('layout')).toHaveAttribute(
        'data-variant',
        'card'
      );
    });

    it('forwards custom className and style', () => {
      renderWithTheme(
        <SkeletonLayout
          variant="list"
          testId="layout"
          className="my-class"
          style={{ marginTop: 8 }}
        />
      );
      const el = screen.getByTestId('layout');
      expect(el.className).toContain('my-class');
      expect(el.getAttribute('style')).toContain('margin-top');
    });

    it('marks the layout as decorative', () => {
      renderWithTheme(<SkeletonLayout variant="card" testId="layout" />);
      const el = screen.getByTestId('layout');
      expect(el).toHaveAttribute('aria-hidden', 'true');
      expect(el).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Width', () => {
    it('defaults to width 100%', () => {
      renderWithTheme(<SkeletonLayout variant="card" testId="layout" />);
      expect(screen.getByTestId('layout').getAttribute('style')).toContain(
        'width: 100%'
      );
    });

    it('resolves numeric width to px', () => {
      renderWithTheme(
        <SkeletonLayout variant="card" testId="layout" width={320} />
      );
      expect(screen.getByTestId('layout').getAttribute('style')).toContain(
        'width: 320px'
      );
    });

    it('passes string width through unchanged', () => {
      renderWithTheme(
        <SkeletonLayout variant="card" testId="layout" width="60ch" />
      );
      expect(screen.getByTestId('layout').getAttribute('style')).toContain(
        'width: 60ch'
      );
    });
  });

  describe('Variant counts', () => {
    it('list defaults to 5 rows', () => {
      const { container } = renderWithTheme(
        <SkeletonLayout variant="list" testId="layout" />
      );
      // Each row contains one circle skeleton — count rows by [data-shape="circle"]
      expect(container.querySelectorAll('[data-shape="circle"]').length).toBe(
        5
      );
    });

    it('respects custom list count', () => {
      const { container } = renderWithTheme(
        <SkeletonLayout variant="list" count={8} testId="layout" />
      );
      expect(container.querySelectorAll('[data-shape="circle"]').length).toBe(
        8
      );
    });

    it('grid defaults to 12 cells with 4 columns', () => {
      const { container } = renderWithTheme(
        <SkeletonLayout variant="grid" testId="layout" />
      );
      const skeletons = container.querySelectorAll('[data-shape="rect"]');
      expect(skeletons.length).toBe(12);
    });

    it('chat defaults to 4 bubbles', () => {
      const { container } = renderWithTheme(
        <SkeletonLayout variant="chat" testId="layout" />
      );
      expect(container.querySelectorAll('[data-shape="circle"]').length).toBe(
        4
      );
    });

    it('table renders header + data rows', () => {
      const { container } = renderWithTheme(
        <SkeletonLayout variant="table" columns={3} count={4} testId="layout" />
      );
      // 3 header cells + 3 × 4 data cells = 15 line skeletons
      expect(container.querySelectorAll('[data-shape="line"]').length).toBe(15);
    });
  });

  describe('Animation', () => {
    it('defaults grid to "none" for performance', () => {
      const { container } = renderWithTheme(
        <SkeletonLayout variant="grid" count={2} testId="layout" />
      );
      const first = container.querySelector('[data-shape="rect"]');
      expect(first).toHaveAttribute('data-animation', 'none');
    });

    it('defaults card to "pulse"', () => {
      const { container } = renderWithTheme(
        <SkeletonLayout variant="card" testId="layout" />
      );
      const circle = container.querySelector('[data-shape="circle"]');
      expect(circle).toHaveAttribute('data-animation', 'pulse');
    });

    it('respects explicit animation override', () => {
      const { container } = renderWithTheme(
        <SkeletonLayout variant="list" animation="wave" testId="layout" />
      );
      const circle = container.querySelector('[data-shape="circle"]');
      expect(circle).toHaveAttribute('data-animation', 'wave');
    });
  });
});
