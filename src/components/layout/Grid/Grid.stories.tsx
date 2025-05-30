// src/components/layout/Grid/Grid.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid, GridSize, GridSpacing } from './Grid';
import { ThemeProvider } from '@/theme';

/**
 * Storybook configuration for Grid component
 * 
 * Showcases the flexible 12-column grid system with container/item patterns,
 * responsive sizing, spacing options, and real-world layout examples.
 */
const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--background-primary)',
          color: 'var(--text-primary)',
          minHeight: '100vh'
        }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A flexible 12-column grid system for creating responsive layouts. Supports container/item patterns, responsive breakpoints, and customizable spacing.',
      },
    },
  },
  argTypes: {
    container: {
      control: 'boolean',
      description: 'Whether this Grid acts as a container for other Grid items',
    },
    size: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'auto'],
      description: 'Grid item size (1-12 columns)',
    },
    spacing: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      description: 'Spacing multiplier between grid items',
    },
    columns: {
      control: 'number',
      description: 'Total number of columns (container only)',
    },
    gap: {
      control: 'text',
      description: 'Custom gap override (CSS value)',
    },
  },
  args: {
    container: false,
    spacing: 2,
    columns: 12,
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

// Helper component for visual examples
export const demoCardStyles: React.CSSProperties = {
  padding: '1rem',
  backgroundColor: 'rgba(0, 122, 204, 0.1)',
  border: '1px solid rgba(0, 122, 204, 0.3)',
  borderRadius: '4px',
  textAlign: 'center',
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '500',
};

// In DemoCard
const DemoCard: React.FC<{ children: React.ReactNode; color?: string }> = ({ 
  children, 
  color = 'rgba(0, 122, 204, 0.1)' 
}) => (
  <div style={{
    ...demoCardStyles,
    backgroundColor: color,
  }}>
    {children}
  </div>
);

// Basic stories
export const Default: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid size={6}>
        <DemoCard>6 columns</DemoCard>
      </Grid>
      <Grid size={6}>
        <DemoCard>6 columns</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic two-column layout using the 12-column grid system.',
      },
    },
  },
};

export const Container: Story = {
  args: {
    container: true,
    spacing: 2,
  },
  render: (args) => (
    <Grid {...args}>
      <Grid size={4}>
        <DemoCard>Column 1</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>Column 2</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>Column 3</DemoCard>
      </Grid>
    </Grid>
  ),
};

export const Item: Story = {
  args: {
    size: 6,
  },
  render: (args) => (
    <Grid container spacing={2}>
      <Grid {...args}>
        <DemoCard>Grid Item ({args.size} columns)</DemoCard>
      </Grid>
      <Grid size={(12 - (args.size as number)) as GridSize}>
        <DemoCard>Remaining space</DemoCard>
      </Grid>
    </Grid>
  ),
};

// Layout examples
export const TwoColumn: Story = {
  render: () => (
    <Grid container spacing={3}>
      <Grid size={8}>
        <DemoCard color="rgba(76, 175, 80, 0.1)">
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Main Content</h3>
            <p style={{ margin: 0, opacity: 0.8 }}>8 columns wide</p>
          </div>
        </DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard color="rgba(255, 152, 0, 0.1)">
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Sidebar</h3>
            <p style={{ margin: 0, opacity: 0.8 }}>4 columns wide</p>
          </div>
        </DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Classic two-column layout with main content and sidebar.',
      },
    },
  },
};

export const ThreeColumn: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid size={4}>
        <DemoCard>Column 1</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>Column 2</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>Column 3</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Equal three-column layout, each taking 4 out of 12 columns.',
      },
    },
  },
};

export const FourColumn: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid size={3}>
        <DemoCard>25%</DemoCard>
      </Grid>
      <Grid size={3}>
        <DemoCard>25%</DemoCard>
      </Grid>
      <Grid size={3}>
        <DemoCard>25%</DemoCard>
      </Grid>
      <Grid size={3}>
        <DemoCard>25%</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Four-column layout with equal widths.',
      },
    },
  },
};

export const MixedSizes: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid size={2}>
        <DemoCard>2</DemoCard>
      </Grid>
      <Grid size={3}>
        <DemoCard>3</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>4</DemoCard>
      </Grid>
      <Grid size={3}>
        <DemoCard>3</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mixed column sizes demonstrating flexible layouts.',
      },
    },
  },
};

