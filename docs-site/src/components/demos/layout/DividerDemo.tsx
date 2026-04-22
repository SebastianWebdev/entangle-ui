import DemoWrapper from '../DemoWrapper';
import { Divider } from '@/components/layout';
import { Stack } from '@/components/layout';

export default function DividerDemo() {
  return (
    <DemoWrapper>
      <Stack gap={4} style={{ width: '100%', maxWidth: 360 }}>
        <Stack gap={2}>
          <span>Section A</span>
          <Divider />
          <span>Section B</span>
          <Divider variant="dashed" />
          <span>Section C</span>
          <Divider variant="dotted" />
          <span>Section D</span>
        </Stack>

        <Divider label="Advanced" />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 32,
          }}
        >
          <span>Left</span>
          <Divider orientation="vertical" />
          <span>Middle</span>
          <Divider orientation="vertical" variant="dashed" />
          <span>Right</span>
        </div>
      </Stack>
    </DemoWrapper>
  );
}
