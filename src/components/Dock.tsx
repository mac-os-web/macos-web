import { useState } from "react";

interface DockApp {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  isOpen?: boolean;
  isSeparator?: boolean;
}

interface DockProps {
  apps: DockApp[];
  onAppClick: (id: string) => void;
}

function DockItem({ app, onClick }: { app: DockApp; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  if (app.isSeparator) {
    return <div className="w-px h-10 bg-white/30 mx-1 self-end mb-1" />;
  }

  return (
    <div className="flex flex-col items-center relative">
      {hovered && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[12px] text-white whitespace-nowrap pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(10px)",
            animation: "fadeIn 0.1s ease-out",
          }}
        >
          {app.name}
        </div>
      )}

      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-[22%] overflow-hidden shadow-lg flex items-center justify-center transition-transform duration-150 hover:scale-125 hover:-translate-y-2 active:scale-90"
        style={{ background: app.color }}
      >
        {app.icon}
      </button>

      {app.isOpen && <div className="w-1 h-1 rounded-full bg-white/80 mt-0.5" />}
      {!app.isOpen && <div className="w-1 h-1 mt-0.5" />}
    </div>
  );
}

export function Dock({ apps, onAppClick }: DockProps) {
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 px-2">
      <div
        className="flex items-end gap-1 px-2 py-1.5 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        {apps.map((app) => (
          <DockItem key={app.id} app={app} onClick={() => onAppClick(app.id)} />
        ))}
      </div>
    </div>
  );
}
