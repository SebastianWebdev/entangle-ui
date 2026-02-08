import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';
import { AccordionItem } from './AccordionItem';
import { AccordionTrigger } from './AccordionTrigger';
import { AccordionContent } from './AccordionContent';
import { Stack } from '@/components/layout/Stack';

const meta: Meta<typeof Accordion> = {
  title: 'Layout/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'filled'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    multiple: { control: 'boolean' },
    collapsible: { control: 'boolean' },
    gap: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: args => (
    <div style={{ width: 320 }}>
      <Accordion defaultValue="transform" {...args}>
        <AccordionItem value="transform">
          <AccordionTrigger>Transform</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              <div>Position: (0, 0, 0)</div>
              <div>Rotation: (0, 0, 0)</div>
              <div>Scale: (1, 1, 1)</div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="material">
          <AccordionTrigger>Material</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              <div>Shader: Standard</div>
              <div>Albedo: #ffffff</div>
              <div>Metallic: 0.0</div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="physics">
          <AccordionTrigger>Physics</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              <div>Mass: 1.0 kg</div>
              <div>Drag: 0.0</div>
              <div>Use Gravity: Yes</div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="column" spacing={4}>
      <div>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Default
        </div>
        <div style={{ width: 300 }}>
          <Accordion defaultValue="s1" variant="default">
            <AccordionItem value="s1">
              <AccordionTrigger>Default Variant</AccordionTrigger>
              <AccordionContent>
                <div style={{ color: '#aaa', fontSize: 12 }}>
                  Subtle header background
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>
                <div style={{ color: '#aaa', fontSize: 12 }}>Content</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Ghost
        </div>
        <div style={{ width: 300 }}>
          <Accordion defaultValue="s1" variant="ghost">
            <AccordionItem value="s1">
              <AccordionTrigger>Ghost Variant</AccordionTrigger>
              <AccordionContent>
                <div style={{ color: '#aaa', fontSize: 12 }}>
                  No header background
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>
                <div style={{ color: '#aaa', fontSize: 12 }}>Content</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div>
        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
          Filled
        </div>
        <div style={{ width: 300 }}>
          <Accordion defaultValue="s1" variant="filled">
            <AccordionItem value="s1">
              <AccordionTrigger>Filled Variant</AccordionTrigger>
              <AccordionContent>
                <div style={{ color: '#aaa', fontSize: 12 }}>
                  Darker header background
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>
                <div style={{ color: '#aaa', fontSize: 12 }}>Content</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" spacing={4}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <div key={size}>
          <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
            {size}
          </div>
          <div style={{ width: 300 }}>
            <Accordion defaultValue="s1" size={size}>
              <AccordionItem value="s1">
                <AccordionTrigger>Section ({size})</AccordionTrigger>
                <AccordionContent>
                  <div style={{ color: '#aaa', fontSize: 12 }}>
                    Content for {size} size
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="s2">
                <AccordionTrigger>Another Section</AccordionTrigger>
                <AccordionContent>
                  <div style={{ color: '#aaa', fontSize: 12 }}>Content</div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      ))}
    </Stack>
  ),
};

export const MultipleOpen: Story = {
  name: 'Multiple Open',
  render: () => (
    <div style={{ width: 320 }}>
      <Accordion defaultValue={['transform', 'material']} multiple>
        <AccordionItem value="transform">
          <AccordionTrigger>Transform</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              Position, rotation, scale
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="material">
          <AccordionTrigger>Material</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              Shader, textures, properties
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="physics">
          <AccordionTrigger>Physics</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              Rigidbody, colliders
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const NonCollapsible: Story = {
  name: 'Non-collapsible',
  render: () => (
    <div style={{ width: 320 }}>
      <Accordion defaultValue="section1">
        <AccordionItem value="section1">
          <AccordionTrigger>Always one open</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              Cannot close this without opening another
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="section2">
          <AccordionTrigger>Alternative section</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              Opening this closes the previous one
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const DisabledItems: Story = {
  name: 'Disabled Items',
  render: () => (
    <div style={{ width: 320 }}>
      <Accordion defaultValue="section1">
        <AccordionItem value="section1">
          <AccordionTrigger>Enabled Section</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>This works</div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="section2" disabled>
          <AccordionTrigger>Disabled Section</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>Cannot open</div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="section3">
          <AccordionTrigger>Another Enabled</AccordionTrigger>
          <AccordionContent>
            <div style={{ color: '#aaa', fontSize: 12 }}>This also works</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | string[]>('transform');

    return (
      <div style={{ width: 320 }}>
        <Accordion value={value} onChange={setValue}>
          <AccordionItem value="transform">
            <AccordionTrigger>Transform</AccordionTrigger>
            <AccordionContent>
              <div style={{ color: '#aaa', fontSize: 12 }}>
                Position, rotation, scale
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="material">
            <AccordionTrigger>Material</AccordionTrigger>
            <AccordionContent>
              <div style={{ color: '#aaa', fontSize: 12 }}>Shader settings</div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
          Active: {String(value)}
        </div>
      </div>
    );
  },
};

export const InspectorExample: Story = {
  name: 'Editor — Inspector',
  render: () => {
    const [expanded, setExpanded] = useState<string | string[]>([
      'transform',
      'material',
    ]);

    return (
      <div
        style={{
          width: 300,
          background: '#1e1e1e',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Accordion
          value={expanded}
          onChange={setExpanded}
          multiple
          size="sm"
          variant="filled"
        >
          <AccordionItem value="transform">
            <AccordionTrigger>Transform</AccordionTrigger>
            <AccordionContent>
              <div style={{ color: '#aaa', fontSize: 11 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span>Position</span>
                  <span style={{ color: '#ddd' }}>0, 0, 0</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span>Rotation</span>
                  <span style={{ color: '#ddd' }}>0, 0, 0</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Scale</span>
                  <span style={{ color: '#ddd' }}>1, 1, 1</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="material">
            <AccordionTrigger>Material</AccordionTrigger>
            <AccordionContent>
              <div style={{ color: '#aaa', fontSize: 11 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span>Shader</span>
                  <span style={{ color: '#ddd' }}>Standard</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span>Metallic</span>
                  <span style={{ color: '#ddd' }}>0.0</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Roughness</span>
                  <span style={{ color: '#ddd' }}>0.5</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="physics">
            <AccordionTrigger>Physics</AccordionTrigger>
            <AccordionContent>
              <div style={{ color: '#aaa', fontSize: 11 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span>Mass</span>
                  <span style={{ color: '#ddd' }}>1.0 kg</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Gravity</span>
                  <span style={{ color: '#ddd' }}>Enabled</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
};
