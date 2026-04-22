import { Plus } from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ControlCenter } from "../components/ControlCenter";
import { Dock } from "../components/Dock";
import { MenuBar } from "../components/MenuBar";
import { Spotlight } from "../components/Spotlight";
import { Widgets, type WidgetInstance } from "../components/Widgets";
import { Window } from "../components/Window";
import { StickyNote } from "../components/stickies/StickyNote";
import { useStickies } from "../hooks/useStickies";
import { WALLPAPER } from "../lib/wallpaper";

const FinderWindow = lazy(() =>
  import("../components/FinderWindow").then((m) => ({ default: m.FinderWindow }))
);
const SafariWindow = lazy(() =>
  import("../components/SafariWindow").then((m) => ({ default: m.SafariWindow }))
);
const NotesWindow = lazy(() =>
  import("../components/NotesWindow").then((m) => ({ default: m.NotesWindow }))
);
const TerminalWindow = lazy(() =>
  import("../components/TerminalWindow").then((m) => ({ default: m.TerminalWindow }))
);
const AppStoreWindow = lazy(() =>
  import("../components/AppStoreWindow").then((m) => ({ default: m.AppStoreWindow }))
);
const MailWindow = lazy(() =>
  import("../components/MailWindow").then((m) => ({ default: m.MailWindow }))
);
const WidgetPicker = lazy(() =>
  import("../components/WidgetPicker").then((m) => ({ default: m.WidgetPicker }))
);

// ── Dock icon components ────────────────────────────────────────────────────
function FinderIcon() {
  return (
    <div
      className="h-full w-full"
      style={{
        background: "linear-gradient(160deg, #7ac6fd 0%, #1568e8 100%)",
      }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full p-1">
        <rect x="8" y="20" width="84" height="65" rx="10" fill="rgba(255,255,255,0.15)" />
        <circle cx="38" cy="45" r="14" fill="rgba(255,255,255,0.9)" />
        <circle cx="62" cy="45" r="14" fill="rgba(255,255,255,0.75)" />
        <ellipse cx="36" cy="43" rx="4" ry="5" fill="#1568e8" />
        <ellipse cx="60" cy="43" rx="4" ry="5" fill="#1568e8" />
        <path
          d="M26 60 Q50 72 74 60"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function SafariIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="saf2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1aa0f0" />
          <stop offset="100%" stopColor="#006edb" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#saf2)" />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
      />
      <polygon
        points="50,18 64,64 50,56 36,64"
        fill="white"
        opacity="0.95"
        transform="rotate(45,50,50)"
      />
      <polygon
        points="50,18 64,64 50,56 36,64"
        fill="#ff3b30"
        opacity="0.9"
        transform="rotate(225,50,50)"
      />
    </svg>
  );
}

function NotesIcon() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: "linear-gradient(160deg, #fff9d0, #ffd60a)",
      }}
    >
      <div className="mt-1 flex h-10 w-9 flex-col gap-0.5 rounded-md bg-white p-1.5 shadow-md">
        <div className="h-1.5 rounded-sm bg-yellow-300" />
        <div className="h-px rounded bg-gray-200" />
        <div className="h-px rounded bg-gray-200" />
        <div className="h-px w-3/4 rounded bg-gray-100" />
        <div className="h-px w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function TerminalIcon() {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-[22%]"
      style={{ background: "#282c34" }}
    >
      <div className="p-1 font-mono text-[10px] leading-tight">
        <div className="text-green-400">$ ls -la</div>
        <div className="text-green-300 opacity-80">drwx------</div>
        <div className="text-green-300 opacity-60">-rw-r--r--</div>
        <div className="text-white opacity-40">
          _<span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}

