'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseRecentItemsOptions {
  /** localStorage key (component does not bind/store unless this is set). */
  storageKey?: string;
  /** Maximum number of recent ids to keep. @default 5 */
  maxRecent?: number;
}

interface UseRecentItemsReturn {
  recentIds: string[];
  pushRecent: (id: string) => void;
  clearRecent: () => void;
}

function readStorage(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

function writeStorage(key: string, ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // localStorage may be unavailable (private mode, full quota); silently ignore.
  }
}

/**
 * Track recently selected command ids. Backed by localStorage when
 * `storageKey` is provided; otherwise the list is in-memory only.
 */
export function useRecentItems({
  storageKey,
  maxRecent = 5,
}: UseRecentItemsOptions): UseRecentItemsReturn {
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    storageKey ? readStorage(storageKey).slice(0, maxRecent) : []
  );

  // Re-read storage if the key changes after mount.
  useEffect(() => {
    if (storageKey) {
      setRecentIds(readStorage(storageKey).slice(0, maxRecent));
    } else {
      setRecentIds([]);
    }
  }, [storageKey, maxRecent]);

  const pushRecent = useCallback(
    (id: string) => {
      setRecentIds(prev => {
        const next = [id, ...prev.filter(v => v !== id)].slice(0, maxRecent);
        if (storageKey) writeStorage(storageKey, next);
        return next;
      });
    },
    [storageKey, maxRecent]
  );

  const clearRecent = useCallback(() => {
    setRecentIds([]);
    if (storageKey) writeStorage(storageKey, []);
  }, [storageKey]);

  return { recentIds, pushRecent, clearRecent };
}
