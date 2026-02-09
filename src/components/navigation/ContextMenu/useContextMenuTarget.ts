import { useCallback, useEffect, useState } from 'react';
import type React from 'react';
import type {
  ContextMenuTargetDetails,
  UseContextMenuTargetResult,
} from './ContextMenu.types';

export function useContextMenuTarget<TPayload = unknown>(
  payload?: TPayload
): UseContextMenuTargetResult<TPayload> {
  const [context, setContext] = useState<ContextMenuTargetDetails<TPayload>>({
    event: null,
    target: null,
    payload,
  });
  const [targetNode, setTargetNode] = useState<HTMLElement | null>(null);

  const updateContext = useCallback(
    (event: MouseEvent, target: HTMLElement | null) => {
      setContext({
        event,
        target,
        payload,
      });
    },
    [payload]
  );

  const onContextMenuCapture = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const target =
        event.target instanceof HTMLElement
          ? event.target
          : event.currentTarget;
      updateContext(event.nativeEvent, target);
    },
    [updateContext]
  );

  const targetRef = useCallback((node: HTMLElement | null) => {
    setTargetNode(node);
  }, []);

  useEffect(() => {
    if (!targetNode) return;

    const handleContextMenu = (event: MouseEvent) => {
      const target =
        event.target instanceof HTMLElement ? event.target : targetNode;
      updateContext(event, target);
    };

    targetNode.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      targetNode.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [targetNode, updateContext]);

  useEffect(() => {
    setContext(prev => ({
      ...prev,
      payload,
    }));
  }, [payload]);

  return {
    context,
    onContextMenuCapture,
    targetRef,
  };
}
