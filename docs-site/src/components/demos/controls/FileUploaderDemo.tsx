import { useEffect, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { FileUploader } from '@/components/controls';
import type {
  FileUploaderItem,
  FileUploaderRejectReason,
} from '@/components/controls';
import { Stack } from '@/components/layout';
import { Text } from '@/components/primitives';

export default function FileUploaderDemo() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <FileUploader
          label="Attachments"
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          helperText="Images or PDFs up to 5 MB"
        />
      </div>
    </DemoWrapper>
  );
}

export function FileUploaderSingle() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <FileUploader
          label="Avatar"
          accept="image/*"
          multiple={false}
          maxSize={2 * 1024 * 1024}
          dropZoneText="Drop an image or click to browse"
          dropZoneHint="PNG or JPG, up to 2 MB"
        />
      </div>
    </DemoWrapper>
  );
}

export function FileUploaderSizes() {
  return (
    <DemoWrapper>
      <Stack gap={3} style={{ width: '100%', maxWidth: 420 }}>
        <FileUploader size="sm" label="sm" />
        <FileUploader size="md" label="md" />
        <FileUploader size="lg" label="lg" />
      </Stack>
    </DemoWrapper>
  );
}

export function FileUploaderWithSimulatedUpload() {
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
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <FileUploader
          label="Documents"
          accept=".pdf,.docx,image/*"
          maxFiles={5}
          maxSize={10 * 1024 * 1024}
          value={items}
          onChange={setItems}
          onReject={(file, reason) => {
            setRejection({ file: file.name, reason: String(reason) });
          }}
          onFilesAdd={files => {
            setItems(prev => {
              const newOnes = prev.slice(prev.length - files.length);
              for (const it of newOnes) startUpload(it);
              return prev;
            });
          }}
        />
        {rejection && (
          <Text size="sm" color="error" style={{ marginTop: 8 }}>
            Rejected {rejection.file}: {rejection.reason}
          </Text>
        )}
      </div>
    </DemoWrapper>
  );
}

export function FileUploaderDisabled() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <FileUploader label="Locked" disabled />
      </div>
    </DemoWrapper>
  );
}

export function FileUploaderError() {
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <FileUploader
          label="Upload"
          error
          errorMessage="Could not upload — please try again."
        />
      </div>
    </DemoWrapper>
  );
}

export function FileUploaderWithValidation() {
  const [lastReject, setLastReject] = useState<string | null>(null);
  return (
    <DemoWrapper>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <FileUploader
          label="Image upload"
          accept="image/*"
          maxSize={1 * 1024 * 1024}
          validate={file => {
            if (file.name.startsWith('.')) return 'no-dotfiles';
            return true;
          }}
          onReject={(file, reason) => {
            setLastReject(`${file.name}: ${String(reason)}`);
          }}
          helperText="Images up to 1 MB. No dotfiles."
        />
        {lastReject && (
          <Text size="sm" color="error" style={{ marginTop: 8 }}>
            Rejected — {lastReject}
          </Text>
        )}
      </div>
    </DemoWrapper>
  );
}
