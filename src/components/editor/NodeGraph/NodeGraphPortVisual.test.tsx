import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { NodeGraphPortVisual } from './NodeGraphPortVisual';

describe('NodeGraphPortVisual', () => {
  it('renders an aria-hidden svg', () => {
    const { container } = renderWithTheme(<NodeGraphPortVisual />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('defaults to a hollow circle painted with currentColor', () => {
    const { container } = renderWithTheme(<NodeGraphPortVisual />);
    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('stroke', 'currentColor');
    expect(circle).toHaveAttribute('fill', 'none');
  });

  it('fills the shape with the colour when filled', () => {
    const { container } = renderWithTheme(
      <NodeGraphPortVisual filled color="#9ee65a" />
    );
    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('stroke', '#9ee65a');
    expect(circle).toHaveAttribute('fill', '#9ee65a');
  });

  it('uses an explicit colour for the stroke while hollow', () => {
    const { container } = renderWithTheme(
      <NodeGraphPortVisual color="#3aa4ff" />
    );
    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('stroke', '#3aa4ff');
    expect(circle).toHaveAttribute('fill', 'none');
  });

  it('renders a polygon for triangle and diamond shapes', () => {
    const tri = renderWithTheme(<NodeGraphPortVisual shape="triangle" />);
    expect(tri.container.querySelector('polygon')).toBeInTheDocument();

    const diamond = renderWithTheme(<NodeGraphPortVisual shape="diamond" />);
    expect(diamond.container.querySelector('polygon')).toBeInTheDocument();
  });

  it('renders a rect for the square shape', () => {
    const { container } = renderWithTheme(
      <NodeGraphPortVisual shape="square" />
    );
    expect(container.querySelector('rect')).toBeInTheDocument();
  });

  it('applies the size prop to the svg box', () => {
    const { container } = renderWithTheme(<NodeGraphPortVisual size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });
});
