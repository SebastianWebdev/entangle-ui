import DemoWrapper from '../DemoWrapper';
import { ContextMenu, Menu } from '@/components/navigation';
import { Text } from '@/components/primitives';

export default function ContextMenuDemo() {
  return (
    <DemoWrapper>
      <ContextMenu>
        <ContextMenu.Trigger>
          <div
            style={{
              padding: '32px',
              border: '1px dashed #4a4a4a',
              borderRadius: 4,
              textAlign: 'center',
            }}
          >
            <Text size="sm" color="muted">
              Right-click here
            </Text>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <Menu.Item shortcut="⌘X" onClick={() => console.log('Cut')}>
            Cut
          </Menu.Item>
          <Menu.Item shortcut="⌘C" onClick={() => console.log('Copy')}>
            Copy
          </Menu.Item>
          <Menu.Item shortcut="⌘V" onClick={() => console.log('Paste')}>
            Paste
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item shortcut="⌫" onClick={() => console.log('Delete')}>
            Delete
          </Menu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    </DemoWrapper>
  );
}
