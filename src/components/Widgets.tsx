import { useState, useRef, useEffect } from "react";
import { X, Plus, Wind, Droplets, Thermometer, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

// ─── Draggable Widget Shell ───────────────────────────────────────────────────
interface WidgetShellProps {
  id: string;
  initialX: number;
  initialY: number;
  children: React.ReactNode;
  onRemove: (id: string) => void;
}

function WidgetShell({ id, initialX, initialY, children, onRemove }: WidgetShellProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [hovered, setHovered] = useState(false);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    px: initialX,
    py: initialY,
  });

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, textarea")) return;
    e.preventDefault();
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      px: pos.x,
      py: pos.y,
    };

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      setPos({
        x: Math.max(0, dragRef.current.px + me.clientX - dragRef.current.startX),
        y: Math.max(28, dragRef.current.py + me.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 10 }}
      className="rounded-2xl overflow-hidden shadow-xl cursor-grab active:cursor-grabbing"
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <button
          onClick={() => onRemove(id)}
          className="absolute top-1.5 left-1.5 z-20 w-5 h-5 rounded-full bg-gray-700/80 flex items-center justify-center transition-opacity"
        >
          <X size={10} className="text-white" />
        </button>
      )}
      {children}
    </div>
  );
}

// ─── Clock Widget ─────────────────────────────────────────────────────────────
function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const { i18n } = useTranslation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const sec = time.getSeconds();
  const min = time.getMinutes();
  const hr = time.getHours() % 12;
  const secDeg = sec * 6;
  const minDeg = min * 6 + sec * 0.1;
  const hrDeg = hr * 30 + min * 0.5;

  return (
    <div
      className="w-36 h-36 flex flex-col items-center justify-center gap-1"
      style={{
        background: "rgba(30,30,30,0.82)",
        backdropFilter: "blur(20px)",
      }}
    >
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={40 + 32 * Math.sin(angle)}
              y1={40 - 32 * Math.cos(angle)}
              x2={40 + 36 * Math.sin(angle)}
              y2={40 - 36 * Math.cos(angle)}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}
        <line
          x1="40"
          y1="40"
          x2={40 + 18 * Math.sin((hrDeg * Math.PI) / 180)}
          y2={40 - 18 * Math.cos((hrDeg * Math.PI) / 180)}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="40"
          x2={40 + 24 * Math.sin((minDeg * Math.PI) / 180)}
          y2={40 - 24 * Math.cos((minDeg * Math.PI) / 180)}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="40"
          x2={40 + 28 * Math.sin((secDeg * Math.PI) / 180)}
          y2={40 - 28 * Math.cos((secDeg * Math.PI) / 180)}
          stroke="#ff3b30"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="40" cy="40" r="2.5" fill="white" />
        <circle cx="40" cy="40" r="1.5" fill="#ff3b30" />
      </svg>
      <p className="text-white text-[11px] opacity-60">
        {time.toLocaleDateString(i18n.language, {
          month: "short",
          day: "numeric",
          weekday: "short",
        })}
      </p>
    </div>
  );
}

