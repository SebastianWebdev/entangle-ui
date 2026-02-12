import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { ColorPicker } from '@/components/controls';

export default function ColorPickerDemo() {
  const [color, setColor] = useState('#007acc');

  return (
    <DemoWrapper withKeyboard>
      <ColorPicker
        value={color}
        onChange={setColor}
        inline
        palette="material"
        presets={[
          { color: '#007acc', label: 'Accent' },
          { color: '#4caf50', label: 'Success' },
          { color: '#ff9800', label: 'Warning' },
          { color: '#f44336', label: 'Error' },
          { color: '#ffffff', label: 'White' },
          { color: '#1a1a1a', label: 'Dark' },
        ]}
      />
    </DemoWrapper>
  );
}
