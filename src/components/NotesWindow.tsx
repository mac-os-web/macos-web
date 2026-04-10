import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
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
        className="w-52 flex-shrink-0 flex flex-col"
        style={{
          background: "rgba(242,238,230,0.95)",
          borderRight: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <span className="text-[12px] text-gray-500 font-semibold">{t("notes.title")}</span>
          <button onClick={addNote} className="p-1 rounded hover:bg-black/10 transition-colors">
            <Plus size={14} className="text-gray-600" />
          </button>
        </div>

        <div className="px-2 py-1.5">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ background: "rgba(0,0,0,0.08)" }}
          >
            <Search size={11} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("notes.search")}
              className="flex-1 bg-transparent outline-none text-[12px] text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {search === "" && notes.some((n) => n.pinned) && (
            <div className="px-3 py-1 text-[10px] text-gray-400 uppercase font-semibold">
              {t("notes.pinned")}
            </div>
          )}
          {filtered
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
            .map((note) => (
              <button
                key={note.id}
                className="w-full text-left px-3 py-2 transition-colors group relative"
                style={{
                  background: selectedId === note.id ? "rgba(255,204,0,0.4)" : "transparent",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                }}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[13px] text-gray-800 font-medium truncate pr-4">
                    {note.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={11} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray-400">{note.date}</span>
                  <span className="text-[11px] text-gray-400 truncate">
                    {note.content.split("\n")[1] || note.content.slice(0, 30)}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col" style={{ background: "rgba(252,249,238,0.98)" }}>
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
                    className="w-6 h-6 rounded flex items-center justify-center text-[12px] text-gray-600 hover:bg-black/10 font-medium transition-colors"
                  >
                    {fmt}
                  </button>
                ))}
                <div className="w-px h-4 bg-gray-300" />
                {["≡", "•", "#"].map((fmt) => (
                  <button
                    key={fmt}
                    className="w-6 h-6 rounded flex items-center justify-center text-[12px] text-gray-600 hover:bg-black/10 transition-colors"
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
              className="flex-1 p-5 bg-transparent outline-none resize-none text-[14px] text-gray-800 leading-relaxed"
              placeholder={t("notes.placeholder")}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-[14px] text-gray-400">{t("notes.emptyState")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
