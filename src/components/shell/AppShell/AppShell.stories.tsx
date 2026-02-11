import type { CSSProperties } from 'react';
import { useState } from 'react';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';
import { vars } from '@/theme';
import { AppShell } from './AppShell';
import { MenuBar } from '../MenuBar';
import { Toolbar } from '../Toolbar';
import { StatusBar } from '../StatusBar';
import { FloatingPanel, FloatingManager } from '../FloatingPanel';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import { SplitPane } from '@/components/layout/SplitPane';
import { PanelSurface } from '@/components/layout/PanelSurface';
import { Tabs, TabList, Tab, TabPanel } from '@/components/navigation/Tabs';
import { TreeView } from '@/components/controls/TreeView';
import { NumberInput } from '@/components/controls/NumberInput';
import { Slider } from '@/components/controls/Slider';
import { Select } from '@/components/controls/Select';
import { ColorPicker } from '@/components/controls/ColorPicker';
import {
  CurveEditor,
  createLinearCurve,
} from '@/components/controls/CurveEditor';
import { ScrollArea } from '@/components/layout/ScrollArea';
import { ContextMenu } from '@/components/navigation/ContextMenu';
import type { MenuConfig } from '@/components/navigation/Menu';
import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/primitives/Checkbox';
import { Input } from '@/components/primitives/Input';
import { Switch } from '@/components/primitives/Switch';
import { Text } from '@/components/primitives/Text';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/layout/Accordion';
import {
  PropertyPanel,
  PropertySection,
  PropertyRow,
  PropertyGroup,
} from '@/components/editor/PropertyInspector';
import {
  AddIcon,
  SaveIcon,
  UndoIcon,
  RedoIcon,
  CopyIcon,
  CutIcon,
  PasteIcon,
  TrashIcon,
  SearchIcon,
  SettingsIcon,
  PlayIcon,
  EyeIcon,
  LockIcon,
  GridIcon,
  FullscreenIcon,
  FolderIcon,
  CodeIcon,
  WarningIcon,
  InfoIcon,
  CheckIcon,
  DownloadIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@/components/Icons';

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

const shellGradient = `radial-gradient(160% 130% at 100% 0%, ${vars.storybook.canvas.gradientStart} 0%, ${vars.storybook.canvas.gradientMid} 48%, ${vars.storybook.canvas.gradientEnd} 100%)`;

const topToolbarGradient = `linear-gradient(90deg, #093236 0%, ${vars.storybook.canvas.gradientMid} 52%, ${vars.storybook.canvas.gradientEnd} 100%)`;

const asideToolbarGradient = `linear-gradient(180deg, #093236 0%, ${vars.storybook.canvas.gradientMid} 52%, ${vars.storybook.canvas.gradientEnd} 100%)`;

const topToolbarGradientStyles: CSSProperties = {
  backgroundImage: topToolbarGradient,
  backgroundColor: vars.storybook.canvas.gradientEnd,
};

const asideToolbarGradientStyles: CSSProperties = {
  backgroundImage: asideToolbarGradient,
  backgroundColor: vars.storybook.canvas.gradientEnd,
};

const panelGradientStyles: CSSProperties = {
  backgroundImage: shellGradient,
  backgroundColor: vars.storybook.canvas.gradientEnd,
};

// ---------------------------------------------------------------------------
// Styled helpers for the FullEditor story
// ---------------------------------------------------------------------------

const ViewportCanvas = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background.primary};
  position: relative;
  overflow: hidden;
`;

const ViewportGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
`;

const ViewportAxisX = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 80, 80, 0.25);
`;

const ViewportAxisZ = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(80, 80, 255, 0.25);
`;

const ViewportGizmo = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const GizmoAxis = styled.div<{ $color: string; $rotation: number }>`
  position: absolute;
  width: 2px;
  height: 22px;
  background: ${({ $color }) => $color};
  transform-origin: bottom center;
  bottom: 50%;
  left: calc(50% - 1px);
  transform: rotate(${({ $rotation }) => $rotation}deg);
  border-radius: 1px;

  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`;

const GizmoLabel = styled.span<{
  $x: number;
  $y: number;
  $color: string;
}>`
  position: absolute;
  font-size: 9px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
`;

const ViewportOverlay = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ViewportBadge = styled.div`
  padding: 3px 8px;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  user-select: none;
`;

const ViewportTopBar = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
`;

const ViewportModeBtn = styled.button<{ $active?: boolean }>`
  padding: 3px 10px;
  font-size: 10px;
  border: 1px solid
    ${({ $active }) =>
      $active ? 'rgba(0,122,204,0.6)' : 'rgba(255,255,255,0.08)'};
  border-radius: 3px;
  background: ${({ $active }) =>
    $active ? 'rgba(0,122,204,0.2)' : 'rgba(20,20,20,0.8)'};
  color: ${({ $active }) => ($active ? '#6cb6ff' : 'rgba(255,255,255,0.5)')};
  cursor: pointer;
  font-family: inherit;

  &:hover {
    border-color: rgba(0, 122, 204, 0.5);
    color: rgba(255, 255, 255, 0.8);
  }
`;

const CubeWireframe = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  transform: translate(-50%, -50%) rotateX(-25deg) rotateY(35deg);
  transform-style: preserve-3d;
`;

const CubeFace = styled.div<{ $transform: string; $highlight?: boolean }>`
  position: absolute;
  width: 120px;
  height: 120px;
  border: 1.5px solid
    ${({ $highlight }) =>
      $highlight ? 'rgba(0, 122, 204, 0.8)' : 'rgba(255, 255, 255, 0.15)'};
  background: ${({ $highlight }) =>
    $highlight ? 'rgba(0, 122, 204, 0.06)' : 'rgba(255, 255, 255, 0.01)'};
  transform: ${({ $transform }) => $transform};
  box-shadow: ${({ $highlight }) =>
    $highlight ? '0 0 20px rgba(0, 122, 204, 0.15)' : 'none'};
`;

const SelectionDots = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 130px;
  height: 130px;
  transform: translate(-50%, -50%) rotateX(-25deg) rotateY(35deg);
  transform-style: preserve-3d;
