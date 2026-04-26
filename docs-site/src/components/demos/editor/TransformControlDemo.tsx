import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  PropertyPanel,
  PropertySection,
} from '@/components/editor/PropertyInspector';
import { TransformControl } from '@/components/editor/TransformControl';
import type {
  CoordinateSpace,
  TransformValue,
} from '@/components/editor/TransformControl';

const initialValue: TransformValue = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

export default function TransformControlDemo() {
  const [transform, setTransform] = useState<TransformValue>(initialValue);
  const [space, setSpace] = useState<CoordinateSpace>('local');

  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 360 }}>
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl
              value={transform}
              onChange={setTransform}
              coordinateSpace={space}
              onCoordinateSpaceChange={setSpace}
              showReset
            />
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}

export function TransformControlBasic() {
  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 360 }}>
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl defaultValue={initialValue} />
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}

export function TransformControlWithReset() {
  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 360 }}>
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl
              defaultValue={{
                position: { x: 1, y: 2, z: 3 },
                rotation: { x: 15, y: 30, z: 0 },
                scale: { x: 2, y: 2, z: 2 },
              }}
              showReset
            />
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}

export function TransformControlLinkedScale() {
  const [transform, setTransform] = useState<TransformValue>(initialValue);
  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 360 }}>
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl
              value={transform}
              onChange={setTransform}
              defaultLinkedScale
            />
          </PropertySection>
        </PropertyPanel>
        <pre
          style={{
            marginTop: 12,
            fontSize: 11,
            color: 'var(--etui-color-text-secondary)',
            padding: '0 12px',
          }}
        >
          scale = ({transform.scale.x.toFixed(2)},{' '}
          {transform.scale.y.toFixed(2)}, {transform.scale.z.toFixed(2)})
        </pre>
      </div>
    </DemoWrapper>
  );
}

export function TransformControlPositionOnly() {
  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 360 }}>
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl
              defaultValue={initialValue}
              show={{ rotation: false, scale: false }}
            />
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}

export function TransformControlCustomSpaces() {
  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 360 }}>
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl
              defaultValue={initialValue}
              defaultCoordinateSpace="camera"
              coordinateSpaceOptions={[
                { value: 'camera', label: 'Camera' },
                { value: 'screen', label: 'Screen' },
                { value: 'tangent', label: 'Tangent' },
              ]}
            />
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}

export function TransformControlInPanel() {
  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 360 }}>
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl defaultValue={initialValue} showReset />
          </PropertySection>
          <PropertySection title="Material" defaultExpanded={false}>
            <div
              style={{
                padding: 8,
                fontSize: 12,
                color: 'var(--etui-color-text-muted)',
              }}
            >
              (placeholder section)
            </div>
          </PropertySection>
          <PropertySection title="Physics" defaultExpanded={false}>
            <div
              style={{
                padding: 8,
                fontSize: 12,
                color: 'var(--etui-color-text-muted)',
              }}
            >
              (placeholder section)
            </div>
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}

export function TransformControlControlled() {
  const [transform, setTransform] = useState<TransformValue>(initialValue);
  return (
    <DemoWrapper withKeyboard padding="0">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <PropertyPanel size="sm">
          <PropertySection title="Transform" defaultExpanded>
            <TransformControl value={transform} onChange={setTransform} />
          </PropertySection>
        </PropertyPanel>
        <pre
          style={{
            margin: 0,
            fontSize: 11,
            lineHeight: 1.5,
            color: 'var(--etui-color-text-secondary)',
            background: 'var(--etui-color-surface-default)',
            padding: 12,
            borderRadius: 4,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(transform, null, 2)}
        </pre>
      </div>
    </DemoWrapper>
  );
}
