import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { CartesianPicker } from '@/components/controls';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

const SIZE = 320;

export default function CartesianPickerDemo() {
  const [point, setPoint] = useState<Point2D>({ x: 0, y: 0 });

  return (
    <DemoWrapper withKeyboard>
      <CartesianPicker
        value={point}
        onChange={setPoint}
        width={SIZE}
        height={SIZE}
      />
    </DemoWrapper>
  );
}

export function CartesianPickerControlled() {
  const [point, setPoint] = useState<Point2D>({ x: 0.5, y: -0.5 });
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2}>
        <CartesianPicker
          value={point}
          onChange={setPoint}
          width={SIZE}
          height={SIZE}
        />
        <Text size="sm" color="muted">
          x: {point.x.toFixed(2)}, y: {point.y.toFixed(2)}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function CartesianPickerDomain() {
  const [uv, setUv] = useState<Point2D>({ x: 0.25, y: 0.75 });
  const [coords, setCoords] = useState<Point2D>({ x: 0, y: 0 });
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={4}>
        <CartesianPicker
          domainX={[0, 1]}
          domainY={[0, 1]}
          value={uv}
          onChange={setUv}
          labelX="U"
          labelY="V"
          width={SIZE}
          height={SIZE}
        />
        <CartesianPicker
          domainX={[-180, 180]}
          domainY={[-90, 90]}
          value={coords}
          onChange={setCoords}
          labelX="Pan"
          labelY="Tilt"
          width={SIZE}
          height={SIZE}
        />
      </Stack>
    </DemoWrapper>
  );
}

export function CartesianPickerGrid() {
  const [point, setPoint] = useState<Point2D>({ x: 0.3, y: -0.4 });
  return (
    <DemoWrapper withKeyboard>
      <CartesianPicker
        showGrid
        gridSubdivisions={8}
        showAxisLabels
        showOriginAxes
        labelX="X"
        labelY="Y"
        value={point}
        onChange={setPoint}
        width={SIZE}
        height={SIZE}
      />
    </DemoWrapper>
  );
}

export function CartesianPickerCrosshair() {
  const [point, setPoint] = useState<Point2D>({ x: -0.4, y: 0.6 });
  return (
    <DemoWrapper withKeyboard>
      <CartesianPicker
        showCrosshair
        crosshairStyle="solid"
        value={point}
        onChange={setPoint}
        width={SIZE}
        height={SIZE}
      />
    </DemoWrapper>
  );
}

export function CartesianPickerSnap() {
  const [grid, setGrid] = useState<Point2D>({ x: 0, y: 0 });
  const [step, setStep] = useState<Point2D>({ x: 0.25, y: 0.25 });
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={4}>
        <Stack gap={1}>
          <Text size="sm" color="muted">
            Snap to grid subdivisions
          </Text>
          <CartesianPicker
            snapToGrid
            gridSubdivisions={4}
            value={grid}
            onChange={setGrid}
            width={SIZE}
            height={SIZE}
          />
        </Stack>
        <Stack gap={1}>
          <Text size="sm" color="muted">
            Discrete step (0.25)
          </Text>
          <CartesianPicker
            step={0.25}
            value={step}
            onChange={setStep}
            width={SIZE}
            height={SIZE}
          />
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function CartesianPickerClamping() {
  const [point, setPoint] = useState<Point2D>({ x: 0, y: 0 });
  return (
    <DemoWrapper withKeyboard>
      <CartesianPicker
        clampToRange={false}
        value={point}
        onChange={setPoint}
        width={SIZE}
        height={SIZE}
      />
    </DemoWrapper>
  );
}

export function CartesianPickerResponsive() {
  const [point, setPoint] = useState<Point2D>({ x: 0, y: 0 });
  return (
    <DemoWrapper withKeyboard>
      <div style={{ width: '100%' }}>
        <CartesianPicker
          responsive
          height={220}
          value={point}
          onChange={setPoint}
        />
      </div>
    </DemoWrapper>
  );
}

export function CartesianPickerBackground() {
  const [point, setPoint] = useState<Point2D>({ x: 0, y: 0 });
  return (
    <DemoWrapper withKeyboard>
      <CartesianPicker
        value={point}
        onChange={setPoint}
        width={SIZE}
        height={SIZE}
        renderBackground={(ctx, info) => {
          const cx = info.width / 2;
          const cy = info.height / 2;
          const grad = ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            info.width / 2
          );
          grad.addColorStop(0, 'rgba(0, 122, 204, 0.35)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, info.width, info.height);
        }}
      />
    </DemoWrapper>
  );
}

export function CartesianPickerBottomBar() {
  const [point, setPoint] = useState<Point2D>({ x: 0, y: 0 });
  return (
    <DemoWrapper withKeyboard>
      <CartesianPicker
        value={point}
        onChange={setPoint}
        width={SIZE}
        height={SIZE}
        renderBottomBar={info => (
          <Text size="sm" color="muted">
            X: {info.point.x.toFixed(2)}, Y: {info.point.y.toFixed(2)}
            {info.isDragging ? ' (dragging)' : ''}
          </Text>
        )}
      />
    </DemoWrapper>
  );
}

export function CartesianPickerChangeComplete() {
  const [point, setPoint] = useState<Point2D>({ x: 0, y: 0 });
  const [committed, setCommitted] = useState<Point2D>({ x: 0, y: 0 });
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2}>
        <CartesianPicker
          value={point}
          onChange={setPoint}
          onChangeComplete={setCommitted}
          width={SIZE}
          height={SIZE}
        />
        <Text size="sm" color="muted">
          Committed: x: {committed.x.toFixed(2)}, y: {committed.y.toFixed(2)}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
