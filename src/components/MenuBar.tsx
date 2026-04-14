import { Battery, Globe, Search, Volume2, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/network";

interface MenuBarProps {
  onSpotlight: () => void;
  onControlCenter: () => void;
  activeApp: string;
}

function DropdownMenu({ items }: { items: (string | null)[] }) {
  return (
    <div
      className="absolute top-full left-0 mt-1 w-52 overflow-hidden rounded-xl py-1"
      style={{
        background: "rgba(238,238,238,0.94)",
        backdropFilter: "blur(40px) saturate(200%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%)",
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.08)",
      }}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="mx-2 my-1 h-px bg-gray-300/70" />
        ) : (
          <button
            key={i}
            className="mx-auto flex w-full items-center justify-between rounded-sm px-4 py-[5px] text-left text-[13px] text-gray-800 hover:bg-blue-500 hover:text-white"
            style={{ width: "calc(100% - 4px)", marginLeft: 2 }}
          >
            {item}
          </button>
        )
      )}
    </div>
  );
}

export function MenuBar({ onSpotlight, onControlCenter, activeApp }: MenuBarProps) {
  const [now, setNow] = useState(() => Temporal.Now.plainDateTimeISO());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const { t, i18n } = useTranslation();
  const { isOnline } = useNetwork();

  const langs = ["ko", "en", "ja"];

  useEffect(() => {
    const timer = setInterval(() => setNow(Temporal.Now.plainDateTimeISO()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (dt: Temporal.PlainDateTime) =>
    dt.toLocaleString(i18n.language, { hour: "2-digit", minute: "2-digit", hour12: false });

  const formatDate = (dt: Temporal.PlainDateTime) =>
    dt.toLocaleString(i18n.language, { month: "short", day: "numeric", weekday: "short" });

  const menuItems: Record<string, string[]> = {
    Finder: [
      t("menu.app.file"),
      t("menu.app.edit"),
      t("menu.app.view"),
      t("menu.app.go"),
      t("menu.app.window"),
      t("menu.app.help"),
    ],
  };

  const appleMenuItems = [
    { label: t("menu.apple.aboutMac"), divider: false },
    { label: null, divider: true },
    { label: t("menu.apple.preferences"), divider: false },
    { label: t("menu.apple.appStore"), divider: false },
    { label: null, divider: true },
    { label: t("menu.apple.recentItems"), divider: false },
    { label: null, divider: true },
    { label: t("menu.apple.forceQuit"), divider: false },
    { label: null, divider: true },
    { label: t("menu.apple.sleep"), divider: false },
    { label: t("menu.apple.restart"), divider: false },
    { label: t("menu.apple.shutdown"), divider: false },
    { label: null, divider: true },
    { label: t("menu.apple.lockScreen"), divider: false },
    { label: t("menu.apple.logout"), divider: false },
  ];

  const appSubMenus: (string | null)[] = [
    t("menu.sub.newWindow"),
    t("menu.sub.newTab"),
    t("menu.sub.open"),
    null,
    t("menu.sub.save"),
    t("menu.sub.saveAs"),
    null,
    t("menu.sub.close"),
  ];

  const currentMenus = menuItems[activeApp] ?? menuItems["Finder"];

  const closeAll = () => {
    setOpenMenu(null);
    setShowAppleMenu(false);
  };

  return (
    <>
      {(openMenu || showAppleMenu) && <div className="fixed inset-0 z-40" onClick={closeAll} />}

      <div
        className="fixed top-0 right-0 left-0 z-50 flex h-7 items-center justify-between px-2"
        style={{
          background: "rgba(255,255,255,0.16)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        {/* Left side */}
        <div className="flex items-center gap-0">
          {/* Apple Logo */}
          <div className="relative">
            <button
              className="flex h-7 items-center rounded px-2 transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setShowAppleMenu(!showAppleMenu);
                setOpenMenu(null);
              }}
            >
              <svg width="13" height="16" viewBox="0 0 13 16" fill="white">
                <path d="M11.39 8.13c-.02-1.94 1.59-2.88 1.66-2.92-0.91-1.33-2.32-1.51-2.81-1.53-1.19-.12-2.32.7-2.92.7-.6 0-1.52-.68-2.5-.66-1.28.02-2.47.75-3.12 1.89-1.33 2.3-.34 5.72.95 7.59.63.91 1.38 1.93 2.37 1.89.95-.04 1.31-.61 2.46-.61 1.14 0 1.47.61 2.47.59 1.02-.02 1.67-.93 2.29-1.84.73-1.05 1.03-2.07 1.04-2.12-.02-.01-1.97-.76-1.99-2.98z" />
                <path d="M9.37 2.18c.53-.64.88-1.53.78-2.42-.75.03-1.67.5-2.21 1.13-.49.56-.91 1.46-.8 2.33.84.06 1.7-.43 2.23-1.04z" />
              </svg>
            </button>
            {showAppleMenu && (
              <div
                className="absolute top-full left-0 z-[60] mt-1 w-56 overflow-hidden rounded-xl py-1"
                style={{
                  background: "rgba(238,238,238,0.94)",
                  backdropFilter: "blur(40px) saturate(200%)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.08)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {appleMenuItems.map((item, i) =>
                  item.divider ? (
                    <div key={i} className="mx-2 my-1 h-px bg-gray-300/70" />
                  ) : (
                    <button
                      key={i}
                      className="block w-full px-4 py-[5px] text-left text-[13px] text-gray-800 hover:bg-blue-500 hover:text-white"
                      onClick={closeAll}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Active App Name */}
          <button className="flex h-7 items-center rounded px-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/20">
            {activeApp}
          </button>

          {/* App Menus */}
          <div className="hidden items-center md:flex">
            {currentMenus.map((menu) => (
              <div key={menu} className="relative">
                <button
                  className="flex h-7 items-center rounded px-2 text-[13px] text-white transition-colors"
                  style={{
                    background: openMenu === menu ? "rgba(255,255,255,0.22)" : "transparent",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(openMenu === menu ? null : menu);
                    setShowAppleMenu(false);
                  }}
                >
                  {menu}
                </button>
                {openMenu === menu && (
                  <div className="relative z-[60]" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu items={appSubMenus} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center">
          <button
            className="hidden h-7 items-center rounded px-2 transition-colors hover:bg-white/20 sm:flex"
            onClick={(e) => {
              e.stopPropagation();
              closeAll();
              onSpotlight();
            }}
          >
            <Search size={13} className="text-white" />
          </button>

          <button
            className="hidden h-7 items-center rounded px-2 transition-colors hover:bg-white/20 sm:flex"
            onClick={(e) => {
              e.stopPropagation();
              closeAll();
              const next = langs[(langs.indexOf(i18n.language) + 1) % langs.length];
              i18n.changeLanguage(next);
            }}
          >
            <Globe size={13} className="text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeAll();
              onControlCenter();
            }}
            className="hidden h-7 items-center gap-1.5 rounded px-2 transition-colors hover:bg-white/20 sm:flex"
          >
            {isOnline ? (
              <Wifi size={13} className="text-white" />
            ) : (
              <WifiOff size={13} className="text-white" />
            )}
            <Volume2 size={13} className="text-white" />
            <Battery size={13} className="text-white" />
          </button>

          <button
            className="flex h-7 items-center rounded px-2 transition-colors hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              closeAll();
              onControlCenter();
            }}
          >
            <span className="text-[12px] font-medium text-white">
              <span className="hidden sm:inline">{formatDate(now)}&nbsp;&nbsp;</span>
              {formatTime(now)}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
