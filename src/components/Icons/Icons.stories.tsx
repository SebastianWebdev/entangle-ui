// src/icons/AllIcons.stories.tsx
import type { IconProps } from '@/components/primitives/Icon';
import { ThemeProvider } from '@/theme';
import type { Meta, StoryObj } from '@storybook/react';

// Core 10 icons
import { AddIcon } from './AddIcon';
import { CloseIcon } from './CloseIcon';
import { EditIcon } from './EditIcon';
import { EyeIcon } from './EyeIcon';
import { FolderIcon } from './FolderIcon';
import { PlayIcon } from './PlayIcon';
import { SaveIcon } from './SaveIcon';
import { SearchIcon } from './SearchIcon';
import { SettingsIcon } from './SettingsIcon';
import { TrashIcon } from './TrashIcon';

// Additional icons
import { ArrowDownIcon } from './ArrowDownIcon';
import { ArrowLeftIcon } from './ArrowLeftIcon';
import { ArrowRightIcon } from './ArrowRightIcon';
import { ArrowUpIcon } from './ArrowUpIcon';
import { BookmarkIcon } from './BookmarkIcon';
import { CalendarIcon } from './CalendarIcon';
import { ChevronDownIcon } from './ChevronDownIcon';
import { ChevronUpIcon } from './ChevronUpIcon';
import { ClockIcon } from './ClockIcon';
import { CodeIcon } from './CodeIcon';
import { CopyIcon } from './CopyIcon';
import { CutIcon } from './CutIcon';
import { DownloadIcon } from './DownloadIcon';
import { ErrorIcon } from './ErrorIcon';
import { FilterIcon } from './FilterIcon';
import { FullscreenIcon } from './FullscreenIcon';
import { GridIcon } from './GridIcon';
import { HeartIcon } from './HeartIcon';
import { HelpIcon } from './HelpIcon';
import { HomeIcon } from './HomeIcon';
import { InfoIcon } from './InfoIcon';
import { LinkIcon } from './LinkIcon';
import { ListIcon } from './ListIcon';
import { LockIcon } from './LockIcon';
import { MaximizeIcon } from './MaximizeIcon';
import { MenuIcon } from './MenuIcon';
import { MinimizeIcon } from './MinimizeIcon';
import { PasteIcon } from './PasteIcon';
import { RedoIcon } from './RedoIcon';
import { RefreshIcon } from './RefreshIcon';
import { SortIcon } from './SortIcon';
import { StarIcon } from './StarIcon';
import { SuccessIcon } from './SuccessIcon';
import { TagIcon } from './TagIcon';
import { UndoIcon } from './UndoIcon';
import { UnlockIcon } from './UnlockIcon';
import { UploadIcon } from './UploadIcon';
import { UserIcon } from './UserIcon';
import { WarningIcon } from './WarningIcon';
import { ZoomInIcon } from './ZoomInIcon';
import { ZoomOutIcon } from './ZoomOutIcon';
import { CircleIcon } from './CircleIcon';
import { CheckIcon } from './CheckIcon';
import { AiChatIcon } from './AiChatIcon';
import { AiSparklesIcon } from './AiSparklesIcon';
import { RobotIcon } from './RobotIcon';

/**
 * Storybook configuration for all Icon components
 *
 * Showcases the complete collection of available icons with different sizes and colors
 * for use in editor interfaces and applications.
 */
