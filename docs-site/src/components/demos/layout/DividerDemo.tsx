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

export function DividerHorizontal() {
  return (
    <DemoWrapper>
      <Stack gap={2} style={{ width: '100%', maxWidth: 320 }}>
        <span>Before</span>
        <Divider />
        <span>After</span>
      </Stack>
    </DemoWrapper>
  );
}

export function DividerVertical() {
  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 32,
          padding: '0 4px',
          background: 'var(--etui-color-surface-default)',
          borderRadius: 4,
        }}
      >
        <span>File</span>
        <Divider orientation="vertical" />
        <span>Edit</span>
        <Divider orientation="vertical" />
        <span>View</span>
        <Divider orientation="vertical" />
        <span>Help</span>
      </div>
    </DemoWrapper>
  );
}

export function DividerVariants() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 320 }}>
        <Stack gap={2}>
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            solid
          </span>
          <Divider variant="solid" />
        </Stack>
        <Stack gap={2}>
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            dashed
          </span>
          <Divider variant="dashed" />
        </Stack>
        <Stack gap={2}>
          <span style={{ fontSize: 11, color: 'var(--etui-color-text-muted)' }}>
            dotted
          </span>
          <Divider variant="dotted" />
        </Stack>
      </Stack>
    </DemoWrapper>
  );
}

export function DividerWithLabel() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 360 }}>
        <span>Primary form fields above…</span>
        <Divider label="Advanced" />
        <span>…and secondary fields below.</span>
        <Divider label="Danger zone" variant="dashed" />
        <span>Destructive actions below.</span>
      </Stack>
    </DemoWrapper>
  );
}

export function DividerSpacing() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 320 }}>
        <span>spacing &#123;0&#125;</span>
        <Divider spacing={0} />
        <span>spacing &#123;3&#125; — md (8px)</span>
        <Divider spacing={3} />
        <span>spacing &#123;5&#125; — xl (16px)</span>
        <Divider spacing={5} />
        <span>spacing &#123;7&#125; — xxxl (32px)</span>
        <Divider spacing={7} />
        <span>end</span>
      </Stack>
    </DemoWrapper>
  );
}
