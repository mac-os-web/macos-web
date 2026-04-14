import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Lock, Plus, Share, WifiOff } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/network";

function OfflinePage({ url }: { url: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12 select-none">
      <div className="text-7xl mb-6" aria-hidden>🦖</div>
      <WifiOff size={48} className="text-gray-300 mb-4" />
      <h2 className="text-[20px] font-semibold text-gray-700 mb-2">
        {t("safari.offline.title")}
      </h2>
      <p className="text-[13px] text-gray-500 mb-1">
        {t("safari.offline.description")}
      </p>
      <p className="text-[12px] text-gray-400 mb-8">
        {t("safari.offline.connectingTo")}{" "}
        <span className="font-mono">{url || t("safari.offline.fallbackServer")}</span>
      </p>
      <p className="text-[11px] text-gray-400">
        <Trans
          i18nKey="safari.offline.pressSpace"
          components={{
            1: <kbd className="px-1.5 py-0.5 rounded border border-gray-300 bg-gray-50 font-mono" />,
          }}
        />
      </p>
    </div>
  );
}

const bookmarks = [
  { name: "Apple", url: "apple.com", icon: "🍎" },
  { name: "GitHub", url: "github.com", icon: "🐙" },
  { name: "YouTube", url: "youtube.com", icon: "📺" },
  { name: "Gmail", url: "gmail.com", icon: "✉️" },
  { name: "Maps", url: "maps.apple.com", icon: "🗺️" },
  { name: "News", url: "news.apple.com", icon: "📰" },
];

export function SafariWindow() {
  const [inputUrl, setInputUrl] = useState("apple.com");
  const [isEditing, setIsEditing] = useState(false);
  const [tabs, setTabs] = useState([
    { id: 1, title: "Apple", url: "apple.com", active: true },
    { id: 2, title: "GitHub", url: "github.com", active: false },
  ]);
  const { t } = useTranslation();
const { isOnline } = useNetwork();

  const news = [
    {
      title: t("safari.news.m4chip"),
      category: t("safari.categories.tech"),
      time: t("safari.time.hoursAgo", { count: 2 }),
      image: "🖥️",
    },
    {
      title: t("safari.news.sequoia"),
      category: t("safari.categories.software"),
      time: t("safari.time.hoursAgo", { count: 4 }),
      image: "📱",
    },
    {
      title: t("safari.news.ai"),
      category: t("safari.categories.ai"),
      time: t("safari.time.hoursAgo", { count: 6 }),
      image: "🤖",
    },
    {
      title: t("safari.news.macbook"),
      category: t("safari.categories.review"),
      time: t("safari.time.yesterday"),
      image: "💻",
    },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "#f5f5f5" }}>
      {/* Tabs */}
      <div
        className="flex items-center h-9 px-2 gap-0.5 overflow-x-auto"
        style={{
          background: "rgba(228,228,228,0.95)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === tab.id })))}
            className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg text-[12px] min-w-[120px] max-w-[180px] flex-shrink-0 transition-colors"
            style={{
              background: tab.active ? "rgba(255,255,255,0.9)" : "transparent",
              color: tab.active ? "#333" : "#888",
              boxShadow: tab.active ? "0 1px 0 white" : "none",
            }}
          >
            <span className="truncate flex-1 text-left">{tab.title}</span>
            <span
              className="text-[10px] text-gray-400 hover:text-gray-600 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setTabs((prev) => prev.filter((t) => t.id !== tab.id));
              }}
            >
              ×
            </span>
          </button>
        ))}
        <button
          className="p-1 rounded hover:bg-black/10 transition-colors ml-1"
          onClick={() =>
            setTabs((prev) => [
              ...prev.map((t) => ({ ...t, active: false })),
              { id: Date.now(), title: t("safari.newTab"), url: "", active: true },
            ])
          }
        >
          <Plus size={13} className="text-gray-500" />
        </button>
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          background: "rgba(235,235,235,0.95)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <button className="p-1 rounded hover:bg-black/10 text-gray-400">
          <ChevronLeft size={16} />
        </button>
        <button className="p-1 rounded hover:bg-black/10 text-gray-400">
          <ChevronRight size={16} />
        </button>
        <button className="p-1 rounded hover:bg-black/10 text-gray-500">
          <RefreshCw size={14} />
        </button>

        <div
          className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-text"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
          onClick={() => setIsEditing(true)}
        >
          <Lock size={11} className="text-gray-400 flex-shrink-0" />
          {isEditing ? (
            <input
              autoFocus
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditing(false);
              }}
              className="flex-1 bg-transparent outline-none text-[13px] text-gray-700 text-center"
            />
          ) : (
            <span className="flex-1 text-[13px] text-gray-700 text-center truncate">
              {inputUrl}
            </span>
          )}
        </div>

        <button className="p-1 rounded hover:bg-black/10 text-gray-500">
          <Share size={14} />
        </button>
        <button className="p-1 rounded hover:bg-black/10 text-gray-500">
          <Plus size={14} />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div
        className="flex items-center gap-1 px-3 py-1 overflow-x-auto"
        style={{
          background: "rgba(235,235,235,0.7)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {bookmarks.map((bm) => (
          <button
            key={bm.name}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-black/10 transition-colors flex-shrink-0"
          >
            <span className="text-[13px]">{bm.icon}</span>
            <span className="text-[11px] text-gray-600 hidden sm:block">{bm.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: "white" }}>
        {isOnline ? (
        <div className="p-6 max-w-3xl mx-auto">
          {/* Favorites */}
          <div className="mb-8">
            <h3 className="text-[14px] text-gray-500 mb-3 font-semibold">
              {t("safari.favorites")}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {bookmarks.map((bm) => (
                <button key={bm.name} className="flex flex-col items-center gap-1.5 group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-shadow"
                    style={{ background: "rgba(0,0,0,0.05)" }}
                  >
                    {bm.icon}
                  </div>
                  <span className="text-[11px] text-gray-600">{bm.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Report */}
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              background: "rgba(0,100,255,0.06)",
              border: "1px solid rgba(0,100,255,0.12)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Lock size={14} className="text-blue-500" />
              <span className="text-[13px] text-blue-600 font-semibold">
                {t("safari.privacyReport")}
              </span>
            </div>
            <p
              className="text-[12px] text-gray-500"
              dangerouslySetInnerHTML={{
                __html: t("safari.privacyText", { count: 148 }),
              }}
            />
          </div>

          {/* News */}
          <div>
            <h3 className="text-[14px] text-gray-500 mb-3 font-semibold">{t("safari.topNews")}</h3>
            <div className="space-y-3">
              {news.map((article) => (
                <div
                  key={article.title}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "rgba(0,0,0,0.05)" }}
                  >
                    {article.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-800 leading-snug">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-blue-500 font-medium">
                        {article.category}
                      </span>
                      <span className="text-[10px] text-gray-400">{article.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        ) : (
          <OfflinePage url={inputUrl} />
        )}
      </div>
    </div>
  );
}
