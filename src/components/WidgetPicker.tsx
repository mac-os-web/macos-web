import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WidgetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
  active: string[];
}

export function WidgetPicker({ isOpen, onClose, onAdd, active }: WidgetPickerProps) {
  const { t } = useTranslation();

  const WIDGET_DEFS = [
    { id: "clock", name: t("widgets.clock.name"), icon: "🕐", desc: t("widgets.clock.desc") },
    { id: "weather", name: t("widgets.weather.name"), icon: "⛅", desc: t("widgets.weather.desc") },
    {
      id: "calendar",
      name: t("widgets.calendar.name"),
      icon: "📅",
      desc: t("widgets.calendar.desc"),
    },
    { id: "system", name: t("widgets.system.name"), icon: "📊", desc: t("widgets.system.desc") },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[910]" onClick={onClose} />
      <div
        data-keep-focus
        className="fixed bottom-24 left-1/2 z-[911] w-80 -translate-x-1/2 rounded-2xl p-4"
        style={{
          background: "rgba(40,40,40,0.92)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
          animation: "slideUp 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-[14px] font-semibold text-white">{t("widgets.addWidget")}</p>
        <div className="space-y-1.5">
          {WIDGET_DEFS.map((w) => {
            const isActive = active.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => onAdd(w.id)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all"
                style={{
                  background: isActive ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-2xl">{w.icon}</span>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-white">{w.name}</p>
                  <p className="text-[11px] text-white/50">{w.desc}</p>
                </div>
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.15)" : "rgba(48,209,88,1)",
                  }}
                >
                  {isActive ? (
                    <span className="text-[14px] text-white/50">✓</span>
                  ) : (
                    <Plus size={13} className="text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