// Responsive examples
export const ResponsiveBasic: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid xs={12} md={6}>
        <DemoCard color="rgba(76, 175, 80, 0.1)">
          <div>
            <strong>Responsive Column 1</strong>
            <br />
            <small>xs=12, md=6</small>
          </div>
        </DemoCard>
      </Grid>
      <Grid xs={12} md={6}>
        <DemoCard color="rgba(255, 152, 0, 0.1)">
          <div>
            <strong>Responsive Column 2</strong>
            <br />
            <small>xs=12, md=6</small>
          </div>
        </DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive layout that stacks on mobile (xs=12) and splits on desktop (md=6). Resize viewport to see changes.',
      },
    },
  },
};

export const ResponsiveComplex: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid xs={12} sm={6} md={3}>
        <DemoCard color="rgba(244, 67, 54, 0.1)">
          <div>
            <strong>Card 1</strong>
            <br />
            <small>xs=12, sm=6, md=3</small>
          </div>
        </DemoCard>
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <DemoCard color="rgba(76, 175, 80, 0.1)">
          <div>
            <strong>Card 2</strong>
            <br />
            <small>xs=12, sm=6, md=3</small>
          </div>
        </DemoCard>
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <DemoCard color="rgba(0, 122, 204, 0.1)">
          <div>
            <strong>Card 3</strong>
            <br />
            <small>xs=12, sm=6, md=3</small>
          </div>
        </DemoCard>
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <DemoCard color="rgba(255, 152, 0, 0.1)">
          <div>
            <strong>Card 4</strong>
            <br />
            <small>xs=12, sm=6, md=3</small>
          </div>
        </DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex responsive layout: 1 column on mobile, 2 on tablet, 4 on desktop.',
      },
    },
  },
};

export const ResponsiveMixed: Story = {
  render: () => (
    <Grid container spacing={3}>
      <Grid xs={12} md={8}>
        <DemoCard color="rgba(76, 175, 80, 0.1)">
          <div>
            <strong>Main Content</strong>
            <br />
            <small>Full width on mobile, 8/12 on desktop</small>
          </div>
        </DemoCard>
      </Grid>
      <Grid xs={12} md={4}>
        <Grid container spacing={2}>
          <Grid xs={6} md={12}>
            <DemoCard color="rgba(255, 152, 0, 0.1)">
              <div>
                <strong>Widget 1</strong>
                <br />
                <small>xs=6, md=12</small>
              </div>
            </DemoCard>
          </Grid>
          <Grid xs={6} md={12}>
            <DemoCard color="rgba(244, 67, 54, 0.1)">
              <div>
                <strong>Widget 2</strong>
                <br />
                <small>xs=6, md=12</small>
              </div>
            </DemoCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive layout with nested grids. Notice how the sidebar widgets change arrangement on different screen sizes.',
      },
    },
  },
};

// Spacing examples
export const SpacingNone: Story = {
  render: () => (
    <Grid container spacing={0}>
      <Grid size={4}>
        <DemoCard>No spacing</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>No spacing</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>No spacing</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid with no spacing between items (spacing={0}).',
      },
    },
  },
};

export const SpacingSmall: Story = {
  render: () => (
    <Grid container spacing={1}>
      <Grid size={4}>
        <DemoCard>Small spacing</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>Small spacing</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>Small spacing</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid with small spacing (spacing={1} = 4px).',
      },
    },
  },
};

export const SpacingLarge: Story = {
  render: () => (
    <Grid container spacing={4}>
      <Grid size={4}>
        <DemoCard>Large spacing</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>Large spacing</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>Large spacing</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid with large spacing (spacing={4} = 16px).',
      },
    },
  },
};
const spacingValues:GridSpacing[] = [0, 1, 2, 3, 4];
export const SpacingComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {spacingValues.map(spacing => (
        <div key={spacing}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '14px', opacity: 0.8 }}>
            Spacing {spacing} ({spacing * 4}px)
          </h4>
          <Grid container spacing={spacing}>
            <Grid size={4}>
              <DemoCard>Item 1</DemoCard>
            </Grid>
            <Grid size={4}>
              <DemoCard>Item 2</DemoCard>
            </Grid>
            <Grid size={4}>
              <DemoCard>Item 3</DemoCard>
            </Grid>
          </Grid>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different spacing values from 0 to 4.',
      },
    },
  },
};

// Custom gap examples
export const CustomGapPixels: Story = {
  render: () => (
    <Grid container gap="24px">
      <Grid size={4}>
        <DemoCard>Custom gap</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>24px</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>between items</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid with custom gap using pixel values (gap="24px").',
      },
    },
  },
};

export const CustomGapRem: Story = {
  render: () => (
    <Grid container gap="1.5rem">
      <Grid size={6}>
        <DemoCard>Custom gap</DemoCard>
      </Grid>
      <Grid size={6}>
        <DemoCard>1.5rem</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid with custom gap using rem units (gap="1.5rem").',
      },
    },
  },
};

