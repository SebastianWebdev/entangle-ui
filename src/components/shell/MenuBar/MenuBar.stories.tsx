import type { Meta, StoryObj } from '@storybook/react';
import { MenuBar } from './MenuBar';

const meta: Meta<typeof MenuBar> = {
  title: 'Shell/MenuBar',
  component: MenuBar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MenuBar>;

export const Default: Story = {
  render: () => (
    <MenuBar>
      <MenuBar.Menu label="File">
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+N">
          New File
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+O">
          Open File...
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Shift+N">
          New Window
        </MenuBar.Item>
        <MenuBar.Separator />
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+S">
          Save
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Shift+S">
          Save As...
        </MenuBar.Item>
        <MenuBar.Separator />
        <MenuBar.Item onClick={() => {}}>Exit</MenuBar.Item>
      </MenuBar.Menu>
      <MenuBar.Menu label="Edit">
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Z">
          Undo
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Y">
          Redo
        </MenuBar.Item>
        <MenuBar.Separator />
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+X">
          Cut
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+C">
          Copy
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+V">
          Paste
        </MenuBar.Item>
      </MenuBar.Menu>
      <MenuBar.Menu label="View">
        <MenuBar.Sub label="Appearance">
          <MenuBar.Item onClick={() => {}}>Full Screen</MenuBar.Item>
          <MenuBar.Item onClick={() => {}}>Zen Mode</MenuBar.Item>
        </MenuBar.Sub>
        <MenuBar.Sub label="Editor Layout">
          <MenuBar.Item onClick={() => {}}>Split Up</MenuBar.Item>
          <MenuBar.Item onClick={() => {}}>Split Down</MenuBar.Item>
          <MenuBar.Item onClick={() => {}}>Split Left</MenuBar.Item>
          <MenuBar.Item onClick={() => {}}>Split Right</MenuBar.Item>
        </MenuBar.Sub>
        <MenuBar.Separator />
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Shift+E">
          Explorer
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Shift+F">
          Search
        </MenuBar.Item>
      </MenuBar.Menu>
      <MenuBar.Menu label="Help">
        <MenuBar.Item onClick={() => {}}>Documentation</MenuBar.Item>
        <MenuBar.Item onClick={() => {}}>About</MenuBar.Item>
      </MenuBar.Menu>
    </MenuBar>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <MenuBar $size="sm">
      <MenuBar.Menu label="File">
        <MenuBar.Item onClick={() => {}}>New</MenuBar.Item>
        <MenuBar.Item onClick={() => {}}>Open</MenuBar.Item>
      </MenuBar.Menu>
      <MenuBar.Menu label="Edit">
        <MenuBar.Item onClick={() => {}}>Undo</MenuBar.Item>
        <MenuBar.Item onClick={() => {}}>Redo</MenuBar.Item>
      </MenuBar.Menu>
    </MenuBar>
  ),
};

export const WithDisabledMenu: Story = {
  render: () => (
    <MenuBar>
      <MenuBar.Menu label="File">
        <MenuBar.Item onClick={() => {}}>New</MenuBar.Item>
        <MenuBar.Item onClick={() => {}} disabled>
          Save (disabled)
        </MenuBar.Item>
      </MenuBar.Menu>
      <MenuBar.Menu label="Debug" disabled>
        <MenuBar.Item onClick={() => {}}>Start</MenuBar.Item>
      </MenuBar.Menu>
    </MenuBar>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <MenuBar>
      <MenuBar.Menu label="File">
        <MenuBar.Item onClick={() => {}} icon={<span>📄</span>}>
          New File
        </MenuBar.Item>
        <MenuBar.Item onClick={() => {}} icon={<span>📂</span>}>
          Open Folder
        </MenuBar.Item>
        <MenuBar.Separator />
        <MenuBar.Item
          onClick={() => {}}
          icon={<span>💾</span>}
          shortcut="Ctrl+S"
        >
          Save
        </MenuBar.Item>
      </MenuBar.Menu>
    </MenuBar>
  ),
};
