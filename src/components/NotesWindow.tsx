import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function NotesWindow() {
  const { t } = useTranslation();

  const [notes, setNotes] = useState([
    {
      id: 1,
      title: t("notes.sample.todo.title"),
      content: t("notes.sample.todo.content"),
      date: t("finder.time.todayMorning", { time: "10:30" }),
      pinned: true,
    },
    {
      id: 2,
      title: t("notes.sample.ideas.title"),
      content: t("notes.sample.ideas.content"),
      date: t("finder.time.yesterday"),
      pinned: false,
    },
    {
      id: 3,
      title: t("notes.sample.meeting.title"),
      content: t("notes.sample.meeting.content"),
      date: t("finder.time.yesterday"),
      pinned: false,
    },
    {
      id: 4,
      title: t("notes.sample.shopping.title"),
      content: t("notes.sample.shopping.content"),
      date: t("finder.time.daysAgo", { count: 2 }),
      pinned: false,
    },
  ]);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState("");

  const selectedNote = notes.find((n) => n.id === selectedId);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: t("notes.newNote"),
      content: "",
      date: t("notes.justNow"),
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(notes[0]?.id || 0);
  };

  const updateContent = (content: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? {
              ...n,
              content,
              title: content.split("\n")[0] || t("notes.newNote"),
              date: t("notes.justNow"),
            }
          : n
      )
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className="flex w-52 flex-shrink-0 flex-col"
        style={{
          background: "rgba(242,238,230,0.95)",
          borderRight: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <span className="text-[12px] font-semibold text-gray-500">{t("notes.title")}</span>
          <button onClick={addNote} className="rounded p-1 transition-colors hover:bg-black/10">
            <Plus size={14} className="text-gray-600" />
          </button>
        </div>

        <div className="px-2 py-1.5">
          <div
            className="flex items-center gap-1.5 rounded-lg px-2 py-1"
            style={{ background: "rgba(0,0,0,0.08)" }}
          >
            <Search size={11} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("notes.search")}
              className="flex-1 bg-transparent text-[12px] text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {search === "" && notes.some((n) => n.pinned) && (
            <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase">
              {t("notes.pinned")}
            </div>
          )}
          {filtered
            .toSorted((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
            .map((note) => (
              <button
                key={note.id}
                className="group relative w-full px-3 py-2 text-left transition-colors"
                style={{
                  background: selectedId === note.id ? "rgba(255,204,0,0.4)" : "transparent",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                }}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="flex items-start justify-between">
                  <span className="truncate pr-4 text-[13px] font-medium text-gray-800">
                    {note.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 size={11} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">{note.date}</span>
                  <span className="truncate text-[11px] text-gray-400">
                    {note.content.split("\n")[1] || note.content.slice(0, 30)}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col" style={{ background: "rgba(252,249,238,0.98)" }}>
        {selectedNote ? (
          <>
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2">
                {["B", "I", "U"].map((fmt) => (
                  <button
                    key={fmt}
                    className="flex h-6 w-6 items-center justify-center rounded text-[12px] font-medium text-gray-600 transition-colors hover:bg-black/10"
                  >
                    {fmt}
                  </button>
                ))}
                <div className="h-4 w-px bg-gray-300" />
                {["≡", "•", "#"].map((fmt) => (
                  <button
                    key={fmt}
                    className="flex h-6 w-6 items-center justify-center rounded text-[12px] text-gray-600 transition-colors hover:bg-black/10"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-gray-400">{selectedNote.date}</span>
            </div>

            <textarea
              value={selectedNote.content}
              onChange={(e) => updateContent(e.target.value)}
              className="flex-1 resize-none bg-transparent p-5 text-[14px] leading-relaxed text-gray-800 outline-none"
              placeholder={t("notes.placeholder")}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-4xl">📝</div>
              <p className="text-[14px] text-gray-400">{t("notes.emptyState")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
