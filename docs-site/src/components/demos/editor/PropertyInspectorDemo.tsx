import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  PropertyPanel,
  PropertySection,
  PropertyRow,
} from '@/components/editor/PropertyInspector';
import { NumberInput } from '@/components/controls';
import { Checkbox } from '@/components/primitives';

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
