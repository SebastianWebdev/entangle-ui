import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar } from './Toolbar';

const meta: Meta<typeof Toolbar> = {
  title: 'Shell/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Horizontal: Story = {
  render: () => (
    <Toolbar aria-label="Main toolbar">
      <Toolbar.Group aria-label="File">
        <Toolbar.Button onClick={() => {}}>New</Toolbar.Button>
        <Toolbar.Button onClick={() => {}}>Open</Toolbar.Button>
        <Toolbar.Button onClick={() => {}}>Save</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Edit">
        <Toolbar.Button onClick={() => {}}>Undo</Toolbar.Button>
        <Toolbar.Button onClick={() => {}}>Redo</Toolbar.Button>
      </Toolbar.Group>
    </Toolbar>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: 40 }}>
      <Toolbar orientation="vertical" aria-label="Tool palette">
        <Toolbar.Button onClick={() => {}}>P</Toolbar.Button>
        <Toolbar.Button onClick={() => {}}>B</Toolbar.Button>
        <Toolbar.Button onClick={() => {}}>E</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Button onClick={() => {}}>S</Toolbar.Button>
        <Toolbar.Button onClick={() => {}}>R</Toolbar.Button>
      </Toolbar>
    </div>
  ),
};

export const WithToggles: Story = {
  render: function Render() {
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(true);

    return (
      <Toolbar aria-label="Formatting">
        <Toolbar.Group aria-label="Text style">
          <Toolbar.Toggle pressed={bold} onPressedChange={setBold}>
            B
          </Toolbar.Toggle>
          <Toolbar.Toggle pressed={italic} onPressedChange={setItalic}>
            I
          </Toolbar.Toggle>
          <Toolbar.Toggle pressed={underline} onPressedChange={setUnderline}>
            U
          </Toolbar.Toggle>
        </Toolbar.Group>
      </Toolbar>
    );
  },
};

export const SmallSize: Story = {
  render: () => (
    <Toolbar size="sm" aria-label="Compact toolbar">
      <Toolbar.Button onClick={() => {}}>A</Toolbar.Button>
      <Toolbar.Button onClick={() => {}}>B</Toolbar.Button>
      <Toolbar.Separator />
      <Toolbar.Button onClick={() => {}}>C</Toolbar.Button>
    </Toolbar>
  ),
};

export const WithSpacer: Story = {
  render: () => (
    <Toolbar aria-label="Spaced toolbar">
      <Toolbar.Button onClick={() => {}}>Left</Toolbar.Button>
      <Toolbar.Spacer />
      <Toolbar.Button onClick={() => {}}>Right</Toolbar.Button>
    </Toolbar>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Toolbar aria-label="Mixed states">
      <Toolbar.Button onClick={() => {}}>Active</Toolbar.Button>
      <Toolbar.Button onClick={() => {}} disabled>
        Disabled
      </Toolbar.Button>
      <Toolbar.Button onClick={() => {}}>Active</Toolbar.Button>
    </Toolbar>
  ),
};
