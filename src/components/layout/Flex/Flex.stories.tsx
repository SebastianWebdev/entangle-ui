// src/components/layout/Flex/Flex.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from './Flex';
import { ThemeProvider } from '@/theme';

/**
 * Storybook configuration for Flex component
 * 
 * Showcases the comprehensive flexbox wrapper with full control over flex properties,
 * responsive behavior, and advanced layout patterns for professional interfaces.
 */
const meta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
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
        component: 'A comprehensive flexbox component providing full control over all flex properties. More powerful than Stack for complex layouts requiring precise flexbox control.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
      description: 'Flex direction - controls main axis orientation',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior',
    },
    justify: {
      control: 'select',
      options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
      description: 'Justify content - distributes space along main axis',
    },
    align: {
      control: 'select',
      options: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
      description: 'Align items - aligns items along cross axis',
    },
    alignContent: {
      control: 'select',
      options: ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around'],
      description: 'Align content - aligns wrapped lines',
    },
    gap: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      description: 'Gap between flex items (multiplier)',
    },
    grow: {
      control: 'number',
      description: 'Flex grow factor',
    },
    shrink: {
      control: 'number',
      description: 'Flex shrink factor',
    },
    basis: {
      control: 'text',
      description: 'Flex basis - initial size',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Fill available width',
    },
    fullHeight: {
      control: 'boolean',
      description: 'Fill available height',
    },
  },
  args: {
    direction: 'row',
    wrap: 'nowrap',
    justify: 'flex-start',
    align: 'stretch',
    alignContent: 'stretch',
    gap: 0,
    grow: 0,
    shrink: 1,
    basis: 'auto',
    fullWidth: false,
    fullHeight: false,
  },
};

export default meta;
type Story = StoryObj<typeof Flex>;

// Helper components for visual examples
const FlexItem: React.FC<{ 
  children: React.ReactNode; 
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  grow?: number;
  shrink?: number;
  basis?: string;
}> = ({ 
  children, 
  color = 'rgba(0, 122, 204, 0.1)',
  size = 'md',
  grow,
  shrink,
  basis
}) => {
  const sizes = {
    sm: { padding: '0.5rem', minHeight: '40px', fontSize: '12px' },
    md: { padding: '1rem', minHeight: '60px', fontSize: '14px' },
    lg: { padding: '1.5rem', minHeight: '80px', fontSize: '16px' },
  };
  
  return (
    <div style={{
      ...sizes[size],
      backgroundColor: color,
      border: '1px solid rgba(0, 122, 204, 0.3)',
      borderRadius: '4px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      flexGrow: grow,
      flexShrink: shrink,
      flexBasis: basis,
    }}>
      {children}
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h3 style={{ 
      margin: '0 0 1rem 0', 
      fontSize: '16px', 
      fontWeight: '600',
      color: 'var(--text-primary)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '0.5rem'
    }}>
      {title}
    </h3>
    {children}
  </div>
);

// Basic stories
export const Default: Story = {
  render: () => (
    <Flex>
      <FlexItem>Item 1</FlexItem>
      <FlexItem>Item 2</FlexItem>
      <FlexItem>Item 3</FlexItem>
    </Flex>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default flex container with row direction and default settings.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    direction: 'row',
    justify: 'space-between',
    align: 'center',
    gap: 2,
  },
  render: (args) => (
    <Flex {...args}>
      <FlexItem>Item 1</FlexItem>
      <FlexItem>Item 2</FlexItem>
      <FlexItem>Item 3</FlexItem>
    </Flex>
  ),
};

// Direction examples
export const DirectionRow: Story = {
  render: () => (
    <Section title="Row Direction">
      <Flex direction="row" gap={2}>
        <FlexItem>First</FlexItem>
        <FlexItem>Second</FlexItem>
        <FlexItem>Third</FlexItem>
      </Flex>
    </Section>
  ),
};

export const DirectionColumn: Story = {
  render: () => (
    <Section title="Column Direction">
      <Flex direction="column" gap={2} style={{ height: '300px' }}>
        <FlexItem>Top</FlexItem>
        <FlexItem>Middle</FlexItem>
        <FlexItem>Bottom</FlexItem>
      </Flex>
    </Section>
  ),
};

export const DirectionReverse: Story = {
  render: () => (
    <div>
      <Section title="Row Reverse">
        <Flex direction="row-reverse" gap={2}>
          <FlexItem color="rgba(244, 67, 54, 0.1)">1 (appears last)</FlexItem>
          <FlexItem color="rgba(255, 152, 0, 0.1)">2</FlexItem>
          <FlexItem color="rgba(76, 175, 80, 0.1)">3 (appears first)</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Column Reverse">
        <Flex direction="column-reverse" gap={2} style={{ height: '200px' }}>
          <FlexItem color="rgba(244, 67, 54, 0.1)">1 (appears bottom)</FlexItem>
          <FlexItem color="rgba(255, 152, 0, 0.1)">2</FlexItem>
          <FlexItem color="rgba(76, 175, 80, 0.1)">3 (appears top)</FlexItem>
        </Flex>
      </Section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Reverse directions change the visual order of items.',
      },
    },
  },
};