// ─── Weather Widget ───────────────────────────────────────────────────────────
function WeatherWidget() {
  const { t } = useTranslation();

  const hourly = [
    { time: t("widgets.weather.now"), icon: "☀️", temp: 23 },
    { time: "13:00", icon: "🌤️", temp: 25 },
    { time: "14:00", icon: "⛅", temp: 24 },
    { time: "15:00", icon: "🌧️", temp: 19 },
    { time: "16:00", icon: "🌧️", temp: 17 },
    { time: "17:00", icon: "🌦️", temp: 18 },
  ];
  return (
    <div
      className="w-72 p-4"
      style={{
        background: "linear-gradient(160deg, rgba(30,120,220,0.88) 0%, rgba(80,160,255,0.88) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white/80 text-[11px] font-medium">{t("widgets.weather.location")}</p>
          <span className="text-white text-[52px] leading-none font-thin">23°</span>
          <p className="text-white text-[13px] opacity-80 mt-0.5">
            {t("widgets.weather.condition")} · {t("widgets.weather.high")} 26°{" "}
            {t("widgets.weather.low")} 15°
          </p>
        </div>
        <div className="text-5xl mt-1">☀️</div>
      </div>
      <div
        className="flex items-center gap-3 mb-3 p-2 rounded-xl"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <div className="flex items-center gap-1">
          <Wind size={11} className="text-white/70" />
          <span className="text-white/80 text-[11px]">3.2 m/s</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets size={11} className="text-white/70" />
          <span className="text-white/80 text-[11px]">45%</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer size={11} className="text-white/70" />
          <span className="text-white/80 text-[11px]">{t("widgets.weather.feelsLike")} 21°</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {hourly.map((h) => (
          <div key={h.time} className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <span className="text-white/60 text-[10px]">{h.time}</span>
            <span className="text-base">{h.icon}</span>
            <span className="text-white text-[12px] font-medium">{h.temp}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calendar Widget ─────────────────────────────────────────────────────────
function CalendarWidget() {
  const { t, i18n } = useTranslation();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = i - firstDay + 1;
    return d >= 1 && d <= daysInMonth ? d : null;
  });

  const events: Record<number, string> = {
    [date]: t("widgets.calendar.today"),
    [date + 2]: t("widgets.calendar.meeting"),
    [date + 5]: t("widgets.calendar.birthday"),
  };

  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, i); // 2024-01-07 is Sunday
    return d.toLocaleDateString(i18n.language, { weekday: "narrow" });
  });

  return (
    <div
      className="w-64 p-4"
      style={{
        background: "rgba(30,30,30,0.88)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-red-400 text-[11px] font-semibold uppercase tracking-wider">
            {today.toLocaleDateString(i18n.language, { month: "long" })}
          </p>
          <p className="text-white text-[28px] font-thin leading-none">{date}</p>
        </div>
        <p className="text-white/40 text-[11px]">{year}</p>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((d, i) => (
          <div
            key={d + i}
            className="text-center text-[10px] py-0.5"
            style={{
              color: i === 0 ? "#ff3b30" : "rgba(255,255,255,0.4)",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {d !== null && (
              <div
                className="w-6 h-6 flex items-center justify-center rounded-full text-[11px] relative"
                style={{
                  background: d === date ? "#ff3b30" : "transparent",
                  color: d === date ? "white" : i % 7 === 0 ? "#ff6b6b" : "rgba(255,255,255,0.75)",
                }}
              >
                {d}
                {events[d] && d !== date && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="text-white/40 text-[10px] mb-1.5">{t("widgets.calendar.upcoming")}</p>
        {Object.entries(events)
          .filter(([d]) => Number(d) >= date)
          .slice(0, 2)
          .map(([d, name]) => (
            <div key={d} className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span className="text-white/70 text-[11px]">
                {month + 1}/{d} · {name}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Notes Widget ─────────────────────────────────────────────────────────────
function NotesWidget() {
  const { t } = useTranslation();
  const [text, setText] = useState(t("widgets.notes.defaultContent"));

  return (
    <div
      className="w-52"
      style={{
        background: "rgba(255,242,120,0.92)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <p className="text-[12px] font-semibold text-yellow-900">{t("widgets.notes.header")}</p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 bg-transparent outline-none text-[12px] text-yellow-900 resize-none leading-relaxed"
        rows={6}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ─── System Stats Widget ──────────────────────────────────────────────────────
function SystemWidget() {
  const { t } = useTranslation();
  const [cpu] = useState(34);
  const [mem] = useState(68);
  const [gpu] = useState(22);
  const [net] = useState(45);

  function Bar({ value, color }: { value: number; color: string }) {
    return (
      <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    );
  }

  return (
    <div
      className="w-56 p-4"
      style={{
        background: "rgba(20,20,20,0.88)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity size={13} className="text-green-400" />
        <p className="text-white text-[12px] font-semibold">{t("widgets.system.title")}</p>
      </div>
      {[
        { label: "CPU", value: cpu, color: "#30d158", unit: "%" },
        { label: t("widgets.system.memory"), value: mem, color: "#1d7af5", unit: "%" },
        { label: "GPU", value: gpu, color: "#bf5af2", unit: "%" },
        { label: t("widgets.system.network"), value: net, color: "#ff9f0a", unit: "MB/s" },
      ].map((item) => (
        <div key={item.label} className="mb-2.5">
          <div className="flex justify-between mb-1">
            <span className="text-white/60 text-[10px]">{item.label}</span>
            <span className="text-white/80 text-[10px]">
              {item.value}
              {item.unit}
            </span>
          </div>
          <Bar value={item.value} color={item.color} />
        </div>
      ))}
      <div
        className="mt-3 pt-2.5 flex justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="text-center">
          <p className="text-white/40 text-[9px]">{t("widgets.system.disk")}</p>
          <p className="text-white text-[11px]">256 GB</p>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-[9px]">{t("widgets.system.chipset")}</p>
          <p className="text-white text-[11px]">M4</p>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-[9px]">{t("widgets.system.memory")}</p>
          <p className="text-white text-[11px]">16 GB</p>
        </div>
      </div>
    </div>
  );
}

// ─── Widget Picker ────────────────────────────────────────────────────────────
interface WidgetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
  active: string[];
}

export function WidgetPicker({ isOpen, onClose, onAdd, active }: WidgetPickerProps) {
  const { t } = useTranslation();

  const WIDGET_DEFS = [
    { id: "clock", name: t("widgets.clock.name"), icon: "🕐", desc: t("widgets.clock.desc") },
    { id: "weather", name: t("widgets.weather.name"), icon: "⛅", desc: t("widgets.weather.desc") },
    {
      id: "calendar",
      name: t("widgets.calendar.name"),
      icon: "📅",
      desc: t("widgets.calendar.desc"),
    },
    { id: "notes", name: t("widgets.notes.name"), icon: "📝", desc: t("widgets.notes.desc") },
    { id: "system", name: t("widgets.system.name"), icon: "📊", desc: t("widgets.system.desc") },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] p-4 rounded-2xl w-80"
        style={{
          background: "rgba(40,40,40,0.92)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
          animation: "slideUp 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white text-[14px] font-semibold mb-3">{t("widgets.addWidget")}</p>
        <div className="space-y-1.5">
          {WIDGET_DEFS.map((w) => {
            const isActive = active.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => onAdd(w.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{
                  background: isActive ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-2xl">{w.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-[13px] font-medium">{w.name}</p>
                  <p className="text-white/50 text-[11px]">{w.desc}</p>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.15)" : "rgba(48,209,88,1)",
                  }}
                >
                  {isActive ? (
                    <span className="text-white/50 text-[14px]">✓</span>
                  ) : (
                    <Plus size={13} className="text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Main Widgets Container ──────────────────────────────────────────────────
export interface WidgetInstance {
  id: string;
  type: string;
  x: number;
  y: number;
}

interface WidgetsProps {
  widgets: WidgetInstance[];
  onRemove: (id: string) => void;
}

export function Widgets({ widgets, onRemove }: WidgetsProps) {
  const renderContent = (type: string) => {
    switch (type) {
      case "clock":
        return <ClockWidget />;
      case "weather":
        return <WeatherWidget />;
      case "calendar":
        return <CalendarWidget />;
      case "notes":
        return <NotesWidget />;
      case "system":
        return <SystemWidget />;
      default:
        return null;
    }
  };

  return (
    <>
      {widgets.map((w) => (
        <WidgetShell key={w.id} id={w.id} initialX={w.x} initialY={w.y} onRemove={onRemove}>
          {renderContent(w.type)}
        </WidgetShell>
      ))}
    </>
  );
}
