import { useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/network";
import { useState } from "react";
import { WifiOff } from "lucide-react";

function MailOffline() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8" style={{ background: "#ffffff" }}>
      <div className="text-6xl mb-4">✉️</div>
      <WifiOff size={40} className="text-gray-300 mb-4" />
      <h2 className="text-[18px] font-semibold text-gray-700 mb-2">
        You're offline
      </h2>
      <p className="text-[13px] text-gray-500 max-w-sm">
        New messages can't be fetched. You'll see them when you reconnect.
      </p>
    </div>
  );
}

export function MailWindow() {
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  if (!isOnline) return <MailOffline />;

  const emails = [
    {
      from: "Apple",
      subject: t("mail.emails.apple.subject"),
      body: t("mail.emails.apple.body"),
      time: "09:30",
      unread: true,
      avatar: "🍎",
    },
    {
      from: "GitHub",
      subject: t("mail.emails.github.subject"),
      body: t("mail.emails.github.body"),
      time: "08:15",
      unread: true,
      avatar: "🐙",
    },
    {
      from: "Slack",
      subject: t("mail.emails.slack.subject"),
      body: t("mail.emails.slack.body"),
      time: t("finder.time.yesterday"),
      unread: false,
      avatar: "💬",
    },
    {
      from: "Google",
      subject: t("mail.emails.google.subject"),
      body: t("mail.emails.google.body"),
      time: t("finder.time.yesterday"),
      unread: false,
      avatar: "🔍",
    },
    {
      from: "Netflix",
      subject: t("mail.emails.netflix.subject"),
      body: t("mail.emails.netflix.body"),
      time: t("finder.time.daysAgo", { count: 2 }),
      unread: false,
      avatar: "🎬",
    },
  ];
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex h-full">
      <div
        className="w-52 flex-shrink-0 flex flex-col"
        style={{
          background: "rgba(238,238,238,0.95)",
          borderRight: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div className="px-3 pt-3 pb-2">
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">
            {t("mail.mailboxes")}
          </p>
          {[
            { name: t("mail.inbox"), icon: "📥", count: 2 },
            { name: t("mail.sent"), icon: "📤", count: 0 },
            { name: t("mail.starred"), icon: "⭐", count: 1 },
            { name: t("mail.trash"), icon: "🗑️", count: 0 },
          ].map((m) => (
            <button
              key={m.name}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors text-left"
            >
              <span className="text-base">{m.icon}</span>
              <span className="flex-1 text-[13px] text-gray-700">{m.name}</span>
              {m.count > 0 && (
                <span className="text-[11px] bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                  {m.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="h-px bg-gray-200 mx-3" />
        <div className="flex-1 overflow-y-auto pt-1">
          {emails.map((e, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="w-full text-left px-3 py-2.5 transition-colors"
              style={{
                background: selected === i ? "rgba(0,100,255,0.1)" : "transparent",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center gap-2">
                {e.unread && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                {!e.unread && <div className="w-1.5 h-1.5 flex-shrink-0" />}
                <span className="text-[13px] font-semibold text-gray-800 flex-1 truncate">
                  {e.from}
                </span>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{e.time}</span>
              </div>
              <p className="text-[11px] text-gray-600 truncate pl-3.5">{e.subject}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0" style={{ background: "white" }}>
        {emails[selected] && (
          <>
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <h2 className="text-[18px] text-gray-900 mb-3">{emails[selected].subject}</h2>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(0,0,0,0.05)" }}
                >
                  {emails[selected].avatar}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-gray-800">{emails[selected].from}</p>
                  <p className="text-[11px] text-gray-400">
                    {t("mail.recipient")} &lt;user@icloud.com&gt;
                  </p>
                </div>
                <span className="text-[11px] text-gray-400">{emails[selected].time}</span>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                {emails[selected].body}
              </p>
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <button
                  className="px-4 py-2 rounded-lg text-[13px] text-white font-medium"
                  style={{ background: "#1d7af5" }}
                >
                  {t("mail.reply")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}