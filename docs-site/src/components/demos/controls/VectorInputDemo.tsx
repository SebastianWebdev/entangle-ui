import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { VectorInput } from '@/components/controls';
import { Stack } from '@/components/layout';

export default function VectorInputDemo() {
  const [pos, setPos] = useState([0, 0, 0]);
  const [color, setColor] = useState([255, 128, 0, 255]);

  return (
    <DemoWrapper withKeyboard>
      <Stack spacing="lg" style={{ maxWidth: 400 }}>
        <VectorInput
          value={pos}
          onChange={setPos}
          dimension={3}
          label="Position"
          labelPreset="xyz"
          colorPreset="spatial"
        />
        <VectorInput
          value={color}
          onChange={setColor}
          dimension={4}
          label="Color"
          labelPreset="rgba"
          colorPreset="color"
          min={0}
          max={255}
          step={1}
        />
      </Stack>
    </DemoWrapper>
  );
}
