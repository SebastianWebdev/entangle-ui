import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { GradientEditor, formatGradientCSS } from '@/components/controls';
import type { GradientData } from '@/components/controls';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

const SUNSET: GradientData = {
  type: 'linear',
  angle: 90,
  stops: [
    { id: 's1', color: '#ff8a00', position: 0 },
    { id: 's2', color: '#e52e71', position: 0.55 },
    { id: 's3', color: '#9b2dff', position: 1 },
  ],
};

export default function GradientEditorDemo() {
  return (
    <DemoWrapper withKeyboard>
      <GradientEditor defaultValue={SUNSET} />
    </DemoWrapper>
  );
}

export function GradientEditorControlled() {
  const [gradient, setGradient] = useState<GradientData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2}>
        <GradientEditor value={gradient} onChange={setGradient} />
        <Text size="sm" color="muted">
          Stops: {gradient ? gradient.stops.length : 2}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}

export function GradientEditorInline() {
  const [gradient, setGradient] = useState<GradientData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <GradientEditor
        value={gradient}
        onChange={setGradient}
        colorEditor="inline"
        width={300}
      />
    </DemoWrapper>
  );
}

export function GradientEditorRadialConic() {
  return (
    <DemoWrapper withKeyboard>
      <GradientEditor defaultValue={{ ...SUNSET, type: 'radial' }} />
    </DemoWrapper>
  );
}

export function GradientEditorLinearOnly() {
  const [gradient, setGradient] = useState<GradientData | undefined>(undefined);
  return (
    <DemoWrapper withKeyboard>
      <GradientEditor
        value={gradient}
        onChange={setGradient}
        types={['linear']}
      />
    </DemoWrapper>
  );
}

export function GradientEditorChangeComplete() {
  const [gradient, setGradient] = useState<GradientData>(SUNSET);
  const [css, setCss] = useState(formatGradientCSS(SUNSET));
  return (
    <DemoWrapper withKeyboard>
      <Stack gap={2}>
        <GradientEditor
          value={gradient}
          onChange={setGradient}
          onChangeComplete={final => {
            setGradient(final);
            setCss(formatGradientCSS(final));
          }}
        />
        <Text size="sm" color="muted">
          Committed CSS: {css}
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
