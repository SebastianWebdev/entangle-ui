import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { ViewportGizmo } from '@/components/editor/ViewportGizmo';
import type {
  GizmoOrientation,
  GizmoPresetView,
  GizmoUpAxis,
  GizmoAxisColorPreset,
  GizmoAxisConfig,
  OrbitDelta,
} from '@/components/editor/ViewportGizmo';
import { Text } from '@/components/primitives';
import { Flex, Stack } from '@/components/layout';

const PRESET_VIEWS: Record<string, GizmoOrientation> = {
  front: { yaw: 0, pitch: 0 },
  back: { yaw: 180, pitch: 0 },
  left: { yaw: -90, pitch: 0 },
  right: { yaw: 90, pitch: 0 },
  top: { yaw: 0, pitch: -90 },
  bottom: { yaw: 0, pitch: 90 },
};

const CUSTOM_AXES: [GizmoAxisConfig, GizmoAxisConfig, GizmoAxisConfig] = [
  { label: 'X', color: '#FF4444', visible: true },
  { label: 'Y', color: '#44FF44', visible: true },
  { label: 'Z', color: '#4444FF', visible: true },
];

/**
 * Shared orbit/snap state used by every gizmo demo so each instance is fully
 * interactive (drag to orbit, click an axis to snap to a preset view).
 */
function useGizmoOrientation(
  initial: GizmoOrientation = { yaw: 30, pitch: -20 }
) {
  const [orientation, setOrientation] = useState<GizmoOrientation>(initial);

  const onOrbit = (delta: OrbitDelta) => {
    setOrientation(prev => ({
      yaw: prev.yaw + delta.deltaYaw,
      pitch: Math.max(-90, Math.min(90, prev.pitch + delta.deltaPitch)),
    }));
  };

  const onSnapToView = (view: GizmoPresetView) => {
    const preset = PRESET_VIEWS[view];
    if (preset) setOrientation(preset);
  };

  return { orientation, setOrientation, onOrbit, onSnapToView };
}

export default function ViewportGizmoDemo() {
  const { orientation, onOrbit, onSnapToView } = useGizmoOrientation();

  return (
    <DemoWrapper>
      <Flex gap={5} align="center">
        <ViewportGizmo
          orientation={orientation}
          onOrbit={onOrbit}
          onSnapToView={onSnapToView}
          diameter={140}
        />
        <div>
          <Text size="sm" color="secondary">
            Yaw: {orientation.yaw.toFixed(1)}
          </Text>
          <Text size="sm" color="secondary">
            Pitch: {orientation.pitch.toFixed(1)}
          </Text>
        </div>
      </Flex>
    </DemoWrapper>
  );
}

export function ViewportGizmoOrientation() {
  const { orientation, onOrbit, onSnapToView } = useGizmoOrientation({
    yaw: 45,
    pitch: -30,
  });

  return (
    <DemoWrapper withKeyboard>
      <Flex gap={5} align="center">
        <ViewportGizmo
          orientation={orientation}
          onOrbit={onOrbit}
          onSnapToView={onSnapToView}
          diameter={140}
        />
        <Text size="sm" color="secondary">
          yaw: {orientation.yaw.toFixed(1)}° · pitch:{' '}
          {orientation.pitch.toFixed(1)}°
        </Text>
      </Flex>
    </DemoWrapper>
  );
}

export function ViewportGizmoUpAxis() {
  const yUp = useGizmoOrientation();
  const zUp = useGizmoOrientation();
  const renderOne = (label: string, upAxis: GizmoUpAxis, state: ReturnType<typeof useGizmoOrientation>) => (
    <Stack gap={2} align="center">
      <Text size="xs" color="secondary">
        {label}
      </Text>
      <ViewportGizmo
        orientation={state.orientation}
        onOrbit={state.onOrbit}
        onSnapToView={state.onSnapToView}
        upAxis={upAxis}
        diameter={120}
      />
    </Stack>
  );

  return (
    <DemoWrapper withKeyboard>
      <Flex gap={6} align="flex-start">
        {renderOne('y-up (Three.js, Maya)', 'y-up', yUp)}
        {renderOne('z-up (Blender, Unreal)', 'z-up', zUp)}
      </Flex>
    </DemoWrapper>
  );
}

export function ViewportGizmoAxisColors() {
  const blender = useGizmoOrientation();
  const unreal = useGizmoOrientation();
  const custom = useGizmoOrientation();

  const renderOne = (
    label: string,
    preset: GizmoAxisColorPreset,
    state: ReturnType<typeof useGizmoOrientation>,
    axisConfig?: [GizmoAxisConfig, GizmoAxisConfig, GizmoAxisConfig]
  ) => (
    <Stack gap={2} align="center">
      <Text size="xs" color="secondary">
        {label}
      </Text>
      <ViewportGizmo
        orientation={state.orientation}
        onOrbit={state.onOrbit}
        onSnapToView={state.onSnapToView}
        axisColorPreset={preset}
        axisConfig={axisConfig}
        diameter={120}
      />
    </Stack>
  );

  return (
    <DemoWrapper withKeyboard>
      <Flex gap={6} align="flex-start" style={{ flexWrap: 'wrap' }}>
        {renderOne('blender', 'blender', blender)}
        {renderOne('unreal', 'unreal', unreal)}
        {renderOne('custom', 'custom', custom, CUSTOM_AXES)}
      </Flex>
    </DemoWrapper>
  );
}

