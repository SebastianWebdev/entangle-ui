import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { MenuBar } from '@/components/shell';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';
import {
  SaveIcon,
  CopyIcon,
  CutIcon,
  PasteIcon,
  FolderOpenIcon,
} from '@/components/Icons';

export default function MenuBarDemo() {
  return (
    <DemoWrapper padding="0" height="300px">
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

export function MenuBarSizes() {
  return (
    <DemoWrapper padding="1rem" height="320px" withKeyboard>
      <Stack gap={4}>
        <div>
          <Text size="xs" color="secondary" style={{ marginBottom: 4 }}>
            size="sm"
          </Text>
          <MenuBar size="sm">
            <MenuBar.Menu label="File">
              <MenuBar.Item shortcut="Ctrl+N">New File</MenuBar.Item>
              <MenuBar.Item shortcut="Ctrl+S">Save</MenuBar.Item>
            </MenuBar.Menu>
            <MenuBar.Menu label="Edit">
              <MenuBar.Item shortcut="Ctrl+Z">Undo</MenuBar.Item>
              <MenuBar.Item shortcut="Ctrl+Y">Redo</MenuBar.Item>
            </MenuBar.Menu>
          </MenuBar>
        </div>
        <div>
          <Text size="xs" color="secondary" style={{ marginBottom: 4 }}>
            size="md"
          </Text>
          <MenuBar size="md">
            <MenuBar.Menu label="File">
              <MenuBar.Item shortcut="Ctrl+N">New File</MenuBar.Item>
              <MenuBar.Item shortcut="Ctrl+S">Save</MenuBar.Item>
            </MenuBar.Menu>
            <MenuBar.Menu label="Edit">
              <MenuBar.Item shortcut="Ctrl+Z">Undo</MenuBar.Item>
              <MenuBar.Item shortcut="Ctrl+Y">Redo</MenuBar.Item>
            </MenuBar.Menu>
          </MenuBar>
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function MenuBarSubmenus() {
  return (
    <DemoWrapper padding="0" height="300px" withKeyboard>
      <MenuBar>
        <MenuBar.Menu label="View">
          <MenuBar.Item>Zoom In</MenuBar.Item>
          <MenuBar.Item>Zoom Out</MenuBar.Item>
          <MenuBar.Separator />
          <MenuBar.Sub label="Layout">
            <MenuBar.Item>Single</MenuBar.Item>
            <MenuBar.Item>Split View</MenuBar.Item>
            <MenuBar.Item>Quad View</MenuBar.Item>
          </MenuBar.Sub>
          <MenuBar.Sub label="Panels">
            <MenuBar.Item>Inspector</MenuBar.Item>
            <MenuBar.Item>Outliner</MenuBar.Item>
            <MenuBar.Item>Console</MenuBar.Item>
          </MenuBar.Sub>
        </MenuBar.Menu>
      </MenuBar>
    </DemoWrapper>
  );
}

export function MenuBarIcons() {
  return (
    <DemoWrapper padding="0" height="300px" withKeyboard>
      <MenuBar>
        <MenuBar.Menu label="File">
          <MenuBar.Item icon={<FolderOpenIcon />} shortcut="Ctrl+O">
            Open...
          </MenuBar.Item>
          <MenuBar.Item icon={<SaveIcon />} shortcut="Ctrl+S">
            Save
          </MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu label="Edit">
          <MenuBar.Item icon={<CutIcon />} shortcut="Ctrl+X">
            Cut
          </MenuBar.Item>
          <MenuBar.Item icon={<CopyIcon />} shortcut="Ctrl+C">
            Copy
          </MenuBar.Item>
          <MenuBar.Item icon={<PasteIcon />} shortcut="Ctrl+V">
            Paste
          </MenuBar.Item>
        </MenuBar.Menu>
      </MenuBar>
    </DemoWrapper>
  );
}

export function MenuBarDisabled() {
  return (
    <DemoWrapper padding="0" height="300px" withKeyboard>
      <MenuBar>
        <MenuBar.Menu label="File">
          <MenuBar.Item icon={<SaveIcon />} shortcut="Ctrl+S">
            Save
          </MenuBar.Item>
          <MenuBar.Item disabled>Export (unavailable)</MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu label="Debug" disabled>
          <MenuBar.Item>Step Over</MenuBar.Item>
        </MenuBar.Menu>
      </MenuBar>
    </DemoWrapper>
  );
}

export function MenuBarCheckable() {
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [shading, setShading] = useState('solid');

  return (
    <DemoWrapper padding="0" height="340px" withKeyboard>
      <MenuBar>
        <MenuBar.Menu label="View">
          <MenuBar.CheckboxItem
            checked={showGrid}
            onCheckedChange={setShowGrid}
          >
            Show Grid
          </MenuBar.CheckboxItem>
          <MenuBar.CheckboxItem
            checked={showAxes}
            onCheckedChange={setShowAxes}
          >
            Show Axes
          </MenuBar.CheckboxItem>
          <MenuBar.Separator />
          <MenuBar.RadioGroup value={shading} onValueChange={setShading}>
            <MenuBar.RadioItem value="solid">Solid</MenuBar.RadioItem>
            <MenuBar.RadioItem value="wireframe">Wireframe</MenuBar.RadioItem>
            <MenuBar.RadioItem value="rendered">Rendered</MenuBar.RadioItem>
          </MenuBar.RadioGroup>
        </MenuBar.Menu>
      </MenuBar>
    </DemoWrapper>
  );
}

export function MenuBarOffset() {
  return (
    <DemoWrapper padding="0" height="300px" withKeyboard>
      <MenuBar menuOffset={10}>
        <MenuBar.Menu label="File">
          <MenuBar.Item shortcut="Ctrl+N">New File</MenuBar.Item>
          <MenuBar.Item shortcut="Ctrl+S">Save</MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu label="Edit">
          <MenuBar.Item shortcut="Ctrl+Z">Undo</MenuBar.Item>
          <MenuBar.Item shortcut="Ctrl+Y">Redo</MenuBar.Item>
        </MenuBar.Menu>
      </MenuBar>
    </DemoWrapper>
  );
}
