// src/components/layout/Paper/Paper.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Paper } from './Paper';
import type { PaperElevation, PaperNestLevel, PaperSpacing } from './Paper';
import { ThemeProvider } from '@/theme';

/**
 * Storybook configuration for Paper component
 *
 * Showcases the versatile surface component with elevation shadows, nesting levels,
 * and flexible spacing for creating cards, panels, and visual hierarchy.
 */
const meta: Meta<typeof Paper> = {
  title: 'Layout/Paper',
  component: Paper,
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{
            padding: '2rem',
            backgroundColor: 'var(--background-primary)',
            color: 'var(--text-primary)',
            minHeight: '100vh',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A versatile paper component providing surface elevation and visual hierarchy. Perfect for creating cards, panels, modals, and any content that needs to stand out from the background.',
      },
    },
  },
  argTypes: {
    elevation: {
      control: 'select',
      options: [0, 1, 2, 3],
      description: 'Paper elevation level controlling shadow intensity',
    },
    bordered: {
      control: 'boolean',
      description: 'Whether to show border around the paper',
    },
    padding: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'],
      description: 'Internal padding using theme spacing tokens',
    },
    nestLevel: {
      control: 'select',
      options: [0, 1, 2, 3],
      description: 'Nesting level for automatic background adjustment',
    },
    expand: {
      control: 'boolean',
      description: 'Whether the paper should expand to fill available space',
    },
    customRadius: {
      control: 'text',
      description: 'Custom border radius override',
    },
  },
  args: {
    elevation: 1,
    bordered: false,
    padding: 'md',
    nestLevel: 0,
    expand: false,
  },
};

export default meta;
type Story = StoryObj<typeof Paper>;

// Helper components for visual examples
const ContentBlock: React.FC<{
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  icon?: string;
}> = ({ title, subtitle, children, icon }) => (
  <div>
    {title && (
      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {icon && <span>{icon}</span>}
        {title}
      </h3>
    )}
    {subtitle && (
      <p
        style={{
          margin: '0 0 1rem 0',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.4',
        }}
      >
        {subtitle}
      </p>
    )}
    {children}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div style={{ marginBottom: '3rem' }}>
    <h3
      style={{
        margin: '0 0 1.5rem 0',
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '0.5rem',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const GridContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1rem',
    }}
  >
    {children}
  </div>
);

// Basic stories
export const Default: Story = {
  render: () => (
    <Paper>
      <ContentBlock
        title="Default Paper"
        subtitle="Basic paper with default settings"
      >
        This is a basic paper component with elevation 1 and medium padding.
        Perfect for most card-like content.
      </ContentBlock>
    </Paper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default paper with elevation 1 and medium padding.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    elevation: 2,
    bordered: true,
    padding: 'lg',
    nestLevel: 1,
  },
  render: args => (
    <Paper {...args}>
      <ContentBlock
        title="Interactive Paper"
        subtitle="Adjust controls to see different variations"
      >
        Use the controls panel to experiment with different elevation levels,
        padding, borders, and nesting configurations.
      </ContentBlock>
    </Paper>
  ),
};

// Elevation examples
export const ElevationLevels: Story = {
  render: () => (
    <Section title="Elevation Levels">
      <GridContainer>
        {([0, 1, 2, 3] as PaperElevation[]).map(elevation => (
          <Paper key={elevation} elevation={elevation} padding="lg">
            <ContentBlock
              title={`Elevation ${elevation}`}
              subtitle={
                elevation === 0
                  ? 'No shadow (flat)'
                  : elevation === 1
                    ? 'Small shadow (subtle depth)'
                    : elevation === 2
                      ? 'Medium shadow (moderate depth)'
                      : 'Large shadow (high depth)'
              }
            >
              {elevation === 0 && '🔳 Flat surface for subtle separation'}
              {elevation === 1 && '📄 Basic cards and content blocks'}
              {elevation === 2 && '📋 Important panels and dialogs'}
              {elevation === 3 && '🎯 Prominent elements and modals'}
            </ContentBlock>
          </Paper>
        ))}
      </GridContainer>

      <div style={{ marginTop: '2rem' }}>
        <Paper
          elevation={0}
          padding="md"
          style={{ textAlign: 'center', opacity: 0.8 }}
        >
          💡 Tip: Higher elevation creates stronger visual hierarchy and draws
          more attention
        </Paper>
      </div>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All elevation levels from flat (0) to high depth (3).',
      },
    },
  },
};

