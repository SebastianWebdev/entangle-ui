import { useMemo, useState } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { AppShell } from '@/components/shell/AppShell';
import { MenuBar } from '@/components/shell/MenuBar';
import { Toolbar } from '@/components/shell/Toolbar';
import { StatusBar } from '@/components/shell/StatusBar';
import { SplitPane } from '@/components/layout/SplitPane';
import { PanelSurface } from '@/components/layout/PanelSurface';
import { TreeView } from '@/components/controls/TreeView';
import { evaluateCurve } from '@/components/controls/CurveEditor';
import type { CurveData } from '@/types/keyframe';
import {
  Timeline,
  useTimelineSelectedTangentMode,
  type TimelineGroup,
  type TimelineMode,
  type TimelineTrack,
} from '@/components/editor/Timeline';
import type { TangentMode } from '@/types/keyframe';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation/SegmentedControl';
import { Text } from '@/components/primitives/Text';
import {
  PlayIcon,
  PauseIcon,
  FirstIcon,
  LastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  WarningIcon,
  AddIcon,
  FolderIcon,
  SaveIcon,
  UndoIcon,
  RedoIcon,
  SettingsIcon,
  TangentAutoIcon,
  TangentLinearIcon,
  TangentStepIcon,
  TangentAlignedIcon,
  TangentMirroredIcon,
  TangentFreeIcon,
} from '@/components/Icons';
import {
  shellBgStyle,
  viewportStyle,
  viewportGridStyle,
  viewportFloorStyle,
  viewportStageStyle,
  cubeRootStyle,
  cubeOrientStyle,
  cubeFaceStyle,
  cubeTxVar,
  cubeTyVar,
  cubeTzVar,
  cubeRxVar,
  cubeRyVar,
  cubeRzVar,
  cubeScaleVar,
  cubeFaceTransformVar,
  cubeFaceTintVar,
  viewportOverlayStyle,
  viewportBadgeStyle,
  sidePanelStyle,
  sidePanelHeaderStyle,
  sidePanelBodyStyle,
  inspectorRowStyle,
  inspectorLabelStyle,
  inspectorValueStyle,
  inspectorAxisRowStyle,
  inspectorAxisLabelStyle,
  inspectorAxisValueStyle,
  timelineWrapStyle,
  statusItemStyle,
} from './AnimationEditorDemo.css';

// ─── Scene + animation data ───────────────────────────────────

const FPS = 30;
const END_FRAME = 120;

function kf(
  id: string,
  x: number,
  y: number,
  handle = 8
): TimelineTrack['keyframes'][number] {
  return {
    id,
    x,
    y,
    handleIn: { x: -handle, y: 0 },
    handleOut: { x: handle, y: 0 },
    tangentMode: 'auto',
  };
}

const INITIAL_TRACKS: TimelineTrack[] = [
  {
    id: 'pos.x',
    label: 'Position X',
    groupId: 'transform',
    valueRange: [-180, 180],
    expanded: true,
    keyframes: [
      kf('px-a', 0, 0),
      kf('px-b', 30, -90),
      kf('px-c', 60, 90),
      kf('px-d', 100, 0),
    ],
  },
  {
    id: 'pos.y',
    label: 'Position Y',
    groupId: 'transform',
    color: '#e0a64b',
    valueRange: [-80, 80],
    keyframes: [
      kf('py-a', 0, 0),
      kf('py-b', 15, -50),
      kf('py-c', 30, 0),
      kf('py-d', 45, -50),
      kf('py-e', 60, 0),
    ],
  },
  {
    id: 'pos.z',
    label: 'Position Z',
    groupId: 'transform',
    color: '#9b6bd6',
    valueRange: [-100, 100],
    keyframes: [kf('pz-a', 0, 0), kf('pz-b', 60, 60), kf('pz-c', 100, 0)],
  },
  {
    id: 'rot.y',
    label: 'Rotation Y',
    groupId: 'transform',
    color: '#5bbf7b',
    valueRange: [0, 360],
    keyframes: [kf('ry-a', 0, 0), kf('ry-b', 100, 360)],
  },
  {
    id: 'rot.x',
    label: 'Rotation X',
    groupId: 'transform',
    valueRange: [-45, 45],
    keyframes: [kf('rx-a', 0, 0), kf('rx-b', 50, 30), kf('rx-c', 100, 0)],
  },
  {
    id: 'scale',
    label: 'Uniform Scale',
    groupId: 'transform',
    color: '#d65b8a',
    valueRange: [0.5, 1.5],
    keyframes: [
      kf('s-a', 0, 1),
      kf('s-b', 40, 1.3),
      kf('s-c', 80, 0.8),
      kf('s-d', 100, 1),
    ],
  },
  {
    id: 'mat.hue',
    label: 'Hue',
    groupId: 'material',
    color: '#4fb6e0',
    valueRange: [180, 260],
    keyframes: [kf('h-a', 0, 200), kf('h-b', 60, 250), kf('h-c', 100, 200)],
  },
  {
    id: 'mat.opacity',
    label: 'Opacity',
    groupId: 'material',
    color: '#5bbf7b',
    valueRange: [0, 1],
    keyframes: [kf('o-a', 0, 1), kf('o-b', 90, 1), kf('o-c', 100, 0.7)],
  },
];

