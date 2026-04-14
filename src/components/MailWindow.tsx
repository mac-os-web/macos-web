import { WifiOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/network";

function MailOffline() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
      <div className="mb-4 text-6xl">✉️</div>
      <WifiOff size={40} className="mb-4 text-gray-300" />
      <h2 className="mb-2 text-[18px] font-semibold text-gray-700">{t("mail.offline.title")}</h2>
      <p className="max-w-sm text-[13px] text-gray-500">{t("mail.offline.description")}</p>
    </div>
  );
}

export function MailWindow() {
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const [selected, setSelected] = useState(0);

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

  return (
    <div className="flex h-full">
      <div className="flex w-52 flex-shrink-0 flex-col border-r border-black/[0.07] bg-neutral-200/95">
        <div className="px-3 pt-3 pb-2">
          <p className="mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
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
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-black/5"
            >
              <span className="text-base">{m.icon}</span>
              <span className="flex-1 text-[13px] text-gray-700">{m.name}</span>
              {m.count > 0 && (
                <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[11px] text-white">
                  {m.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mx-3 h-px bg-gray-200" />
        <div className="flex-1 overflow-y-auto pt-1">
          {emails.map((e, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="w-full px-3 py-2.5 text-left transition-colors"
              style={{
                background: selected === i ? "rgba(0,100,255,0.1)" : "transparent",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center gap-2">
                {e.unread && <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />}
                {!e.unread && <div className="h-1.5 w-1.5 flex-shrink-0" />}
                <span className="flex-1 truncate text-[13px] font-semibold text-gray-800">
                  {e.from}
                </span>
                <span className="flex-shrink-0 text-[10px] text-gray-400">{e.time}</span>
              </div>
              <p className="truncate pl-3.5 text-[11px] text-gray-600">{e.subject}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col" style={{ background: "white" }}>
        {emails[selected] && (
          <>
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <h2 className="mb-3 text-[18px] text-gray-900">{emails[selected].subject}</h2>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl"
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
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-[14px] leading-relaxed whitespace-pre-line text-gray-700">
                {emails[selected].body}
              </p>
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <button
                  className="rounded-lg px-4 py-2 text-[13px] font-medium text-white"
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
