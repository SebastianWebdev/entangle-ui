// src/primitives/IconButton/IconButton.stories.tsx
import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';
import { ThemeProvider } from '@/theme';

// Import some icons for examples
import { SaveIcon } from "@/components/Icons"
import { AddIcon } from '@/components/Icons/AddIcon';
import { SettingsIcon } from '@/components/Icons/SettingsIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';
import { PlayIcon } from '@/components/Icons/PlayIcon';
import { EyeIcon } from '@/components/Icons/EyeIcon';
import { SearchIcon } from '@/components/Icons/SearchIcon';
import { EditIcon } from '@/components/Icons/EditIcon';
import { CloseIcon } from '@/components/Icons/CloseIcon';

/**
* Storybook configuration for IconButton component
* 
* Showcases the square icon button with various sizes, variants, and radius options
* optimized for editor interfaces and toolbar usage.
*/
const meta: Meta<typeof IconButton> = {
 title: 'Primitives/IconButton',
 component: IconButton,
 decorators: [
   (Story) => (
     <ThemeProvider>
       <div style={{ 
         padding: '1rem', 
         backgroundColor: 'var(--background-primary)',
         color: 'var(--text-primary)'
       }}>
         <Story />
       </div>
     </ThemeProvider>
   ),
 ],
 parameters: {
   layout: 'centered',
   docs: {
     description: {
       component: 'A specialized square button component for icons. Always maintains square proportions and scales appropriately with icon sizes. Perfect for toolbars, quick actions, and icon-based interfaces.',
     },
   },
 },
 argTypes: {
   size: {
     control: 'select',
     options: ['sm', 'md', 'lg'],
     description: 'Button size - always square and scaled for icon',
   },
   variant: {
     control: 'select',
     options: ['default', 'ghost', 'filled'],
     description: 'Visual style variant',
   },
   radius: {
     control: 'select',
     options: ['none', 'sm', 'md', 'lg', 'full'],
     description: 'Border radius - from sharp corners to fully circular',
   },
   disabled: {
     control: 'boolean',
     description: 'Whether the button is disabled',
   },
   loading: {
     control: 'boolean',
     description: 'Whether the button shows loading state',
   },
   pressed: {
     control: 'boolean',
     description: 'Whether the button appears pressed/active',
   },
 },
 args: {
   size: 'md',
   variant: 'ghost',
   radius: 'md',
   disabled: false,
   loading: false,
   pressed: false,
   'aria-label': 'Icon button',
 },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

// Basic stories
export const Default: Story = {
 args: {
   'aria-label': 'Save file',
   children: <SaveIcon />,
 },
};

export const Ghost: Story = {
 args: {
   variant: 'ghost',
   'aria-label': 'Settings',
   children: <SettingsIcon />,
 },
};

export const Filled: Story = {
 args: {
   variant: 'filled',
   'aria-label': 'Add item',
   children: <AddIcon />,
 },
};

// Size variants
export const Small: Story = {
 args: {
   size: 'sm',
   'aria-label': 'Small button',
   children: <EditIcon />,
 },
};

export const Medium: Story = {
 args: {
   size: 'md',
   'aria-label': 'Medium button',
   children: <EditIcon />,
 },
};

export const Large: Story = {
 args: {
   size: 'lg',
   'aria-label': 'Large button',
   children: <EditIcon />,
 },
};

// Radius variants
export const SharpCorners: Story = {
 args: {
   radius: 'none',
   variant: 'default',
   'aria-label': 'Sharp corners',
   children: <SettingsIcon />,
 },
};

export const SmallRadius: Story = {
 args: {
   radius: 'sm',
   variant: 'default',
   'aria-label': 'Small radius',
   children: <SettingsIcon />,
 },
};

export const MediumRadius: Story = {
 args: {
   radius: 'md',
   variant: 'default',
   'aria-label': 'Medium radius',
   children: <SettingsIcon />,
 },
};

export const LargeRadius: Story = {
 args: {
   radius: 'lg',
   variant: 'default',
   'aria-label': 'Large radius',
   children: <SettingsIcon />,
 },
};

export const Circular: Story = {
 args: {
   radius: 'full',
   variant: 'filled',
   'aria-label': 'Circular button',
   children: <PlayIcon />,
 },
};

// States
export const Disabled: Story = {
 args: {
   disabled: true,
   'aria-label': 'Disabled button',
   children: <SaveIcon />,
 },
};

export const Loading: Story = {
 args: {
   loading: true,
   'aria-label': 'Loading...',
   children: <SaveIcon />,
 },
};

export const Pressed: Story = {
 args: {
   pressed: true,
   'aria-label': 'Pressed button',
   children: <EyeIcon />,
 },
};

// Showcase all sizes
export const AllSizes: Story = {
 render: () => (
   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
       <IconButton size="sm" aria-label="Small">
         <SaveIcon />
       </IconButton>
       <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Small (20px)</span>
     </div>
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
       <IconButton size="md" aria-label="Medium">
         <SaveIcon />
       </IconButton>
       <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Medium (24px)</span>
     </div>
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
       <IconButton size="lg" aria-label="Large">
         <SaveIcon />
       </IconButton>
       <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Large (32px)</span>
     </div>
   </div>
 ),
 parameters: {
   docs: {
     description: {
       story: 'All available sizes shown together. Notice how buttons remain perfectly square.',
     },
   },
 },
};

// Showcase all variants
export const AllVariants: Story = {
 render: () => (
   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
       <IconButton variant="default" aria-label="Default variant">
         <SettingsIcon />
       </IconButton>
       <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Default</span>
     </div>
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
       <IconButton variant="ghost" aria-label="Ghost variant">
         <SettingsIcon />
       </IconButton>
       <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ghost</span>
     </div>
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
       <IconButton variant="filled" aria-label="Filled variant">
         <SettingsIcon />
       </IconButton>
       <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Filled</span>
     </div>
   </div>
 ),
 parameters: {
   docs: {
     description: {
       story: 'All visual variants available for different contexts and emphasis levels.',
     },
   },
 },
};

// Showcase all radius options
export const AllRadiusOptions: Story = {
 render: () => (
   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
     {(['none', 'sm', 'md', 'lg', 'full'] as const).map(radius => (
       <div key={radius} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
         <IconButton 
           radius={radius} 
           variant="default" 
           aria-label={`${radius} radius`}
         >
           <SettingsIcon />
         </IconButton>
         <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
           {radius === 'full' ? 'Circular' : radius.charAt(0).toUpperCase() + radius.slice(1)}
         </span>
       </div>
     ))}
   </div>
 ),
 parameters: {
   docs: {
     description: {
       story: 'All border radius options from sharp corners to fully circular buttons.',
     },
   },
 },
};

// Toolbar example
export const ToolbarExample: Story = {
 render: () => (
   <div style={{ 
     display: 'flex', 
     gap: '4px',
     padding: '8px',
     backgroundColor: 'rgba(255, 255, 255, 0.05)',
     borderRadius: '6px',
     border: '1px solid rgba(255, 255, 255, 0.1)'
   }}>
     <IconButton size="sm" radius="sm" aria-label="Save">
       <SaveIcon />
     </IconButton>
     <IconButton size="sm" radius="sm" aria-label="Search">
       <SearchIcon />
     </IconButton>
     <IconButton size="sm" radius="sm" aria-label="Settings">
       <SettingsIcon />
     </IconButton>
     <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0 4px' }} />
     <IconButton size="sm" radius="sm" variant="filled" aria-label="Add">
       <AddIcon />
     </IconButton>
     <IconButton size="sm" radius="sm" aria-label="Delete">
       <TrashIcon />
     </IconButton>
   </div>
 ),
 parameters: {
   docs: {
     description: {
       story: 'Example toolbar using small icon buttons with slight rounding for a compact, professional look.',
     },
   },
 },
};

// Action buttons example
export const ActionButtonsExample: Story = {
 render: () => (
   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
     <IconButton 
       variant="filled" 
       radius="full" 
       size="lg"
       aria-label="Play video"
     >
       <PlayIcon />
     </IconButton>
     
     <IconButton 
       variant="default" 
       radius="md"
       aria-label="Edit content"
     >
       <EditIcon />
     </IconButton>
     
     <IconButton 
       variant="ghost" 
       radius="full"
       aria-label="Close dialog"
     >
       <CloseIcon />
     </IconButton>
   </div>
 ),
 parameters: {
   docs: {
     description: {
       story: 'Examples of action buttons with different combinations of variants and radius for various contexts.',
     },
   },
 },
};

// Interactive toggle example
export const InteractiveToggle: Story = {
 render: () => {
   const [isVisible, setIsVisible] = React.useState(false);
   const [isPlaying, setIsPlaying] = React.useState(false);
   
   return (
     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
         <IconButton 
           pressed={isVisible}
           aria-label={isVisible ? 'Hide content' : 'Show content'}
           onClick={() => setIsVisible(!isVisible)}
         >
           <EyeIcon />
         </IconButton>
         <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
           {isVisible ? 'Visible' : 'Hidden'}
         </span>
       </div>
       
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
         <IconButton 
           variant="filled"
           radius="full"
           pressed={isPlaying}
           aria-label={isPlaying ? 'Pause' : 'Play'}
           onClick={() => setIsPlaying(!isPlaying)}
         >
           <PlayIcon />
         </IconButton>
         <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
           {isPlaying ? 'Playing' : 'Paused'}
         </span>
       </div>
     </div>
   );
 },
 parameters: {
   docs: {
     description: {
       story: 'Interactive toggle buttons showing pressed states for different UI controls.',
     },
   },
 },
};