// Justify content examples
export const JustifyContent: Story = {
  render: () => (
    <div>
      {(['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'] as const).map(justify => (
        <Section key={justify} title={`Justify: ${justify}`}>
          <Flex justify={justify} style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '0.5rem' }}>
            <FlexItem size="sm">A</FlexItem>
            <FlexItem size="sm">B</FlexItem>
            <FlexItem size="sm">C</FlexItem>
          </Flex>
        </Section>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All justify-content options for distributing space along the main axis.',
      },
    },
  },
};

// Align items examples
export const AlignItems: Story = {
  render: () => (
    <div>
      {(['flex-start', 'flex-end', 'center', 'stretch', 'baseline'] as const).map(align => (
        <Section key={align} title={`Align: ${align}`}>
          <Flex 
            align={align} 
            gap={2}
            style={{ 
              border: '1px dashed rgba(255, 255, 255, 0.2)', 
              padding: '0.5rem',
              height: '100px'
            }}
          >
            <FlexItem size="sm">Short</FlexItem>
            <FlexItem size="md">Medium content</FlexItem>
            <FlexItem size="lg">Tall content with more text</FlexItem>
          </Flex>
        </Section>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All align-items options for aligning items along the cross axis.',
      },
    },
  },
};

// Wrap examples
export const FlexWrap: Story = {
  render: () => (
    <div>
      <Section title="No Wrap (default)">
        <Flex wrap="nowrap" gap={1} style={{ width: '300px', border: '1px dashed rgba(255, 255, 255, 0.2)' }}>
          <FlexItem>Item 1</FlexItem>
          <FlexItem>Item 2</FlexItem>
          <FlexItem>Item 3</FlexItem>
          <FlexItem>Item 4</FlexItem>
          <FlexItem>Item 5</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Wrap">
        <Flex wrap="wrap" gap={1} style={{ width: '300px', border: '1px dashed rgba(255, 255, 255, 0.2)' }}>
          <FlexItem basis="120px">Item 1</FlexItem>
          <FlexItem basis="120px">Item 2</FlexItem>
          <FlexItem basis="120px">Item 3</FlexItem>
          <FlexItem basis="120px">Item 4</FlexItem>
          <FlexItem basis="120px">Item 5</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Wrap Reverse">
        <Flex wrap="wrap-reverse" gap={1} style={{ width: '300px', border: '1px dashed rgba(255, 255, 255, 0.2)' }}>
          <FlexItem basis="120px" color="rgba(244, 67, 54, 0.1)">Item 1</FlexItem>
          <FlexItem basis="120px" color="rgba(255, 152, 0, 0.1)">Item 2</FlexItem>
          <FlexItem basis="120px" color="rgba(76, 175, 80, 0.1)">Item 3</FlexItem>
          <FlexItem basis="120px" color="rgba(0, 122, 204, 0.1)">Item 4</FlexItem>
        </Flex>
      </Section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Flex wrap behavior controls how items flow when container width is exceeded.',
      },
    },
  },
};

// Gap examples
export const GapSpacing: Story = {
  render: () => (
    <div>
      {[0, 1, 2, 3, 4].map(gap => (
        <Section key={gap} title={`Gap ${gap} (${gap * 4}px)`}>
          <Flex gap={gap as any}>
            <FlexItem size="sm">A</FlexItem>
            <FlexItem size="sm">B</FlexItem>
            <FlexItem size="sm">C</FlexItem>
            <FlexItem size="sm">D</FlexItem>
          </Flex>
        </Section>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Gap spacing system using theme-based multipliers.',
      },
    },
  },
};

export const CustomGap: Story = {
  render: () => (
    <div>
      <Section title="Custom Gap: 24px">
        <Flex customGap="24px">
          <FlexItem>Item 1</FlexItem>
          <FlexItem>Item 2</FlexItem>
          <FlexItem>Item 3</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Custom Gap: 2rem 1rem">
        <Flex customGap="2rem 1rem" wrap="wrap" style={{ width: '400px' }}>
          <FlexItem basis="150px">Item 1</FlexItem>
          <FlexItem basis="150px">Item 2</FlexItem>
          <FlexItem basis="150px">Item 3</FlexItem>
          <FlexItem basis="150px">Item 4</FlexItem>
        </Flex>
      </Section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom gap values override the theme-based spacing system.',
      },
    },
  },
};

