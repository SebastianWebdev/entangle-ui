import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Slider } from '@/components/controls';
import { Stack } from '@/components/layout';

export default function SliderDemo() {
  const [v1, setV1] = useState(50);
  const [v2, setV2] = useState(75);
  const [v3, setV3] = useState(180);
  const [v4, setV4] = useState(60);

  return (
    <DemoWrapper withKeyboard>
      <Stack spacing={4} style={{ maxWidth: 350 }}>
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
        <Slider value={v4} onChange={setV4} label="Brightness" size="lg" />
        <Slider value={50} onChange={() => {}} label="Locked" disabled />
      </Stack>
    </DemoWrapper>
  );
}