export const CustomGapComplex: Story = {
  render: () => (
    <Grid container gap="2rem 1rem">
      <Grid size={4}>
        <DemoCard>Complex gap</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>2rem vertical</DemoCard>
      </Grid>
      <Grid size={4}>
        <DemoCard>1rem horizontal</DemoCard>
      </Grid>
      <Grid size={6}>
        <DemoCard>Row 2</DemoCard>
      </Grid>
      <Grid size={6}>
        <DemoCard>Row 2</DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid with different vertical and horizontal gaps (gap="2rem 1rem").',
      },
    },
  },
};

// Nested grids
export const NestedBasic: Story = {
  render: () => (
    <Grid container spacing={3}>
      <Grid size={8}>
        <div style={{ marginBottom: '1rem' }}>
          <DemoCard color="rgba(76, 175, 80, 0.1)">
            <strong>Main Content Area</strong>
          </DemoCard>
        </div>
        <Grid container spacing={2}>
          <Grid size={6}>
            <DemoCard color="rgba(76, 175, 80, 0.2)">Nested 1</DemoCard>
          </Grid>
          <Grid size={6}>
            <DemoCard color="rgba(76, 175, 80, 0.2)">Nested 2</DemoCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={4}>
        <DemoCard color="rgba(255, 152, 0, 0.1)">
          <strong>Sidebar</strong>
        </DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Nested grid layout with a main content area containing its own grid.',
      },
    },
  },
};

export const NestedComplex: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid size={12}>
        <DemoCard color="rgba(0, 122, 204, 0.1)">
          <strong>Header</strong>
        </DemoCard>
      </Grid>
      <Grid size={9}>
        <Grid container spacing={2}>
          <Grid size={8}>
            <DemoCard color="rgba(76, 175, 80, 0.1)">
              <strong>Main Content</strong>
            </DemoCard>
          </Grid>
          <Grid size={4}>
            <Grid container spacing={1}>
              <Grid size={12}>
                <DemoCard color="rgba(76, 175, 80, 0.2)">Widget 1</DemoCard>
              </Grid>
              <Grid size={12}>
                <DemoCard color="rgba(76, 175, 80, 0.2)">Widget 2</DemoCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={3}>
        <DemoCard color="rgba(255, 152, 0, 0.1)">
          <strong>Sidebar</strong>
        </DemoCard>
      </Grid>
      <Grid size={12}>
        <DemoCard color="rgba(244, 67, 54, 0.1)">
          <strong>Footer</strong>
        </DemoCard>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex nested layout demonstrating multiple levels of grid nesting.',
      },
    },
  },
};

// Real-world examples
export const DashboardLayout: Story = {
  render: () => (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid size={12}>
        <DemoCard color="rgba(63, 81, 181, 0.1)">
          <div style={{ padding: '0.5rem 0' }}>
            <strong>Dashboard Header</strong>
            <br />
            <small>Navigation, search, user menu</small>
          </div>
        </DemoCard>
      </Grid>
      
      {/* Main content area */}
      <Grid size={9}>
        <Grid container spacing={2}>
          {/* Stats cards */}
          <Grid xs={6} sm={3}>
            <DemoCard color="rgba(76, 175, 80, 0.1)">
              <div>
                <strong>$12,345</strong>
                <br />
                <small>Revenue</small>
              </div>
            </DemoCard>
          </Grid>
          <Grid xs={6} sm={3}>
            <DemoCard color="rgba(255, 152, 0, 0.1)">
              <div>
                <strong>1,234</strong>
                <br />
                <small>Users</small>
              </div>
            </DemoCard>
          </Grid>
          <Grid xs={6} sm={3}>
            <DemoCard color="rgba(244, 67, 54, 0.1)">
              <div>
                <strong>567</strong>
                <br />
                <small>Orders</small>
              </div>
            </DemoCard>
          </Grid>
          <Grid xs={6} sm={3}>
            <DemoCard color="rgba(156, 39, 176, 0.1)">
              <div>
                <strong>89%</strong>
                <br />
                <small>Growth</small>
              </div>
            </DemoCard>
          </Grid>
          
          {/* Charts */}
          <Grid xs={12} md={8}>
            <DemoCard color="rgba(0, 122, 204, 0.1)">
              <div style={{ padding: '2rem 0' }}>
                <strong>Main Chart</strong>
                <br />
                <small>Revenue over time</small>
              </div>
            </DemoCard>
          </Grid>
          <Grid xs={12} md={4}>
            <DemoCard color="rgba(76, 175, 80, 0.1)">
              <div style={{ padding: '2rem 0' }}>
                <strong>Pie Chart</strong>
                <br />
                <small>User segments</small>
              </div>
            </DemoCard>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Sidebar */}
      <Grid size={3}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <DemoCard color="rgba(255, 152, 0, 0.1)">
              <div>
                <strong>Recent Activity</strong>
                <br />
                <small>Latest updates</small>
              </div>
            </DemoCard>
          </Grid>
          <Grid size={12}>
            <DemoCard color="rgba(244, 67, 54, 0.1)">
              <div>
                <strong>Quick Actions</strong>
                <br />
                <small>Common tasks</small>
              </div>
            </DemoCard>
          </Grid>
          <Grid size={12}>
            <DemoCard color="rgba(156, 39, 176, 0.1)">
              <div>
                <strong>Notifications</strong>
                <br />
                <small>3 new messages</small>
              </div>
            </DemoCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete dashboard layout with header, stats cards, charts, and sidebar.',
      },
    },
  },
};

