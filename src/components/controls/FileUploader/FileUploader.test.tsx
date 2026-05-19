import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { FileUploader } from './FileUploader';
import type {
  FileUploaderItem,
  FileUploaderRejectReason,
} from './FileUploader.types';

function makeFile(name: string, size = 1024, type = 'text/plain'): File {
  // Build a file whose .size matches the requested size by padding with
  // zero bytes — File constructor does not let you set size directly.
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

function getInput(testId = 'up'): HTMLInputElement {
  const input = screen.getByTestId(`${testId}-input`);
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Hidden file input not found');
  }
  return input;
}

function getDropZone(testId = 'up'): HTMLElement {
  return screen.getByTestId(`${testId}-dropzone`);
}

describe('FileUploader', () => {
  describe('Rendering', () => {
    it('renders the dropzone with default text', () => {
      renderWithTheme(<FileUploader testId="up" />);
      expect(
        screen.getByText('Drag files here or click to browse')
      ).toBeInTheDocument();
    });

    it('renders accept hint', () => {
      renderWithTheme(
        <FileUploader testId="up" accept="image/*" maxSize={1024} />
      );
      expect(screen.getByText(/image\/\*/)).toBeInTheDocument();
      expect(screen.getByText(/up to/)).toBeInTheDocument();
    });

    it('renders existing items as rows', () => {
      const items: FileUploaderItem[] = [
        { id: '1', file: makeFile('a.txt'), status: 'done', progress: 100 },
        {
          id: '2',
          file: makeFile('b.txt'),
          status: 'uploading',
          progress: 50,
        },
      ];
      renderWithTheme(<FileUploader testId="up" value={items} />);
      expect(screen.getByText('a.txt')).toBeInTheDocument();
      expect(screen.getByText('b.txt')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('adds files via the file input', () => {
      const onFilesAdd = vi.fn();
      const onChange = vi.fn();
      renderWithTheme(
        <FileUploader testId="up" onFilesAdd={onFilesAdd} onChange={onChange} />
      );
      const file = makeFile('hello.txt', 100);
      fireEvent.change(getInput(), { target: { files: [file] } });
      expect(onFilesAdd).toHaveBeenCalledWith([file]);
      expect(onChange).toHaveBeenCalled();
      expect(screen.getByText('hello.txt')).toBeInTheDocument();
    });

    it('replaces the previous file when multiple is false', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <FileUploader testId="up" multiple={false} onChange={onChange} />
      );
      fireEvent.change(getInput(), {
        target: { files: [makeFile('one.txt')] },
      });
      fireEvent.change(getInput(), {
        target: { files: [makeFile('two.txt')] },
      });
      const calls = onChange.mock.calls;
      const lastCall = calls[calls.length - 1];
      const lastValue = (lastCall?.[0] ?? []) as FileUploaderItem[];
      expect(lastValue).toHaveLength(1);
      expect(lastValue[0]?.file.name).toBe('two.txt');
    });

    it('removes a file via the remove button', () => {
      const onChange = vi.fn();
      const items: FileUploaderItem[] = [
        { id: '1', file: makeFile('a.txt'), status: 'done' },
        { id: '2', file: makeFile('b.txt'), status: 'done' },
      ];
      renderWithTheme(
        <FileUploader testId="up" value={items} onChange={onChange} />
      );
      fireEvent.click(screen.getByLabelText('Remove a.txt'));
      const calls = onChange.mock.calls;
      const lastCall = calls[calls.length - 1];
      const lastValue = (lastCall?.[0] ?? []) as FileUploaderItem[];
      expect(lastValue).toHaveLength(1);
      expect(lastValue[0]?.id).toBe('2');
    });
  });

  describe('Validation', () => {
    it('rejects files exceeding maxSize', () => {
      const onReject = vi.fn();
      renderWithTheme(
        <FileUploader testId="up" maxSize={100} onReject={onReject} />
      );
      const big = makeFile('big.txt', 1024);
      fireEvent.change(getInput(), { target: { files: [big] } });
      expect(onReject).toHaveBeenCalledWith(big, 'too-large');
      expect(screen.queryByText('big.txt')).not.toBeInTheDocument();
    });

    it('rejects files with the wrong type', () => {
      const onReject = vi.fn();
      renderWithTheme(
        <FileUploader testId="up" accept="image/*" onReject={onReject} />
      );
      const wrong = makeFile('note.txt', 100, 'text/plain');
      fireEvent.change(getInput(), { target: { files: [wrong] } });
      expect(onReject).toHaveBeenCalledWith(wrong, 'wrong-type');
    });

    it('rejects past maxFiles', () => {
      const onReject = vi.fn();
      const items: FileUploaderItem[] = [
        { id: '1', file: makeFile('a.txt'), status: 'done' },
      ];
      renderWithTheme(
        <FileUploader
          testId="up"
          value={items}
          maxFiles={1}
          onReject={onReject}
        />
      );
      const extra = makeFile('b.txt');
      fireEvent.change(getInput(), { target: { files: [extra] } });
      expect(onReject).toHaveBeenCalledWith(extra, 'max-files');
    });

    it('runs a custom validator', () => {
      const onReject = vi.fn();
      renderWithTheme(
        <FileUploader
          testId="up"
          validate={file => (file.name.includes('.bad') ? 'banned' : true)}
          onReject={onReject}
        />
      );
      const bad = makeFile('virus.bad');
      fireEvent.change(getInput(), { target: { files: [bad] } });
      const reason: FileUploaderRejectReason = 'banned';
      expect(onReject).toHaveBeenCalledWith(bad, reason);
    });
  });

  describe('Drag and drop', () => {
    it('highlights on drag enter and accepts dropped files', () => {
      const onFilesAdd = vi.fn();
      renderWithTheme(<FileUploader testId="up" onFilesAdd={onFilesAdd} />);
      const zone = getDropZone();
      const file = makeFile('drop.txt', 200);

      fireEvent.dragEnter(zone, { dataTransfer: { files: [file] } });
      fireEvent.drop(zone, { dataTransfer: { files: [file] } });
      expect(onFilesAdd).toHaveBeenCalledWith([file]);
    });
  });

  describe('Accessibility', () => {
    it('opens the file picker on Enter / Space', () => {
      renderWithTheme(<FileUploader testId="up" />);
      const zone = getDropZone();
      const input = getInput();
      const spy = vi.spyOn(input, 'click').mockImplementation(() => undefined);
      fireEvent.keyDown(zone, { key: 'Enter' });
      fireEvent.keyDown(zone, { key: ' ' });
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('does not open the picker when disabled', () => {
      renderWithTheme(<FileUploader testId="up" disabled />);
      const input = getInput();
      const spy = vi.spyOn(input, 'click').mockImplementation(() => undefined);
      fireEvent.click(getDropZone());
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