function AppStoreIcon() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: "linear-gradient(160deg, #2196f3 0%, #1565c0 100%)",
      }}
    >
      <svg viewBox="0 0 60 60" className="h-10 w-10">
        <text
          x="30"
          y="36"
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontFamily="system-ui"
          fontWeight="300"
        >
          A
        </text>
        <line
          x1="8"
          y1="46"
          x2="52"
          y2="46"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function MailIcon() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: "linear-gradient(160deg, #42a5f5 0%, #1565c0 100%)",
      }}
    >
      <svg viewBox="0 0 64 48" className="h-7 w-10">
        <rect x="2" y="2" width="60" height="44" rx="6" fill="white" opacity="0.95" />
        <polyline
          points="2,4 32,28 62,4"
          fill="none"
          stroke="#1565c0"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function TrashIcon() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: "linear-gradient(160deg, #cfd8dc 0%, #90a4ae 100%)",
      }}
    >
      <svg viewBox="0 0 50 60" className="h-9 w-8">
        <rect x="6" y="14" width="38" height="40" rx="4" fill="rgba(255,255,255,0.7)" />
        <rect x="0" y="10" width="50" height="6" rx="3" fill="rgba(255,255,255,0.9)" />
        <rect x="18" y="4" width="14" height="7" rx="3" fill="rgba(255,255,255,0.9)" />
        <line
          x1="17"
          y1="22"
          x2="17"
          y2="46"
          stroke="rgba(100,120,140,0.6)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="25"
          y1="22"
          x2="25"
          y2="46"
          stroke="rgba(100,120,140,0.6)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="33"
          y1="22"
          x2="33"
          y2="46"
          stroke="rgba(100,120,140,0.6)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ── App types ────────────────────────────────────────────────────────────────
type AppId = "finder" | "safari" | "notes" | "terminal" | "appstore" | "mail";

interface AppWindow {
  id: AppId;
  isOpen: boolean;
  isMinimized: boolean;
}

const BASE_Z = 100;

const APP_CONFIG: Record<
  AppId,
  { titleKey: string; w: number; h: number; x: number; y: number; minW?: number; minH?: number }
> = {
  finder: { titleKey: "dock.finder", w: 720, h: 480, x: 80, y: 60 },
  safari: { titleKey: "dock.safari", w: 740, h: 540, x: 120, y: 80, minW: 700, minH: 500 },
  notes: { titleKey: "dock.notes", w: 620, h: 460, x: 160, y: 70 },
  terminal: { titleKey: "dock.terminal", w: 600, h: 420, x: 200, y: 90 },
  appstore: { titleKey: "dock.appStore", w: 700, h: 500, x: 140, y: 80 },
  mail: { titleKey: "dock.mail", w: 720, h: 520, x: 100, y: 70 },
};

const WIDGET_POSITIONS: Record<string, { x: number; y: number }> = {
  clock: { x: 40, y: 60 },
  weather: { x: 40, y: 220 },
  calendar: { x: 40, y: 520 },
  notes: { x: 330, y: 60 },
  system: { x: 330, y: 280 },
};

