import { useState, useCallback, useRef } from 'react';
import type {
  ChatMessageData,
  UseChatMessagesOptions,
  UseChatMessagesReturn,
} from './ChatPanel.types';

export function useChatMessages(
  options: UseChatMessagesOptions = {}
): UseChatMessagesReturn {
  const { initialMessages = [], maxMessages } = options;
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const trimToMax = useCallback(
    (msgs: ChatMessageData[]): ChatMessageData[] => {
      if (maxMessages !== undefined && msgs.length > maxMessages) {
        return msgs.slice(msgs.length - maxMessages);
      }
      return msgs;
    },
    [maxMessages]
  );

  const appendMessage = useCallback(
    (message: ChatMessageData) => {
      setMessages(prev => trimToMax([...prev, message]));
    },
    [trimToMax]
  );

  const updateMessage = useCallback(
    (
      id: string,
      update:
        | Partial<ChatMessageData>
        | ((prev: ChatMessageData) => Partial<ChatMessageData>)
    ) => {
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id !== id) return msg;
          const partial = typeof update === 'function' ? update(msg) : update;
          return { ...msg, ...partial };
        })
      );
    },
    []
  );

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const getMessage = useCallback((id: string): ChatMessageData | undefined => {
    return messagesRef.current.find(msg => msg.id === id);
  }, []);

  return {
    messages,
    setMessages,
    appendMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    getMessage,
  };
}
