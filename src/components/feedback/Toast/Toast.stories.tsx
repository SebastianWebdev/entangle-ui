import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';
import { ToastItem } from './ToastItem';
import { Stack } from '@/components/layout';
import type { ToastPosition, ToastInternalData } from './Toast.types';

// --- Meta ---

const meta: Meta<typeof ToastProvider> = {
  title: 'Feedback/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

// --- Static severity showcase (no provider needed) ---

const createStaticToast = (
  overrides: Partial<ToastInternalData>
): ToastInternalData => ({
  id: `static-${overrides.severity ?? 'info'}`,
  message: 'This is a notification message.',
  severity: 'info',
  duration: 0,
  closable: true,
  showProgress: false,
  createdAt: Date.now(),
  ...overrides,
});

export const AllSeverities: Story = {
  render: () => (
    <Stack direction="column" spacing={2} style={{ width: 380 }}>
      <ToastItem
        toast={createStaticToast({
          severity: 'info',
          title: 'Info',
          message: 'Workspace has been updated.',
        })}
        onDismiss={() => {}}
      />
      <ToastItem
        toast={createStaticToast({
          severity: 'success',
          title: 'Success',
          message: 'File saved successfully.',
        })}
        onDismiss={() => {}}
      />
      <ToastItem
        toast={createStaticToast({
          severity: 'warning',
          title: 'Warning',
          message: 'Unsaved changes will be lost.',
        })}
        onDismiss={() => {}}
      />
      <ToastItem
        toast={createStaticToast({
          severity: 'error',
          title: 'Error',
          message: 'Failed to export project.',
        })}
        onDismiss={() => {}}
      />
    </Stack>
  ),
};

// --- Interactive Demo ---

const InteractiveDemoInner: React.FC = () => {
  const { info, success, warning, error } = useToast();

  return (
    <Stack direction="row" spacing={2}>
      <button onClick={() => info('Workspace updated.')}>Info</button>
      <button onClick={() => success('File saved successfully.')}>
        Success
      </button>
      <button onClick={() => warning('Unsaved changes will be lost.')}>
        Warning
      </button>
      <button onClick={() => error('Failed to export project.')}>Error</button>
    </Stack>
  );
};

export const InteractiveDemo: Story = {
  render: () => (
    <ToastProvider position="bottom-right">
      <InteractiveDemoInner />
    </ToastProvider>
  ),
};

// --- With Title ---

const WithTitleInner: React.FC = () => {
  const { toast } = useToast();

  return (
    <button
      onClick={() =>
        toast({
          title: 'Export Complete',
          message: 'Your project has been exported to scene.glb',
          severity: 'success',
        })
      }
    >
      Show Toast with Title
    </button>
  );
};

export const WithTitle: Story = {
  render: () => (
    <ToastProvider>
      <WithTitleInner />
    </ToastProvider>
  ),
};

// --- With Action ---

const WithActionInner: React.FC = () => {
  const { toast } = useToast();

  return (
    <button
      onClick={() =>
        toast({
          message: 'Object deleted.',
          severity: 'info',
          action: {
            label: 'Undo',
            onClick: () => alert('Undo action triggered!'),
          },
        })
      }
    >
      Show Toast with Action
    </button>
  );
};

export const WithAction: Story = {
  render: () => (
    <ToastProvider>
      <WithActionInner />
    </ToastProvider>
  ),
};

// --- Progress Bar ---

const ProgressBarInner: React.FC = () => {
  const { toast } = useToast();

  return (
    <button
      onClick={() =>
        toast({
          message: 'Processing your request...',
          severity: 'info',
          showProgress: true,
          duration: 5000,
        })
      }
    >
      Show Toast with Progress
    </button>
  );
};

export const ProgressBar: Story = {
  render: () => (
    <ToastProvider>
      <ProgressBarInner />
    </ToastProvider>
  ),
};

// --- Persistent ---

const PersistentInner: React.FC = () => {
  const { toast, dismissAll } = useToast();

  return (
    <Stack direction="row" spacing={2}>
      <button
        onClick={() =>
          toast({
            message: 'This toast will not auto-dismiss.',
            severity: 'warning',
            duration: 0,
          })
        }
      >
        Show Persistent Toast
      </button>
      <button onClick={dismissAll}>Dismiss All</button>
    </Stack>
  );
};

export const Persistent: Story = {
  render: () => (
    <ToastProvider>
      <PersistentInner />
    </ToastProvider>
  ),
};

// --- Positions ---

const PositionInner: React.FC = () => {
  const { info } = useToast();

  return (
    <button onClick={() => info('Toast from this position!')}>
      Show Toast
    </button>
  );
};

export const Positions: Story = {
  render: () => {
    const [position, setPosition] = useState<ToastPosition>('bottom-right');
    const positions: ToastPosition[] = [
      'top-right',
      'top-left',
      'top-center',
      'bottom-right',
      'bottom-left',
      'bottom-center',
    ];

    return (
      <ToastProvider position={position} key={position}>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={1}>
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                style={{
                  fontWeight: pos === position ? 'bold' : 'normal',
                  textDecoration: pos === position ? 'underline' : 'none',
                }}
              >
                {pos}
              </button>
            ))}
          </Stack>
          <PositionInner />
        </Stack>
      </ToastProvider>
    );
  },
};

// --- Editor File Operations (realistic use case) ---

const EditorFileOpsInner: React.FC = () => {
  const { success, error, warning, toast } = useToast();

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" spacing={2}>
        <button
          onClick={() =>
            success('Scene saved.', {
              title: 'Auto-save',
              showProgress: true,
              duration: 3000,
            })
          }
        >
          Save Scene
        </button>
        <button
          onClick={() =>
            success('Exported to scene.glb (2.4 MB)', {
              title: 'Export Complete',
            })
          }
        >
          Export GLB
        </button>
        <button
          onClick={() =>
            error('Connection to asset server lost.', {
              title: 'Network Error',
              duration: 0,
              action: { label: 'Retry', onClick: () => alert('Retrying...') },
            })
          }
        >
          Network Error
        </button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <button
          onClick={() =>
            warning('3 unsaved changes. Save before closing.', {
              title: 'Unsaved Changes',
              action: { label: 'Save All', onClick: () => alert('Saving...') },
            })
          }
        >
          Unsaved Warning
        </button>
        <button
          onClick={() =>
            toast({
              message: 'Loading textures... (14/28)',
              severity: 'info',
              title: 'Asset Loading',
              showProgress: true,
              duration: 8000,
            })
          }
        >
          Asset Loading
        </button>
      </Stack>
    </Stack>
  );
};

export const EditorFileOps: Story = {
  name: 'Editor File Operations',
  render: () => (
    <ToastProvider position="bottom-right" maxVisible={5}>
      <EditorFileOpsInner />
    </ToastProvider>
  ),
};
