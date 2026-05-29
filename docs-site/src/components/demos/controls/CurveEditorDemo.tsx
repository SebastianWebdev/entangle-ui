import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { CurveEditor } from '@/components/controls';
import type { CurveData, CurvePreset } from '@/components/controls';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

const WIDTH = 440;
const HEIGHT = 260;

/** A simple linear ramp used as a custom preset. */
const LINEAR_RAMP: CurveData = {
  domainX: [0, 1],
  domainY: [0, 1],
  keyframes: [
    {
      x: 0,
      y: 0,
      handleIn: { x: 0, y: 0 },
      handleOut: { x: 0.25, y: 0.25 },
      tangentMode: 'linear',
    },
    {
      x: 1,
      y: 1,
      handleIn: { x: -0.25, y: -0.25 },
      handleOut: { x: 0, y: 0 },
      tangentMode: 'linear',
    },
  ],
};

const RAMP_PRESET: CurvePreset = {
  id: 'custom-ramp',
  label: 'Linear Ramp',
  category: 'Custom',
  curve: LINEAR_RAMP,
};

export default function CurveEditorDemo() {
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor width={WIDTH} height={HEIGHT} />
    </DemoWrapper>
  );
}

export function CurveEditorControlled() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2}>
        <CurveEditor
          value={curve}
          onChange={setCurve}
          width={WIDTH}
          height={HEIGHT}
        />
        <Text size="sm" color="muted">
          Keyframes: {curve ? curve.keyframes.length : 2}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function CurveEditorLockTangents() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        lockTangents
        width={WIDTH}
        height={HEIGHT}
      />
    </DemoWrapper>
  );
}

export function CurveEditorPresets() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        presets={[RAMP_PRESET]}
        width={WIDTH}
        height={HEIGHT}
      />
    </DemoWrapper>
  );
}

export function CurveEditorGrid() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        showGrid
        gridSubdivisions={8}
        showAxisLabels
        labelX="Time"
        labelY="Value"
        width={WIDTH}
        height={HEIGHT}
      />
    </DemoWrapper>
  );
}

export function CurveEditorSnap() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        snapToGrid
        gridSubdivisions={4}
        width={WIDTH}
        height={HEIGHT}
      />
    </DemoWrapper>
  );
}

export function CurveEditorConstraints() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        lockEndpoints
        maxKeyframes={6}
        minKeyframeDistance={0.02}
        clampY
        width={WIDTH}
        height={HEIGHT}
      />
    </DemoWrapper>
  );
}

export function CurveEditorResponsive() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%' }}>
        <CurveEditor
          responsive
          height={220}
          value={curve}
          onChange={setCurve}
        />
      </div>
    </DemoWrapper>
  );
}

export function CurveEditorBackground() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        width={WIDTH}
        height={HEIGHT}
        renderBackground={(ctx, info) => {
          const grad = ctx.createLinearGradient(0, info.height, 0, 0);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, info.width, info.height);
        }}
      />
    </DemoWrapper>
  );
}

export function CurveEditorBottomBar() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor
        value={curve}
        onChange={setCurve}
        width={WIDTH}
        height={HEIGHT}
        renderBottomBar={({ selectedKeyframes, evaluate }) => (
          <Text size="sm" color="muted">
            {selectedKeyframes.length > 0
              ? `Selected: (${selectedKeyframes[0].x.toFixed(2)}, ${selectedKeyframes[0].y.toFixed(2)})`
              : `Midpoint value: ${evaluate(0.5).toFixed(3)}`}
          </Text>
        )}
      />
    </DemoWrapper>
  );
}

export function CurveEditorChangeComplete() {
  const [curve, setCurve] = useState<CurveData | undefined>(undefined);
  const [commits, setCommits] = useState(0);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2}>
        <CurveEditor
          value={curve}
          onChange={setCurve}
          onChangeComplete={final => {
            setCurve(final);
            setCommits(prev => prev + 1);
          }}
          width={WIDTH}
          height={HEIGHT}
        />
        <Text size="sm" color="muted">
          Committed edits: {commits}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