// Flex item properties
export const FlexItemProperties: Story = {
  render: () => (
    <div>
      <Section title="Flex Grow">
        <Flex gap={2} style={{ width: '400px', border: '1px dashed rgba(255, 255, 255, 0.2)' }}>
          <FlexItem>Fixed</FlexItem>
          <FlexItem grow={1} color="rgba(76, 175, 80, 0.1)">Grow 1</FlexItem>
          <FlexItem grow={2} color="rgba(255, 152, 0, 0.1)">Grow 2</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Flex Basis">
        <Flex gap={2}>
          <FlexItem basis="100px" color="rgba(244, 67, 54, 0.1)">100px</FlexItem>
          <FlexItem basis="200px" color="rgba(76, 175, 80, 0.1)">200px</FlexItem>
          <FlexItem basis="50%" color="rgba(255, 152, 0, 0.1)">50%</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Flex Shrink">
        <Flex gap={1} style={{ width: '200px', border: '1px dashed rgba(255, 255, 255, 0.2)' }}>
          <FlexItem basis="150px" shrink={0} color="rgba(244, 67, 54, 0.1)">No Shrink</FlexItem>
          <FlexItem basis="150px" shrink={1} color="rgba(76, 175, 80, 0.1)">Shrink 1</FlexItem>
          <FlexItem basis="150px" shrink={2} color="rgba(255, 152, 0, 0.1)">Shrink 2</FlexItem>
        </Flex>
      </Section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Flex item properties control how individual items grow, shrink, and size themselves.',
      },
    },
  },
};

// Responsive examples
export const ResponsiveDirection: Story = {
  render: () => (
    <div>
      <Section title="Responsive Direction">
        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '1rem' }}>
          Column on mobile → Row on tablet → Row on desktop
        </p>
        <Flex direction="column" md="row" gap={2} style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '1rem' }}>
          <FlexItem color="rgba(244, 67, 54, 0.1)">Navigation</FlexItem>
          <FlexItem color="rgba(76, 175, 80, 0.1)">Content</FlexItem>
          <FlexItem color="rgba(255, 152, 0, 0.1)">Sidebar</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Complex Responsive">
        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '1rem' }}>
          column → row-reverse → row → column-reverse
        </p>
        <Flex 
          direction="column" 
          sm="row-reverse" 
          md="row" 
          lg="column-reverse" 
          gap={2}
          style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '1rem' }}
        >
          <FlexItem color="rgba(244, 67, 54, 0.1)">1st</FlexItem>
          <FlexItem color="rgba(255, 152, 0, 0.1)">2nd</FlexItem>
          <FlexItem color="rgba(76, 175, 80, 0.1)">3rd</FlexItem>
        </Flex>
      </Section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive direction changes allow different layouts at different breakpoints. Resize window to see changes.',
      },
    },
  },
};

// Layout patterns
export const NavigationBar: Story = {
  render: () => (
    <Section title="Navigation Bar Pattern">
      <Flex 
        justify="space-between" 
        align="center" 
        gap={3}
        style={{ 
          padding: '1rem 2rem',
          backgroundColor: 'rgba(0, 122, 204, 0.05)',
          border: '1px solid rgba(0, 122, 204, 0.2)',
          borderRadius: '6px'
        }}
      >
        <FlexItem color="rgba(244, 67, 54, 0.1)">
          <strong>🏠 Logo</strong>
        </FlexItem>
        
        <Flex gap={2} align="center">
          <FlexItem size="sm" color="rgba(255, 255, 255, 0.05)">Home</FlexItem>
          <FlexItem size="sm" color="rgba(255, 255, 255, 0.05)">About</FlexItem>
          <FlexItem size="sm" color="rgba(255, 255, 255, 0.05)">Services</FlexItem>
          <FlexItem size="sm" color="rgba(255, 255, 255, 0.05)">Contact</FlexItem>
        </Flex>
        
        <FlexItem color="rgba(76, 175, 80, 0.1)">
          <strong>👤 Profile</strong>
        </FlexItem>
      </Flex>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Classic navigation bar layout with logo, navigation links, and user menu.',
      },
    },
  },
};

