import {
  Airplay,
  Battery,
  Monitor,
  Moon,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sun,
  Volume2,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/network";

const DEMO_SSID = "Network_5G";

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

function Slider({
  value,
  onChange,
  color = "#1d7af5",
}: {
  value: number;
  onChange: (v: number) => void;
  color?: string;
}) {
  return (
    <div className="relative h-1.5 w-full rounded-full bg-black/15">
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
        style={{ height: "100%" }}
      />
    </div>
  );
}

export function ControlCenter({ isOpen, onClose }: ControlCenterProps) {
  const { isOnline, setOnline } = useNetwork();
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [volume, setVolume] = useState(60);
  const [darkMode, setDarkMode] = useState(false);
  const [playing, setPlaying] = useState(true);
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[900]" onClick={onClose} />
      <div
        data-keep-focus
        className="fixed top-8 right-2 z-[901] w-80 rounded-2xl p-3"
        style={{
          background: "rgba(245,245,245,0.88)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
          animation: "slideDown 0.15s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Row 1: WiFi, Bluetooth, AirDrop, Focus */}
        <div className="mb-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.7)" }}>
            <button
              onClick={() => setOnline(!isOnline)}
              className="mb-2.5 flex w-full items-center gap-2.5"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: isOnline ? "#1d7af5" : "rgba(0,0,0,0.12)",
                }}
              >
                <Wifi size={14} className={isOnline ? "text-white" : "text-gray-500"} />
              </div>
              <div className="text-left">
                <p className="text-[12px] font-semibold text-gray-800">Wi-Fi</p>
                <p className="text-[10px] text-gray-500">
                  {isOnline ? DEMO_SSID : t("controlCenter.off")}
                </p>
              </div>
            </button>
            <div className="mb-2.5 h-px bg-gray-200" />
            <button
              onClick={() => setBluetooth(!bluetooth)}
              className="flex w-full items-center gap-2.5"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: bluetooth ? "#1d7af5" : "rgba(0,0,0,0.12)",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill={bluetooth ? "white" : "#888"}>
                  <path
                    d="M6.5 6.5l11 5-5.5 5.5V1l5.5 5.5-11 5"
                    strokeWidth="2"
                    stroke={bluetooth ? "white" : "#888"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[12px] font-semibold text-gray-800">Bluetooth</p>
                <p className="text-[10px] text-gray-500">
                  {bluetooth ? t("controlCenter.on") : t("controlCenter.off")}
                </p>
              </div>
            </button>
          </div>

          <div
            className="flex flex-col gap-2 rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <button onClick={() => setAirdrop(!airdrop)} className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: airdrop ? "#1d7af5" : "rgba(0,0,0,0.12)",
                }}
              >
                <Airplay size={14} className={airdrop ? "text-white" : "text-gray-500"} />
              </div>
              <div className="text-left">
                <p className="text-[12px] font-semibold text-gray-800">AirDrop</p>
                <p className="text-[10px] text-gray-500">
                  {airdrop ? t("controlCenter.everyone") : t("controlCenter.off")}
                </p>
              </div>
            </button>
            <div className="h-px bg-gray-200" />
            <button onClick={() => setFocusMode(!focusMode)} className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: focusMode ? "#30d158" : "rgba(0,0,0,0.12)",
                }}
              >
                <Moon size={14} className={focusMode ? "text-white" : "text-gray-500"} />
              </div>
              <div className="text-left">
                <p className="text-[12px] font-semibold text-gray-800">
                  {t("controlCenter.focusMode")}
                </p>
                <p className="text-[10px] text-gray-500">
                  {focusMode ? t("controlCenter.doNotDisturb") : t("controlCenter.off")}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Brightness */}
        <div className="mb-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.7)" }}>
          <div className="mb-2 flex items-center gap-2">
            <Sun size={14} className="flex-shrink-0 text-gray-500" />
            <span className="text-[12px] font-semibold text-gray-700">
              {t("controlCenter.brightness")}
            </span>
            <span className="ml-auto text-[11px] text-gray-400">{brightness}%</span>
          </div>
          <Slider value={brightness} onChange={setBrightness} color="#FFB800" />
        </div>

        {/* Volume */}
        <div className="mb-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.7)" }}>
          <div className="mb-2 flex items-center gap-2">
            <Volume2 size={14} className="flex-shrink-0 text-gray-500" />
            <span className="text-[12px] font-semibold text-gray-700">
              {t("controlCenter.sound")}
            </span>
            <span className="ml-auto text-[11px] text-gray-400">{volume}%</span>
          </div>
          <Slider value={volume} onChange={setVolume} color="#1d7af5" />
        </div>

        {/* Now Playing */}
        <div className="mb-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.7)" }}>
          <div className="mb-2 flex items-center gap-2">
            <Music size={12} className="text-gray-400" />
            <span className="text-[10px] tracking-wider text-gray-400 uppercase">
              {t("controlCenter.nowPlaying")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl"
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
              }}
            >
              🎵
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-gray-800">Dynamite</p>
              <p className="truncate text-[11px] text-gray-400">BTS</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-500 transition-colors hover:text-gray-800">
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ background: "rgba(0,0,0,0.08)" }}
              >
                {playing ? (
                  <Pause size={12} className="text-gray-700" />
                ) : (
                  <Play size={12} className="text-gray-700" />
                )}
              </button>
              <button className="text-gray-500 transition-colors hover:text-gray-800">
                <SkipForward size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex flex-col items-center gap-1 rounded-xl p-2 transition-colors"
            style={{
              background: darkMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
            }}
          >
            <Moon size={16} className={darkMode ? "text-white" : "text-gray-600"} />
            <span className="text-[10px]" style={{ color: darkMode ? "white" : "#555" }}>
              {t("controlCenter.darkMode")}
            </span>
          </button>
          <button
            className="flex flex-col items-center gap-1 rounded-xl p-2"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <Monitor size={16} className="text-gray-600" />
            <span className="text-[10px] text-gray-600">{t("controlCenter.mirroring")}</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 rounded-xl p-2"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <Battery size={16} className="text-green-500" />
            <span className="text-[10px] text-gray-600">85%</span>
          </button>
        </div>
      </div>
    </>
  );
}
