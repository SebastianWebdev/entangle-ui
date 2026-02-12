import DemoWrapper from '../DemoWrapper';
import { MenuBar } from '@/components/shell';

export default function MenuBarDemo() {
  return (
    <DemoWrapper padding="0">
      <MenuBar>
        <MenuBar.Menu label="File">
          <MenuBar.Item shortcut="Ctrl+N">New File</MenuBar.Item>
          <MenuBar.Item shortcut="Ctrl+O">Open...</MenuBar.Item>
          <MenuBar.Item shortcut="Ctrl+S">Save</MenuBar.Item>
          <MenuBar.Separator />
          <MenuBar.Item>Exit</MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu label="Edit">
          <MenuBar.Item shortcut="Ctrl+Z">Undo</MenuBar.Item>
          <MenuBar.Item shortcut="Ctrl+Y">Redo</MenuBar.Item>
          <MenuBar.Separator />
          <MenuBar.Item shortcut="Ctrl+C">Copy</MenuBar.Item>
          <MenuBar.Item shortcut="Ctrl+V">Paste</MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu label="View">
          <MenuBar.Item>Zoom In</MenuBar.Item>
          <MenuBar.Item>Zoom Out</MenuBar.Item>
        </MenuBar.Menu>
      </MenuBar>
    </DemoWrapper>
  );
}
