import { useQuery } from "@tanstack/react-query";
import { Activity, Droplets, Plus, Thermometer, WifiOff, Wind, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/network";
import { apiGet } from "../lib/axios";

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
      className="cursor-grab overflow-hidden rounded-2xl shadow-xl active:cursor-grabbing"
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <button
          onClick={() => onRemove(id)}
          className="absolute top-1.5 left-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700/80 transition-opacity"
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
  const [now, setNow] = useState(() => Temporal.Now.plainDateTimeISO());
  const { i18n } = useTranslation();

  useEffect(() => {
    const t = setInterval(() => setNow(Temporal.Now.plainDateTimeISO()), 1000);
    return () => clearInterval(t);
  }, []);

  const sec = now.second;
  const min = now.minute;
  const hr = now.hour % 12;
  const secDeg = sec * 6;
  const minDeg = min * 6 + sec * 0.1;
  const hrDeg = hr * 30 + min * 0.5;

  return (
    <div
      className="flex h-36 w-36 flex-col items-center justify-center gap-1"
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
      <p className="text-[11px] text-white opacity-60">
        {now.toLocaleString(i18n.language, {
          month: "short",
          day: "numeric",
          weekday: "short",
        })}
      </p>
    </div>
  );
}

// ─── WMO天気コードをアイコンに変換 ─────────────────────────────────────────────
const WMO_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

// ─── Open-Meteoレスポンスの型 ───────────────────────────────────────────────
interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
}

