import {
  ChevronLeft,
  ChevronRight,
  Download,
  Film,
  Grid,
  HardDrive,
  Home,
  Image,
  List,
  Music,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function FinderWindow() {
  const [view, setView] = useState<"grid" | "list">("list");
  const [selected, setSelected] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("downloads");
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();

  const sidebarItems = [
    {
      section: t("finder.sidebar.favorites"),
      items: [
        {
          key: "airdrop",
          name: t("finder.sidebar.airdrop"),
          icon: <span className="text-blue-500">📡</span>,
        },
        {
          key: "recent",
          name: t("finder.sidebar.recent"),
          icon: <span className="text-gray-500">🕐</span>,
        },
        { key: "applications", name: t("finder.sidebar.applications"), icon: <span>🗂️</span> },
        {
          key: "desktop",
          name: t("finder.sidebar.desktop"),
          icon: <Home size={14} className="text-blue-400" />,
        },
        {
          key: "downloads",
          name: t("finder.sidebar.downloads"),
          icon: <Download size={14} className="text-blue-400" />,
        },
        {
          key: "photos",
          name: t("finder.sidebar.photos"),
          icon: <Image size={14} className="text-blue-400" />,
        },
        {
          key: "music",
          name: t("finder.sidebar.music"),
          icon: <Music size={14} className="text-blue-400" />,
        },
        {
          key: "videos",
          name: t("finder.sidebar.videos"),
          icon: <Film size={14} className="text-blue-400" />,
        },
      ],
    },
    {
      section: t("finder.sidebar.locations"),
      items: [
        {
          key: "macintoshHD",
          name: t("finder.sidebar.macintoshHD"),
          icon: <HardDrive size={14} className="text-gray-500" />,
        },
        {
          key: "network",
          name: t("finder.sidebar.network"),
          icon: <span className="text-gray-500">🌐</span>,
        },
      ],
    },
    {
      section: t("finder.sidebar.tags"),
      items: [
        {
          key: "red",
          name: t("finder.tags.red"),
          icon: <div className="h-3 w-3 rounded-full bg-red-500" />,
        },
        {
          key: "orange",
          name: t("finder.tags.orange"),
          icon: <div className="h-3 w-3 rounded-full bg-orange-400" />,
        },
        {
          key: "yellow",
          name: t("finder.tags.yellow"),
          icon: <div className="h-3 w-3 rounded-full bg-yellow-400" />,
        },
        {
          key: "green",
          name: t("finder.tags.green"),
          icon: <div className="h-3 w-3 rounded-full bg-green-500" />,
        },
        {
          key: "blue",
          name: t("finder.tags.blue"),
          icon: <div className="h-3 w-3 rounded-full bg-blue-500" />,
        },
      ],
    },
  ];

  const files = [
    {
      name: t("finder.files.photos"),
      icon: "📸",
      type: "folder",
      modified: t("finder.time.todayMorning", { time: "10:30" }),
      size: "-",
    },
    {
      name: t("finder.files.projects"),
      icon: "📁",
      type: "folder",
      modified: t("finder.time.yesterday"),
      size: "-",
    },
    {
      name: t("finder.files.downloads"),
      icon: "📥",
      type: "folder",
      modified: t("finder.time.yesterday"),
      size: "-",
    },
    {
      name: t("finder.files.documents"),
      icon: "📄",
      type: "folder",
      modified: t("finder.time.daysAgo", { count: 2 }),
      size: "-",
    },
    {
      name: t("finder.files.report"),
      icon: "📕",
      type: "file",
      modified: t("finder.time.todayMorning", { time: "9:12" }),
      size: "2.4 MB",
    },
    {
      name: t("finder.files.presentation"),
      icon: "📊",
      type: "file",
      modified: t("finder.time.yesterday"),
      size: "8.1 MB",
    },
    {
      name: t("finder.files.note"),
      icon: "📝",
      type: "file",
      modified: t("finder.time.daysAgo", { count: 3 }),
      size: "12 KB",
    },
    {
      name: t("finder.files.photo001"),
      icon: "🖼️",
      type: "file",
      modified: t("finder.time.lastWeek"),
      size: "4.2 MB",
    },
    {
      name: t("finder.files.music"),
      icon: "🎵",
      type: "file",
      modified: t("finder.time.lastWeek"),
      size: "6.8 MB",
    },
    {
      name: t("finder.files.video"),
      icon: "🎬",
      type: "file",
      modified: t("finder.time.lastMonth"),
      size: "256 MB",
    },
  ];

  const filtered = searchValue
    ? files.filter((f) => f.name.toLowerCase().includes(searchValue.toLowerCase()))
    : files;

  return (
    <div className="flex h-full" style={{ background: "#f5f5f5" }}>
      {/* Sidebar */}
      <div
        className="flex w-44 flex-shrink-0 flex-col overflow-y-auto pt-2"
        style={{
          background: "rgba(235,235,235,0.9)",
          borderRight: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {sidebarItems.map((section) => (
          <div key={section.section} className="mb-2">
            <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              {section.section}
            </div>
            {section.items.map((item) => (
              <button
                key={item.key}
                className="mx-1 flex w-full items-center gap-2 rounded-md px-3 py-1 text-left transition-colors"
                style={{
                  width: "calc(100% - 8px)",
                  background: activeSection === item.key ? "rgba(0,100,255,0.15)" : "transparent",
                  color: activeSection === item.key ? "#0064ff" : "#3d3d3d",
                }}
                onClick={() => setActiveSection(item.key)}
              >
                <span className="flex items-center text-[13px]">{item.icon}</span>
                <span className="truncate text-[12px]">{item.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <div
          className="flex flex-shrink-0 items-center gap-2 px-3 py-2"
          style={{
            background: "rgba(235,235,235,0.95)",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <button className="rounded p-1 text-gray-500 transition-colors hover:bg-black/10">
            <ChevronLeft size={16} />
          </button>
          <button className="rounded p-1 text-gray-400 transition-colors hover:bg-black/10">
            <ChevronRight size={16} />
          </button>

          <div className="ml-2 flex items-center gap-1">
            <button
              onClick={() => setView("grid")}
              className="rounded p-1 transition-colors"
              style={{
                background: view === "grid" ? "rgba(0,0,0,0.12)" : "transparent",
              }}
            >
              <Grid size={15} className="text-gray-600" />
            </button>
            <button
              onClick={() => setView("list")}
              className="rounded p-1 transition-colors"
              style={{
                background: view === "list" ? "rgba(0,0,0,0.12)" : "transparent",
              }}
            >
              <List size={15} className="text-gray-600" />
            </button>
          </div>

          <div
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1"
            style={{ background: "rgba(0,0,0,0.08)" }}
          >
            <Search size={12} className="text-gray-400" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("finder.toolbar.search")}
              className="w-24 bg-transparent text-[12px] text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Path */}
        <div
          className="flex items-center gap-1 px-4 py-1.5 text-[11px] text-gray-500"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <span>{t("finder.sidebar.macintoshHD")}</span>
          <span>›</span>
          <span>{t("finder.path.users")}</span>
          <span>›</span>
          <span className="font-medium text-gray-700">{t("finder.path.userFolder")}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === "list" ? (
            <table className="w-full">
              <thead>
                <tr
                  className="text-[11px] text-gray-400"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <th className="pb-1 pl-1 text-left font-medium">{t("finder.table.name")}</th>
                  <th className="hidden pb-1 text-left font-medium sm:table-cell">
                    {t("finder.table.modified")}
                  </th>
                  <th className="hidden pb-1 text-left font-medium sm:table-cell">
                    {t("finder.table.size")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((file) => (
                  <tr
                    key={file.name}
                    className="cursor-pointer rounded"
                    style={{
                      background: selected === file.name ? "rgba(0,100,255,0.15)" : "transparent",
                    }}
                    onClick={() => setSelected(file.name)}
                    onDoubleClick={() => setSelected(null)}
                  >
                    <td className="py-1 pl-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{file.icon}</span>
                        <span className="text-[13px] text-gray-800">{file.name}</span>
                      </div>
                    </td>
                    <td className="hidden py-1 text-[11px] text-gray-500 sm:table-cell">
                      {file.modified}
                    </td>
                    <td className="hidden py-1 text-[11px] text-gray-500 sm:table-cell">
                      {file.size}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((file) => (
                <button
                  key={file.name}
                  className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors"
                  style={{
                    background: selected === file.name ? "rgba(0,100,255,0.15)" : "transparent",
                  }}
                  onClick={() => setSelected(file.name)}
                >
                  <span className="text-4xl">{file.icon}</span>
                  <span className="text-center text-[11px] leading-tight text-gray-700">
                    {file.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div
          className="flex justify-between px-4 py-1.5 text-[11px] text-gray-500"
          style={{
            borderTop: "1px solid rgba(0,0,0,0.06)",
            background: "rgba(240,240,240,0.5)",
          }}
        >
          <span>{t("finder.status.items", { count: filtered.length })}</span>
          <span>{t("finder.status.free")}</span>
        </div>
      </div>
    </div>
  );
}