export const FormLayout: Story = {
  render: () => (
    <Section title="Form Layout Pattern">
      <Flex direction="column" gap={3} maxWidth="400px" style={{ margin: '0 auto' }}>
        <FlexItem color="rgba(0, 122, 204, 0.05)">
          <strong>📝 Login Form</strong>
        </FlexItem>
        
        <FlexItem color="rgba(255, 255, 255, 0.05)">
          📧 Email Input
        </FlexItem>
        
        <FlexItem color="rgba(255, 255, 255, 0.05)">
          🔒 Password Input
        </FlexItem>
        
        <Flex gap={2}>
          <FlexItem grow={1} color="rgba(244, 67, 54, 0.1)">
            Cancel
          </FlexItem>
          <FlexItem grow={1} color="rgba(76, 175, 80, 0.1)">
            <strong>Login</strong>
          </FlexItem>
        </Flex>
        
        <FlexItem size="sm" color="rgba(255, 152, 0, 0.1)">
          Forgot password?
        </FlexItem>
      </Flex>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical form layout with action buttons and additional links.',
      },
    },
  },
};

export const DashboardLayout: Story = {
  render: () => (
    <Section title="Dashboard Layout Pattern">
      <Flex direction="column" gap={2} style={{ height: '400px', border: '1px dashed rgba(255, 255, 255, 0.2)' }}>
        {/* Header */}
        <FlexItem color="rgba(63, 81, 181, 0.1)">
          <strong>📊 Dashboard Header</strong>
        </FlexItem>
        
        {/* Main content area */}
        <Flex grow={1} gap={2}>
          {/* Sidebar */}
          <FlexItem basis="200px" color="rgba(255, 152, 0, 0.1)">
            <div>
              <strong>📋 Sidebar</strong>
              <br />
              <small>Navigation menu</small>
            </div>
          </FlexItem>
          
          {/* Main content */}
          <Flex direction="column" grow={1} gap={2}>
            {/* Stats row */}
            <Flex gap={2}>
              <FlexItem grow={1} color="rgba(76, 175, 80, 0.1)">💰 Revenue</FlexItem>
              <FlexItem grow={1} color="rgba(244, 67, 54, 0.1)">👥 Users</FlexItem>
              <FlexItem grow={1} color="rgba(156, 39, 176, 0.1)">📈 Growth</FlexItem>
            </Flex>
            
            {/* Charts area */}
            <FlexItem grow={1} color="rgba(0, 122, 204, 0.1)">
              <div>
                <strong>📊 Main Chart Area</strong>
                <br />
                <small>Analytics and reports</small>
              </div>
            </FlexItem>
          </Flex>
        </Flex>
        
        {/* Footer */}
        <FlexItem color="rgba(96, 125, 139, 0.1)">
          <strong>🔗 Footer</strong>
        </FlexItem>
      </Flex>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex dashboard layout with header, sidebar, main content area, and footer.',
      },
    },
  },
};

export const CardGrid: Story = {
  render: () => (
    <Section title="Responsive Card Grid">
      <Flex wrap="wrap" gap={3} justify="center">
        {Array.from({ length: 8 }, (_, i) => (
          <FlexItem 
            key={i}
            basis="250px"
            grow={1}
            color={`hsla(${i * 45}, 70%, 50%, 0.1)`}
          >
            <div>
              <strong>Card {i + 1}</strong>
              <br />
              <small>basis: 250px, grow: 1</small>
            </div>
          </FlexItem>
        ))}
      </Flex>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive card grid that wraps and grows to fill available space.',
      },
    },
  },
};

