import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './ScrollArea';
import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';

const meta: Meta<typeof ScrollArea> = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const LONG_TEXT = Array.from(
  { length: 20 },
  (_, i) =>
    `Item ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
);

// --- Stories ---

export const Default: Story = {
  render: () => (
    <div style={{ width: 300, height: 300, border: '1px solid #333' }}>
      <ScrollArea maxHeight={300}>
        <Stack spacing={2} style={{ padding: 8 }}>
          {LONG_TEXT.map((text, i) => (
            <Text key={i} size="xs">
              {text}
            </Text>
          ))}
        </Stack>
      </ScrollArea>
    </div>
  ),
};

export const AlwaysVisible: Story = {
  render: () => (
    <div style={{ width: 300, height: 300, border: '1px solid #333' }}>
      <ScrollArea maxHeight={300} scrollbarVisibility="always">
        <Stack spacing={2} style={{ padding: 8 }}>
          {LONG_TEXT.map((text, i) => (
            <Text key={i} size="xs">
              {text}
            </Text>
          ))}
        </Stack>
      </ScrollArea>
    </div>
  ),
};

export const HoverOnly: Story = {
  render: () => (
    <div style={{ width: 300, height: 300, border: '1px solid #333' }}>
      <ScrollArea maxHeight={300} scrollbarVisibility="hover">
        <Stack spacing={2} style={{ padding: 8 }}>
          {LONG_TEXT.map((text, i) => (
            <Text key={i} size="xs">
              {text}
            </Text>
          ))}
        </Stack>
      </ScrollArea>
    </div>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <div style={{ width: 300, height: 100, border: '1px solid #333' }}>
      <ScrollArea direction="horizontal" maxWidth={300}>
        <div style={{ width: 800, padding: 8, whiteSpace: 'nowrap' }}>
          <Text size="xs">
            This is a very long text line that extends far beyond the visible
            area and requires horizontal scrolling to see the full content of
            this element.
          </Text>
        </div>
      </ScrollArea>
    </div>
  ),
};

export const BothAxes: Story = {
  render: () => (
    <div style={{ width: 300, height: 300, border: '1px solid #333' }}>
      <ScrollArea direction="both" maxHeight={300} maxWidth={300}>
        <div style={{ width: 600, padding: 8 }}>
          <Stack spacing={2}>
            {LONG_TEXT.map((text, i) => (
              <Text key={i} size="xs" style={{ whiteSpace: 'nowrap' }}>
                {text}
              </Text>
            ))}
          </Stack>
        </div>
      </ScrollArea>
    </div>
  ),
};

export const WithFadeMasks: Story = {
  render: () => (
    <div style={{ width: 300, height: 300, border: '1px solid #333' }}>
      <ScrollArea maxHeight={300} fadeMask>
        <Stack spacing={2} style={{ padding: 8 }}>
          {LONG_TEXT.map((text, i) => (
            <Text key={i} size="xs">
              {text}
            </Text>
          ))}
        </Stack>
      </ScrollArea>
    </div>
  ),
};

export const CustomScrollbarWidth: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <div>
        <Text size="xs" color="muted" style={{ marginBottom: 4 }}>
          Thin (4px)
        </Text>
        <div style={{ width: 200, height: 200, border: '1px solid #333' }}>
          <ScrollArea
            maxHeight={200}
            scrollbarWidth={4}
            scrollbarVisibility="always"
          >
            <Stack spacing={1} style={{ padding: 8 }}>
              {LONG_TEXT.slice(0, 10).map((text, i) => (
                <Text key={i} size="xs">
                  {text}
                </Text>
              ))}
            </Stack>
          </ScrollArea>
        </div>
      </div>
      <div>
        <Text size="xs" color="muted" style={{ marginBottom: 4 }}>
          Wide (10px)
        </Text>
        <div style={{ width: 200, height: 200, border: '1px solid #333' }}>
          <ScrollArea
            maxHeight={200}
            scrollbarWidth={10}
            scrollbarVisibility="always"
          >
            <Stack spacing={1} style={{ padding: 8 }}>
              {LONG_TEXT.slice(0, 10).map((text, i) => (
                <Text key={i} size="xs">
                  {text}
                </Text>
              ))}
            </Stack>
          </ScrollArea>
        </div>
      </div>
    </Stack>
  ),
};

export const PropertyList: Story = {
  name: 'Editor Example — Property List',
  render: () => {
    const properties = Array.from({ length: 30 }, (_, i) => ({
      name: `property_${i + 1}`,
      value: (Math.random() * 100).toFixed(2),
    }));

    return (
      <div
        style={{
          width: 260,
          height: 400,
          background: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: 4,
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid #333',
          }}
        >
          <Text size="sm" weight="semibold">
            Properties
          </Text>
        </div>
        <ScrollArea maxHeight={360} fadeMask scrollbarVisibility="auto">
          <Stack spacing={0} style={{ padding: 4 }}>
            {properties.map(prop => (
              <div
                key={prop.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <Text size="xs" color="muted">
                  {prop.name}
                </Text>
                <Text size="xs">{prop.value}</Text>
              </div>
            ))}
          </Stack>
        </ScrollArea>
      </div>
    );
  },
};