`;

const SelectionCorner = styled.div<{ $x: number; $y: number; $z: number }>`
  position: absolute;
  width: 6px;
  height: 6px;
  background: #007acc;
  border: 1px solid #fff;
  border-radius: 1px;
  transform: translate3d(
    ${({ $x }) => $x}px,
    ${({ $y }) => $y}px,
    ${({ $z }) => $z}px
  );
`;

const ConsoleEntry = styled.div<{
  $type?: 'info' | 'warn' | 'error' | 'success';
}>`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 3px 10px;
  font-size: 11px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ $type, theme }) => {
    switch ($type) {
      case 'warn':
        return theme.colors.accent.warning;
      case 'error':
        return theme.colors.accent.error;
      case 'success':
        return theme.colors.accent.success;
      default:
        return theme.colors.text.muted;
    }
  }};
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const TimeStamp = styled.span`
  color: ${({ theme }) => theme.colors.text.disabled};
  flex-shrink: 0;
`;

// ---------------------------------------------------------------------------
// FullEditor Story — jaw-dropping showcase of Entangle UI
// ---------------------------------------------------------------------------

export const FullEditor: Story = {
  render: function Render() {
    // State for interactive controls
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(1.5);
    const [posZ, setPosZ] = useState(0);
    const [rotX, setRotX] = useState(0);
    const [rotY, setRotY] = useState(35);
    const [rotZ, setRotZ] = useState(0);
    const [objectName, setObjectName] = useState('Cube.001');
    const [tagFilter, setTagFilter] = useState('hero');
    const [scaleVal, setScaleVal] = useState(1);
    const [baseColor, setBaseColor] = useState('#4a9eff');
    const [paletteColor, setPaletteColor] = useState('#4a9eff');
    const [roughness, setRoughness] = useState(0.45);
    const [metallic, setMetallic] = useState(0.8);
    const [emissionStrength, setEmissionStrength] = useState(0);
    const [castShadows, setCastShadows] = useState(true);
    const [receiveShadows, setReceiveShadows] = useState(true);
    const [visible, setVisible] = useState(true);
    const [lockedInOutliner, setLockedInOutliner] = useState(false);
    const [showBounds, setShowBounds] = useState(true);
    const [curveData, setCurveData] = useState(() => createLinearCurve());
    const [curvePreviewValue, setCurvePreviewValue] = useState(0.5);
    const [renderMode, setRenderMode] = useState<string>('solid');
    const [showFloating, setShowFloating] = useState(true);
    const [outlinerTab, setOutlinerTab] = useState('scene');
    const [bottomTab, setBottomTab] = useState('console');

    const viewportContextMenu: MenuConfig = {
      groups: [
        {
          id: 'selection',
          itemSelectionType: 'none',
          items: [
            {
              id: 'select-all',
              label: 'Select All',
              icon: <GridIcon size="sm" />,
              onClick: () => {},
            },
            {
              id: 'deselect',
              label: 'Deselect All',
              icon: <CutIcon size="sm" />,
              onClick: () => {},
            },
            {
              id: 'invert',
              label: 'Invert Selection',
              icon: <UndoIcon size="sm" />,
              onClick: () => {},
            },
          ],
        },
        {
          id: 'add-object',
          label: 'Add',
          itemSelectionType: 'none',
          items: [
            {
              id: 'add-mesh',
              label: 'Mesh',
              icon: <GridIcon size="sm" />,
              onClick: () => {},
              subMenu: {
                groups: [
                  {
                    id: 'meshes',
                    itemSelectionType: 'none',
                    items: [
                      { id: 'add-cube', label: 'Cube', onClick: () => {} },
                      { id: 'add-sphere', label: 'Sphere', onClick: () => {} },
                      {
                        id: 'add-cylinder',
                        label: 'Cylinder',
                        onClick: () => {},
                      },
                      { id: 'add-plane', label: 'Plane', onClick: () => {} },
                      { id: 'add-torus', label: 'Torus', onClick: () => {} },
                    ],
                  },
                ],
              },
            },
            {
              id: 'add-light',
              label: 'Light',
              icon: <PlayIcon size="sm" />,
              onClick: () => {},
              subMenu: {
                groups: [
                  {
                    id: 'lights',
                    itemSelectionType: 'none',
                    items: [
                      {
                        id: 'add-point',
                        label: 'Point Light',
                        onClick: () => {},
                      },
                      {
                        id: 'add-spot',
                        label: 'Spot Light',
                        onClick: () => {},
                      },
                      {
                        id: 'add-dir',
                        label: 'Directional Light',
                        onClick: () => {},
                      },
                      {
                        id: 'add-area',
                        label: 'Area Light',
                        onClick: () => {},
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: 'add-camera',
              label: 'Camera',
              icon: <EyeIcon size="sm" />,
              onClick: () => {},
            },
            {
              id: 'add-empty',
              label: 'Empty',
              icon: <AddIcon size="sm" />,
              onClick: () => {},
            },
          ],
        },
        {
          id: 'object',
          itemSelectionType: 'none',
          items: [
            {
              id: 'duplicate',
              label: 'Duplicate',
              icon: <CopyIcon size="sm" />,
              onClick: () => {},
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: <TrashIcon size="sm" />,
              onClick: () => {},
            },
            {
              id: 'hide',
              label: 'Hide Selected',
              icon: <EyeIcon size="sm" />,
              onClick: () => {},
            },
            {
              id: 'lock',
              label: 'Lock Selected',
              icon: <LockIcon size="sm" />,
              onClick: () => {},
            },
          ],
        },
        {
          id: 'snapping',
          label: 'Snap',
          itemSelectionType: 'none',
          items: [
            {
              id: 'snap-cursor',
              label: 'Cursor to Selected',
              icon: <FullscreenIcon size="sm" />,
              onClick: () => {},
            },
            {
              id: 'snap-origin',
              label: 'Origin to Geometry',
              icon: <GridIcon size="sm" />,
              onClick: () => {},
            },
            {
              id: 'snap-ground',
              label: 'Snap to Ground',
              icon: <DownloadIcon size="sm" />,
              onClick: () => {},
            },
          ],
        },
      ],
    };

    const sceneTree = [
      {
        id: 'scene',
        label: 'Scene',
        icon: <FolderIcon size="sm" />,
        children: [
          {
            id: 'camera',
            label: 'Main Camera',
            icon: <EyeIcon size="sm" />,
          },
          {
            id: 'light-sun',
            label: 'Directional Light',
            icon: <span style={{ fontSize: 12, lineHeight: 1 }}>&#9728;</span>,
          },
          {
            id: 'light-point',
            label: 'Point Light',
            icon: <span style={{ fontSize: 12, lineHeight: 1 }}>&#9679;</span>,
          },
          {
            id: 'cube',
            label: 'Cube.001',
            icon: <span style={{ fontSize: 10, lineHeight: 1 }}>&#11042;</span>,
            children: [
              {
                id: 'cube-mesh',
                label: 'Mesh',
                icon: <GridIcon size="sm" />,
              },
              {
                id: 'cube-material',
                label: 'PBR Material',
                icon: (
                  <span style={{ fontSize: 10, lineHeight: 1 }}>&#9673;</span>
                ),
              },
            ],
          },
          {
            id: 'plane',
            label: 'Ground Plane',
            icon: <span style={{ fontSize: 10, lineHeight: 1 }}>&#9645;</span>,
          },
          {
            id: 'sphere',
            label: 'Sphere.001',
            icon: <span style={{ fontSize: 10, lineHeight: 1 }}>&#9711;</span>,
          },
          {
            id: 'empty',
            label: 'Empty (Origin)',
            icon: <AddIcon size="sm" />,
          },
        ],
      },
    ];

    return (
      <KeyboardContextProvider>
        <AppShell viewportLock topChromeSeparator="both">
          {/* ============ MENU BAR ============ */}
          <AppShell.MenuBar>
            <MenuBar menuOffset={4}>
              <MenuBar.Menu label="File">
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Ctrl+N"
                  icon={<AddIcon size="sm" />}
                >
                  New Scene
                </MenuBar.Item>
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Ctrl+O"
                  icon={<FolderIcon size="sm" />}
                >
                  Open Scene...
                </MenuBar.Item>
                <MenuBar.Sub label="Open Recent">
                  <MenuBar.Item onClick={() => {}}>
                    scene_v3_final.entangle
                  </MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>
                    character_rig.entangle
                  </MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>
                    environment_01.entangle
                  </MenuBar.Item>
                  <MenuBar.Separator />
                  <MenuBar.Item onClick={() => {}}>Clear Recent</MenuBar.Item>
                </MenuBar.Sub>
                <MenuBar.Separator />
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Ctrl+S"
                  icon={<SaveIcon size="sm" />}
                >
                  Save
                </MenuBar.Item>
                <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Shift+S">
                  Save As...
                </MenuBar.Item>
                <MenuBar.Separator />
                <MenuBar.Sub label="Export">
                  <MenuBar.Item onClick={() => {}}>
                    Export as glTF (.gltf)
                  </MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>
                    Export as FBX (.fbx)
                  </MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>
                    Export as OBJ (.obj)
                  </MenuBar.Item>
                </MenuBar.Sub>
                <MenuBar.Item
                  onClick={() => {}}
                  icon={<DownloadIcon size="sm" />}
                >
                  Import...
                </MenuBar.Item>
                <MenuBar.Separator />
                <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Q">
                  Quit
                </MenuBar.Item>
              </MenuBar.Menu>

              <MenuBar.Menu label="Edit">
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Ctrl+Z"
                  icon={<UndoIcon size="sm" />}
                >
                  Undo
                </MenuBar.Item>
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Ctrl+Y"
                  icon={<RedoIcon size="sm" />}
                >
                  Redo
                </MenuBar.Item>
                <MenuBar.Separator />
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Ctrl+X"
                  icon={<CutIcon size="sm" />}
                >
                  Cut
                </MenuBar.Item>
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Ctrl+C"
                  icon={<CopyIcon size="sm" />}
                >
                  Copy
                </MenuBar.Item>
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Ctrl+V"
                  icon={<PasteIcon size="sm" />}
                >
                  Paste
                </MenuBar.Item>
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="Delete"
                  icon={<TrashIcon size="sm" />}
                >
                  Delete
                </MenuBar.Item>
                <MenuBar.Separator />
                <MenuBar.Item onClick={() => {}} shortcut="Ctrl+A">
                  Select All
                </MenuBar.Item>
                <MenuBar.Item onClick={() => {}} shortcut="Ctrl+Shift+A">
                  Deselect All
                </MenuBar.Item>
                <MenuBar.Separator />
                <MenuBar.Item
                  onClick={() => {}}
                  icon={<SettingsIcon size="sm" />}
                >
                  Preferences...
                </MenuBar.Item>
              </MenuBar.Menu>

              <MenuBar.Menu label="View">
                <MenuBar.Sub label="Viewport Shading">
                  <MenuBar.Item onClick={() => setRenderMode('wireframe')}>
                    Wireframe
                  </MenuBar.Item>
                  <MenuBar.Item onClick={() => setRenderMode('solid')}>
                    Solid
                  </MenuBar.Item>
                  <MenuBar.Item onClick={() => setRenderMode('material')}>
                    Material Preview
                  </MenuBar.Item>
                  <MenuBar.Item onClick={() => setRenderMode('rendered')}>
                    Rendered
                  </MenuBar.Item>
                </MenuBar.Sub>
                <MenuBar.Separator />
                <MenuBar.Item onClick={() => {}} shortcut="Numpad 0">
                  Camera View
                </MenuBar.Item>
                <MenuBar.Item onClick={() => {}} shortcut="Numpad 1">
                  Front View
                </MenuBar.Item>
                <MenuBar.Item onClick={() => {}} shortcut="Numpad 3">
                  Right View
                </MenuBar.Item>
                <MenuBar.Item onClick={() => {}} shortcut="Numpad 7">
                  Top View
                </MenuBar.Item>
                <MenuBar.Separator />
                <MenuBar.Item onClick={() => setShowFloating(!showFloating)}>
                  {showFloating ? 'Hide' : 'Show'} Render Settings
                </MenuBar.Item>
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="F11"
                  icon={<FullscreenIcon size="sm" />}
                >
                  Toggle Fullscreen
                </MenuBar.Item>
              </MenuBar.Menu>

              <MenuBar.Menu label="Add">
                <MenuBar.Sub label="Mesh">
                  <MenuBar.Item onClick={() => {}}>Cube</MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>Sphere</MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>Cylinder</MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>Plane</MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>Torus</MenuBar.Item>
                </MenuBar.Sub>
                <MenuBar.Sub label="Light">
                  <MenuBar.Item onClick={() => {}}>Point Light</MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>Spot Light</MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>
                    Directional Light
                  </MenuBar.Item>
                  <MenuBar.Item onClick={() => {}}>Area Light</MenuBar.Item>
                </MenuBar.Sub>
                <MenuBar.Item onClick={() => {}}>Camera</MenuBar.Item>
                <MenuBar.Item onClick={() => {}}>Empty</MenuBar.Item>
              </MenuBar.Menu>

              <MenuBar.Menu label="Render">
                <MenuBar.Item
                  onClick={() => {}}
                  shortcut="F12"
                  icon={<PlayIcon size="sm" />}
                >
                  Render Image
                </MenuBar.Item>
                <MenuBar.Item onClick={() => {}} shortcut="Ctrl+F12">
                  Render Animation
                </MenuBar.Item>
                <MenuBar.Separator />
                <MenuBar.Item onClick={() => {}}>
                  Render Settings...
                </MenuBar.Item>
              </MenuBar.Menu>

              <MenuBar.Menu label="Help">
                <MenuBar.Item onClick={() => {}} icon={<InfoIcon size="sm" />}>
                  Documentation
                </MenuBar.Item>
                <MenuBar.Item onClick={() => {}} icon={<CodeIcon size="sm" />}>
                  API Reference
                </MenuBar.Item>
                <MenuBar.Separator />
                <MenuBar.Item onClick={() => {}}>About Entangle</MenuBar.Item>
              </MenuBar.Menu>
            </MenuBar>
          </AppShell.MenuBar>

          {/* ============ TOP TOOLBAR ============ */}
          <AppShell.Toolbar>
            <Toolbar aria-label="Main toolbar" style={topToolbarGradientStyles}>
              <Toolbar.Group aria-label="File operations">
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<AddIcon size="sm" />}
                  tooltip="New Scene (Ctrl+N)"
                />
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<SaveIcon size="sm" />}
                  tooltip="Save (Ctrl+S)"
                />
              </Toolbar.Group>
              <Toolbar.Separator />
              <Toolbar.Group aria-label="History">
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<UndoIcon size="sm" />}
                  tooltip="Undo (Ctrl+Z)"
                />
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<RedoIcon size="sm" />}
                  tooltip="Redo (Ctrl+Y)"
                />
              </Toolbar.Group>
              <Toolbar.Separator />
              <Toolbar.Group aria-label="Clipboard">
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<CutIcon size="sm" />}
                  tooltip="Cut (Ctrl+X)"
                />
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<CopyIcon size="sm" />}
                  tooltip="Copy (Ctrl+C)"
                />
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<PasteIcon size="sm" />}
                  tooltip="Paste (Ctrl+V)"
                />
              </Toolbar.Group>
              <Toolbar.Separator />
              <Toolbar.Group aria-label="Viewport">
                <Toolbar.Toggle
                  pressed={renderMode === 'wireframe'}
                  onPressedChange={() => setRenderMode('wireframe')}
                  icon={<GridIcon size="sm" />}
                  tooltip="Wireframe mode"
                />
                <Toolbar.Toggle
                  pressed={renderMode === 'solid'}
                  onPressedChange={() => setRenderMode('solid')}
                  tooltip="Solid mode"
                >
                  S
                </Toolbar.Toggle>
                <Toolbar.Toggle
                  pressed={renderMode === 'rendered'}
                  onPressedChange={() => setRenderMode('rendered')}
                  icon={<EyeIcon size="sm" />}
                  tooltip="Rendered mode"
                />
              </Toolbar.Group>
              <Toolbar.Spacer />
              <Toolbar.Group aria-label="Playback">
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<PlayIcon size="sm" />}
                  tooltip="Render (F12)"
                />
              </Toolbar.Group>
              <Toolbar.Separator />
              <Toolbar.Group aria-label="View">
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<ZoomInIcon size="sm" />}
                  tooltip="Zoom In"
                />
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<ZoomOutIcon size="sm" />}
                  tooltip="Zoom Out"
                />
                <Toolbar.Button
                  onClick={() => {}}
                  icon={<FullscreenIcon size="sm" />}
                  tooltip="Fullscreen (F11)"
                />
              </Toolbar.Group>
              <Toolbar.Separator />
              <Toolbar.Button
                onClick={() => {}}
                icon={<SearchIcon size="sm" />}
                tooltip="Search (Ctrl+F)"
              />
              <Toolbar.Button
                onClick={() => {}}
                icon={<SettingsIcon size="sm" />}
                tooltip="Preferences"
              />
            </Toolbar>
          </AppShell.Toolbar>

          {/* ============ LEFT TOOLBAR — tool palette ============ */}
          <AppShell.Toolbar position="left">
            <Toolbar
              $orientation="vertical"
              aria-label="Tool palette"
              $size="sm"
              style={asideToolbarGradientStyles}
            >
              <Toolbar.Toggle
                pressed={true}
                onPressedChange={() => {}}
                tooltip="Select (W)"
              >
                &#10132;
              </Toolbar.Toggle>
              <Toolbar.Toggle
                pressed={false}
                onPressedChange={() => {}}
                tooltip="Move (G)"
              >
                &#8853;
              </Toolbar.Toggle>
              <Toolbar.Toggle
                pressed={false}
                onPressedChange={() => {}}
                tooltip="Rotate (R)"
              >
                &#8634;
              </Toolbar.Toggle>
              <Toolbar.Toggle
                pressed={false}
                onPressedChange={() => {}}
                tooltip="Scale (S)"
              >
                &#8596;
              </Toolbar.Toggle>
              <Toolbar.Separator />
              <Toolbar.Toggle
                pressed={false}
                onPressedChange={() => {}}
                tooltip="Measure"
              >
                &#8230;
              </Toolbar.Toggle>
              <Toolbar.Toggle
                pressed={false}
                onPressedChange={() => {}}
                tooltip="Annotate"
              >
                &#9998;
              </Toolbar.Toggle>
              <Toolbar.Separator />
              <Toolbar.Spacer />
              <Toolbar.Toggle
                pressed={false}
                onPressedChange={() => {}}
                icon={<LockIcon size="sm" />}
                tooltip="Lock selection"
              />
            </Toolbar>
          </AppShell.Toolbar>

          {/* ============ DOCK AREA — main content ============ */}
          <AppShell.Dock>
            <FloatingManager baseZIndex={200}>
              <SplitPane
                direction="horizontal"
                panels={[
                  {
                    defaultSize: '20%',
                    minSize: 180,
                    maxSize: 400,
                    collapsible: true,
                  },
                  {},
                  {
                    defaultSize: '25%',
                    minSize: 220,
                    maxSize: 500,
                    collapsible: true,
                  },
                ]}
                dividerSize={3}
              >
                {/* ------------ LEFT PANEL: Scene Outliner ------------ */}
                <PanelSurface bordered={false} style={panelGradientStyles}>
                  <PanelSurface.Body padding={0} style={{ display: 'flex' }}>
                    <Tabs
                      value={outlinerTab}
                      onChange={setOutlinerTab}
                      variant="pills"
                      pillsFrame={false}
                      size="sm"
                      style={{ flex: 1, minHeight: 0 }}
                    >
                      <TabList>
                        <Tab value="scene">Scene</Tab>
                        <Tab value="assets">Assets</Tab>
                      </TabList>
                      <TabPanel value="scene">
                        <ScrollArea
                          maxHeight="100%"
                          scrollbarVisibility="hover"
                          style={{ flex: 1 }}
                        >
                          <div style={{ padding: 4 }}>
                            <TreeView
                              nodes={sceneTree}
                              defaultExpandedIds={['scene', 'cube']}
                              defaultSelectedIds={['cube']}
                              size="sm"
                              showGuideLines
                            />
                          </div>
                        </ScrollArea>
                      </TabPanel>
                      <TabPanel value="assets">
                        <ScrollArea
                          maxHeight="100%"
                          scrollbarVisibility="hover"
                          style={{ flex: 1 }}
                        >
                          <div style={{ padding: 8 }}>
                            <TreeView
                              nodes={[
                                {
                                  id: 'materials',
                                  label: 'Materials',
                                  icon: <FolderIcon size="sm" />,
                                  children: [
                                    {
                                      id: 'mat-pbr',
                                      label: 'PBR Standard',
                                    },
                                    {
                                      id: 'mat-glass',
                                      label: 'Glass',
                                    },
                                    {
                                      id: 'mat-emissive',
                                      label: 'Emissive',
                                    },
                                  ],
                                },
                                {
                                  id: 'textures',
                                  label: 'Textures',
                                  icon: <FolderIcon size="sm" />,
                                  children: [
                                    {
                                      id: 'tex-brick',
                                      label: 'brick_albedo.png',
                                    },
                                    {
                                      id: 'tex-wood',
                                      label: 'wood_diffuse.png',
                                    },
                                  ],
                                },
                              ]}
                              defaultExpandedIds={['materials']}
                              size="sm"
                              showGuideLines
                            />
                          </div>
                        </ScrollArea>
                      </TabPanel>
                    </Tabs>
                  </PanelSurface.Body>
                </PanelSurface>

                {/* ------------ CENTER: Viewport + Bottom Panel ------------ */}
                <SplitPane
                  direction="vertical"
                  panels={[{}, { defaultSize: '22%', minSize: 100 }]}
                  dividerSize={3}
                >
                  {/* 3D Viewport */}
                  <ContextMenu config={viewportContextMenu}>
                    <ViewportCanvas>
                      <ViewportGrid />
                      <ViewportAxisX />
                      <ViewportAxisZ />

                      {/* Wireframe cube object */}
                      <CubeWireframe>
                        <CubeFace $transform="translateZ(60px)" $highlight />
                        <CubeFace $transform="translateZ(-60px)" />
                        <CubeFace $transform="rotateY(90deg) translateZ(60px)" />
                        <CubeFace $transform="rotateY(-90deg) translateZ(60px)" />
                        <CubeFace $transform="rotateX(90deg) translateZ(60px)" />
                        <CubeFace $transform="rotateX(-90deg) translateZ(60px)" />
                      </CubeWireframe>
                      <SelectionDots>
                        <SelectionCorner $x={-3} $y={-3} $z={65} />
                        <SelectionCorner $x={123} $y={-3} $z={65} />
                        <SelectionCorner $x={-3} $y={123} $z={65} />
                        <SelectionCorner $x={123} $y={123} $z={65} />
                      </SelectionDots>

                      {/* Orientation gizmo */}
                      <ViewportGizmo>
                        <GizmoAxis $color="#f55" $rotation={0} />
                        <GizmoAxis $color="#5f5" $rotation={90} />
                        <GizmoAxis $color="#55f" $rotation={45} />
                        <GizmoLabel $x={10} $y={8} $color="#f55">
                          Y
                        </GizmoLabel>
                        <GizmoLabel $x={50} $y={40} $color="#5f5">
                          X
                        </GizmoLabel>
                        <GizmoLabel $x={37} $y={14} $color="#55f">
                          Z
                        </GizmoLabel>
                      </ViewportGizmo>

                      {/* Viewport mode selector */}
                      <ViewportTopBar>
                        <ViewportModeBtn
                          $active={renderMode === 'wireframe'}
                          onClick={() => setRenderMode('wireframe')}
                        >
                          Wireframe
                        </ViewportModeBtn>
                        <ViewportModeBtn
                          $active={renderMode === 'solid'}
                          onClick={() => setRenderMode('solid')}
                        >
                          Solid
                        </ViewportModeBtn>
                        <ViewportModeBtn
                          $active={renderMode === 'material'}
                          onClick={() => setRenderMode('material')}
                        >
                          Material
                        </ViewportModeBtn>
                        <ViewportModeBtn
                          $active={renderMode === 'rendered'}
                          onClick={() => setRenderMode('rendered')}
                        >
                          Rendered
                        </ViewportModeBtn>
                      </ViewportTopBar>

                      {/* Viewport info badges */}
                      <ViewportOverlay>
                        <ViewportBadge>
                          Verts: 8 &middot; Faces: 6 &middot; Tris: 12
                        </ViewportBadge>
                        <ViewportBadge>Objects: 5 / 1 selected</ViewportBadge>
                        <ViewportBadge>60.0 fps</ViewportBadge>
                      </ViewportOverlay>
                    </ViewportCanvas>
                  </ContextMenu>

                  {/* Bottom panel: Console / Output / Timeline */}
                  <PanelSurface bordered={false} style={panelGradientStyles}>
                    <PanelSurface.Body
                      padding={0}
                      style={{ flex: 1, minHeight: 0 }}
                    >
                      <Tabs
                        value={bottomTab}
                        onChange={setBottomTab}
                        variant="enclosed"
                        size="sm"
                        style={{ flex: 1, minHeight: 0 }}
                      >
                        <TabList>
                          <Tab value="console">Console</Tab>
                          <Tab value="output">Output</Tab>
                          <Tab value="timeline">Timeline</Tab>
                        </TabList>
                        <TabPanel value="console">
                          <ScrollArea
                            maxHeight="100%"
                            scrollbarVisibility="hover"
                            style={{ flex: 1 }}
                          >
                            <ConsoleEntry $type="info">
                              <InfoIcon size="sm" />
                              <TimeStamp>12:04:21</TimeStamp>
                              <span>Scene loaded: 5 objects, 3 materials</span>
                            </ConsoleEntry>
                            <ConsoleEntry $type="success">
                              <CheckIcon size="sm" />
                              <TimeStamp>12:04:21</TimeStamp>
                              <span>Shader compilation complete (245ms)</span>
                            </ConsoleEntry>
                            <ConsoleEntry $type="warn">
                              <WarningIcon size="sm" />
                              <TimeStamp>12:04:22</TimeStamp>
                              <span>
                                Texture &quot;brick_normal.png&quot; missing —
                                using fallback
                              </span>
                            </ConsoleEntry>
                            <ConsoleEntry $type="info">
                              <InfoIcon size="sm" />
                              <TimeStamp>12:04:23</TimeStamp>
                              <span>
                                Render engine: WebGPU (Hardware Accelerated)
                              </span>
                            </ConsoleEntry>
                            <ConsoleEntry $type="info">
                              <InfoIcon size="sm" />
                              <TimeStamp>12:04:23</TimeStamp>
                              <span>Viewport resolution: 1920 x 1080 @2x</span>
                            </ConsoleEntry>
                            <ConsoleEntry $type="success">
                              <CheckIcon size="sm" />
                              <TimeStamp>12:04:24</TimeStamp>
                              <span>Auto-save: scene_v3_final.entangle</span>
                            </ConsoleEntry>
                          </ScrollArea>
                        </TabPanel>
                        <TabPanel value="output">
                          <ScrollArea
                            maxHeight="100%"
                            scrollbarVisibility="hover"
                            style={{ flex: 1 }}
                          >
                            <ConsoleEntry $type="info">
                              <TimeStamp>12:04:21</TimeStamp>
                              <span>
                                Build output: dist/scene.gltf (2.4 MB)
                              </span>
                            </ConsoleEntry>
                          </ScrollArea>
                        </TabPanel>
                        <TabPanel value="timeline">
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              color: '#555',
                              fontSize: 11,
                            }}
                          >
                            Timeline — Frame 1 / 250 &middot; 24 fps
                          </div>
                        </TabPanel>
                      </Tabs>
                    </PanelSurface.Body>
                  </PanelSurface>
                </SplitPane>

                {/* ------------ RIGHT PANEL: Properties Inspector ------------ */}
                <PanelSurface bordered={false} style={panelGradientStyles}>
                  <PanelSurface.Header
                    style={{
                      backgroundColor: vars.storybook.canvas.gradientEnd,
                      borderBottom: '1px solid rgba(111, 204, 182, 0.18)',
                    }}
                    actions={
                      <span
                        style={{
                          fontSize: 9,
                          padding: '1px 5px',
                          background: 'rgba(0,122,204,0.2)',
                          border: '1px solid rgba(0,122,204,0.3)',
                          borderRadius: 3,
                          color: '#6cb6ff',
                        }}
                      >
                        Mesh
                      </span>
                    }
                  >
                    {objectName}
                  </PanelSurface.Header>
                  <PanelSurface.Body padding={0}>
                    <PropertyPanel
                      size="sm"
                      maxHeight="100%"
                      contentTopSpacing={8}
                      contentBottomSpacing={12}
                      style={{
                        background: vars.storybook.canvas.gradientEnd,
                      }}
                    >
                      <PropertySection title="Transform">
                        <PropertyRow label="Position X" modified={posX !== 0}>
                          <NumberInput
                            value={posX}
                            onChange={setPosX}
                            step={0.1}
                            precision={2}
                            size="sm"
                            unit="m"
                          />
                        </PropertyRow>
                        <PropertyRow label="Position Y" modified={posY !== 0}>
                          <NumberInput
                            value={posY}
                            onChange={setPosY}
                            step={0.1}
                            precision={2}
                            size="sm"
                            unit="m"
                          />
                        </PropertyRow>
                        <PropertyRow label="Position Z" modified={posZ !== 0}>
                          <NumberInput
                            value={posZ}
                            onChange={setPosZ}
                            step={0.1}
                            precision={2}
                            size="sm"
                            unit="m"
                          />
                        </PropertyRow>
                        <PropertyRow label="Rotation X" modified={rotX !== 0}>
                          <NumberInput
                            value={rotX}
                            onChange={setRotX}
                            step={1}
                            precision={1}
                            size="sm"
                            unit="°"
                          />
                        </PropertyRow>
                        <PropertyRow label="Rotation Y" modified={rotY !== 0}>
                          <NumberInput
                            value={rotY}
                            onChange={setRotY}
                            step={1}
                            precision={1}
                            size="sm"
                            unit="°"
                          />
                        </PropertyRow>
                        <PropertyRow label="Rotation Z" modified={rotZ !== 0}>
                          <NumberInput
                            value={rotZ}
                            onChange={setRotZ}
                            step={1}
                            precision={1}
                            size="sm"
                            unit="°"
                          />
                        </PropertyRow>
                        <PropertyRow label="Scale" modified={scaleVal !== 1}>
                          <Slider
                            value={scaleVal}
                            onChange={setScaleVal}
                            min={0.01}
                            max={10}
                            step={0.01}
                            precision={2}
                            size="sm"
                          />
                        </PropertyRow>
                      </PropertySection>

                      <PropertySection title="Material — PBR Standard">
                        <PropertyRow label="Base Color">
                          <ColorPicker
                            value={baseColor}
                            onChange={setBaseColor}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Roughness">
                          <Slider
                            value={roughness}
                            onChange={setRoughness}
                            min={0}
                            max={1}
                            step={0.01}
                            precision={2}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Metallic">
                          <Slider
                            value={metallic}
                            onChange={setMetallic}
                            min={0}
                            max={1}
                            step={0.01}
                            precision={2}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Emission">
                          <Slider
                            value={emissionStrength}
                            onChange={setEmissionStrength}
                            min={0}
                            max={10}
                            step={0.1}
                            precision={1}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyGroup title="Textures">
                          <PropertyRow label="Albedo">
                            <span
                              style={{
                                color: '#aaa',
                                fontSize: 10,
                              }}
                            >
                              brick_albedo.png
                            </span>
                          </PropertyRow>
                          <PropertyRow label="Normal">
                            <span
                              style={{
                                color: '#666',
                                fontSize: 10,
                                fontStyle: 'italic',
                              }}
                            >
                              None
                            </span>
                          </PropertyRow>
                          <PropertyRow label="Roughness">
                            <span
                              style={{
                                color: '#666',
                                fontSize: 10,
                                fontStyle: 'italic',
                              }}
                            >
                              None
                            </span>
                          </PropertyRow>
                        </PropertyGroup>
                      </PropertySection>

                      <PropertySection title="Rendering">
                        <PropertyRow label="Visible">
                          <Switch
                            checked={visible}
                            onChange={setVisible}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Cast Shadows">
                          <Switch
                            checked={castShadows}
                            onChange={setCastShadows}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Recv Shadows">
                          <Switch
                            checked={receiveShadows}
                            onChange={setReceiveShadows}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Show Bounds">
                          <Switch
                            checked={showBounds}
                            onChange={setShowBounds}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Render Order">
                          <NumberInput
                            value={0}
                            onChange={() => {}}
                            min={-100}
                            max={100}
                            step={1}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Layer">
                          <Select
                            value="default"
                            options={[
                              { value: 'default', label: 'Default' },
                              { value: 'ui', label: 'UI' },
                              { value: 'fx', label: 'Effects' },
                              {
                                value: 'background',
                                label: 'Background',
                              },
                            ]}
                            size="sm"
                            onChange={() => {}}
                          />
                        </PropertyRow>
                      </PropertySection>

                      <PropertySection title="Primitives Showcase">
                        <PropertyRow
                          label="Object Name"
                          modified={objectName !== 'Cube.001'}
                        >
                          <Input
                            size="sm"
                            value={objectName}
                            onChange={event =>
                              setObjectName(event.target.value)
                            }
                          />
                        </PropertyRow>
                        <PropertyRow label="Tag Filter">
                          <Input
                            size="sm"
                            type="search"
                            value={tagFilter}
                            startIcon={<SearchIcon size="sm" />}
                            onChange={event => setTagFilter(event.target.value)}
                          />
                        </PropertyRow>
                        <PropertyRow label="Pinned in Outliner">
                          <Checkbox
                            size="sm"
                            checked={lockedInOutliner}
                            onChange={setLockedInOutliner}
                          />
                        </PropertyRow>
                        <PropertyRow label="Inspector Preset">
                          <Text size="xs" color="muted" mono>
                            editor-showcase-v2
                          </Text>
                        </PropertyRow>
                        <PropertyRow label="Actions" fullWidth>
                          <div
                            style={{
                              display: 'flex',
                              gap: 6,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Button
                              size="sm"
                              variant="filled"
                              icon={<SaveIcon size="sm" />}
                              onClick={() => {}}
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<UndoIcon size="sm" />}
                              onClick={() => {}}
                            >
                              Revert
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<TrashIcon size="sm" />}
                              onClick={() => {}}
                            >
                              Reset
                            </Button>
                          </div>
                        </PropertyRow>
                      </PropertySection>

                      <PropertySection title="Curve Editor">
                        <PropertyRow label="Opacity Curve" fullWidth>
                          <div
                            style={{
                              display: 'flex',
                              width: '100%',
                              minWidth: 0,
                            }}
                          >
                            <CurveEditor
                              value={curveData}
                              onChange={setCurveData}
                              responsive
                              height={180}
                              size="sm"
                              showToolbar
                              labelX="Time"
                              labelY="Opacity"
                              gridSubdivisions={5}
                            />
                          </div>
                        </PropertyRow>
                        <PropertyRow label="Preview Time">
                          <Slider
                            value={curvePreviewValue}
                            onChange={setCurvePreviewValue}
                            min={0}
                            max={1}
                            step={0.01}
                            precision={2}
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Preview Value">
                          <Text size="xs" color="secondary" mono>
                            t={curvePreviewValue.toFixed(2)}
                          </Text>
                        </PropertyRow>
                      </PropertySection>

                      <PropertySection title="Color Picker Standalone">
                        <PropertyRow label="Palette (Material)" fullWidth>
                          <ColorPicker
                            value={paletteColor}
                            onChange={setPaletteColor}
                            inline
                            showAlpha
                            palette="material"
                            pickerWidth={228}
                          />
                        </PropertyRow>
                        <PropertyRow label="Quick Swatch">
                          <ColorPicker
                            value={paletteColor}
                            onChange={setPaletteColor}
                            size="sm"
                          />
                        </PropertyRow>
                      </PropertySection>

                      <PropertySection title="LOD and Streaming">
                        <PropertyRow label="Active LOD">
                          <Select
                            value="lod1"
                            options={[
                              { value: 'lod0', label: 'LOD 0' },
                              { value: 'lod1', label: 'LOD 1' },
                              { value: 'lod2', label: 'LOD 2' },
                              { value: 'lod3', label: 'LOD 3' },
                            ]}
                            size="sm"
                            onChange={() => {}}
                          />
                        </PropertyRow>
                        {Array.from({ length: 8 }).map((_, level) => (
                          <PropertyRow
                            key={`lod-distance-${level}`}
                            label={`LOD ${level} Dist`}
                          >
                            <NumberInput
                              value={level === 0 ? 0 : level * 12}
                              onChange={() => {}}
                              min={0}
                              max={300}
                              step={1}
                              size="sm"
                              unit="m"
                            />
                          </PropertyRow>
                        ))}
                        <PropertyRow label="Keep Resident">
                          <Switch
                            checked={true}
                            onChange={() => {}}
                            size="sm"
                          />
                        </PropertyRow>
                      </PropertySection>

                      <PropertySection title="Physics" defaultExpanded={false}>
                        <PropertyRow label="Body Type">
                          <Select
                            value="static"
                            options={[
                              { value: 'static', label: 'Static' },
                              { value: 'dynamic', label: 'Dynamic' },
                              {
                                value: 'kinematic',
                                label: 'Kinematic',
                              },
                            ]}
                            size="sm"
                            onChange={() => {}}
                          />
                        </PropertyRow>
                        <PropertyRow label="Mass">
                          <NumberInput
                            value={1}
                            onChange={() => {}}
                            min={0}
                            max={10000}
                            step={0.1}
                            precision={2}
                            unit="kg"
                            size="sm"
                          />
                        </PropertyRow>
                        <PropertyRow label="Friction">
                          <Slider
                            value={0.3}
                            onChange={() => {}}
                            min={0}
                            max={1}
                            step={0.01}
                            size="sm"
                          />
                        </PropertyRow>
                      </PropertySection>
                    </PropertyPanel>
                  </PanelSurface.Body>
                </PanelSurface>
              </SplitPane>

              {/* ------------ FLOATING PANEL: Render Settings ------------ */}
              {showFloating && (
                <FloatingPanel
                  title="Render Settings"
                  defaultPosition={{ x: 300, y: 60 }}
                  defaultSize={{ width: 280, height: 260 }}
                  minWidth={220}
                  minHeight={180}
                  onClose={() => setShowFloating(false)}
                >
                  <Accordion
                    defaultValue="engine"
                    variant="default"
                    size="sm"
                    collapsible
                  >
                    <AccordionItem value="engine">
                      <AccordionTrigger>Render Engine</AccordionTrigger>
                      <AccordionContent>
                        <div style={{ padding: '4px 8px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                color: '#aaa',
                              }}
                            >
                              Engine
                            </span>
                            <Select
                              value="webgpu"
                              options={[
                                { value: 'webgpu', label: 'WebGPU' },
                                { value: 'webgl2', label: 'WebGL 2' },
                              ]}
                              size="sm"
                              onChange={() => {}}
                            />
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                color: '#aaa',
                              }}
                            >
                              Samples
                            </span>
                            <NumberInput
                              value={128}
                              onChange={() => {}}
                              min={1}
                              max={4096}
                              step={1}
                              size="sm"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="output">
                      <AccordionTrigger>Output</AccordionTrigger>
                      <AccordionContent>
                        <div style={{ padding: '4px 8px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 6,
                            }}
                          >
                            <span style={{ fontSize: 11, color: '#aaa' }}>
                              Resolution
                            </span>
                            <span style={{ fontSize: 11, color: '#ccc' }}>
                              1920 x 1080
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ fontSize: 11, color: '#aaa' }}>
                              Format
                            </span>
                            <Select
                              value="png"
                              options={[
                                { value: 'png', label: 'PNG' },
                                { value: 'jpg', label: 'JPEG' },
                                { value: 'exr', label: 'EXR' },
                              ]}
                              size="sm"
                              onChange={() => {}}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </FloatingPanel>
              )}
            </FloatingManager>
          </AppShell.Dock>

          {/* ============ STATUS BAR ============ */}
          <AppShell.StatusBar>
            <StatusBar>
              <StatusBar.Section $side="left">
                <StatusBar.Item
                  icon={<CheckIcon size="sm" />}
                  onClick={() => {}}
                >
                  Ready
                </StatusBar.Item>
                <StatusBar.Item onClick={() => {}}>
                  Cube.001 selected
                </StatusBar.Item>
                <StatusBar.Item>Verts: 8 &middot; Faces: 6</StatusBar.Item>
              </StatusBar.Section>
              <StatusBar.Section $side="right">
                <StatusBar.Item
                  icon={<WarningIcon size="sm" />}
                  badge={1}
                  onClick={() => {}}
                >
                  Warnings
                </StatusBar.Item>
                <StatusBar.Item onClick={() => {}}>WebGPU</StatusBar.Item>
                <StatusBar.Item onClick={() => {}}>60 fps</StatusBar.Item>
                <StatusBar.Item onClick={() => {}}>1920 x 1080</StatusBar.Item>
              </StatusBar.Section>
            </StatusBar>
          </AppShell.StatusBar>
        </AppShell>
      </KeyboardContextProvider>
    );
  },
};

// ---------------------------------------------------------------------------
// Other stories (kept simple for reference)
// ---------------------------------------------------------------------------

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