// Size control examples
export const SizeControl: Story = {
  render: () => (
    <div>
      <Section title="Full Width">
        <Flex fullWidth justify="center" style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '1rem' }}>
          <FlexItem>Centered in full width container</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Max Width">
        <Flex maxWidth="500px" justify="space-between" style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '1rem', margin: '0 auto' }}>
          <FlexItem>Left</FlexItem>
          <FlexItem>Right</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Min Height">
        <Flex direction="column" minHeight="200px" justify="space-between" style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '1rem' }}>
          <FlexItem>Top</FlexItem>
          <FlexItem>Bottom</FlexItem>
        </Flex>
      </Section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Size control properties for constraining and expanding flex containers.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  render: () => {
    const [direction, setDirection] = React.useState<'row' | 'column'>('row');
    const [justify, setJustify] = React.useState<'flex-start' | 'center' | 'space-between'>('flex-start');
    const [align, setAlign] = React.useState<'stretch' | 'center' | 'flex-start'>('stretch');
    const [wrap, setWrap] = React.useState<'nowrap' | 'wrap'>('nowrap');
    const [gap, setGap] = React.useState(2);
    const [items, setItems] = React.useState(3);
    
    return (
      <div>
        <Section title="Interactive Flex Playground">
          {/* Controls */}
          <div style={{ 
            marginBottom: '2rem', 
            padding: '1rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
                Direction:
              </label>
              <select 
                value={direction} 
                onChange={(e) => setDirection(e.target.value as any)}
                style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: '1px solid #444' }}
              >
                <option value="row">Row</option>
                <option value="column">Column</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
                Justify:
              </label>
              <select 
                value={justify} 
                onChange={(e) => setJustify(e.target.value as any)}
                style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: '1px solid #444' }}
              >
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="space-between">Space Between</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
                Align:
              </label>
              <select 
                value={align} 
                onChange={(e) => setAlign(e.target.value as any)}
                style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: '1px solid #444' }}
              >
                <option value="stretch">Stretch</option>
                <option value="center">Center</option>
                <option value="flex-start">Start</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
                Wrap:
              </label>
              <select 
                value={wrap} 
                onChange={(e) => setWrap(e.target.value as any)}
                style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: '1px solid #444' }}
              >
                <option value="nowrap">No Wrap</option>
                <option value="wrap">Wrap</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
                Gap: {gap} ({gap * 4}px)
              </label>
              <input 
                type="range" 
                min="0" 
                max="6"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
                Items: {items}
              </label>
              <input 
                type="range" 
                min="1" 
                max="8"
                value={items}
                onChange={(e) => setItems(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          {/* Flex preview */}
          <Flex 
            direction={direction}
            justify={justify}
            align={align}
            wrap={wrap}
            gap={gap as any}
            style={{ 
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              padding: '1rem',
              minHeight: direction === 'column' ? '300px' : '120px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            {Array.from({ length: items }, (_, i) => (
              <FlexItem 
                key={i}
                color={`hsla(${i * (360 / items)}, 60%, 50%, 0.15)`}
                basis={wrap === 'wrap' ? '150px' : undefined}
              >
                Item {i + 1}
              </FlexItem>
            ))}
          </Flex>
          
          {/* Generated code */}
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Generated Code:</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {`<Flex`}<br />
              {`  direction="${direction}"`}<br />
              {`  justify="${justify}"`}<br />
              {`  align="${align}"`}<br />
              {`  wrap="${wrap}"`}<br />
              {`  gap={${gap}}`}<br />
              {`>`}<br />
              {Array.from({ length: items }, (_, i) => 
                `  <Item key={${i}}>Item ${i + 1}</Item>`
              ).join('\n')}<br />
              {`</Flex>`}
            </div>
          </div>
        </Section>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all Flex properties. Adjust settings and see the generated code.',
      },
    },
  },
};

// Performance and edge cases
export const PerformanceTest: Story = {
  render: () => (
    <Section title="Performance Test - 100 Items">
      <Flex wrap="wrap" gap={1} justify="center" style={{ maxHeight: '300px', overflow: 'auto' }}>
        {Array.from({ length: 100 }, (_, i) => (
          <FlexItem 
            key={i}
            size="sm"
            basis="80px"
            color={`hsla(${i * 3.6}, 60%, 50%, 0.1)`}
          >
            {i + 1}
          </FlexItem>
        ))}
      </Flex>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Performance test with 100 flex items to ensure smooth rendering.',
      },
    },
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div>
      <Section title="Empty Container">
        <Flex style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', minHeight: '60px', padding: '1rem' }}>
          {/* No children */}
        </Flex>
      </Section>
      
      <Section title="Single Item">
        <Flex justify="center" align="center" style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', minHeight: '60px' }}>
          <FlexItem>Lonely item</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Very Long Content">
        <Flex gap={2} style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '0.5rem' }}>
          <FlexItem>Short</FlexItem>
          <FlexItem>This is a very long piece of content that might overflow or cause wrapping issues in certain scenarios</FlexItem>
          <FlexItem>Short</FlexItem>
        </Flex>
      </Section>
      
      <Section title="Nested Flex">
        <Flex direction="column" gap={2} style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', padding: '1rem' }}>
          <FlexItem>Parent Item 1</FlexItem>
          <Flex justify="space-between" gap={1} style={{ padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <FlexItem size="sm" color="rgba(244, 67, 54, 0.2)">Nested 1</FlexItem>
            <FlexItem size="sm" color="rgba(76, 175, 80, 0.2)">Nested 2</FlexItem>
            <FlexItem size="sm" color="rgba(255, 152, 0, 0.2)">Nested 3</FlexItem>
          </Flex>
          <FlexItem>Parent Item 3</FlexItem>
        </Flex>
      </Section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Edge cases and unusual scenarios to ensure robust behavior.',
      },
    },
  },
};