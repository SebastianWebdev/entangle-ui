import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FileUploader } from './FileUploader';
import type {
  FileUploaderItem,
  FileUploaderRejectReason,
} from './FileUploader.types';

const meta: Meta<typeof FileUploader> = {
  title: 'Controls/FileUploader',
  component: FileUploader,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof FileUploader>;

export const Default: Story = {
  args: {
    label: 'Attachments',
    accept: 'image/*,.pdf',
    maxSize: 5 * 1024 * 1024,
  },
};

export const SingleFile: Story = {
  args: {
    label: 'Avatar',
    accept: 'image/*',
    multiple: false,
    maxSize: 2 * 1024 * 1024,
  },
};

export const WithSimulatedUpload: Story = {
  render: function SimulatedStory(args) {
    const [items, setItems] = useState<FileUploaderItem[]>([]);
    const [rejection, setRejection] = useState<{
      file: string;
      reason: FileUploaderRejectReason;
    } | null>(null);
    const timersRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
      const timers = timersRef.current;
      return () => {
        timers.forEach(t => {
          window.clearInterval(t);
        });
        timers.clear();
      };
    }, []);

    const startUpload = (target: FileUploaderItem) => {
      const interval = window.setInterval(() => {
        setItems(prev =>
          prev.map(it => {
            if (it.id !== target.id) return it;
            const next = (it.progress ?? 0) + 12;
            if (next >= 100) {
              const timer = timersRef.current.get(it.id);
              if (timer) {
                window.clearInterval(timer);
                timersRef.current.delete(it.id);
              }
              return { ...it, status: 'done', progress: 100 };
            }
            return { ...it, status: 'uploading', progress: next };
          })
        );
      }, 220);
      timersRef.current.set(target.id, interval);
    };

    return (
      <div style={{ width: 420 }}>
        <FileUploader
          {...args}
          value={items}
          onChange={setItems}
          onReject={(file, reason) => {
            setRejection({ file: file.name, reason: String(reason) });
          }}
          onFilesAdd={files => {
            // The just-added items are appended at the end with status='pending'.
            setItems(prev => {
              const newOnes = prev.slice(prev.length - files.length);
              for (const it of newOnes) startUpload(it);
              return prev;
            });
          }}
        />
        {rejection && (
          <div style={{ marginTop: 8, color: 'tomato', fontSize: 12 }}>
            Rejected {rejection.file}: {rejection.reason}
          </div>
        )}
      </div>
    );
  },
  args: {
    label: 'Documents',
    accept: '.pdf,.docx,image/*',
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Failed upload',
    error: true,
    errorMessage: 'Could not upload — please try again.',
  },
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 420,
      }}
    >
      <FileUploader size="sm" label="sm" />
      <FileUploader size="md" label="md" />
      <FileUploader size="lg" label="lg" />
    </div>
  ),
};