const meta: Meta<IconProps> = {
  title: 'Icons/All Icons',
  decorators: [
    Story => (
      <ThemeProvider>
        <div
          style={{
            padding: '1rem',
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
    docs: {
      description: {
        component:
          'A comprehensive collection of 40 commonly used icons for editor interfaces. All icons are built using the base Icon component and support consistent sizing and coloring.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the icon',
      defaultValue: 'md',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'muted',
        'accent',
        'success',
        'warning',
        'error',
      ],
      description: 'Color variant of the icon',
      defaultValue: 'primary',
    },
  },
};

export default meta;
type Story = StoryObj<IconProps>;

// All icons grouped by category
const coreIcons = [
  { Component: SaveIcon, name: 'SaveIcon' },
  { Component: TrashIcon, name: 'TrashIcon' },
  { Component: SettingsIcon, name: 'SettingsIcon' },
  { Component: SearchIcon, name: 'SearchIcon' },
  { Component: AddIcon, name: 'AddIcon' },
  { Component: CloseIcon, name: 'CloseIcon' },
  { Component: EditIcon, name: 'EditIcon' },
  { Component: PlayIcon, name: 'PlayIcon' },
  { Component: FolderIcon, name: 'FolderIcon' },
  { Component: EyeIcon, name: 'EyeIcon' },
  { Component: CodeIcon, name: 'CodeIcon' },
];

const editingIcons = [
  { Component: CopyIcon, name: 'CopyIcon' },
  { Component: CutIcon, name: 'CutIcon' },
  { Component: PasteIcon, name: 'PasteIcon' },
  { Component: UndoIcon, name: 'UndoIcon' },
  { Component: RedoIcon, name: 'RedoIcon' },
  { Component: RefreshIcon, name: 'RefreshIcon' },
];

const fileIcons = [
  { Component: DownloadIcon, name: 'DownloadIcon' },
  { Component: UploadIcon, name: 'UploadIcon' },
  { Component: LockIcon, name: 'LockIcon' },
  { Component: UnlockIcon, name: 'UnlockIcon' },
];

const navigationIcons = [
  { Component: HomeIcon, name: 'HomeIcon' },
  { Component: MenuIcon, name: 'MenuIcon' },
  { Component: ArrowUpIcon, name: 'ArrowUpIcon' },
  { Component: ArrowDownIcon, name: 'ArrowDownIcon' },
  { Component: ArrowLeftIcon, name: 'ArrowLeftIcon' },
  { Component: ArrowRightIcon, name: 'ArrowRightIcon' },
  { Component: ChevronUpIcon, name: 'ChevronUpIcon' },
  { Component: ChevronDownIcon, name: 'ChevronDownIcon' },
];

const viewIcons = [
  { Component: GridIcon, name: 'GridIcon' },
  { Component: ListIcon, name: 'ListIcon' },
  { Component: FilterIcon, name: 'FilterIcon' },
  { Component: SortIcon, name: 'SortIcon' },
  { Component: ZoomInIcon, name: 'ZoomInIcon' },
  { Component: ZoomOutIcon, name: 'ZoomOutIcon' },
  { Component: FullscreenIcon, name: 'FullscreenIcon' },
  { Component: MaximizeIcon, name: 'MaximizeIcon' },
  { Component: MinimizeIcon, name: 'MinimizeIcon' },
];

const statusIcons = [
  { Component: HelpIcon, name: 'HelpIcon' },
  { Component: InfoIcon, name: 'InfoIcon' },
  { Component: WarningIcon, name: 'WarningIcon' },
  { Component: ErrorIcon, name: 'ErrorIcon' },
  { Component: SuccessIcon, name: 'SuccessIcon' },
  { Component: CircleIcon, name: 'CircleIcon' },
  { Component: CheckIcon, name: 'CheckIcon' },
];

const socialIcons = [
  { Component: CalendarIcon, name: 'CalendarIcon' },
  { Component: ClockIcon, name: 'ClockIcon' },
  { Component: UserIcon, name: 'UserIcon' },
  { Component: StarIcon, name: 'StarIcon' },
  { Component: HeartIcon, name: 'HeartIcon' },
  { Component: BookmarkIcon, name: 'BookmarkIcon' },
  { Component: TagIcon, name: 'TagIcon' },
  { Component: LinkIcon, name: 'LinkIcon' },
];

const aiIcons = [
  { Component: AiChatIcon, name: 'AiChatIcon' },
  { Component: AiSparklesIcon, name: 'AiSparklesIcon' },
  { Component: RobotIcon, name: 'RobotIcon' },
];

const IconGrid = ({
  icons,
  title,
  ...iconProps
}: { icons: typeof coreIcons; title: string } & IconProps) => (
  <div style={{ marginBottom: '32px' }}>
    <h3
      style={{
        marginBottom: '16px',
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
      }}
    >
      {title}
    </h3>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '16px',
      }}
    >
      {icons.map(({ Component, name }) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Component {...iconProps} />
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Complete overview of all available icons organized by category
 */
export const AllIcons: Story = {
  render: args => (
    <div style={{ padding: '24px' }}>
      <h2
        style={{
          marginBottom: '32px',
          fontSize: '24px',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}
      >
        Icon Library (
        {coreIcons.length +
          editingIcons.length +
          fileIcons.length +
          navigationIcons.length +
          viewIcons.length +
          statusIcons.length +
          socialIcons.length +
          aiIcons.length}{' '}
        Icons)
      </h2>

      <IconGrid icons={coreIcons} title="Core Icons" {...args} />
      <IconGrid icons={editingIcons} title="Editing & Actions" {...args} />
      <IconGrid icons={fileIcons} title="File Operations" {...args} />
      <IconGrid icons={navigationIcons} title="Navigation" {...args} />
      <IconGrid icons={viewIcons} title="View Controls" {...args} />
      <IconGrid icons={statusIcons} title="Status & Feedback" {...args} />
      <IconGrid icons={socialIcons} title="Social & Metadata" {...args} />
      <IconGrid icons={aiIcons} title="AI & Automation" {...args} />
    </div>
  ),
  args: {
    size: 'md',
    color: 'primary',
  },
};

/**
 * Size comparison showing icons in all available sizes
 */
export const SizeComparison: Story = {
  render: () => {
    const sampleIcons = [
      SaveIcon,
      SearchIcon,
      SettingsIcon,
      PlayIcon,
      EditIcon,
      TrashIcon,
      AddIcon,
      FolderIcon,
    ];

    return (
      <div style={{ padding: '24px' }}>
        <h2
          style={{
            marginBottom: '32px',
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}
        >
          Size Variants
        </h2>

        {(['sm', 'md', 'lg'] as const).map(size => (
          <div key={size} style={{ marginBottom: '32px' }}>
            <h3
              style={{
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {size.toUpperCase()} (
              {size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px'})
            </h3>
            <div
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
              }}
            >
              {sampleIcons.map((Icon, index) => (
                <Icon key={index} size={size} color="primary" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Color variants showing semantic color usage with examples
 */
export const ColorVariants: Story = {
  render: () => (
    <div style={{ padding: '24px' }}>
      <h2
        style={{
          marginBottom: '32px',
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}
      >
        Color Variants
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Semantic Colors */}
        <div>
          <h3
            style={{
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}
          >
            Semantic Colors
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '32px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <SuccessIcon color="success" size="lg" />
                <SaveIcon color="success" size="lg" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Success Actions
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <ErrorIcon color="error" size="lg" />
                <TrashIcon color="error" size="lg" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Destructive Actions
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <WarningIcon color="warning" size="lg" />
                <LockIcon color="warning" size="lg" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Warning States
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <PlayIcon color="accent" size="lg" />
                <AddIcon color="accent" size="lg" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Primary Actions
              </span>
            </div>
          </div>
        </div>

        {/* Neutral Colors */}
        <div>
          <h3
            style={{
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}
          >
            Neutral Colors
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '32px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <SearchIcon color="primary" size="lg" />
                <SettingsIcon color="primary" size="lg" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Primary Content
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <EditIcon color="secondary" size="lg" />
                <FolderIcon color="secondary" size="lg" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Secondary Content
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <CloseIcon color="muted" size="lg" />
                <HelpIcon color="muted" size="lg" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Subtle Elements
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Usage examples showing icons in practical contexts
 */
export const UsageExamples: Story = {
  render: () => (
    <div style={{ padding: '24px' }}>
      <h2
        style={{
          marginBottom: '32px',
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}
      >
        Usage Examples
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Toolbar Example */}
        <div>
          <h3
            style={{
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}
          >
            Editor Toolbar
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <UndoIcon size="sm" color="secondary" />
            <RedoIcon size="sm" color="secondary" />
            <div
              style={{
                width: '1px',
                height: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                margin: '0 4px',
              }}
            />
            <CopyIcon size="sm" color="secondary" />
            <CutIcon size="sm" color="secondary" />
            <PasteIcon size="sm" color="secondary" />
            <div
              style={{
                width: '1px',
                height: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                margin: '0 4px',
              }}
            />
            <ZoomInIcon size="sm" color="secondary" />
            <ZoomOutIcon size="sm" color="secondary" />
            <FullscreenIcon size="sm" color="secondary" />
          </div>
        </div>

        {/* Status Indicators */}
        <div>
          <h3
            style={{
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}
          >
            Status Indicators
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SuccessIcon size="sm" color="success" />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                File saved successfully
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <WarningIcon size="sm" color="warning" />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                Unsaved changes detected
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ErrorIcon size="sm" color="error" />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                Failed to load project
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <InfoIcon size="sm" color="accent" />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                Processing in background
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <h3
            style={{
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}
          >
            Navigation Menu
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '200px',
            }}
          >
            {[
              { Icon: HomeIcon, label: 'Dashboard' },
              { Icon: FolderIcon, label: 'Projects' },
              { Icon: UserIcon, label: 'Profile' },
              { Icon: SettingsIcon, label: 'Settings' },
              { Icon: HelpIcon, label: 'Help & Support' },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  borderRadius: '4px',
                }}
              >
                <Icon size="sm" color="secondary" />
                <span
                  style={{ fontSize: '14px', color: 'var(--text-primary)' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};
