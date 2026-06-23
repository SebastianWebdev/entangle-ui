import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  PropertyPanel,
  PropertySection,
  PropertyRow,
} from '@/components/editor/PropertyInspector';
import { NumberInput } from '@/components/controls';
import { Checkbox } from '@/components/primitives';
import { StarIcon } from '@/components/Icons';

export default function PropertyInspectorDemo() {
  const [x, setX] = useState(100);
  const [y, setY] = useState(200);
  const [visible, setVisible] = useState(true);

  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 350 }}>
        <PropertyPanel>
          <PropertySection title="Transform" defaultExpanded>
            <PropertyRow label="X">
              <NumberInput value={x} onChange={setX} />
            </PropertyRow>
            <PropertyRow label="Y">
              <NumberInput value={y} onChange={setY} />
            </PropertyRow>
          </PropertySection>
          <PropertySection title="Appearance" defaultExpanded>
            <PropertyRow label="Visible">
              <Checkbox
                checked={visible}
                onChange={checked => setVisible(checked)}
              />
            </PropertyRow>
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}

export function PropertyRowLabelDemo() {
  const [opacity, setOpacity] = useState(0.8);
  const [roughness, setRoughness] = useState(0.5);

  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 350 }}>
        <PropertyPanel>
          <PropertySection title="Material" defaultExpanded>
            <PropertyRow label="Opacity" tooltip="Surface opacity (0–1)">
              <NumberInput
                value={opacity}
                onChange={setOpacity}
                min={0}
                max={1}
                step={0.05}
              />
            </PropertyRow>
            <PropertyRow
              label={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <StarIcon size={12} decorative /> Roughness
                </span>
              }
            >
              <NumberInput
                value={roughness}
                onChange={setRoughness}
                min={0}
                max={1}
                step={0.05}
              />
            </PropertyRow>
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}

export function PropertySectionCheckableDemo() {
  const [fogEnabled, setFogEnabled] = useState(true);
  const [density, setDensity] = useState(0.3);
  const [bloomEnabled, setBloomEnabled] = useState(false);
  const [intensity, setIntensity] = useState(1.2);

  return (
    <DemoWrapper withKeyboard padding="0">
      <div style={{ maxWidth: 350 }}>
        <PropertyPanel>
          <PropertySection
            title="Fog"
            checkable
            checked={fogEnabled}
            onCheckedChange={setFogEnabled}
          >
            <PropertyRow label="Density" tooltip="Volumetric fog density">
              <NumberInput
                value={density}
                onChange={setDensity}
                min={0}
                max={1}
                step={0.01}
              />
            </PropertyRow>
          </PropertySection>
          <PropertySection
            title="Bloom"
            checkable
            checked={bloomEnabled}
            onCheckedChange={setBloomEnabled}
          >
            <PropertyRow label="Intensity">
              <NumberInput
                value={intensity}
                onChange={setIntensity}
                min={0}
                max={5}
                step={0.1}
              />
            </PropertyRow>
          </PropertySection>
        </PropertyPanel>
      </div>
    </DemoWrapper>
  );
}