// Nesting levels
export const NestingLevels: Story = {
  args: {
    bordered: false,
  },

  render: () => (
    <Section title="Nesting Levels">
      <Paper nestLevel={0} padding="xl">
        <ContentBlock
          title="🌑 Level 0 - Primary Background"
          subtitle="Darkest background level"
        >
          <div style={{ marginTop: '1rem' }}>
            <Paper nestLevel={1} padding="lg">
              <ContentBlock
                title="🌒 Level 1 - Secondary Background"
                subtitle="Slightly lighter for nested content"
              >
                <div style={{ marginTop: '1rem' }}>
                  <Paper nestLevel={2} padding="md">
                    <ContentBlock
                      title="🌓 Level 2 - Tertiary Background"
                      subtitle="Even lighter for deeper nesting"
                    >
                      <div style={{ marginTop: '1rem' }}>
                        <Paper nestLevel={3} padding="sm">
                          <ContentBlock
                            title="🌕 Level 3 - Elevated Background"
                            subtitle="Lightest background for maximum contrast"
                          >
                            Perfect for the most nested elements that need to
                            stand out.
                          </ContentBlock>
                        </Paper>
                      </div>
                    </ContentBlock>
                  </Paper>
                </div>
              </ContentBlock>
            </Paper>
          </div>
        </ContentBlock>
      </Paper>

      <div style={{ marginTop: '2rem' }}>
        <GridContainer>
          {([0, 1, 2, 3] as PaperNestLevel[]).map(level => (
            <Paper key={level} nestLevel={level} padding="lg" elevation={1}>
              <ContentBlock
                title={`Nest Level ${level}`}
                subtitle={`Background becomes ${level === 0 ? 'darkest' : level === 3 ? 'lightest' : 'progressively lighter'}`}
              >
                Compare background colors across different nesting levels for
                optimal visual hierarchy.
              </ContentBlock>
            </Paper>
          ))}
        </GridContainer>
      </div>
    </Section>
  ),

  parameters: {
    docs: {
      description: {
        story:
          'Automatic background adjustment based on nesting level for visual hierarchy.',
      },
    },
  },
};

// Padding variants
export const PaddingVariants: Story = {
  render: () => (
    <Section title="Padding Variants">
      <GridContainer>
        {(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as PaperSpacing[]).map(
          padding => (
            <Paper key={padding} padding={padding} elevation={1} bordered>
              <ContentBlock
                title={`Padding ${padding.toUpperCase()}`}
                subtitle={`${
                  padding === 'xs'
                    ? '2px'
                    : padding === 'sm'
                      ? '4px'
                      : padding === 'md'
                        ? '8px'
                        : padding === 'lg'
                          ? '12px'
                          : padding === 'xl'
                            ? '16px'
                            : padding === 'xxl'
                              ? '24px'
                              : '32px'
                } internal spacing`}
              >
                {padding === 'xs' && '🔬 Minimal spacing for compact UI'}
                {padding === 'sm' && '📌 Tight spacing for small elements'}
                {padding === 'md' && '📄 Standard spacing for most content'}
                {padding === 'lg' && '📋 Comfortable spacing for panels'}
                {padding === 'xl' && '🖼️ Generous spacing for cards'}
                {padding === 'xxl' && '📺 Spacious layout for sections'}
                {padding === 'xxxl' && '🏛️ Maximum spacing for containers'}
              </ContentBlock>
            </Paper>
          )
        )}
      </GridContainer>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All padding options using theme spacing tokens.',
      },
    },
  },
};

