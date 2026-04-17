import { useCallback, useEffect, useRef, useState } from "react";
import type { StickyData } from "../components/stickies/StickyNote";

const STORAGE_KEY = "macos-web-stickies";

function loadStickies(): StickyData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StickyData[]) : [];
  } catch {
    return [];
  }
}

function persistStickies(stickies: StickyData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stickies));
}

export function useStickies() {
  const [stickies, setStickies] = useState<StickyData[]>(loadStickies);
  const zCounter = useRef(100);

  useEffect(() => {
    persistStickies(stickies);
  }, [stickies]);

  const addSticky = useCallback(() => {
    const offset = stickies.length * 20;
    const now = Temporal.Now.instant().toString();
    const newSticky: StickyData = {
      id: crypto.randomUUID(),
      content: "",
      color: "yellow",
      x: 100 + offset,
      y: 100 + offset,
      width: 200,
      height: 200,
      createdAt: now,
      updatedAt: now,
    };
    setStickies((prev) => [...prev, newSticky]);
    return newSticky.id;
  }, [stickies.length]);

  const updateSticky = useCallback((id: string, data: Partial<StickyData>) => {
    setStickies((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: Temporal.Now.instant().toString() } : s
      )
    );
  }, []);

  const deleteSticky = useCallback((id: string) => {
    setStickies((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getNextZ = useCallback(() => {
    zCounter.current += 1;
    return zCounter.current;
  }, []);

  return { stickies, addSticky, updateSticky, deleteSticky, getNextZ };
}
