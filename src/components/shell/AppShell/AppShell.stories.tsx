import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell';
import { MenuBar } from '../MenuBar';
import { Toolbar } from '../Toolbar';
import { StatusBar } from '../StatusBar';

const meta: Meta<typeof AppShell> = {
  title: 'Shell/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const FullEditor: Story = {
  render: () => (
    <AppShell>
      <AppShell.MenuBar>
        <MenuBar>
          <MenuBar.Menu label="File">
            <MenuBar.Item onClick={() => {}}>New</MenuBar.Item>
            <MenuBar.Item onClick={() => {}}>Open</MenuBar.Item>
            <MenuBar.Separator />
            <MenuBar.Item onClick={() => {}}>Save</MenuBar.Item>
          </MenuBar.Menu>
          <MenuBar.Menu label="Edit">
            <MenuBar.Item onClick={() => {}}>Undo</MenuBar.Item>
            <MenuBar.Item onClick={() => {}}>Redo</MenuBar.Item>
          </MenuBar.Menu>
          <MenuBar.Menu label="View">
            <MenuBar.Item onClick={() => {}}>Toggle Sidebar</MenuBar.Item>
          </MenuBar.Menu>
        </MenuBar>
      </AppShell.MenuBar>

      <AppShell.Toolbar>
        <Toolbar aria-label="Main toolbar">
          <Toolbar.Button onClick={() => {}}>New</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>Save</Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Button onClick={() => {}}>Undo</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>Redo</Toolbar.Button>
        </Toolbar>
      </AppShell.Toolbar>

      <AppShell.Toolbar position="left">
        <Toolbar $orientation="vertical" aria-label="Tool palette" $size="sm">
          <Toolbar.Button onClick={() => {}}>S</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>M</Toolbar.Button>
          <Toolbar.Button onClick={() => {}}>R</Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Button onClick={() => {}}>P</Toolbar.Button>
        </Toolbar>
      </AppShell.Toolbar>

      <AppShell.Dock>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
          }}
        >
          Dock area — panels would go here
        </div>
      </AppShell.Dock>

      <AppShell.StatusBar>
        <StatusBar>
          <StatusBar.Section $side="left">
            <StatusBar.Item onClick={() => {}}>main</StatusBar.Item>
            <StatusBar.Item>Ready</StatusBar.Item>
          </StatusBar.Section>
          <StatusBar.Section $side="right">
            <StatusBar.Item onClick={() => {}}>UTF-8</StatusBar.Item>
            <StatusBar.Item onClick={() => {}}>TypeScript</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      </AppShell.StatusBar>
    </AppShell>
  ),
};

export const MinimalConfig: Story = {
  render: () => (
    <AppShell>
      <AppShell.Dock>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
          }}
        >
          Just a dock — no menu, no toolbars, no status bar
        </div>
      </AppShell.Dock>
    </AppShell>
  ),
};

export const DockAndStatusBar: Story = {
  render: () => (
    <AppShell>
      <AppShell.Dock>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
          }}
        >
          Main editor area
        </div>
      </AppShell.Dock>
      <AppShell.StatusBar>
        <StatusBar>
          <StatusBar.Section $side="left">
            <StatusBar.Item>Connected</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      </AppShell.StatusBar>
    </AppShell>
  ),
};

export const WithViewportLock: Story = {
  render: () => (
    <AppShell viewportLock>
      <AppShell.MenuBar>
        <MenuBar>
          <MenuBar.Menu label="File">
            <MenuBar.Item onClick={() => {}}>New</MenuBar.Item>
          </MenuBar.Menu>
        </MenuBar>
      </AppShell.MenuBar>
      <AppShell.Dock>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
          }}
        >
          Viewport-locked app shell
        </div>
      </AppShell.Dock>
      <AppShell.StatusBar>
        <StatusBar>
          <StatusBar.Section $side="left">
            <StatusBar.Item>Viewport Locked</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      </AppShell.StatusBar>
    </AppShell>
  ),
};
