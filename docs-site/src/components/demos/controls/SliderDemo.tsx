import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Slider } from '@/components/controls';
import { Stack } from '@/components/layout';

export default function SliderDemo() {
  const [v1, setV1] = useState(50);
  const [v2, setV2] = useState(75);
  const [v3, setV3] = useState(180);

  return (
    <DemoWrapper withKeyboard>
      <Stack spacing="lg" style={{ maxWidth: 350 }}>
        <Slider value={v1} onChange={setV1} label="Opacity" unit="%" />
        <Slider
          value={v2}
          onChange={setV2}
          label="Volume"
          min={0}
          max={100}
          size="sm"
        />
        <Slider
          value={v3}
          onChange={setV3}
          label="Rotation"
          min={0}
          max={360}
          step={15}
          unit="°"
          showTicks
          tickCount={8}
        />
      </Stack>
    </DemoWrapper>
  );
}
