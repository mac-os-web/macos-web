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
    return <div className="mx-1 mb-1 h-10 w-px self-end bg-white/30" />;
  }

  return (
    <div className="relative flex flex-col items-center">
      {hovered && (
        <div
          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md px-2 py-0.5 text-[12px] whitespace-nowrap text-white"
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
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[22%] shadow-lg transition-transform duration-150 hover:-translate-y-2 hover:scale-125 active:scale-90 sm:h-12 sm:w-12"
        style={{ background: app.color }}
      >
        {app.icon}
      </button>

      {app.isOpen && <div className="mt-0.5 h-1 w-1 rounded-full bg-white/80" />}
      {!app.isOpen && <div className="mt-0.5 h-1 w-1" />}
    </div>
  );
}

export function Dock({ apps, onAppClick }: DockProps) {
  return (
    <div className="fixed bottom-2 left-1/2 z-50 -translate-x-1/2 px-2">
      <div
        className="flex items-end gap-1 rounded-2xl px-2 py-1.5"
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
