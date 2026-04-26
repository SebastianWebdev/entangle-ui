import { useEffect, useRef } from 'react';
import DemoWrapper from '../DemoWrapper';
import { useTheme } from '@/hooks/useTheme';
import { Stack } from '@/components/layout/Stack';
import { Flex } from '@/components/layout/Flex';
import { Text } from '@/components/primitives/Text';
import { Code } from '@/components/primitives/Code';

const SAMPLE_PATHS = [
  'colors.accent.primary',
  'colors.text.primary',
  'spacing.md',
  'borderRadius.md',
  'shell.menuBar.height',
];

function ThemedCanvas({ size = 96 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { values } = useTheme();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = values.colors.background.elevated;
    ctx.fillRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
    ctx.fillStyle = values.colors.accent.primary;
    ctx.fill();

    ctx.strokeStyle = values.colors.border.default;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  }, [size, values]);

  return <canvas ref={ref} />;
}

export default function UseThemeDemo() {
  const { variant, values, getVar } = useTheme();

  return (
    <DemoWrapper>
      <Stack spacing={3}>
        <Flex gap={3} align="center">
          <ThemedCanvas size={96} />
          <Stack spacing={1}>
            <Text size="sm" color="secondary">
              variant
            </Text>
            <Text size="md">{variant}</Text>
            <Text size="sm" color="secondary">
              accent
            </Text>
            <Text size="md">{values.colors.accent.primary}</Text>
          </Stack>
        </Flex>
        <div
          style={{
            padding: 12,
            borderRadius: 4,
            background: getVar('colors.surface.default'),
            border: `1px solid ${getVar('colors.border.default')}`,
            color: getVar('colors.text.primary'),
          }}
        >
          <Text size="sm">
            Surface, border, and text colour all driven by `getVar`.
          </Text>
        </div>
      </Stack>
    </DemoWrapper>
  );
}

export function UseThemeCanvasDrawing() {
  return (
    <DemoWrapper>
      <Flex gap={3} align="center">
        <ThemedCanvas size={120} />
        <Text size="sm" color="secondary">
          Canvas re-paints whenever <Code>useTheme</Code> resolves new values on
          mount, using the live <Code>colors.accent.primary</Code> token.
        </Text>
      </Flex>
    </DemoWrapper>
  );
}

export function UseThemeConditionalLogic() {
  const { variant } = useTheme();

  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <Text size="sm" color="secondary">
          Detected variant: <Code>{variant}</Code>
        </Text>
        {variant === 'dark' && (
          <Text size="md">Dark mode — high-contrast assets loaded.</Text>
        )}
        {variant === 'light' && (
          <Text size="md">Light mode — soft assets loaded.</Text>
        )}
        {variant === 'custom' && (
          <Text size="md">Custom theme — fall back to default assets.</Text>
        )}
      </Stack>
    </DemoWrapper>
  );
}

export function UseThemeGetToken() {
  const { getToken } = useTheme();

  return (
    <DemoWrapper>
      <Stack spacing={2}>
        {SAMPLE_PATHS.map(path => (
          <Flex key={path} gap={2} align="center" justify="space-between">
            <Code>{path}</Code>
            <Text size="sm" color="secondary">
              {getToken(path) || '(unresolved)'}
            </Text>
          </Flex>
        ))}
      </Stack>
    </DemoWrapper>
  );
}

export function UseThemeGetVar() {
  const { getVar } = useTheme();

  return (
    <DemoWrapper>
      <Stack spacing={2}>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            background: getVar('colors.surface.default'),
            border: `1px solid ${getVar('colors.border.default')}`,
            color: getVar('colors.accent.primary'),
            fontWeight: 500,
          }}
        >
          Inline styles via getVar('colors.accent.primary')
        </div>
        <Text size="sm" color="secondary">
          The string is just <Code>var(--etui-...)</Code>, so the browser
          re-resolves the colour automatically when the surrounding theme class
          changes.
        </Text>
      </Stack>
    </DemoWrapper>
  );
}
