import React, { useState, useCallback, useRef, useEffect } from 'react';
import type {
  UseChatInputOptions,
  UseChatInputReturn,
} from './ChatPanel.types';

export function useChatInput(
  options: UseChatInputOptions = {}
): UseChatInputReturn {
  const { submitKey = 'enter', onSubmit, maxLines = 6 } = options;
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to measure scroll height
    textarea.style.height = 'auto';

    const lineHeight = parseInt(
      getComputedStyle(textarea).lineHeight || '18',
      10
    );
    const maxHeight = maxLines * lineHeight;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
  }, [maxLines]);

  // Auto-resize on value change
  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const clear = useCallback(() => {
    setValue('');
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
    }
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isSubmit =
        submitKey === 'enter'
          ? event.key === 'Enter' &&
            !event.shiftKey &&
            !event.ctrlKey &&
            !event.metaKey
          : event.key === 'Enter' && (event.ctrlKey || event.metaKey);

      if (isSubmit) {
        event.preventDefault();
        const trimmed = value.trim();
        if (trimmed) {
          onSubmit?.(trimmed);
          clear();
        }
      }
    },
    [submitKey, value, onSubmit, clear]
  );

  return {
    value,
    setValue,
    clear,
    textareaRef,
    handleKeyDown,
    handleChange,
  };
}
