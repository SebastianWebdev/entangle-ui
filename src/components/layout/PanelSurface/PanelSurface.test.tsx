import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { PanelSurface } from './PanelSurface';

describe('PanelSurface', () => {
  it('renders root container and children', () => {
    renderWithTheme(
      <PanelSurface testId="panel-surface">
        <PanelSurface.Body>Content</PanelSurface.Body>
      </PanelSurface>
    );

    expect(screen.getByTestId('panel-surface')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders header, body, and footer sections', () => {
    renderWithTheme(
      <PanelSurface>
        <PanelSurface.Header>Header</PanelSurface.Header>
        <PanelSurface.Body>Body</PanelSurface.Body>
        <PanelSurface.Footer>Footer</PanelSurface.Footer>
      </PanelSurface>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('supports gradient backgrounds through background prop', () => {
    renderWithTheme(
      <PanelSurface
        testId="gradient-panel"
        background="linear-gradient(180deg, #2f3442 0%, #1b202a 100%)"
      >
        <PanelSurface.Body>Gradient</PanelSurface.Body>
      </PanelSurface>
    );

    // assignInlineVars sets the gradient value as a CSS custom property.
    // jsdom can't resolve CSS vars, so verify the inline style contains the value.
    const panel = screen.getByTestId('gradient-panel');
    expect(panel.style.cssText).toContain(
      'linear-gradient(180deg, #2f3442 0%, #1b202a 100%)'
    );
  });

  it('supports scrollable body mode', () => {
    renderWithTheme(
      <PanelSurface>
        <PanelSurface.Body testId="scroll-body" scroll>
          Body
        </PanelSurface.Body>
      </PanelSurface>
    );

    expect(screen.getByTestId('scroll-body')).toHaveStyle({ overflow: 'auto' });
  });

  it('supports body padding as number and string', () => {
    const { rerender } = renderWithTheme(
      <PanelSurface>
        <PanelSurface.Body testId="body-padding" padding={12}>
          Body
        </PanelSurface.Body>
      </PanelSurface>
    );

    expect(screen.getByTestId('body-padding')).toHaveStyle({ padding: '12px' });

    rerender(
      <PanelSurface>
        <PanelSurface.Body testId="body-padding" padding="16px 20px">
          Body
        </PanelSurface.Body>
      </PanelSurface>
    );

    expect(screen.getByTestId('body-padding')).toHaveStyle({
      padding: '16px 20px',
    });
  });

  it('renders header actions area', () => {
    renderWithTheme(
      <PanelSurface>
        <PanelSurface.Header actions={<button>Action</button>}>
          Header
        </PanelSurface.Header>
      </PanelSurface>
    );

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