// Border variants
export const BorderVariants: Story = {
  render: () => (
    <Section title="Border Variants">
      <GridContainer>
        <Paper elevation={0} bordered={false} padding="lg">
          <ContentBlock
            title="🚫 No Border"
            subtitle="Clean surface without outline"
          >
            Perfect for seamless integration with the background. Relies on
            elevation or nesting for visual separation.
          </ContentBlock>
        </Paper>

        <Paper elevation={0} bordered={true} padding="lg">
          <ContentBlock
            title="📦 With Border"
            subtitle="Subtle outline for definition"
          >
            Adds a subtle border for better definition without elevation. Great
            for flat designs or when shadows aren't appropriate.
          </ContentBlock>
        </Paper>

        <Paper elevation={1} bordered={false} padding="lg">
          <ContentBlock
            title="☁️ Shadow Only"
            subtitle="Elevation without border"
          >
            Uses elevation shadow for depth while maintaining clean edges.
            Modern approach for card-based interfaces.
          </ContentBlock>
        </Paper>

        <Paper elevation={2} bordered={true} padding="lg">
          <ContentBlock
            title="🔲 Shadow + Border"
            subtitle="Maximum definition"
          >
            Combines elevation and border for maximum visual separation. Perfect
            for important UI elements that need strong emphasis.
          </ContentBlock>
        </Paper>
      </GridContainer>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different border and elevation combinations.',
      },
    },
  },
};

// Size and expansion
export const SizeAndExpansion: Story = {
  render: () => (
    <Section title="Size and Expansion">
      <div style={{ marginBottom: '2rem' }}>
        <h4
          style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}
        >
          Normal Size (Auto Width/Height)
        </h4>
        <Paper elevation={1} padding="lg">
          <ContentBlock
            title="📏 Auto Sizing"
            subtitle="Adapts to content dimensions"
          >
            This paper automatically sizes itself based on its content. Width
            and height adjust naturally to fit the content inside.
          </ContentBlock>
        </Paper>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4
          style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}
        >
          Expanded Size (100% Width/Height)
        </h4>
        <div
          style={{
            height: '200px',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
          }}
        >
          <Paper expand elevation={1} padding="lg">
            <ContentBlock
              title="📐 Expanded Paper"
              subtitle="Fills available container space"
            >
              This paper expands to fill 100% of its container's width and
              height. Perfect for full-width panels, sections, and layout
              containers.
            </ContentBlock>
          </Paper>
        </div>
      </div>

      <div>
        <h4
          style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}
        >
          Custom Constraints
        </h4>
        <Paper
          elevation={1}
          padding="lg"
          style={{
            width: '300px',
            height: '150px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ContentBlock
            title="📊 Fixed Dimensions"
            subtitle="Custom width and height via style prop"
          >
            Use style prop for custom dimensions and positioning.
          </ContentBlock>
        </Paper>
      </div>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Size control options from auto-sizing to full expansion.',
      },
    },
  },
};

// Custom radius
export const CustomRadius: Story = {
  render: () => (
    <Section title="Custom Border Radius">
      <GridContainer>
        <Paper elevation={1} padding="lg">
          <ContentBlock
            title="🔲 Default Radius"
            subtitle="Theme default border radius"
          >
            Uses the default border radius from theme tokens for consistent
            visual language across the application.
          </ContentBlock>
        </Paper>

        <Paper elevation={1} padding="lg" customRadius="0">
          <ContentBlock
            title="⬜ Sharp Corners"
            subtitle="No border radius (0px)"
          >
            Sharp rectangular corners for geometric, technical, or minimalist
            interface designs.
          </ContentBlock>
        </Paper>

        <Paper elevation={1} padding="lg" customRadius="12px">
          <ContentBlock title="🔘 Rounded" subtitle="Custom 12px radius">
            More pronounced rounded corners for a softer, friendly appearance in
            modern interface designs.
          </ContentBlock>
        </Paper>

        <Paper elevation={1} padding="lg" customRadius="50%">
          <ContentBlock title="⭕ Circular" subtitle="50% radius (circular)">
            Fully circular shape perfect for profile pictures, status
            indicators, or decorative elements.
          </ContentBlock>
        </Paper>
      </GridContainer>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom border radius options for different visual styles.',
      },
    },
  },
};