export const CardGallery: Story = {
  render: () => (
    <Grid container spacing={3}>
      {Array.from({ length: 12 }, (_, i) => (
        <Grid key={i} xs={12} sm={6} md={4} lg={3}>
          <DemoCard color={`hsla(${i * 30}, 70%, 50%, 0.1)`}>
            <div>
              <strong>Card {i + 1}</strong>
              <br />
              <small>Responsive card layout</small>
            </div>
          </DemoCard>
        </Grid>
      ))}
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive card gallery that adapts from 1 to 4 columns based on screen size.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  render: () => {
    const [spacing, setSpacing] = React.useState<GridSpacing>(2);
    const [columns, setColumns] = React.useState(12);
    const [sizes, setSizes] = React.useState<GridSize[]>([4, 4, 4]);
    
    const addColumn = () => {
      if (sizes.length < 6) {
        setSizes([...sizes, 2]);
      }
    };
    
    const removeColumn = () => {
      if (sizes.length > 1) {
        setSizes(sizes.slice(0, -1));
      }
    };
    
    const updateSize = (index: number, newSize: GridSize) => {
      const newSizes = [...sizes];
      newSizes[index] = newSize;
      setSizes(newSizes);
    };
    
    return (
      <div>
        {/* Controls */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
              Spacing:
            </label>
            <select 
              value={spacing} 
              onChange={(e) => setSpacing(Number(e.target.value) as GridSpacing)}
              style={{ padding: '0.25rem', borderRadius: '3px', border: '1px solid #444' }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>{s} ({s * 4}px)</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
              Columns:
            </label>
            <input 
              type="number" 
              min="1" 
              max="24" 
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
              style={{ 
                padding: '0.25rem', 
                borderRadius: '3px', 
                border: '1px solid #444',
                width: '60px'
              }}
            />
          </div>
          
          <div>
            <button 
              onClick={addColumn}
              style={{ 
                padding: '0.25rem 0.5rem', 
                marginRight: '0.25rem',
                borderRadius: '3px',
                border: '1px solid #007acc',
                backgroundColor: '#007acc',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              + Add
            </button>
            <button 
              onClick={removeColumn}
              style={{ 
                padding: '0.25rem 0.5rem',
                borderRadius: '3px',
                border: '1px solid #f44336',
                backgroundColor: '#f44336',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              - Remove
            </button>
          </div>
        </div>
        
        {/* Grid preview */}
        <Grid container spacing={spacing} columns={columns}>
          {sizes.map((size, index) => (
            <Grid key={index} size={size}>
              <div style={{
                ...demoCardStyles,
                cursor: 'pointer',
                position: 'relative'
              }}>
                <div>
                  <strong>Column {index + 1}</strong>
                  <br />
                  <small>Size: {size}/{columns}</small>
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  display: 'flex',
                  gap: '0.25rem',
                  justifyContent: 'center'
                }}>
                  <button 
                    onClick={() => updateSize(index, Math.max(1, size as number - 1) as GridSize)}
                    style={{ 
                      padding: '0.125rem 0.25rem',
                      fontSize: '12px',
                      borderRadius: '2px',
                      border: '1px solid #666',
                      backgroundColor: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <button 
                    onClick={() => updateSize(index, Math.min(columns, size as  number + 1) as GridSize)}
                    style={{ 
                      padding: '0.125rem 0.25rem',
                      fontSize: '12px',
                      borderRadius: '2px',
                      border: '1px solid #666',
                      backgroundColor: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
        
        {/* Info */}
        <div style={{ 
          marginTop: '1rem', 
          fontSize: '12px', 
          opacity: 0.7,
          textAlign: 'center'
        }}>
          Total columns used: {sizes.reduce((sum, size) => sum + (size as number), 0)} / {columns}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with Grid settings. Adjust spacing, columns, and individual item sizes.',
      },
    },
  },
};