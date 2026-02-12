import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { CartesianPicker } from '@/components/controls';

export default function CartesianPickerDemo() {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  return (
    <DemoWrapper withKeyboard>
      <CartesianPicker
        value={point}
        onChange={setPoint}
        width={340}
        height={340}
      />
    </DemoWrapper>
  );
}