// Real-world patterns
export const CardPattern: Story = {
  render: () => (
    <Section title="Card Pattern">
      <GridContainer>
        <Paper elevation={1} padding="lg">
          <ContentBlock
            icon="👤"
            title="User Profile"
            subtitle="Basic information card"
          >
            <div style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>John Smith</strong>
              </div>
              <div
                style={{ fontSize: '14px', opacity: 0.8, marginBottom: '1rem' }}
              >
                Frontend Developer at TechCorp
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Paper
                  elevation={0}
                  padding="xs"
                  bordered
                  style={{ fontSize: '12px' }}
                >
                  React
                </Paper>
                <Paper
                  elevation={0}
                  padding="xs"
                  bordered
                  style={{ fontSize: '12px' }}
                >
                  TypeScript
                </Paper>
                <Paper
                  elevation={0}
                  padding="xs"
                  bordered
                  style={{ fontSize: '12px' }}
                >
                  Design Systems
                </Paper>
              </div>
            </div>
          </ContentBlock>
        </Paper>

        <Paper elevation={2} padding="lg">
          <ContentBlock
            icon="📊"
            title="Analytics Dashboard"
            subtitle="Key performance metrics"
          >
            <div style={{ marginTop: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    $47,293
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Revenue</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#4caf50',
                    }}
                  >
                    +12.5%
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Growth</div>
                </div>
              </div>
              <Paper nestLevel={1} padding="sm" elevation={0}>
                <div style={{ fontSize: '12px', textAlign: 'center' }}>
                  📈 Trend visualization would go here
                </div>
              </Paper>
            </div>
          </ContentBlock>
        </Paper>

        <Paper elevation={1} padding="lg">
          <ContentBlock
            icon="📝"
            title="Article Preview"
            subtitle="Latest blog post"
          >
            <div style={{ marginTop: '1rem' }}>
              <h4
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Building Scalable Design Systems
              </h4>
              <p
                style={{
                  fontSize: '13px',
                  opacity: 0.8,
                  lineHeight: '1.4',
                  margin: '0 0 1rem 0',
                }}
              >
                Learn how to create and maintain design systems that scale with
                your organization and provide consistent user experiences...
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  opacity: 0.6,
                }}
              >
                <span>March 15, 2024</span>
                <span>5 min read</span>
              </div>
            </div>
          </ContentBlock>
        </Paper>
      </GridContainer>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common card patterns for user interfaces.',
      },
    },
  },
};

export const ModalPattern: Story = {
  render: () => (
    <Section title="Modal Pattern">
      <div
        style={{
          position: 'relative',
          minHeight: '400px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          padding="xxl"
          customRadius="8px"
          style={{
            maxWidth: '500px',
            width: '90%',
          }}
        >
          <ContentBlock
            icon="⚠️"
            title="Confirm Action"
            subtitle="This action cannot be undone"
          >
            <div style={{ marginTop: '1.5rem' }}>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '2rem',
                }}
              >
                Are you sure you want to delete this project? All associated
                files, settings, and data will be permanently removed from our
                servers.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                }}
              >
                <Paper
                  elevation={0}
                  bordered
                  padding="md"
                  style={{
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    minWidth: '80px',
                  }}
                >
                  Cancel
                </Paper>
                <Paper
                  elevation={1}
                  padding="md"
                  nestLevel={1}
                  style={{
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    minWidth: '80px',
                    backgroundColor: '#f44336',
                  }}
                >
                  Delete
                </Paper>
              </div>
            </div>
          </ContentBlock>
        </Paper>
      </div>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Modal dialog pattern with high elevation for prominence.',
      },
    },
  },
};

