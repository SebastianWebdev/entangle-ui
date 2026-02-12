// src/primitives/Input/Input.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { ThemeProvider } from '@/theme';

import {
  SearchIcon,
  EyeIcon,
  UserIcon,
  LockIcon,
  SuccessIcon,
  ErrorIcon,
} from '@/components/Icons';

/**
 * Storybook configuration for Input component
 *
 * Showcases the versatile text input with various configurations,
 * sizes, states, and features for editor interfaces.
 */
const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--background-primary)',
            color: 'var(--text-primary)',
            maxWidth: '400px',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile input component for text entry. Supports labels, helper text, icons, validation states, and various input types. Optimized for editor interfaces with consistent styling.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size variant',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
      description: 'HTML input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input has an error state',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    label: {
      control: 'text',
      description: 'Input label text',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below input',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message when error is true',
    },
  },
  args: {
    size: 'md',
    type: 'text',
    disabled: false,
    error: false,
    required: false,
    readOnly: false,
    placeholder: 'Enter text...',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Basic stories
export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Project Name',
    placeholder: 'My Awesome Project',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'johndoe',
    helperText: 'Choose a unique username for your account',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small Input',
    placeholder: 'Compact size',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    label: 'Medium Input',
    placeholder: 'Standard size',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large Input',
    placeholder: 'Prominent size',
  },
};

// Input types
export const EmailInput: Story = {
  args: {
    type: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    startIcon: <UserIcon />,
  },
};

export const PasswordInput: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    startIcon: <LockIcon />,
    endIcon: <EyeIcon />,
  },
};

export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search projects...',
    startIcon: <SearchIcon />,
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    label: 'Quantity',
    placeholder: '0',
    helperText: 'Enter a numeric value',
  },
};

// With icons
export const WithStartIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Type to search...',
    startIcon: <SearchIcon />,
  },
};

export const WithEndIcon: Story = {
  args: {
    label: 'Verified Email',
    placeholder: 'your@email.com',
    endIcon: <SuccessIcon />,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    startIcon: <UserIcon />,
    endIcon: <SuccessIcon />,
  },
};

// States
export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit this',
    disabled: true,
    value: 'Read-only value',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    value: 'This value cannot be changed',
    readOnly: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Required Field',
    placeholder: 'This field is required',
    required: true,
    helperText: 'Please fill in this field',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'your@email.com',
    value: 'invalid-email',
    error: true,
    errorMessage: 'Please enter a valid email address',
    startIcon: <UserIcon />,
    endIcon: <ErrorIcon />,
  },
};

// Showcase all sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Small (20px)
        </h3>
        <Input
          size="sm"
          label="Small Input"
          placeholder="Compact for toolbars"
          startIcon={<SearchIcon />}
        />
      </div>

      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Medium (24px)
        </h3>
        <Input
          size="md"
          label="Medium Input"
          placeholder="Standard for forms"
          startIcon={<SearchIcon />}
        />
      </div>

      <div>
        <h3
          style={{
            marginBottom: '0.5rem',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Large (32px)
        </h3>
        <Input
          size="lg"
          label="Large Input"
          placeholder="Prominent for key inputs"
          startIcon={<SearchIcon />}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available input sizes with consistent icon scaling.',
      },
    },
  },
};

// Form examples
export const LoginForm: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '0.5rem',
        }}
      >
        Login Form Example
      </h3>

      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        startIcon={<UserIcon />}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        startIcon={<LockIcon />}
        endIcon={<EyeIcon />}
        required
      />

      <Input
        label="Workspace (Optional)"
        placeholder="acme-corp"
        helperText="Leave empty to use your personal workspace"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example login form using various input configurations.',
      },
    },
  },
};

// Search examples
export const SearchVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3
        style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '0.5rem',
        }}
      >
        Search Input Variations
      </h3>

      <Input
        type="search"
        placeholder="Search everything..."
        startIcon={<SearchIcon />}
        size="lg"
      />

      <Input
        label="Filter Projects"
        type="search"
        placeholder="Type to filter..."
        startIcon={<SearchIcon />}
        helperText="Search by name, tags, or description"
      />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Input
          size="sm"
          placeholder="Quick search"
          startIcon={<SearchIcon />}
        />
        <Input
          size="sm"
          placeholder="Filter by tag"
          startIcon={<SearchIcon />}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Various search input configurations for different use cases.',
      },
    },
  },
};

// Error states showcase
export const ErrorStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3
        style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '0.5rem',
        }}
      >
        Error State Examples
      </h3>

      <Input
        label="Email"
        value="invalid-email"
        error
        errorMessage="Please enter a valid email address"
        startIcon={<UserIcon />}
        endIcon={<ErrorIcon />}
      />

      <Input
        label="Password"
        type="password"
        value="123"
        error
        errorMessage="Password must be at least 8 characters long"
        startIcon={<LockIcon />}
      />

      <Input
        label="Required Field"
        placeholder="This field cannot be empty"
        error
        errorMessage="This field is required"
        required
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of input error states with validation messages.',
      },
    },
  },
};

// Interactive example
export const InteractiveExample: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    const [hasError, setHasError] = React.useState(false);

    const handleChange = (newValue: string) => {
      setValue(newValue);

      // Simple validation example
      setHasError(newValue.length > 0 && newValue.length < 3);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
          Interactive Validation
        </h3>

        <Input
          label="Project Name"
          value={value}
          onChange={handleChange}
          placeholder="Enter project name..."
          error={hasError}
          errorMessage={
            hasError ? 'Project name must be at least 3 characters' : undefined
          }
          helperText={
            !hasError ? 'Choose a descriptive name for your project' : undefined
          }
          startIcon={<SearchIcon />}
          endIcon={value.length >= 3 ? <SuccessIcon /> : undefined}
        />

        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          Current value: "{value}" ({value.length} characters)
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example with real-time validation and state changes.',
      },
    },
  },
};
