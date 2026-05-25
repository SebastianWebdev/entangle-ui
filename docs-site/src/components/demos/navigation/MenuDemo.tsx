import DemoWrapper from '../DemoWrapper';
import { Menu } from '@/components/navigation';

export default function MenuDemo() {
  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>Open Menu</Menu.Trigger>
        <Menu.Content>
          <Menu.Group label="File">
            <Menu.Item shortcut="⌘N" onClick={() => console.log('New')}>
              New File
            </Menu.Item>
            <Menu.Item onClick={() => console.log('Open')}>Open…</Menu.Item>
            <Menu.Item shortcut="⌘S" onClick={() => console.log('Save')}>
              Save
            </Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Group label="Edit">
            <Menu.Item shortcut="⌘Z" onClick={() => console.log('Undo')}>
              Undo
            </Menu.Item>
            <Menu.Item shortcut="⇧⌘Z" onClick={() => console.log('Redo')}>
              Redo
            </Menu.Item>
          </Menu.Group>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}
