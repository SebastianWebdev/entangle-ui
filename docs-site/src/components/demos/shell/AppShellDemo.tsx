import DemoWrapper from '../DemoWrapper';
import { AppShell, MenuBar, StatusBar } from '@/components/shell';
import { Text } from '@/components/primitives';

export default function AppShellDemo() {
  return (
    <DemoWrapper padding="0">
      <div
        style={{
          height: 400,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 6,
        }}
      >
        <AppShell>
          <AppShell.MenuBar>
            <MenuBar>
              <MenuBar.Menu label="File">
                <MenuBar.Item>New</MenuBar.Item>
                <MenuBar.Item>Open</MenuBar.Item>
              </MenuBar.Menu>
              <MenuBar.Menu label="Edit">
                <MenuBar.Item>Undo</MenuBar.Item>
                <MenuBar.Item>Redo</MenuBar.Item>
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
              }}
            >
              <Text color="muted">Viewport Area</Text>
            </div>
          </AppShell.Dock>
          <AppShell.StatusBar>
            <StatusBar>
              <StatusBar.Section side="left">
                <StatusBar.Item>Ready</StatusBar.Item>
              </StatusBar.Section>
            </StatusBar>
          </AppShell.StatusBar>
        </AppShell>
      </div>
    </DemoWrapper>
  );
}