export function ViewportGizmoInteractionModes() {
  const full = useGizmoOrientation();
  const snap = useGizmoOrientation();
  const orbit = useGizmoOrientation();
  const display = useGizmoOrientation();

  return (
    <DemoWrapper withKeyboard>
      <Flex gap={6} align="flex-start" style={{ flexWrap: 'wrap' }}>
        <Stack gap={2} align="center">
          <Text size="xs" color="secondary">
            full
          </Text>
          <ViewportGizmo
            orientation={full.orientation}
            onOrbit={full.onOrbit}
            onSnapToView={full.onSnapToView}
            interactionMode="full"
            diameter={120}
          />
        </Stack>
        <Stack gap={2} align="center">
          <Text size="xs" color="secondary">
            snap-only
          </Text>
          <ViewportGizmo
            orientation={snap.orientation}
            onSnapToView={snap.onSnapToView}
            interactionMode="snap-only"
            diameter={120}
          />
        </Stack>
        <Stack gap={2} align="center">
          <Text size="xs" color="secondary">
            orbit-only
          </Text>
          <ViewportGizmo
            orientation={orbit.orientation}
            onOrbit={orbit.onOrbit}
            interactionMode="orbit-only"
            diameter={120}
          />
        </Stack>
        <Stack gap={2} align="center">
          <Text size="xs" color="secondary">
            display-only
          </Text>
          <ViewportGizmo
            orientation={display.orientation}
            interactionMode="display-only"
            diameter={120}
          />
        </Stack>
      </Flex>
    </DemoWrapper>
  );
}

export function ViewportGizmoVisualOptions() {
  const { orientation, onOrbit, onSnapToView } = useGizmoOrientation();
  const [showLabels, setShowLabels] = useState(true);
  const [showNegativeAxes, setShowNegativeAxes] = useState(true);
  const [showOrbitRing, setShowOrbitRing] = useState(true);
  const [showOriginHandle, setShowOriginHandle] = useState(true);

  const toggle = (
    label: string,
    value: boolean,
    set: (v: boolean) => void
  ) => (
    <label
      style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={e => set(e.target.checked)}
      />
      <Text size="sm" color="secondary">
        {label}
      </Text>
    </label>
  );

  return (
    <DemoWrapper withKeyboard>
      <Flex gap={5} align="center">
        <ViewportGizmo
          orientation={orientation}
          onOrbit={onOrbit}
          onSnapToView={onSnapToView}
          showLabels={showLabels}
          showNegativeAxes={showNegativeAxes}
          showOrbitRing={showOrbitRing}
          showOriginHandle={showOriginHandle}
          diameter={140}
        />
        <Stack gap={2}>
          {toggle('showLabels', showLabels, setShowLabels)}
          {toggle('showNegativeAxes', showNegativeAxes, setShowNegativeAxes)}
          {toggle('showOrbitRing', showOrbitRing, setShowOrbitRing)}
          {toggle('showOriginHandle', showOriginHandle, setShowOriginHandle)}
        </Stack>
      </Flex>
    </DemoWrapper>
  );
}

export function ViewportGizmoOrbitConfig() {
  const { orientation, setOrientation, onOrbit, onSnapToView } =
    useGizmoOrientation();
  const [final, setFinal] = useState<GizmoOrientation | null>(null);

  return (
    <DemoWrapper withKeyboard>
      <Flex gap={5} align="center">
        <ViewportGizmo
          orientation={orientation}
          onOrbit={onOrbit}
          onOrbitEnd={setFinal}
          onSnapToView={view => {
            onSnapToView(view);
            setFinal(PRESET_VIEWS[view] ?? null);
          }}
          orbitSpeed={1.5}
          constrainPitch
          diameter={140}
        />
        <Stack gap={1}>
          <Text size="sm" color="secondary">
            orbitSpeed: 1.5 · constrainPitch
          </Text>
          <Text size="sm" color="secondary">
            Last orbit end:{' '}
            {final
              ? `${final.yaw.toFixed(0)}°, ${final.pitch.toFixed(0)}°`
              : '—'}
          </Text>
        </Stack>
      </Flex>
    </DemoWrapper>
  );
}

export function ViewportGizmoEvents() {
  const { orientation, onOrbit, onSnapToView } = useGizmoOrientation();
  const [log, setLog] = useState('Interact with the gizmo...');

  return (
    <DemoWrapper withKeyboard>
      <Flex gap={5} align="center">
        <ViewportGizmo
          orientation={orientation}
          onOrbit={onOrbit}
          onSnapToView={view => {
            onSnapToView(view);
            setLog(`onSnapToView: ${view}`);
          }}
          onAxisClick={(axis, positive) =>
            setLog(`onAxisClick: ${positive ? '+' : '-'}${axis}`)
          }
          onOriginClick={() => setLog('onOriginClick')}
          diameter={140}
        />
        <Text size="sm" color="secondary">
          {log}
        </Text>
      </Flex>
    </DemoWrapper>
  );
}

export function ViewportGizmoSizes() {
  const sm = useGizmoOrientation();
  const md = useGizmoOrientation();
  const lg = useGizmoOrientation();

  return (
    <DemoWrapper withKeyboard>
      <Flex gap={6} align="center" style={{ flexWrap: 'wrap' }}>
        <ViewportGizmo
          orientation={sm.orientation}
          onOrbit={sm.onOrbit}
          onSnapToView={sm.onSnapToView}
          size="sm"
          diameter={80}
        />
        <ViewportGizmo
          orientation={md.orientation}
          onOrbit={md.onOrbit}
          onSnapToView={md.onSnapToView}
          size="md"
          diameter={120}
        />
        <ViewportGizmo
          orientation={lg.orientation}
          onOrbit={lg.onOrbit}
          onSnapToView={lg.onSnapToView}
          size="lg"
          diameter={160}
        />
      </Flex>
    </DemoWrapper>
  );
}
