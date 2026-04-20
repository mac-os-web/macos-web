import { useCallback, useEffect, useState } from "react";
import type { StickyData } from "../components/stickies/StickyNote";

const STORAGE_KEY = "macos-web-stickies";

const STICKY_COLORS = new Set(["yellow", "blue", "green", "pink", "purple", "gray"]);

function isStickyData(value: unknown): value is StickyData {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.content === "string" &&
    typeof s.color === "string" &&
    STICKY_COLORS.has(s.color) &&
    typeof s.x === "number" &&
    typeof s.y === "number" &&
    typeof s.width === "number" &&
    typeof s.height === "number" &&
    typeof s.createdAt === "string" &&
    typeof s.updatedAt === "string"
  );
}

function loadStickies(): StickyData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isStickyData) : [];
  } catch {
    return [];
  }
}

function persistStickies(stickies: StickyData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickies));
  } catch {
    // localStorage unavailable (quota / security) — UI는 계속 동작
  }
}

export function useStickies() {
  const [stickies, setStickies] = useState<StickyData[]>(loadStickies);

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

  return { stickies, addSticky, updateSticky, deleteSticky };
}