export const FormPattern: Story = {
  render: () => (
    <Section title="Form Pattern">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Paper elevation={1} padding="xxl">
          <ContentBlock
            icon="🔐"
            title="Sign In"
            subtitle="Access your account"
          >
            <div style={{ marginTop: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Paper nestLevel={1} padding="md" bordered>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    📧 Email input field
                  </div>
                </Paper>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <Paper nestLevel={1} padding="md" bordered>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    🔒 Password input field
                  </div>
                </Paper>
              </div>

              <Paper
                elevation={1}
                padding="md"
                style={{
                  backgroundColor: '#007acc',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                Sign In
              </Paper>

              <div style={{ textAlign: 'center' }}>
                <Paper
                  elevation={0}
                  padding="sm"
                  style={{
                    display: 'inline-block',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                  }}
                >
                  Forgot your password?
                </Paper>
              </div>
            </div>
          </ContentBlock>
        </Paper>
      </div>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Form layout pattern with nested input fields.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  render: () => {
    const [elevation, setElevation] = React.useState<PaperElevation>(1);
    const [nestLevel, setNestLevel] = React.useState<PaperNestLevel>(0);
    const [padding, setPadding] = React.useState<PaperSpacing>('md');
    const [bordered, setBordered] = React.useState(false);
    const [expand, setExpand] = React.useState(false);
    const [customRadius, setCustomRadius] = React.useState('');
    const [content, setContent] = React.useState('default');

    const contentOptions = {
      default: {
        title: 'Sample Content',
        subtitle: 'This is sample content for testing',
        body: 'Adjust the controls above to see how different Paper configurations affect the appearance and behavior of this content.',
      },
      card: {
        title: '💳 User Card',
        subtitle: 'Profile information',
        body: 'John Doe • Frontend Developer • React, TypeScript, Design Systems',
      },
      panel: {
        title: '⚙️ Settings Panel',
        subtitle: 'Configuration options',
        body: 'This panel contains various settings and options that users can configure to customize their experience.',
      },
      modal: {
        title: '📋 Important Notice',
        subtitle: 'Please review and confirm',
        body: 'This is an important message that requires your attention. Please read carefully before proceeding.',
      },
    };

    const currentContent =
      contentOptions[content as keyof typeof contentOptions];

    return (
      <Section title="Interactive Paper Playground">
        {/* Controls */}
        <Paper nestLevel={1} padding="lg" style={{ marginBottom: '2rem' }}>
          <h4
            style={{
              marginBottom: '1.5rem',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            🎛️ Controls
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '12px',
                }}
              >
                Elevation: {elevation}
              </label>
              <input
                type="range"
                min="0"
                max="3"
                value={elevation}
                onChange={e =>
                  setElevation(Number(e.target.value) as PaperElevation)
                }
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '12px',
                }}
              >
                Nest Level: {nestLevel}
              </label>
              <input
                type="range"
                min="0"
                max="3"
                value={nestLevel}
                onChange={e =>
                  setNestLevel(Number(e.target.value) as PaperNestLevel)
                }
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '12px',
                }}
              >
                Padding:
              </label>
              <select
                value={padding}
                onChange={e => setPadding(e.target.value as PaperSpacing)}
                style={{
                  width: '100%',
                  padding: '0.25rem',
                  borderRadius: '3px',
                  border: '1px solid #444',
                }}
              >
                <option value="xs">XS (2px)</option>
                <option value="sm">SM (4px)</option>
                <option value="md">MD (8px)</option>
                <option value="lg">LG (12px)</option>
                <option value="xl">XL (16px)</option>
                <option value="xxl">XXL (24px)</option>
                <option value="xxxl">XXXL (32px)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '12px',
                }}
              >
                Content Type:
              </label>
              <select
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.25rem',
                  borderRadius: '3px',
                  border: '1px solid #444',
                }}
              >
                <option value="default">Default</option>
                <option value="card">User Card</option>
                <option value="panel">Settings Panel</option>
                <option value="modal">Important Notice</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '12px',
                }}
              >
                Custom Radius:
              </label>
              <input
                type="text"
                value={customRadius}
                onChange={e => setCustomRadius(e.target.value)}
                placeholder="e.g. 12px, 50%"
                style={{
                  width: '100%',
                  padding: '0.25rem',
                  borderRadius: '3px',
                  border: '1px solid #444',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '12px',
                }}
              >
                <input
                  type="checkbox"
                  checked={bordered}
                  onChange={e => setBordered(e.target.checked)}
                />
                Bordered
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '12px',
                }}
              >
                <input
                  type="checkbox"
                  checked={expand}
                  onChange={e => setExpand(e.target.checked)}
                />
                Expand
              </label>
            </div>
          </div>
        </Paper>

        {/* Preview */}
        <div style={{ marginBottom: '2rem' }}>
          <h4
            style={{
              marginBottom: '1rem',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            🎨 Preview
          </h4>

          <div
            style={{
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              padding: '2rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              ...(expand ? { height: '300px' } : {}),
            }}
          >
            <Paper
              elevation={elevation}
              nestLevel={nestLevel}
              padding={padding}
              bordered={bordered}
              expand={expand}
              customRadius={customRadius || undefined}
            >
              <ContentBlock
                title={currentContent.title}
                subtitle={currentContent.subtitle}
              >
                {currentContent.body}
              </ContentBlock>
            </Paper>
          </div>
        </div>

        {/* Generated code */}
        <Paper nestLevel={2} padding="lg">
          <h4
            style={{
              marginBottom: '1rem',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            💻 Generated Code
          </h4>

          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '1rem',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              overflow: 'auto',
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {`<Paper`}
              {elevation !== 1 && (
                <>
                  <br />
                  {`  elevation={${elevation}}`}
                </>
              )}
              {nestLevel !== 0 && (
                <>
                  <br />
                  {`  nestLevel={${nestLevel}}`}
                </>
              )}
              {padding !== 'md' && (
                <>
                  <br />
                  {`  padding="${padding}"`}
                </>
              )}
              {bordered && (
                <>
                  <br />
                  {`  bordered={${bordered}}`}
                </>
              )}
              {expand && (
                <>
                  <br />
                  {`  expand={${expand}}`}
                </>
              )}
              {customRadius && (
                <>
                  <br />
                  {`  customRadius="${customRadius}"`}
                </>
              )}
              <br />
              {`>`}
              <br />
              {`  <ContentBlock`}
              <br />
              {`    title="${currentContent.title}"`}
              <br />
              {`    subtitle="${currentContent.subtitle}"`}
              <br />
              {`  >`}
              <br />
              {`    ${currentContent.body}`}
              <br />
              {`  </ContentBlock>`}
              <br />
              {`</Paper>`}
            </div>
          </div>
        </Paper>
      </Section>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to experiment with all Paper properties and see generated code.',
      },
    },
  },
};