// ── Home page ──────────────────────────────────────────────────────────────
export function Home() {
  const { t } = useTranslation();
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [focusOrder, setFocusOrder] = useState<string[]>([]);
  const [overlay, setOverlay] = useState<"spotlight" | "control" | "picker" | null>(null);
  const spotlightOpen = overlay === "spotlight";
  const controlCenterOpen = overlay === "control";
  const widgetPickerOpen = overlay === "picker";
  const toggleOverlay = (target: "spotlight" | "control" | "picker") =>
    setOverlay((cur) => (cur === target ? null : target));
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([
    { id: "clock-1", type: "clock", ...WIDGET_POSITIONS.clock },
    { id: "weather-1", type: "weather", ...WIDGET_POSITIONS.weather },
  ]);
  const { stickies, addSticky, updateSticky, deleteSticky } = useStickies();

  const bringToFront = useCallback((id: string) => {
    setFocusOrder((prev) => [...prev.filter((x) => x !== id), id]);
  }, []);

  const removeFromFocus = useCallback((id: string) => {
    setFocusOrder((prev) => prev.filter((x) => x !== id));
  }, []);

  const getZ = (id: string) => {
    const idx = focusOrder.indexOf(id);
    return idx === -1 ? BASE_Z : BASE_Z + idx;
  };

  // Topmost open (non-minimized) window — derived from focusOrder.
  // Returns null if desktop is the most recent focus, or if no open window.
  const topWindowId = (() => {
    const openIds = new Set(windows.filter((w) => w.isOpen && !w.isMinimized).map((w) => w.id));
    for (let i = focusOrder.length - 1; i >= 0; i--) {
      const id = focusOrder[i];
      if (id === "desktop") return null;
      if (openIds.has(id as AppId)) return id as AppId;
    }
    return null;
  })();

  const activeApp = topWindowId ? t(APP_CONFIG[topWindowId].titleKey) : "Finder";

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === " ") {
        e.preventDefault();
        toggleOverlay("spotlight");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openApp = useCallback(
    (id: AppId) => {
      bringToFront(id);
      setWindows((prev) => {
        const ex = prev.find((w) => w.id === id);
        if (ex)
          return prev.map((w) => (w.id === id ? { ...w, isOpen: true, isMinimized: false } : w));
        return [...prev, { id, isOpen: true, isMinimized: false }];
      });
    },
    [bringToFront]
  );

  const closeApp = (id: AppId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    removeFromFocus(id);
  };
  const minimizeApp = (id: AppId) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)));
  const focusApp = (id: AppId) => {
    bringToFront(id);
  };

  const isDockOpen = (id: AppId) => windows.some((w) => w.id === id && w.isOpen);

  const dockApps = [
    {
      id: "finder",
      name: "Finder",
      icon: <FinderIcon />,
      color: "transparent",
      isOpen: isDockOpen("finder"),
    },
    {
      id: "safari",
      name: "Safari",
      icon: <SafariIcon />,
      color: "transparent",
      isOpen: isDockOpen("safari"),
    },
    {
      id: "notes",
      name: t("dock.notes"),
      icon: <NotesIcon />,
      color: "transparent",
      isOpen: isDockOpen("notes"),
    },
    {
      id: "terminal",
      name: t("dock.terminal"),
      icon: <TerminalIcon />,
      color: "transparent",
      isOpen: isDockOpen("terminal"),
    },
    { id: "sep1", name: "", icon: null, color: "", isSeparator: true },
    {
      id: "appstore",
      name: "App Store",
      icon: <AppStoreIcon />,
      color: "transparent",
      isOpen: isDockOpen("appstore"),
    },
    {
      id: "mail",
      name: "Mail",
      icon: <MailIcon />,
      color: "transparent",
      isOpen: isDockOpen("mail"),
    },
    { id: "sep2", name: "", icon: null, color: "", isSeparator: true },
    {
      id: "trash",
      name: t("dock.trash"),
      icon: <TrashIcon />,
      color: "transparent",
      isOpen: false,
    },
  ];

  const handleDockClick = (id: string) => {
    if (["sep1", "sep2", "trash"].includes(id)) return;
    const win = windows.find((w) => w.id === id);
    if (win?.isMinimized) {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: false } : w)));
      bringToFront(id);
    } else if (win?.isOpen) focusApp(id as AppId);
    else openApp(id as AppId);
  };

  const renderContent = (id: AppId) => {
    const content = (() => {
      switch (id) {
        case "finder":
          return <FinderWindow />;
        case "safari":
          return <SafariWindow activeApp={activeApp} />;
        case "notes":
          return <NotesWindow />;
        case "terminal":
          return <TerminalWindow />;
        case "appstore":
          return <AppStoreWindow />;
        case "mail":
          return <MailWindow />;
      }
    })();
    return <Suspense fallback={null}>{content}</Suspense>;
  };

  // Widget management
  const addWidget = (type: string) => {
    const already = widgets.find((w) => w.type === type);
    if (already) return;
    const pos = WIDGET_POSITIONS[type] ?? { x: 100, y: 100 };
    setWidgets((prev) => [
      ...prev,
      { id: `${type}-${Temporal.Now.instant().epochMilliseconds}`, type, x: pos.x, y: pos.y },
    ]);
  };
  const removeWidget = (id: string) => setWidgets((prev) => prev.filter((w) => w.id !== id));
  const activeWidgetTypes = widgets.map((w) => w.type);

  const isMobileView = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div
      className="relative h-screen w-full overflow-hidden select-none"
      style={{
        backgroundImage: `url(${WALLPAPER})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-keep-focus]")) return;
        bringToFront("desktop");
      }}
      onClick={() => {
        setContextMenu(null);
        setOverlay(null);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Wallpaper overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(0,0,0,0.06)" }}
      />

      {/* Menu Bar */}
      <MenuBar
        onSpotlight={() => setOverlay("spotlight")}
        onControlCenter={() => toggleOverlay("control")}
        activeApp={activeApp}
      />

      {/* Control Center */}
      <ControlCenter isOpen={controlCenterOpen} onClose={() => setOverlay(null)} />

      {/* Desktop Widgets */}
      <Widgets widgets={widgets} onRemove={removeWidget} />

      {/* Stickies */}
      {stickies.map((s) => (
        <StickyNote
          key={s.id}
          sticky={s}
          onUpdate={updateSticky}
          onDelete={(id) => {
            deleteSticky(id);
            removeFromFocus(id);
          }}
          onFocus={bringToFront}
          zIndex={getZ(s.id)}
        />
      ))}

      {/* Add Widget Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleOverlay("picker");
        }}
        className="fixed right-4 bottom-24 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <Plus size={13} />
        {t("widgets.button")}
      </button>

      {/* Widget Picker */}
      <Suspense fallback={null}>
        <WidgetPicker
          isOpen={widgetPickerOpen}
          onClose={() => setOverlay(null)}
          onAdd={addWidget}
          active={activeWidgetTypes}
        />
      </Suspense>

      {/* Mobile grid */}
      {isMobileView && (
        <div className="absolute inset-0 top-7 bottom-24 flex flex-col items-center justify-center px-6">
          <div className="grid grid-cols-4 gap-5">
            {(["finder", "safari", "notes", "terminal", "appstore", "mail"] as AppId[]).map(
              (id) => (
                <button
                  key={id}
                  onClick={() => openApp(id)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-[22%] shadow-xl">
                    {dockApps.find((a) => a.id === id)?.icon}
                  </div>
                  <span
                    className="text-[10px] font-medium text-white"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                  >
                    {t(APP_CONFIG[id].titleKey)}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Windows */}
      {(() => {
        const openWins = windows.filter((w) => w.isOpen && !w.isMinimized);
        return openWins.map((win) => {
          const cfg = APP_CONFIG[win.id];
          const mv = typeof window !== "undefined" && window.innerWidth < 640;
          return (
            <Window
              key={win.id}
              id={win.id}
              title={t(cfg.titleKey)}
              initialX={mv ? 0 : cfg.x}
              initialY={mv ? 28 : cfg.y}
              initialW={mv ? window.innerWidth : cfg.w}
              initialH={mv ? window.innerHeight - 108 : cfg.h}
              minW={cfg.minW}
              minH={cfg.minH}
              isActive={topWindowId === win.id}
              isMinimized={win.isMinimized}
              zIndex={getZ(win.id)}
              onFocus={() => focusApp(win.id)}
              onClose={() => closeApp(win.id)}
              onMinimize={() => minimizeApp(win.id)}
            >
              {renderContent(win.id)}
            </Window>
          );
        });
      })()}

      {/* Spotlight */}
      <Spotlight
        isOpen={spotlightOpen}
        onClose={() => setOverlay(null)}
        onOpenApp={(id) => openApp(id as AppId)}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[200] w-56 overflow-hidden rounded-xl py-1"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 230),
            top: Math.min(contextMenu.y, window.innerHeight - 260),
            background: "rgba(238,238,238,0.94)",
            backdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(
            [
              [t("contextMenu.newFolder"), () => {}],
              null,
              [t("contextMenu.getInfo"), () => {}],
              [t("contextMenu.changeWallpaper"), () => {}],
              null,
              [t("contextMenu.addWidget"), () => setOverlay("picker")],
              [
                t("contextMenu.newSticky"),
                () => {
                  const id = addSticky();
                  bringToFront(id);
                },
              ],
              [t("contextMenu.spotlightSearch"), () => setOverlay("spotlight")],
              null,
              [t("contextMenu.preferences"), () => {}],
            ] as ([string, () => void] | null)[]
          ).map((item, i) =>
            item === null ? (
              <div key={i} className="mx-2 my-1 h-px bg-gray-300/60" />
            ) : (
              <button
                key={i}
                className="w-full px-4 py-[5px] text-left text-[13px] text-gray-800 hover:bg-blue-500 hover:text-white"
                onClick={() => {
                  item[1]();
                  setContextMenu(null);
                }}
              >
                {item[0]}
              </button>
            )
          )}
        </div>
      )}

      {/* Dock */}
      <Dock apps={dockApps} onAppClick={handleDockClick} />
    </div>
  );
}