// ─── Weather Widget ───────────────────────────────────────────────────────────
function WeatherWidget() {
  const { isOnline } = useNetwork();
  const { t, i18n } = useTranslation();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({ lat: 37.5665, lon: 126.978 })
    );
  }, []);

  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["weather", coords?.lat, coords?.lon],
    queryFn: () =>
      apiGet<WeatherData>("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: coords!.lat,
          longitude: coords!.lon,
          current: "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m",
          daily: "temperature_2m_max,temperature_2m_min,weather_code",
          hourly: "temperature_2m,weather_code",
          timezone: "auto",
          forecast_days: 5,
          forecast_hours: 6,
        },
      }),
    enabled: !!coords && isOnline,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const { data: cityData } = useQuery({
    queryKey: ["city", coords?.lat, coords?.lon, i18n.language],
    queryFn: () =>
      apiGet<{ city: string; locality: string }>(
        "https://api.bigdatacloud.net/data/reverse-geocode-client",
        {
          params: {
            latitude: coords!.lat,
            longitude: coords!.lon,
            localityLanguage: i18n.language,
          },
        }
      ),
    enabled: !!coords && isOnline,
    staleTime: Infinity,
  });

  const cityName = cityData?.city || cityData?.locality || t("widgets.weather.location");

  const current = weather?.current;
  const daily = weather?.daily;
  const hourlyData = weather?.hourly;

  // 時間別データを整形
  const hourlyItems = hourlyData
    ? hourlyData.time.slice(0, 6).map((time, i) => ({
        time: i === 0 ? t("widgets.weather.now") : (time.split("T")[1]?.slice(0, 5) ?? ""),
        icon: WMO_ICONS[hourlyData.weather_code[i]] ?? "☁️",
        temp: Math.round(hourlyData.temperature_2m[i]),
      }))
    : [];

  // 5日間予報を整形
  const dailyItems = daily
    ? daily.time.map((date, i) => {
        const d = Temporal.PlainDate.from(date);
        return {
          day:
            i === 0
              ? t("widgets.calendar.today")
              : d.toLocaleString(i18n.language, { weekday: "short" }),
          icon: WMO_ICONS[daily.weather_code[i]] ?? "☁️",
          high: Math.round(daily.temperature_2m_max[i]),
          low: Math.round(daily.temperature_2m_min[i]),
        };
      })
    : [];

  if (!weather && !isOnline) {
    return (
      <div
        className="w-72 p-6 text-center"
        style={{ background: "rgba(80,80,80,0.88)", backdropFilter: "blur(20px)" }}
      >
        <WifiOff size={32} className="mx-auto mb-2 text-white/50" />
        <p className="text-[13px] font-semibold text-white/80">{t("widgets.weather.noData")}</p>
        <p className="mt-1 text-[11px] text-white/50">{t("widgets.weather.noDataDesc")}</p>
      </div>
    );
  }

  return (
    <div
      className="w-72 p-4"
      style={{
        background: "linear-gradient(160deg, rgba(30,120,220,0.88) 0%, rgba(80,160,255,0.88) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {!isOnline && (
        <div className="mb-2 flex items-center gap-1 rounded bg-black/25 px-2 py-1 text-[10px] text-white/90">
          <WifiOff size={10} />
          <span>{t("widgets.weather.staleBanner")}</span>
        </div>
      )}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-white/80">{cityName}</p>
          <span className="text-[52px] leading-none font-thin text-white">
            {current ? `${Math.round(current.temperature_2m)}°` : "--°"}
          </span>
          <p className="mt-0.5 text-[13px] text-white opacity-80">
            {current ? (WMO_ICONS[current.weather_code] ?? "☁️") : ""}{" "}
            {daily
              ? `${t("widgets.weather.high")} ${Math.round(daily.temperature_2m_max[0])}° ${t("widgets.weather.low")} ${Math.round(daily.temperature_2m_min[0])}°`
              : ""}
          </p>
        </div>
        <div className="mt-1 text-5xl">
          {current ? (WMO_ICONS[current.weather_code] ?? "☁️") : "⏳"}
        </div>
      </div>
      <div
        className="mb-3 flex items-center gap-3 rounded-xl p-2"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <div className="flex items-center gap-1">
          <Wind size={11} className="text-white/70" />
          <span className="text-[11px] text-white/80">
            {current ? `${current.wind_speed_10m} m/s` : "-- m/s"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets size={11} className="text-white/70" />
          <span className="text-[11px] text-white/80">
            {current ? `${current.relative_humidity_2m}%` : "--%"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer size={11} className="text-white/70" />
          <span className="text-[11px] text-white/80">
            {t("widgets.weather.feelsLike")}{" "}
            {current ? `${Math.round(current.temperature_2m)}°` : "--°"}
          </span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {hourlyItems.map((h) => (
          <div key={h.time} className="flex flex-shrink-0 flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/60">{h.time}</span>
            <span className="text-base">{h.icon}</span>
            <span className="text-[12px] font-medium text-white">{h.temp}°</span>
          </div>
        ))}
      </div>
      {/* 5日間予報 */}
      {dailyItems.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          {dailyItems.map((d) => (
            <div key={d.day} className="flex items-center justify-between py-0.5">
              <span className="w-8 text-[11px] text-white/70">{d.day}</span>
              <span className="text-base">{d.icon}</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-white/50">{d.low}°</span>
                <div
                  className="h-1 w-16 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #60a5fa, #f97316)",
                      width: "100%",
                    }}
                  />
                </div>
                <span className="text-[11px] text-white">{d.high}°</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Calendar Widget ─────────────────────────────────────────────────────────
function CalendarWidget() {
  const { t, i18n } = useTranslation();

  const today = Temporal.Now.plainDateISO();
  const year = today.year;
  const month = today.month;
  const date = today.day;

  const firstOfMonth = today.with({ day: 1 });
  const firstDay = firstOfMonth.dayOfWeek % 7; // 0: Sunday, 1: Monday, ..., 6: Saturday
  const daysInMonth = today.daysInMonth;
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
    const d = Temporal.PlainDate.from("2024-01-07").add({ days: i }); // 2024-01-07 is Sunday
    return d.toLocaleString(i18n.language, { weekday: "narrow" });
  });

  return (
    <div
      className="w-64 p-4"
      style={{
        background: "rgba(30,30,30,0.88)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-red-400 uppercase">
            {today.toLocaleString(i18n.language, { month: "long" })}
          </p>
          <p className="text-[28px] leading-none font-thin text-white">{date}</p>
        </div>
        <p className="text-[11px] text-white/40">{year}</p>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {weekdays.map((d, i) => (
          <div
            key={d + i}
            className="py-0.5 text-center text-[10px]"
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
          <div key={i} className="flex aspect-square items-center justify-center">
            {d !== null && (
              <div
                className="relative flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                style={{
                  background: d === date ? "#ff3b30" : "transparent",
                  color: d === date ? "white" : i % 7 === 0 ? "#ff6b6b" : "rgba(255,255,255,0.75)",
                }}
              >
                {d}
                {events[d] && d !== date && (
                  <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-400" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="mb-1.5 text-[10px] text-white/40">{t("widgets.calendar.upcoming")}</p>
        {Object.entries(events)
          .filter(([d]) => Number(d) >= date)
          .slice(0, 2)
          .map(([d, name]) => (
            <div key={d} className="mb-1 flex items-center gap-2">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
              <span className="text-[11px] text-white/70">
                {month}/{d} · {name}
              </span>
            </div>
          ))}
      </div>
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
      <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
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
      <div className="mb-3 flex items-center gap-2">
        <Activity size={13} className="text-green-400" />
        <p className="text-[12px] font-semibold text-white">{t("widgets.system.title")}</p>
      </div>
      {[
        { label: "CPU", value: cpu, color: "#30d158", unit: "%" },
        { label: t("widgets.system.memory"), value: mem, color: "#1d7af5", unit: "%" },
        { label: "GPU", value: gpu, color: "#bf5af2", unit: "%" },
        { label: t("widgets.system.network"), value: net, color: "#ff9f0a", unit: "MB/s" },
      ].map((item) => (
        <div key={item.label} className="mb-2.5">
          <div className="mb-1 flex justify-between">
            <span className="text-[10px] text-white/60">{item.label}</span>
            <span className="text-[10px] text-white/80">
              {item.value}
              {item.unit}
            </span>
          </div>
          <Bar value={item.value} color={item.color} />
        </div>
      ))}
      <div
        className="mt-3 flex justify-between pt-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="text-center">
          <p className="text-[9px] text-white/40">{t("widgets.system.disk")}</p>
          <p className="text-[11px] text-white">256 GB</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-white/40">{t("widgets.system.chipset")}</p>
          <p className="text-[11px] text-white">M4</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-white/40">{t("widgets.system.memory")}</p>
          <p className="text-[11px] text-white">16 GB</p>
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
    { id: "system", name: t("widgets.system.name"), icon: "📊", desc: t("widgets.system.desc") },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        className="fixed bottom-24 left-1/2 z-[70] w-80 -translate-x-1/2 rounded-2xl p-4"
        style={{
          background: "rgba(40,40,40,0.92)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
          animation: "slideUp 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-[14px] font-semibold text-white">{t("widgets.addWidget")}</p>
        <div className="space-y-1.5">
          {WIDGET_DEFS.map((w) => {
            const isActive = active.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => onAdd(w.id)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all"
                style={{
                  background: isActive ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-2xl">{w.icon}</span>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-white">{w.name}</p>
                  <p className="text-[11px] text-white/50">{w.desc}</p>
                </div>
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.15)" : "rgba(48,209,88,1)",
                  }}
                >
                  {isActive ? (
                    <span className="text-[14px] text-white/50">✓</span>
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
