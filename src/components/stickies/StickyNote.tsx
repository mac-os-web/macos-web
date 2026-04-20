import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface StickyData {
  id: string;
  content: string;
  color: "yellow" | "blue" | "green" | "pink" | "purple" | "gray";
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

interface StickyNoteProps {
  sticky: StickyData;
  onUpdate: (id: string, data: Partial<StickyData>) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  zIndex: number;
}

const STICKY_COLORS = {
  yellow: { bg: "rgba(255, 234, 128, 0.95)", header: "rgba(245, 220, 90, 0.95)" },
  blue: { bg: "rgba(173, 216, 255, 0.95)", header: "rgba(140, 195, 245, 0.95)" },
  green: { bg: "rgba(178, 235, 178, 0.95)", header: "rgba(145, 215, 145, 0.95)" },
  pink: { bg: "rgba(255, 200, 210, 0.95)", header: "rgba(245, 175, 190, 0.95)" },
  purple: { bg: "rgba(215, 195, 245, 0.95)", header: "rgba(195, 170, 235, 0.95)" },
  gray: { bg: "rgba(220, 220, 220, 0.95)", header: "rgba(200, 200, 200, 0.95)" },
} as const;

const COLOR_OPTIONS = Object.keys(STICKY_COLORS) as StickyData["color"][];

const MIN_WIDTH = 150;
const MIN_HEIGHT = 120;

export function StickyNote({ sticky, onUpdate, onDelete, onFocus, zIndex }: StickyNoteProps) {
  const [pos, setPos] = useState({ x: sticky.x, y: sticky.y });
  const [size, setSize] = useState({ w: sticky.width, h: sticky.height });
  const [hovered, setHovered] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, px: 0, py: 0 });
  const resizeRef = useRef({ resizing: false, startX: 0, startY: 0, sw: 0, sh: 0 });
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const colors = STICKY_COLORS[sticky.color];

  const savePosition = useCallback(
    (x: number, y: number) => {
      onUpdate(sticky.id, { x, y });
    },
    [sticky.id, onUpdate]
  );

  const saveSize = useCallback(
    (width: number, height: number) => {
      onUpdate(sticky.id, { width, height });
    },
    [sticky.id, onUpdate]
  );

  const handleContentChange = (value: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onUpdate(sticky.id, { content: value });
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Sync position/size from props when they change externally
  useEffect(() => {
    setPos({ x: sticky.x, y: sticky.y });
  }, [sticky.x, sticky.y]);

  useEffect(() => {
    setSize({ w: sticky.width, h: sticky.height });
  }, [sticky.width, sticky.height]);

  const onDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, textarea")) return;
    e.preventDefault();
    onFocus(sticky.id);
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      px: pos.x,
      py: pos.y,
    };

    let lastX = pos.x;
    let lastY = pos.y;

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const maxX = window.innerWidth - size.w;
      const maxY = window.innerHeight - size.h;
      const nx = dragRef.current.px + me.clientX - dragRef.current.startX;
      const ny = dragRef.current.py + me.clientY - dragRef.current.startY;
      lastX = Math.min(maxX, Math.max(0, nx));
      lastY = Math.min(maxY, Math.max(28, ny));
      setPos({ x: lastX, y: lastY });
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      savePosition(lastX, lastY);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(sticky.id);
    resizeRef.current = {
      resizing: true,
      startX: e.clientX,
      startY: e.clientY,
      sw: size.w,
      sh: size.h,
    };

    const clampW = (w: number) => Math.min(window.innerWidth - pos.x, Math.max(MIN_WIDTH, w));
    const clampH = (h: number) => Math.min(window.innerHeight - pos.y, Math.max(MIN_HEIGHT, h));

    const onMove = (me: MouseEvent) => {
      if (!resizeRef.current.resizing) return;
      const nw = clampW(resizeRef.current.sw + me.clientX - resizeRef.current.startX);
      const nh = clampH(resizeRef.current.sh + me.clientY - resizeRef.current.startY);
      setSize({ w: nw, h: nh });
    };
    const onUp = (me: MouseEvent) => {
      resizeRef.current.resizing = false;
      const finalW = clampW(resizeRef.current.sw + me.clientX - resizeRef.current.startX);
      const finalH = clampH(resizeRef.current.sh + me.clientY - resizeRef.current.startY);
      saveSize(finalW, finalH);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
      }}
      className="flex flex-col rounded-lg shadow-lg select-none"
      onMouseDown={() => onFocus(sticky.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowColors(false);
      }}
    >
      {/* Header — drag handle */}
      <div
        className="flex h-6 flex-shrink-0 cursor-grab items-center rounded-t-lg px-1.5 active:cursor-grabbing"
        style={{ background: colors.header }}
        onMouseDown={onDragStart}
      >
        {/* Close button */}
        <button
          onClick={() => onDelete(sticky.id)}
          className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition-opacity"
          style={{ opacity: hovered ? 1 : 0, background: "rgba(0,0,0,0.2)" }}
        >
          <X size={8} className="text-gray-700" />
        </button>

        <div className="flex-1" />

        {/* Color picker toggle */}
        <button
          onClick={() => setShowColors((v) => !v)}
          className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition-opacity"
          style={{
            opacity: hovered ? 1 : 0,
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <span className="text-[7px] leading-none text-gray-600">●</span>
        </button>
      </div>

      {/* Color picker dropdown */}
      {showColors && (
        <div
          className="absolute top-7 right-1 flex gap-1 rounded-lg p-1.5 shadow-md"
          style={{ background: "rgba(255,255,255,0.95)", zIndex: 1 }}
        >
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => {
                onUpdate(sticky.id, { color: c });
                setShowColors(false);
              }}
              className="h-4 w-4 rounded-full border border-black/10 transition-transform hover:scale-125"
              style={{ background: STICKY_COLORS[c].bg }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <textarea
        ref={textRef}
        defaultValue={sticky.content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="..."
        className="flex-1 resize-none rounded-b-lg border-none p-2 text-[13px] leading-relaxed text-gray-800 outline-none placeholder:text-gray-400/50"
        style={{ background: colors.bg }}
      />

      {/* Resize handle */}
      <div
        className="absolute right-0 bottom-0 h-3 w-3 cursor-nwse-resize"
        onMouseDown={onResizeStart}
        style={{ opacity: hovered ? 0.4 : 0 }}
      >
        <svg viewBox="0 0 10 10" className="h-full w-full text-gray-600">
          <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1" />
          <line x1="9" y1="4" x2="4" y2="9" stroke="currentColor" strokeWidth="1" />
          <line x1="9" y1="7" x2="7" y2="9" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