const INITIAL_GROUPS: TimelineGroup[] = [
  { id: 'transform', label: 'Transform' },
  { id: 'material', label: 'Material' },
];

const SCENE_TREE = [
  {
    id: 'scene',
    label: 'Scene',
    children: [
      {
        id: 'cube',
        label: 'Cube',
        children: [
          { id: 'cube.mesh', label: 'Mesh' },
          { id: 'cube.mat', label: 'Material' },
        ],
      },
      { id: 'light', label: 'Light' },
      { id: 'camera', label: 'Camera' },
    ],
  },
];

// ─── Cube animator (reads curves at the current frame) ──────

interface CubeState {
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  hue: number;
  opacity: number;
}

function curveOf(track: TimelineTrack): CurveData {
  return {
    keyframes: track.keyframes,
    domainX: [0, END_FRAME],
    domainY: track.valueRange ?? [0, 1],
  };
}

function readCube(tracks: TimelineTrack[], frame: number): CubeState {
  const byId = new Map(tracks.map(t => [t.id, t]));
  const sample = (id: string, fallback: number): number => {
    const t = byId.get(id);
    if (!t || t.keyframes.length === 0) return fallback;
    return evaluateCurve(curveOf(t), frame);
  };
  return {
    px: sample('pos.x', 0),
    py: sample('pos.y', 0),
    pz: sample('pos.z', 0),
    rx: sample('rot.x', 0),
    ry: sample('rot.y', 0),
    rz: 0,
    scale: sample('scale', 1),
    hue: sample('mat.hue', 210),
    opacity: sample('mat.opacity', 1),
  };
}

interface CubeFaceProps {
  transform: string;
  hue: number;
  opacity: number;
}

function CubeFace({ transform, hue, opacity }: CubeFaceProps): JSX.Element {
  const tint = `hsla(${hue}, 70%, 55%, ${0.18 * opacity})`;
  return (
    <div
      className={cubeFaceStyle}
      style={assignInlineVars({
        [cubeFaceTransformVar]: transform,
        [cubeFaceTintVar]: tint,
      })}
    />
  );
}

interface ViewportProps {
  cube: CubeState;
  frame: number;
}

function Viewport3D({ cube, frame }: ViewportProps): JSX.Element {
  const half = 50;
  return (
    <div className={viewportStyle}>
      <div className={viewportGridStyle} />
      <div className={viewportStageStyle}>
        <div className={viewportFloorStyle} />
        <div
          className={cubeRootStyle}
          style={assignInlineVars({
            [cubeTxVar]: `${cube.px}px`,
            [cubeTyVar]: `${cube.py}px`,
            [cubeTzVar]: `${cube.pz}px`,
          })}
        >
          <div
            className={cubeOrientStyle}
            style={assignInlineVars({
              [cubeRxVar]: `${cube.rx}deg`,
              [cubeRyVar]: `${cube.ry}deg`,
              [cubeRzVar]: `${cube.rz}deg`,
              [cubeScaleVar]: `${cube.scale}`,
            })}
          >
            <CubeFace
              transform={`translateZ(${half}px)`}
              hue={cube.hue}
              opacity={cube.opacity}
            />
            <CubeFace
              transform={`rotateY(180deg) translateZ(${half}px)`}
              hue={cube.hue}
              opacity={cube.opacity}
            />
            <CubeFace
              transform={`rotateY(90deg) translateZ(${half}px)`}
              hue={cube.hue}
              opacity={cube.opacity}
            />
            <CubeFace
              transform={`rotateY(-90deg) translateZ(${half}px)`}
              hue={cube.hue}
              opacity={cube.opacity}
            />
            <CubeFace
              transform={`rotateX(90deg) translateZ(${half}px)`}
              hue={cube.hue}
              opacity={cube.opacity}
            />
            <CubeFace
              transform={`rotateX(-90deg) translateZ(${half}px)`}
              hue={cube.hue}
              opacity={cube.opacity}
            />
          </div>
        </div>
      </div>
      <div className={viewportOverlayStyle}>
        <span className={viewportBadgeStyle}>Perspective · 1080p</span>
        <span className={viewportBadgeStyle}>
          Frame {Math.round(frame)} / {END_FRAME}
        </span>
      </div>
    </div>
  );
}

