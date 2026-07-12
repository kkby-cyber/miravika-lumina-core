import { useEffect, useState, useCallback } from "react";

const KEY = "miravika-recently-viewed";
const MAX = 8;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* noop */
  }
}

export function useRecordView(handle: string | undefined) {
  useEffect(() => {
    if (!handle) return;
    const list = read().filter((h) => h !== handle);
    write([handle, ...list]);
  }, [handle]);
}

export function useRecentlyViewed(excludeHandle?: string) {
  const [handles, setHandles] = useState<string[]>([]);
  useEffect(() => {
    setHandles(read().filter((h) => h !== excludeHandle));
  }, [excludeHandle]);
  const clear = useCallback(() => {
    write([]);
    setHandles([]);
  }, []);
  return { handles, clear };
}
