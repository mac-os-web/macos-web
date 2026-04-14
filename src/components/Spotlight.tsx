import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: string) => void;
}

export function Spotlight({ isOpen, onClose, onOpenApp }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const suggestions = [
    {
      category: t("spotlight.categories.apps"),
      items: [
        { id: "finder", name: "Finder", names: ["Finder"], icon: "🗂️" },
        { id: "safari", name: "Safari", names: ["Safari"], icon: "🧭" },
        { id: "notes", name: t("dock.notes"), names: ["메모", "Notes", "メモ"], icon: "📝" },
        {
          id: "terminal",
          name: t("dock.terminal"),
          names: ["터미널", "Terminal", "ターミナル"],
          icon: "⬛",
        },
        { id: "appstore", name: "App Store", names: ["App Store"], icon: "🛍️" },
        { id: "mail", name: "Mail", names: ["Mail", "메일"], icon: "✉️" },
      ],
    },
    {
      category: t("spotlight.categories.recent"),
      items: [
        {
          id: "notes",
          name: t("spotlight.recentItems.todoList"),
          names: ["오늘의 할 일 목록", "Today's To-Do List", "今日のToDoリスト"],
          icon: "📄",
        },
        {
          id: "finder",
          name: t("spotlight.recentItems.downloads"),
          names: ["다운로드", "Downloads", "ダウンロード"],
          icon: "📁",
        },
      ],
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const allItems = suggestions.flatMap((s) => s.items);
  const filtered = query
    ? allItems.filter((item) =>
        item.names.some((n) => n.toLowerCase().includes(query.toLowerCase()))
      )
    : allItems.slice(0, 6);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelected((s) => Math.min(s + 1, filtered.length - 1));
      if (e.key === "ArrowUp") setSelected((s) => Math.max(s - 1, 0));
      if (e.key === "Enter" && filtered[selected]) {
        onOpenApp(filtered[selected].id);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, filtered, selected, onClose, onOpenApp]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={onClose}
      style={{ animation: "fadeIn 0.15s ease-out" }}
    >
      <div
        className="w-[90vw] max-w-[620px] overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
          animation: "slideDown 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-gray-200/50 px-5 py-4">
          <Search size={20} className="flex-shrink-0 text-gray-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder={t("spotlight.placeholder")}
            className="flex-1 bg-transparent text-[17px] text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>

        {/* Results */}
        {filtered.length > 0 && (
          <div className="max-h-[50vh] overflow-y-auto py-2">
            {!query
              ? suggestions.map((section) => (
                  <div key={section.category}>
                    <div className="px-5 py-1 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                      {section.category}
                    </div>
                    {section.items.map((item, i) => {
                      const globalIndex = allItems.findIndex((a) => a === item);
                      return (
                        <button
                          key={item.id + i}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors"
                          style={{
                            background:
                              selected === globalIndex ? "rgba(0,106,255,0.85)" : "transparent",
                            color: selected === globalIndex ? "white" : "inherit",
                          }}
                          onMouseEnter={() => setSelected(globalIndex)}
                          onClick={() => {
                            onOpenApp(item.id);
                            onClose();
                          }}
                        >
                          <span className="w-8 text-center text-2xl">{item.icon}</span>
                          <span
                            className="text-[14px]"
                            style={{
                              color: selected === globalIndex ? "white" : "#1a1a1a",
                            }}
                          >
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              : filtered.map((item, i) => (
                  <button
                    key={item.id + i}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors"
                    style={{
                      background: selected === i ? "rgba(0,106,255,0.85)" : "transparent",
                    }}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => {
                      onOpenApp(item.id);
                      onClose();
                    }}
                  >
                    <span className="w-8 text-center text-2xl">{item.icon}</span>
                    <span
                      className="text-[14px]"
                      style={{ color: selected === i ? "white" : "#1a1a1a" }}
                    >
                      {item.name}
                    </span>
                  </button>
                ))}
          </div>
        )}

        {filtered.length === 0 && query && (
          <div className="py-8 text-center text-[14px] text-gray-500">
            {t("spotlight.noResults", { query })}
          </div>
        )}
      </div>
    </div>
  );
}