// ─── Side panels ─────────────────────────────────────────────

function SceneTreeColumn(): JSX.Element {
  return (
    <PanelSurface bordered={false} style={{ height: '100%' }}>
      <div className={sidePanelStyle}>
        <div className={sidePanelHeaderStyle}>Scene</div>
        <div className={sidePanelBodyStyle}>
          <TreeView
            nodes={SCENE_TREE}
            defaultExpandedIds={['scene', 'cube']}
            defaultSelectedIds={['cube']}
            size="sm"
            showGuideLines
          />
        </div>
      </div>
    </PanelSurface>
  );
}

interface InspectorProps {
  cube: CubeState;
  frame: number;
}

function InspectorColumn({ cube, frame }: InspectorProps): JSX.Element {
  const fmt = (n: number, d = 2): string => n.toFixed(d);
  return (
    <PanelSurface bordered={false} style={{ height: '100%' }}>
      <div className={sidePanelStyle}>
        <div className={sidePanelHeaderStyle}>Inspector — Cube</div>
        <div className={sidePanelBodyStyle}>
          <div className={inspectorRowStyle}>
            <span className={inspectorLabelStyle}>Frame</span>
            <span className={inspectorValueStyle}>
              {Math.round(frame)} / {END_FRAME}
            </span>
          </div>
          <div className={sidePanelHeaderStyle} style={{ marginTop: 8 }}>
            Transform
          </div>
          <div className={inspectorAxisRowStyle}>
            <span className={inspectorAxisLabelStyle}>Pos</span>
            <span className={inspectorAxisValueStyle}>{fmt(cube.px, 1)}</span>
            <span className={inspectorAxisValueStyle}>{fmt(cube.py, 1)}</span>
            <span className={inspectorAxisValueStyle}>{fmt(cube.pz, 1)}</span>
          </div>
          <div className={inspectorAxisRowStyle}>
            <span className={inspectorAxisLabelStyle}>Rot</span>
            <span className={inspectorAxisValueStyle}>{fmt(cube.rx, 1)}°</span>
            <span className={inspectorAxisValueStyle}>{fmt(cube.ry, 1)}°</span>
            <span className={inspectorAxisValueStyle}>{fmt(cube.rz, 1)}°</span>
          </div>
          <div className={inspectorRowStyle}>
            <span className={inspectorLabelStyle}>Scale</span>
            <span className={inspectorValueStyle}>×{fmt(cube.scale, 3)}</span>
          </div>
          <div className={sidePanelHeaderStyle} style={{ marginTop: 8 }}>
            Material
          </div>
          <div className={inspectorRowStyle}>
            <span className={inspectorLabelStyle}>Hue</span>
            <span className={inspectorValueStyle}>{fmt(cube.hue, 0)}°</span>
          </div>
          <div className={inspectorRowStyle}>
            <span className={inspectorLabelStyle}>Opacity</span>
            <span className={inspectorValueStyle}>{fmt(cube.opacity, 2)}</span>
          </div>
        </div>
      </div>
    </PanelSurface>
  );
}

// ─── Top chrome (menu + toolbar) ────────────────────────────

interface TopChromeProps {
  playing: boolean;
  onTogglePlay: () => void;
  frame: number;
  onJumpToStart: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onJumpToEnd: () => void;
  mode: TimelineMode;
  onModeChange: (mode: TimelineMode) => void;
}

