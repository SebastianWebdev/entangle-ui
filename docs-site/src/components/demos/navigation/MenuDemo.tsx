import { useState } from 'react';

import DemoWrapper from '../DemoWrapper';
import { Menu } from '@/components/navigation';
import { Badge, Switch } from '@/components/primitives';
import { IconButton } from '@/components/primitives/IconButton';
import {
  AddIcon,
  CopyIcon,
  CutIcon,
  DotsVerticalIcon,
  EyeIcon,
  GridIcon,
  PasteIcon,
  PlayIcon,
  SaveIcon,
  TrashIcon,
} from '@/components/Icons';

/** Basic composition: trigger + content + items. */
export default function MenuDemo() {
  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>Options</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onClick={() => console.log('Copy')}>Copy</Menu.Item>
          <Menu.Item onClick={() => console.log('Paste')}>Paste</Menu.Item>
          <Menu.Item onClick={() => console.log('Delete')}>Delete</Menu.Item>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}

/** Icon (left) + label (center) + shortcut (right). */
export function MenuWithIcons() {
  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>Edit</Menu.Trigger>
        <Menu.Content>
          <Menu.Item icon={<CutIcon size="sm" />} shortcut="⌘X">
            Cut
          </Menu.Item>
          <Menu.Item icon={<CopyIcon size="sm" />} shortcut="⌘C">
            Copy
          </Menu.Item>
          <Menu.Item icon={<PasteIcon size="sm" />} shortcut="⌘V">
            Paste
          </Menu.Item>
          <Menu.Item icon={<TrashIcon size="sm" />} shortcut="⌫">
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}

/** Labeled groups split by separators. */
export function MenuGroups() {
  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>File</Menu.Trigger>
        <Menu.Content>
          <Menu.Group label="File">
            <Menu.Item icon={<AddIcon size="sm" />} shortcut="⌘N">
              New File
            </Menu.Item>
            <Menu.Item icon={<SaveIcon size="sm" />} shortcut="⌘S">
              Save
            </Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Group label="Edit">
            <Menu.Item shortcut="⌘Z">Undo</Menu.Item>
            <Menu.Item shortcut="⇧⌘Z">Redo</Menu.Item>
          </Menu.Group>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}

/** Single selection with a controlled RadioGroup. */
export function MenuRadioSelection() {
  const [view, setView] = useState('perspective');

  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>View: {view}</Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup value={view} onValueChange={setView}>
            <Menu.RadioItem value="perspective">Perspective</Menu.RadioItem>
            <Menu.RadioItem value="orthographic">Orthographic</Menu.RadioItem>
            <Menu.RadioItem value="front">Front</Menu.RadioItem>
            <Menu.RadioItem value="top">Top</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}

/** Multiple independent toggles via CheckboxItem. */
export function MenuCheckboxSelection() {
  const [grid, setGrid] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [normals, setNormals] = useState(false);

  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>Overlays</Menu.Trigger>
        <Menu.Content>
          <Menu.Group label="Overlays">
            <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
              Grid
            </Menu.CheckboxItem>
            <Menu.CheckboxItem
              checked={wireframe}
              onCheckedChange={setWireframe}
            >
              Wireframe
            </Menu.CheckboxItem>
            <Menu.CheckboxItem checked={normals} onCheckedChange={setNormals}>
              Normals
            </Menu.CheckboxItem>
          </Menu.Group>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}

/** Arbitrary nodes (badge, switch) in the right slot via endContent. */
export function MenuEndContent() {
  const [snap, setSnap] = useState(true);

  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>Tools</Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            icon={<PlayIcon size="sm" />}
            endContent={<Badge>3</Badge>}
          >
            Render Queue
          </Menu.Item>
          <Menu.Item
            icon={<GridIcon size="sm" />}
            endContent={
              <Switch
                size="sm"
                checked={snap}
                onChange={setSnap}
                aria-label="Snapping"
              />
            }
          >
            Snapping
          </Menu.Item>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}

/** Nested submenu. SubTrigger renders a chevron automatically. */
export function MenuSubmenus() {
  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>Add</Menu.Trigger>
        <Menu.Content>
          <Menu.Sub>
            <Menu.SubTrigger icon={<GridIcon size="sm" />}>
              Mesh
            </Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Cube</Menu.Item>
              <Menu.Item>Sphere</Menu.Item>
              <Menu.Item>Cylinder</Menu.Item>
              <Menu.Item>Plane</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Sub>
            <Menu.SubTrigger icon={<PlayIcon size="sm" />}>
              Light
            </Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Point</Menu.Item>
              <Menu.Item>Spot</Menu.Item>
              <Menu.Item>Directional</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Item icon={<EyeIcon size="sm" />}>Camera</Menu.Item>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}

/** Custom trigger element via render. */
export function MenuCustomTrigger() {
  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger
          render={
            <IconButton aria-label="More actions">
              <DotsVerticalIcon size="sm" />
            </IconButton>
          }
        />
        <Menu.Content>
          <Menu.Item icon={<CopyIcon size="sm" />}>Duplicate</Menu.Item>
          <Menu.Item icon={<TrashIcon size="sm" />}>Remove</Menu.Item>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}

/** Disabled item and disabled trigger. */
export function MenuDisabled() {
  return (
    <DemoWrapper>
      <Menu>
        <Menu.Trigger>Edit</Menu.Trigger>
        <Menu.Content>
          <Menu.Item icon={<CopyIcon size="sm" />} shortcut="⌘C">
            Copy
          </Menu.Item>
          <Menu.Item icon={<PasteIcon size="sm" />} shortcut="⌘V" disabled>
            Paste
          </Menu.Item>
        </Menu.Content>
      </Menu>
    </DemoWrapper>
  );
}
