import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { AppShell, useAppShell } from './AppShell';
import React from 'react';

describe('AppShell', () => {
  describe('Rendering', () => {
    it('renders with role="application"', () => {
      renderWithTheme(
        <AppShell>
          <AppShell.Dock>Main content</AppShell.Dock>
        </AppShell>
      );
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    it('renders all slots', () => {
      renderWithTheme(
        <AppShell>
          <AppShell.MenuBar>
            <div data-testid="menubar">Menu</div>
          </AppShell.MenuBar>
          <AppShell.Toolbar>
            <div data-testid="toolbar-top">Top Toolbar</div>
          </AppShell.Toolbar>
          <AppShell.Toolbar position="left">
            <div data-testid="toolbar-left">Left Toolbar</div>
          </AppShell.Toolbar>
          <AppShell.Dock>
            <div data-testid="dock">Dock Area</div>
          </AppShell.Dock>
          <AppShell.Toolbar position="right">
            <div data-testid="toolbar-right">Right Toolbar</div>
          </AppShell.Toolbar>
          <AppShell.StatusBar>
            <div data-testid="statusbar">Status</div>
          </AppShell.StatusBar>
        </AppShell>
      );
      expect(screen.getByTestId('menubar')).toBeInTheDocument();
      expect(screen.getByTestId('toolbar-top')).toBeInTheDocument();
      expect(screen.getByTestId('toolbar-left')).toBeInTheDocument();
      expect(screen.getByTestId('dock')).toBeInTheDocument();
      expect(screen.getByTestId('toolbar-right')).toBeInTheDocument();
      expect(screen.getByTestId('statusbar')).toBeInTheDocument();
    });

    it('renders minimal config (dock + status only)', () => {
      renderWithTheme(
        <AppShell>
          <AppShell.Dock>Content</AppShell.Dock>
          <AppShell.StatusBar>Status</AppShell.StatusBar>
        </AppShell>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('supports topChromeSeparator="none"', () => {
      renderWithTheme(
        <AppShell topChromeSeparator="none">
          <AppShell.Toolbar>
            <div data-testid="toolbar-top">Top Toolbar</div>
          </AppShell.Toolbar>
          <AppShell.Dock>Content</AppShell.Dock>
        </AppShell>
      );

      const toolbarTopSlot = screen.getByTestId('toolbar-top').parentElement;
      expect(toolbarTopSlot).toHaveStyle({ borderBottom: 'none' });
      expect(toolbarTopSlot).toHaveStyle({ boxShadow: 'none' });
    });

    it('supports sideChromeSeparator="none"', () => {
      renderWithTheme(
        <AppShell sideChromeSeparator="none">
          <AppShell.Toolbar position="left">
            <div data-testid="toolbar-left">Left Toolbar</div>
          </AppShell.Toolbar>
          <AppShell.Dock>Content</AppShell.Dock>
          <AppShell.Toolbar position="right">
            <div data-testid="toolbar-right">Right Toolbar</div>
          </AppShell.Toolbar>
        </AppShell>
      );

      const toolbarLeftSlot = screen.getByTestId('toolbar-left').parentElement;
      const toolbarRightSlot =
        screen.getByTestId('toolbar-right').parentElement;

      expect(toolbarLeftSlot).toHaveStyle({ borderRight: 'none' });
      expect(toolbarLeftSlot).toHaveStyle({ boxShadow: 'none' });
      expect(toolbarRightSlot).toHaveStyle({ borderLeft: 'none' });
      expect(toolbarRightSlot).toHaveStyle({ boxShadow: 'none' });
    });
  });

  describe('Semantic HTML', () => {
    it('uses header for menu bar slot', () => {
      const { container } = renderWithTheme(
        <AppShell>
          <AppShell.MenuBar>Menu</AppShell.MenuBar>
          <AppShell.Dock>Content</AppShell.Dock>
        </AppShell>
      );
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Menu');
    });

    it('uses main for dock slot', () => {
      const { container } = renderWithTheme(
        <AppShell>
          <AppShell.Dock>Content</AppShell.Dock>
        </AppShell>
      );
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveTextContent('Content');
    });

    it('uses footer for status bar slot', () => {
      const { container } = renderWithTheme(
        <AppShell>
          <AppShell.Dock>Content</AppShell.Dock>
          <AppShell.StatusBar>Status</AppShell.StatusBar>
        </AppShell>
      );
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveTextContent('Status');
    });

    it('uses aside for side toolbar slots', () => {
      const { container } = renderWithTheme(
        <AppShell>
          <AppShell.Toolbar position="left">Left</AppShell.Toolbar>
          <AppShell.Dock>Content</AppShell.Dock>
          <AppShell.Toolbar position="right">Right</AppShell.Toolbar>
        </AppShell>
      );
      const asides = container.querySelectorAll('aside');
      expect(asides).toHaveLength(2);
    });
  });

  describe('Toolbar Visibility', () => {
    it('hides toolbar via useAppShell context', () => {
      const ToggleButton: React.FC = () => {
        const { setToolbarVisible, isToolbarVisible } = useAppShell();
        return (
          <button
            onClick={() => setToolbarVisible('left', !isToolbarVisible('left'))}
          >
            Toggle
          </button>
        );
      };

      renderWithTheme(
        <AppShell>
          <AppShell.Dock>
            <ToggleButton />
          </AppShell.Dock>
          <AppShell.Toolbar position="left">
            <div data-testid="left-toolbar">Tools</div>
          </AppShell.Toolbar>
        </AppShell>
      );

      // Toolbar should be visible initially
      expect(screen.getByTestId('left-toolbar')).toBeInTheDocument();

      // Toggle off
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.queryByTestId('left-toolbar')).not.toBeInTheDocument();

      // Toggle back on
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.getByTestId('left-toolbar')).toBeInTheDocument();
    });
  });

  describe('Viewport Lock', () => {
    it('does not inject global styles by default', () => {
      renderWithTheme(
        <AppShell>
          <AppShell.Dock>Content</AppShell.Dock>
        </AppShell>
      );
      // Just verify component renders without viewportLock
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    it('renders with viewportLock enabled', () => {
      renderWithTheme(
        <AppShell viewportLock>
          <AppShell.Dock>Content</AppShell.Dock>
        </AppShell>
      );
      expect(screen.getByRole('application')).toBeInTheDocument();
    });
  });
});