function TopChrome({
  playing,
  onTogglePlay,
  frame,
  onJumpToStart,
  onStepBack,
  onStepForward,
  onJumpToEnd,
  mode,
  onModeChange,
}: TopChromeProps): JSX.Element {
  return (
    <>
      <AppShell.MenuBar>
        <MenuBar menuOffset={4}>
          <MenuBar.Menu label="File">
            <MenuBar.Item
              icon={<AddIcon size="sm" />}
              shortcut="Ctrl+N"
              onClick={() => {}}
            >
              New Scene
            </MenuBar.Item>
            <MenuBar.Item
              icon={<FolderIcon size="sm" />}
              shortcut="Ctrl+O"
              onClick={() => {}}
            >
              Open Scene…
            </MenuBar.Item>
            <MenuBar.Item
              icon={<SaveIcon size="sm" />}
              shortcut="Ctrl+S"
              onClick={() => {}}
            >
              Save Animation
            </MenuBar.Item>
          </MenuBar.Menu>
          <MenuBar.Menu label="Edit">
            <MenuBar.Item
              icon={<UndoIcon size="sm" />}
              shortcut="Ctrl+Z"
              onClick={() => {}}
            >
              Undo
            </MenuBar.Item>
            <MenuBar.Item
              icon={<RedoIcon size="sm" />}
              shortcut="Ctrl+Shift+Z"
              onClick={() => {}}
            >
              Redo
            </MenuBar.Item>
          </MenuBar.Menu>
          <MenuBar.Menu label="Animation">
            <MenuBar.Item shortcut="K" onClick={() => {}}>
              Insert Keyframe at Playhead
            </MenuBar.Item>
            <MenuBar.Item shortcut="Shift+K" onClick={() => {}}>
              Delete Keyframe at Playhead
            </MenuBar.Item>
            <MenuBar.Item onClick={() => {}}>Bake to Frames…</MenuBar.Item>
          </MenuBar.Menu>
          <MenuBar.Menu label="View">
            <MenuBar.Item icon={<SettingsIcon size="sm" />} onClick={() => {}}>
              Preferences…
            </MenuBar.Item>
          </MenuBar.Menu>
        </MenuBar>
      </AppShell.MenuBar>

      <AppShell.Toolbar>
        <Toolbar size="sm" aria-label="Transport">
          <Toolbar.Group aria-label="Transport">
            <Toolbar.Button
              onClick={onJumpToStart}
              icon={<FirstIcon size="sm" />}
              tooltip="Jump to start (Home)"
            />
            <Toolbar.Button
              onClick={onStepBack}
              icon={<ChevronLeftIcon size="sm" />}
              tooltip="Step −1 frame (←)"
            />
            <Toolbar.Toggle
              pressed={playing}
              onPressedChange={onTogglePlay}
              icon={playing ? <PauseIcon size="sm" /> : <PlayIcon size="sm" />}
              tooltip={playing ? 'Pause (Space)' : 'Play (Space)'}
            />
            <Toolbar.Button
              onClick={onStepForward}
              icon={<ChevronRightIcon size="sm" />}
              tooltip="Step +1 frame (→)"
            />
            <Toolbar.Button
              onClick={onJumpToEnd}
              icon={<LastIcon size="sm" />}
              tooltip="Jump to end (End)"
            />
          </Toolbar.Group>
          <Toolbar.Separator />
          <SegmentedControl
            value={mode}
            onChange={next => onModeChange(next as TimelineMode)}
            size="sm"
            aria-label="Editor mode"
          >
            <SegmentedControlItem value="dope-sheet">
              Dope sheet
            </SegmentedControlItem>
            <SegmentedControlItem value="graph">Graph</SegmentedControlItem>
          </SegmentedControl>
          <Toolbar.Spacer />
          <Text
            variant="caption"
            color="muted"
            style={{ padding: '0 8px', fontVariantNumeric: 'tabular-nums' }}
          >
            Frame {Math.round(frame).toString().padStart(3, '0')} · {FPS} fps
          </Text>
        </Toolbar>
      </AppShell.Toolbar>
    </>
  );
}

// ─── Status bar ─────────────────────────────────────────────

interface FooterProps {
  frame: number;
  playing: boolean;
  selectionCount: number;
}

function Footer({ frame, playing, selectionCount }: FooterProps): JSX.Element {
  return (
    <AppShell.StatusBar>
      <StatusBar>
        <StatusBar.Section side="left">
          <StatusBar.Item icon={<CheckIcon size="sm" />} onClick={() => {}}>
            {playing ? 'Playing' : 'Idle'}
          </StatusBar.Item>
          <StatusBar.Item onClick={() => {}}>Cube selected</StatusBar.Item>
          <StatusBar.Item>{selectionCount} keyframes selected</StatusBar.Item>
        </StatusBar.Section>
        <StatusBar.Section side="right">
          <StatusBar.Item icon={<WarningIcon size="sm" />} badge={0}>
            <span className={statusItemStyle}>
              Frame {Math.round(frame).toString().padStart(3, '0')}
            </span>
          </StatusBar.Item>
          <StatusBar.Item>{FPS} fps</StatusBar.Item>
          <StatusBar.Item>WebGPU</StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>
    </AppShell.StatusBar>
  );
}

// ─── Tangent-mode bar (slot child; uses the selected-tangent hook) ──