// Performance and edge cases
export const PerformanceTest: Story = {
  render: () => (
    <Section title="Performance Test - 50 Papers">
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {Array.from({ length: 50 }, (_, i) => (
            <Paper
              key={i}
              elevation={(i % 4) as PaperElevation}
              nestLevel={(i % 4) as PaperNestLevel}
              padding={['xs', 'sm', 'md', 'lg'][i % 4] as PaperSpacing}
              bordered={i % 3 === 0}
            >
              <ContentBlock title={`Paper ${i + 1}`}>
                Content item {i + 1} with varying configurations for performance
                testing.
              </ContentBlock>
            </Paper>
          ))}
        </div>
      </div>
    </Section>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Performance test with 50 Paper components with different configurations.',
      },
    },
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div>
      <Section title="Empty Paper">
        <Paper elevation={1} padding="lg" style={{ minHeight: '100px' }}>
          {/* No content */}
        </Paper>
      </Section>

      <Section title="Very Long Content">
        <Paper elevation={1} padding="md">
          <ContentBlock title="📚 Lorem Ipsum" subtitle="Long content test">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum. Sed ut
            perspiciatis unde omnis iste natus error sit voluptatem accusantium
            doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
            inventore veritatis et quasi architecto beatae vitae dicta sunt
            explicabo.
          </ContentBlock>
        </Paper>
      </Section>

      <Section title="Nested Edge Case">
        <Paper elevation={3} padding="lg">
          <ContentBlock title="🎯 Deep Nesting Test">
            <div style={{ marginTop: '1rem' }}>
              <Paper nestLevel={1} padding="md">
                <div>Level 1</div>
                <Paper
                  nestLevel={2}
                  padding="sm"
                  style={{ marginTop: '0.5rem' }}
                >
                  <div>Level 2</div>
                  <Paper
                    nestLevel={3}
                    padding="xs"
                    style={{ marginTop: '0.5rem' }}
                  >
                    <div style={{ fontSize: '12px' }}>
                      Level 3 (Maximum nesting)
                    </div>
                    <Paper
                      nestLevel={3}
                      padding="xs"
                      style={{ marginTop: '0.5rem' }}
                    >
                      <div style={{ fontSize: '10px' }}>
                        Level 3+ (Should not get lighter)
                      </div>
                    </Paper>
                  </Paper>
                </Paper>
              </Paper>
            </div>
          </ContentBlock>
        </Paper>
      </Section>

      <Section title="Extreme Configurations">
        <GridContainer>
          <Paper elevation={0} padding="xs" customRadius="0">
            <div style={{ fontSize: '10px' }}>Minimal config</div>
          </Paper>

          <Paper elevation={3} padding="xxxl" customRadius="20px" bordered>
            <ContentBlock
              title="🎪 Maximum Config"
              subtitle="All options enabled"
            >
              High elevation, maximum padding, custom radius, and border.
            </ContentBlock>
          </Paper>

          <Paper elevation={2} expand style={{ height: '100px' }}>
            <ContentBlock title="📏 Expanded">
              Full width and height expansion test.
            </ContentBlock>
          </Paper>
        </GridContainer>
      </Section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Edge cases and extreme configurations to ensure robust behavior.',
      },
    },
  },
};
