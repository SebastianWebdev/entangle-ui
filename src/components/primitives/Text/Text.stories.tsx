import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';
import { ThemeProvider } from '@/theme/ThemeProvider';

/**
 * Storybook configuration for Text component
 */
const meta: Meta<typeof Text> = {
  title: 'Primitives/Text',
  component: Text,
  parameters: {
    docs: {
      description: {
        component:
          'A versatile text component for consistent typography in editor interfaces. Provides semantic variants, flexible sizing, and comprehensive text styling options optimized for professional editor UIs.',
      },
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--background-primary)',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'display',
        'heading',
        'subheading',
        'body',
        'caption',
        'code',
        'inherit',
      ],
      description: 'Semantic variant with predefined styling',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Text size using theme typography tokens',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold'],
      description: 'Text weight using theme typography tokens',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'muted',
        'disabled',
        'accent',
        'success',
        'warning',
        'error',
      ],
      description: 'Text color using theme color tokens',
    },
    lineHeight: {
      control: 'select',
      options: ['tight', 'normal', 'relaxed'],
      description: 'Line height using theme typography tokens',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
    },
    as: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'span',
        'div',
        'label',
        'strong',
        'em',
        'small',
      ],
      description: 'HTML element to render as',
    },
    truncate: {
      control: 'boolean',
      description: 'Whether to truncate text with ellipsis on overflow',
    },
    maxLines: {
      control: 'number',
      description:
        'Maximum number of lines before truncating (requires truncate=true)',
    },
    nowrap: {
      control: 'boolean',
      description: 'Whether text should not wrap to next line',
    },
    mono: {
      control: 'boolean',
      description: 'Whether to use monospace font family',
    },
    children: {
      control: 'text',
      description: 'Text content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text component with body variant
 */
export const Default: Story = {
  args: {
    children: 'This is default body text',
  },
};

/**
 * All semantic variants showcased together
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text variant="display">Display Text - Large titles and headings</Text>
      <Text variant="heading">Heading Text - Section headings</Text>
      <Text variant="subheading">Subheading Text - Subsection headings</Text>
      <Text variant="body">
        Body Text - Standard paragraph content for reading
      </Text>
      <Text variant="caption">
        Caption Text - Small descriptive text and labels
      </Text>
      <Text variant="code">Code Text - Monospace for inline code snippets</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows all available semantic variants with their typical use cases.',
      },
    },
  },
};

/**
 * Different text sizes using theme typography tokens
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text size="xs">Extra Small (10px) - Tiny labels and indicators</Text>
      <Text size="sm">Small (11px) - Standard UI text</Text>
      <Text size="md">Medium (12px) - Panel content</Text>
      <Text size="lg">Large (14px) - Headings</Text>
      <Text size="xl">Extra Large (16px) - Main titles</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates all available sizes with pixel values from theme tokens.',
      },
    },
  },
};

/**
 * Different font weights available
 */
export const Weights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text weight="normal">Normal Weight (400) - Standard text</Text>
      <Text weight="medium">Medium Weight (500) - Emphasized text</Text>
      <Text weight="semibold">Semibold Weight (600) - Strong emphasis</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows all font weights with their numeric values from theme tokens.',
      },
    },
  },
};

/**
 * Different text colors from theme
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text color="primary">Primary - Main content color</Text>
      <Text color="secondary">Secondary - Less prominent text</Text>
      <Text color="muted">Muted - Subtle helper text</Text>
      <Text color="disabled">Disabled - Inactive text</Text>
      <Text color="accent">Accent - Interactive elements</Text>
      <Text color="success">Success - Positive feedback</Text>
      <Text color="warning">Warning - Cautionary messages</Text>
      <Text color="error">Error - Error messages and alerts</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all available colors from the theme token system.',
      },
    },
  },
};

/**
 * Text alignment options
 */
export const Alignment: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}
    >
      <Text align="left">
        Left aligned text for standard content and reading flow
      </Text>
      <Text align="center">
        Center aligned text for titles and emphasized content
      </Text>
      <Text align="right">
        Right aligned text for numeric values and special layouts
      </Text>
      <Text align="justify">
        Justify aligned text spreads content evenly across the full width of the
        container creating uniform margins on both sides
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows different text alignment options with typical use cases.',
      },
    },
  },
};

/**
 * Truncation behaviors for handling overflow
 */
export const Truncation: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '250px',
      }}
    >
      <div>
        <Text variant="caption" color="muted">
          Single line truncation:
        </Text>
        <Text truncate>
          This is a very long text that will be truncated with ellipsis when it
          overflows the container width
        </Text>
      </div>
      <div>
        <Text variant="caption" color="muted">
          Multi-line truncation (2 lines):
        </Text>
        <Text truncate maxLines={2}>
          This is a longer text that demonstrates multi-line truncation. It will
          show up to two lines before being cut off with ellipsis, which is
          useful for previews and cards.
        </Text>
      </div>
      <div>
        <Text variant="caption" color="muted">
          No wrap:
        </Text>
        <Text nowrap>
          This text will not wrap to multiple lines and will overflow
          horizontally
        </Text>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates single-line truncation, multi-line truncation, and nowrap behavior.',
      },
    },
  },
};

/**
 * Monospace font for code and technical content
 */
export const Monospace: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text>Regular sans-serif font for normal content</Text>
      <Text mono>Monospace font for technical content and measurements</Text>
      <Text variant="code">Code variant automatically uses monospace font</Text>
      <Text mono color="accent">
        const fileName = 'example.tsx';
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows monospace font usage for code and technical content.',
      },
    },
  },
};

/**
 * Different HTML elements with semantic variants
 */
export const HTMLElements: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text as="h1" variant="display">
        H1 Element with Display Variant
      </Text>
      <Text as="h2" variant="heading">
        H2 Element with Heading Variant
      </Text>
      <Text as="h3" variant="subheading">
        H3 Element with Subheading Variant
      </Text>
      <Text as="p" variant="body">
        Paragraph element with body variant for main content
      </Text>
      <Text as="label" variant="caption">
        Label element with caption variant
      </Text>
      <Text as="strong" weight="semibold">
        Strong element with semibold weight
      </Text>
      <Text as="em" color="muted">
        Emphasis element with muted color
      </Text>
      <Text as="small" size="xs">
        Small element with extra small size
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how the component can render as different HTML elements while maintaining consistent styling.',
      },
    },
  },
};

/**
 * Line height variations
 */
export const LineHeight: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <Text variant="caption" color="muted">
          Tight line height (1.2):
        </Text>
        <Text lineHeight="tight">
          This text uses tight line height which is good for headings and
          compact layouts where space is limited.
        </Text>
      </div>
      <div>
        <Text variant="caption" color="muted">
          Normal line height (1.4):
        </Text>
        <Text lineHeight="normal">
          This text uses normal line height which provides good readability for
          most content and is the standard choice.
        </Text>
      </div>
      <div>
        <Text variant="caption" color="muted">
          Relaxed line height (1.6):
        </Text>
        <Text lineHeight="relaxed">
          This text uses relaxed line height which gives more breathing room and
          is excellent for longer reading content.
        </Text>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows different line height options and their appropriate use cases.',
      },
    },
  },
};

/**
 * Playground for testing all props combinations
 */
export const Playground: Story = {
  args: {
    children: 'Customize this text with the controls below',
    variant: 'body',
    size: undefined,
    weight: undefined,
    color: 'primary',
    lineHeight: undefined,
    align: undefined,
    as: 'span',
    truncate: false,
    maxLines: undefined,
    nowrap: false,
    mono: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to test all component props and their combinations.',
      },
    },
  },
};
