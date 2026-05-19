import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Page navigator with sibling/boundary ellipsis logic. Pages are 1-based. Controlled when `page` is set, otherwise uncontrolled with `defaultPage`.',
      },
    },
  },
  argTypes: {
    count: { control: { type: 'number', min: 0, max: 100 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
    boundaryCount: { control: { type: 'number', min: 1, max: 3 } },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showFirstButton: { control: 'boolean' },
    showLastButton: { control: 'boolean' },
    hidePrevButton: { control: 'boolean' },
    hideNextButton: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: { count: 10, defaultPage: 1 },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Pagination size="sm" count={10} defaultPage={3} />
      <Pagination size="md" count={10} defaultPage={3} />
      <Pagination size="lg" count={10} defaultPage={3} />
    </div>
  ),
};

export const ManyPages: Story = {
  args: { count: 50, defaultPage: 25 },
};

export const FullControls: Story = {
  args: {
    count: 50,
    defaultPage: 25,
    showFirstButton: true,
    showLastButton: true,
  },
};

export const Compact: Story = {
  args: {
    count: 20,
    defaultPage: 10,
    siblingCount: 0,
    boundaryCount: 1,
  },
};

export const Disabled: Story = {
  args: { count: 10, defaultPage: 4, disabled: true },
};

export const Controlled: Story = {
  render: function ControlledExample() {
    const [page, setPage] = useState(1);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div>
          Current page: <strong>{page}</strong>
        </div>
        <Pagination
          count={20}
          page={page}
          onChange={(_, next) => {
            setPage(next);
          }}
        />
      </div>
    );
  },
};
