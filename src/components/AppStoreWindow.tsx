import { useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/network";
import { useState } from "react";
import { WifiOff } from "lucide-react";

function AppStoreOffline() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8" style={{ background: "#f5f5f7" }}>
      <div className="text-6xl mb-4">🛍️</div>
      <WifiOff size={40} className="text-gray-300 mb-4" />
      <h2 className="text-[18px] font-semibold text-gray-700 mb-2">
        Cannot connect to App Store
      </h2>
      <p className="text-[13px] text-gray-500 max-w-sm">
        An Internet connection is required. Check your Wi-Fi and try again.
      </p>
    </div>
  );
}

export function AppStoreWindow() {
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  if (!isOnline) return <AppStoreOffline />;

  const featured = [
    {
      name: "Figma",
      icon: "🎨",
      rating: "4.8",
      category: t("appStore.categoryLabels.design"),
      price: t("appStore.free"),
      color: "#a259ff",
    },
    {
      name: "Slack",
      icon: "💬",
      rating: "4.6",
      category: t("appStore.categoryLabels.work"),
      price: t("appStore.free"),
      color: "#4a154b",
    },
    {
      name: "Notion",
      icon: "📋",
      rating: "4.7",
      category: t("appStore.categoryLabels.productivity"),
      price: t("appStore.free"),
      color: "#000",
    },
    {
      name: "VS Code",
      icon: "💻",
      rating: "4.9",
      category: t("appStore.categoryLabels.dev"),
      price: t("appStore.free"),
      color: "#007acc",
    },
    {
      name: "Spotify",
      icon: "🎵",
      rating: "4.5",
      category: t("appStore.categoryLabels.music"),
      price: t("appStore.free"),
      color: "#1db954",
    },
    {
      name: "1Password",
      icon: "🔐",
      rating: "4.8",
      category: t("appStore.categoryLabels.utility"),
      price: "₩14,900",
      color: "#0076d1",
    },
  ];
  const [installed, setInstalled] = useState<string[]>([]);

  return (
    <div className="h-full flex" style={{ background: "#f5f5f7" }}>
      <div
        className="w-44 flex-shrink-0 pt-2"
        style={{
          background: "rgba(235,235,235,0.9)",
          borderRight: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {[
          {
            label: t("appStore.browse"),
            items: [
              t("appStore.today"),
              t("appStore.games"),
              t("appStore.apps"),
              t("appStore.arcade"),
            ],
          },
          {
            label: t("appStore.categories"),
            items: [
              t("appStore.devTools"),
              t("appStore.graphicDesign"),
              t("appStore.productivity"),
              t("appStore.utilities"),
            ],
          },
        ].map((sec) => (
          <div key={sec.label} className="mb-2">
            <p className="px-3 py-1 text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
              {sec.label}
            </p>
            {sec.items.map((item) => (
              <button
                key={item}
                className="w-full text-left px-4 py-1.5 text-[13px] text-gray-600 hover:bg-black/5 transition-colors rounded"
              >
                {item}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          <div
            className="rounded-2xl overflow-hidden mb-5 h-40 flex items-center justify-between px-8"
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            }}
          >
            <div className="text-white">
              <p className="text-[11px] opacity-60 uppercase tracking-wider mb-1">
                {t("appStore.editorsChoice")}
              </p>
              <p className="text-[22px] font-semibold leading-tight">
                {t("appStore.banner.year")}
                <br />
                {t("appStore.banner.title")}
              </p>
              <p className="text-[12px] opacity-60 mt-1">{t("appStore.banner.subtitle")}</p>
            </div>
            <div className="text-6xl">🚀</div>
          </div>

          <h3 className="text-[17px] text-gray-800 font-semibold mb-3">
            {t("appStore.popularFree")}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {featured.map((app, i) => (
              <div
                key={app.name}
                className="flex items-center gap-3 p-3 bg-white rounded-xl"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <span className="text-[13px] text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: app.color + "20" }}
                >
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800">{app.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {app.category} · ⭐ {app.rating}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setInstalled((prev) =>
                      prev.includes(app.name)
                        ? prev.filter((n) => n !== app.name)
                        : [...prev, app.name]
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                  style={{
                    background: installed.includes(app.name)
                      ? "rgba(0,0,0,0.06)"
                      : "rgba(0,100,255,0.1)",
                    color: installed.includes(app.name) ? "#555" : "#0064ff",
                  }}
                >
                  {installed.includes(app.name)
                    ? t("appStore.open")
                    : app.price === t("appStore.free")
                      ? t("appStore.get")
                      : app.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}