const TANGENT_MODES: ReadonlyArray<{
  mode: TangentMode;
  Icon: typeof TangentAutoIcon;
  label: string;
}> = [
  { mode: 'auto', Icon: TangentAutoIcon, label: 'Auto' },
  { mode: 'linear', Icon: TangentLinearIcon, label: 'Linear' },
  { mode: 'step', Icon: TangentStepIcon, label: 'Step' },
  { mode: 'aligned', Icon: TangentAlignedIcon, label: 'Aligned' },
  { mode: 'mirrored', Icon: TangentMirroredIcon, label: 'Mirrored' },
  { mode: 'free', Icon: TangentFreeIcon, label: 'Free' },
];

interface TangentBarProps {
  tracks: TimelineTrack[];
  onTracksChange: (tracks: TimelineTrack[]) => void;
}

function TangentBar({ tracks, onTracksChange }: TangentBarProps): JSX.Element {
  const t = useTimelineSelectedTangentMode(tracks, onTracksChange);
  if (t.current === null) {
    return (
      <Text variant="caption" color="muted" style={{ padding: '0 8px' }}>
        Select a keyframe to change its tangent mode
      </Text>
    );
  }
  return (
    <Toolbar size="sm" aria-label="Tangent mode">
      <Toolbar.Group aria-label="Tangent mode">
        {TANGENT_MODES.map(({ mode, Icon, label }) => (
          <Toolbar.Toggle
            key={mode}
            pressed={t.current === mode}
            onPressedChange={() => t.set(mode)}
            icon={<Icon size="sm" />}
            tooltip={label}
          />
        ))}
      </Toolbar.Group>
      <Toolbar.Spacer />
      <Text
        variant="caption"
        color="muted"
        style={{ padding: '0 4px', fontVariantNumeric: 'tabular-nums' }}
      >
        {t.current === 'mixed' ? 'mixed' : t.current}
      </Text>
    </Toolbar>
  );
}

// ─── Demo root ───────────────────────────────────────────────

export default function AnimationEditorDemo(): JSX.Element {
  const [tracks, setTracks] = useState<TimelineTrack[]>(INITIAL_TRACKS);
  const [groups, setGroups] = useState<TimelineGroup[]>(INITIAL_GROUPS);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<TimelineMode>('dope-sheet');
  const [selectionCount, setSelectionCount] = useState(0);

  const cube = useMemo(() => readCube(tracks, frame), [tracks, frame]);

  const jumpTo = (f: number): void =>
    setFrame(Math.max(0, Math.min(END_FRAME, f)));

  return (
    <div className={shellBgStyle}>
      <AppShell viewportLock topChromeSeparator="both">
        <TopChrome
          playing={playing}
          onTogglePlay={() => setPlaying(p => !p)}
          frame={frame}
          onJumpToStart={() => jumpTo(0)}
          onStepBack={() => jumpTo(frame - 1)}
          onStepForward={() => jumpTo(frame + 1)}
          onJumpToEnd={() => jumpTo(END_FRAME)}
          mode={mode}
          onModeChange={setMode}
        />

        <AppShell.Dock>
          <SplitPane
            direction="vertical"
            panels={[{}, { defaultSize: '40%', minSize: 200, maxSize: 480 }]}
            dividerSize={3}
          >
            <SplitPane
              direction="horizontal"
              panels={[
                { defaultSize: 200, minSize: 160, maxSize: 320 },
                {},
                { defaultSize: 260, minSize: 220, maxSize: 380 },
              ]}
              dividerSize={3}
            >
              <SceneTreeColumn />
              <Viewport3D cube={cube} frame={frame} />
              <InspectorColumn cube={cube} frame={frame} />
            </SplitPane>

            <div className={timelineWrapStyle}>
              <Timeline
                tracks={tracks}
                onTracksChange={setTracks}
                groups={groups}
                onGroupsChange={setGroups}
                endFrame={END_FRAME}
                fps={FPS}
                frame={frame}
                onFrameChange={setFrame}
                playing={playing}
                onPlayingChange={setPlaying}
                mode={mode}
                onModeChange={setMode}
                onSelectionChange={s => setSelectionCount(s.length)}
                defaultView={{ startFrame: 0, endFrame: 60 }}
                loop={{ startFrame: 0, endFrame: END_FRAME }}
                trackHeaderWidth={180}
              >
                <Timeline.Toolbar>
                  <TangentBar tracks={tracks} onTracksChange={setTracks} />
                </Timeline.Toolbar>
                <Timeline.Minimap tracks={tracks} height={36} />
              </Timeline>
            </div>
          </SplitPane>
        </AppShell.Dock>

        <Footer
          frame={frame}
          playing={playing}
          selectionCount={selectionCount}
        />
      </AppShell>
    </div>
  );
}
