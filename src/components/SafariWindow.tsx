import { ChevronLeft, ChevronRight, Lock, Plus, RefreshCw, Share } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/network";
import { DinoGame } from "./dino/DinoGame";

function OfflinePage({
  url,
  isActive,
  visible,
}: {
  url: string;
  isActive: boolean;
  visible: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="flex h-full flex-col items-center bg-white px-12 py-8 select-none"
      style={{ display: visible ? "flex" : "none" }}
    >
      <div className="flex w-full max-w-[600px] flex-col items-center text-center">
        {/* 게임 영역 (공룡) */}
        <div className="mb-8 w-full">
          <DinoGame isActive={isActive} />
        </div>

        {/* 오프라인 안내 문구 */}
        <h2 className="mb-3 text-[22px] font-normal text-gray-800">
          {t("safari.offline.title")}
        </h2>
        <p className="mb-1 text-[13px] leading-relaxed text-gray-600">
          {t("safari.offline.description")}
        </p>
        <p className="text-[12px] text-gray-400">
          {t("safari.offline.connectingTo")}{" "}
          <span className="font-mono">{url || t("safari.offline.fallbackServer")}</span>
        </p>
        <p className="mt-4 text-[11px] text-gray-400">
          <Trans
            i18nKey="safari.offline.pressSpace"
            components={{
              1: (
                <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono" />
              ),
            }}
          />
        </p>
      </div>
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

interface SafariWindowProps {
  /** 현재 활성 앱 이름 (예: "Safari") — DinoGame pause/resume에 사용 */
  activeApp?: string;
}

export function SafariWindow({ activeApp }: SafariWindowProps = {}) {
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
    <div className="flex h-full flex-col" style={{ background: "#f5f5f5" }}>
      {/* Tabs */}
      <div
        className="flex h-9 items-center gap-0.5 overflow-x-auto px-2"
        style={{
          background: "rgba(228,228,228,0.95)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabs((prev) => prev.map((x) => ({ ...x, active: x.id === tab.id })))}
            className="flex max-w-[180px] min-w-[120px] flex-shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-1 text-[12px] transition-colors"
            style={{
              background: tab.active ? "rgba(255,255,255,0.9)" : "transparent",
              color: tab.active ? "#333" : "#888",
              boxShadow: tab.active ? "0 1px 0 white" : "none",
            }}
          >
            <span className="flex-1 truncate text-left">{tab.title}</span>
            <span
              className="flex-shrink-0 text-[10px] text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setTabs((prev) => prev.filter((x) => x.id !== tab.id));
              }}
            >
              ×
            </span>
          </button>
        ))}
        <button
          className="ml-1 rounded p-1 transition-colors hover:bg-black/10"
          onClick={() =>
            setTabs((prev) => [
              ...prev.map((x) => ({ ...x, active: false })),
              {
                id: Temporal.Now.instant().epochMilliseconds,
                title: t("safari.newTab"),
                url: "",
                active: true,
              },
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
        <button className="rounded p-1 text-gray-400 hover:bg-black/10">
          <ChevronLeft size={16} />
        </button>
        <button className="rounded p-1 text-gray-400 hover:bg-black/10">
          <ChevronRight size={16} />
        </button>
        <button className="rounded p-1 text-gray-500 hover:bg-black/10">
          <RefreshCw size={14} />
        </button>

        <div
          className="flex flex-1 cursor-text items-center gap-2 rounded-lg px-3 py-1.5"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
          onClick={() => setIsEditing(true)}
        >
          <Lock size={11} className="flex-shrink-0 text-gray-400" />
          {isEditing ? (
            <input
              autoFocus
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditing(false);
              }}
              className="flex-1 bg-transparent text-center text-[13px] text-gray-700 outline-none"
            />
          ) : (
            <span className="flex-1 truncate text-center text-[13px] text-gray-700">
              {inputUrl}
            </span>
          )}
        </div>

        <button className="rounded p-1 text-gray-500 hover:bg-black/10">
          <Share size={14} />
        </button>
        <button className="rounded p-1 text-gray-500 hover:bg-black/10">
          <Plus size={14} />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div
        className="flex items-center gap-1 overflow-x-auto px-3 py-1"
        style={{
          background: "rgba(235,235,235,0.7)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {bookmarks.map((bm) => (
          <button
            key={bm.name}
            className="flex flex-shrink-0 items-center gap-1.5 rounded px-2 py-0.5 transition-colors hover:bg-black/10"
          >
            <span className="text-[13px]">{bm.icon}</span>
            <span className="hidden text-[11px] text-gray-600 sm:block">{bm.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: "white" }}>
        {isOnline ? (
          <div className="mx-auto max-w-3xl p-6">
            {/* Favorites */}
            <div className="mb-8">
              <h3 className="mb-3 text-[14px] font-semibold text-gray-500">
                {t("safari.favorites")}
              </h3>
              <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                {bookmarks.map((bm) => (
                  <button key={bm.name} className="group flex flex-col items-center gap-1.5">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm transition-shadow group-hover:shadow-md"
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
              className="mb-6 rounded-xl p-4"
              style={{
                background: "rgba(0,100,255,0.06)",
                border: "1px solid rgba(0,100,255,0.12)",
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <Lock size={14} className="text-blue-500" />
                <span className="text-[13px] font-semibold text-blue-600">
                  {t("safari.privacyReport")}
                </span>
              </div>
              <p className="text-[12px] text-gray-500">
                <Trans
                  i18nKey="safari.privacyText"
                  values={{ count: 148 }}
                  components={{ 1: <strong /> }}
                />
              </p>
            </div>

            {/* News */}
            <div>
              <h3 className="mb-3 text-[14px] font-semibold text-gray-500">
                {t("safari.topNews")}
              </h3>
              <div className="space-y-3">
                {news.map((article) => (
                  <div
                    key={article.title}
                    className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
                    style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-2xl"
                      style={{ background: "rgba(0,0,0,0.05)" }}
                    >
                      {article.image}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-gray-800">{article.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-medium text-blue-500">
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
          // 탭별 독립 DinoGame 인스턴스 — 각 탭의 점수/상태를 유지.
          // 비활성 탭은 display:none으로 숨기되 mount는 유지.
          // URL 바 편집 중(isEditing)엔 키 충돌 방지를 위해 게임 lock.
          tabs.map((tab) => (
            <OfflinePage
              key={tab.id}
              url={inputUrl}
              isActive={activeApp === "Safari" && tab.active && !isEditing}
              visible={tab.active}
            />
          ))
        )}
      </div>
    </div>
  );
}
