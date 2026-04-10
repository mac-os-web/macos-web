import { useState, useRef, useCallback } from "react";

interface WindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialW?: number;
  initialH?: number;
  isActive: boolean;
  isMinimized: boolean;
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize?: () => void;
}

export function Window({
  title,
  icon,
  children,
  initialX = 100,
  initialY = 60,
  initialW = 700,
  initialH = 480,
  isActive,
  isMinimized,
  zIndex,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
}: WindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ w: initialW, h: initialH });
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [show, setShow] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Trigger enter animation
  useState(() => {
    requestAnimationFrame(() => setShow(true));
  });

  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMaximized) return;
      e.preventDefault();
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
      onFocus();

      const onMove = (me: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = me.clientX - dragStart.current.x;
        const dy = me.clientY - dragStart.current.y;
        setPos({
          x: Math.max(0, dragStart.current.px + dx),
          y: Math.max(28, dragStart.current.py + dy),
        });
      };
      const onUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [isMaximized, pos, onFocus]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: size.w,
        h: size.h,
      };

      const onMove = (me: MouseEvent) => {
        if (!isResizing.current) return;
        const dx = me.clientX - resizeStart.current.x;
        const dy = me.clientY - resizeStart.current.y;
        setSize({
          w: Math.max(300, resizeStart.current.w + dx),
          h: Math.max(200, resizeStart.current.h + dy),
        });
      };
      const onUp = () => {
        isResizing.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [size]
  );

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (onMaximize) onMaximize();
  };

  if (isMinimized) return null;

  return (
    <div
      onMouseDown={onFocus}
      style={{
        position: "fixed",
        left: isMaximized ? 0 : pos.x,
        top: isMaximized ? 28 : pos.y,
        width: isMaximized ? "100%" : size.w,
        height: isMaximized ? "calc(100% - 28px)" : size.h,
        zIndex,
        minWidth: 300,
        minHeight: 200,
        transform: show ? "scale(1)" : "scale(0.9)",
        opacity: show ? 1 : 0,
        transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
      }}
      className="flex flex-col rounded-xl overflow-hidden"
    >
      <div
        className="flex flex-col w-full h-full rounded-xl overflow-hidden"
        style={{
          boxShadow: isActive
            ? "0 25px 60px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.2)"
            : "0 10px 30px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.1)",
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center px-3 h-11 flex-shrink-0 select-none relative"
          style={{
            background: isActive ? "rgba(230,230,230,0.95)" : "rgba(210,210,210,0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
          }}
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={handleMaximize}
        >
          {/* Traffic Lights */}
          <div className="flex items-center gap-1.5 group z-10">
            <button
              className="w-3 h-3 rounded-full flex items-center justify-center"
              style={{ background: "#FF5F57" }}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="닫기"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] text-red-900 font-bold leading-none">
                ✕
              </span>
            </button>
            <button
              className="w-3 h-3 rounded-full flex items-center justify-center"
              style={{ background: "#FEBC2E" }}
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              title="최소화"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] text-yellow-900 font-bold leading-none">
                −
              </span>
            </button>
            <button
              className="w-3 h-3 rounded-full flex items-center justify-center"
              style={{ background: "#28C840" }}
              onClick={(e) => {
                e.stopPropagation();
                handleMaximize();
              }}
              title="최대화"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] text-green-900 font-bold leading-none">
                +
              </span>
            </button>
          </div>

          {/* Title */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {icon && <span className="text-base">{icon}</span>}
            <span className="text-[13px] text-gray-700 font-semibold">{title}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Resize Handle */}
        {!isMaximized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
            style={{
              background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.15) 50%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
