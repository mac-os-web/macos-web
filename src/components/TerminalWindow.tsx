import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Line {
  type: "input" | "output" | "error";
  content: string;
}

export function TerminalWindow() {
  const { t, i18n } = useTranslation();

  const commands: Record<string, string> = {
    help: `${t("terminal.help.title")}
  help     - ${t("terminal.help.help")}
  ls       - ${t("terminal.help.ls")}
  pwd      - ${t("terminal.help.pwd")}
  whoami   - ${t("terminal.help.whoami")}
  date     - ${t("terminal.help.date")}
  clear    - ${t("terminal.help.clear")}
  echo     - ${t("terminal.help.echo")}
  uname    - ${t("terminal.help.uname")}
  neofetch - ${t("terminal.help.neofetch")}`,
    ls: `Applications    Desktop    Documents    Downloads
Library         Movies     Music        Pictures
Public`,
    pwd: `/Users/${t("terminal.user")}`,
    whoami: t("terminal.user"),
    date: Temporal.Now.plainDateTimeISO().toLocaleString(i18n.language),
    uname: "Darwin MacBook-Pro.local 24.4.0 Darwin Kernel Version 24.4.0",
    neofetch: `
                    'c.          ${t("terminal.user")}@MacBook-Pro
                 ,xNMM.          -------------------------
               .OMMMMo           OS: macOS Sequoia 15.4.1
               OMMM0,            Host: MacBook Pro (M4)
     .;loddo:.  oMMMo            Kernel: Darwin 24.4.0
   cKMMMMMMMMMMNWMMMNk.          Uptime: 3 days, 14 hours
 .XMMMMMMMMMMMMMMMMMMMX.         Packages: 142 (brew)
;MMMMMMMMMMMMMMMMMMMMMM:         Shell: zsh 5.9
:MMMMMMMMMMMMMMMMMMMMMM:         Resolution: 2560x1664
.MMMMMMMMMMMMMMMMMMMMMMX.        DE: Aqua
 kMMMMMMMMMMMMMMMMMMMMMMMk.      WM: Quartz Compositor
 .KMMMMMMMMMMMMMMMMMMMMMMk.      CPU: Apple M4
   kMMMMMMMMMMMMMMMMMMMMk.       GPU: Apple M4
     xMMMMMMMMMMMMMMMMk.         Memory: 8192MiB / 16384MiB
      oMMMMMMMMMMMMMMo.`,
  };

  const [lines, setLines] = useState<Line[]>([
    {
      type: "output",
      content: "Last login: Wed Apr  9 09:00:00 on ttys001",
    },
    {
      type: "output",
      content: t("terminal.welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const execute = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newLines: Line[] = [{ type: "input", content: trimmed }];

    if (trimmed === "clear") {
      setLines([]);
      setHistory((h) => [trimmed, ...h]);
      setHistoryIndex(-1);
      return;
    }

    const parts = trimmed.split(" ");
    const baseCmd = parts[0];

    if (baseCmd === "echo") {
      newLines.push({ type: "output", content: parts.slice(1).join(" ") });
    } else if (commands[baseCmd]) {
      newLines.push({ type: "output", content: commands[baseCmd] });
    } else {
      newLines.push({
        type: "error",
        content: `zsh: command not found: ${baseCmd}`,
      });
    }

    setLines((prev) => [...prev, ...newLines]);
    setHistory((h) => [trimmed, ...h]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      execute(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = historyIndex + 1;
      if (next < history.length) {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIndex - 1;
      if (next < 0) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    }
  };

  const userPrompt = `${t("terminal.user")}@MacBook-Pro`;

  return (
    <div
      className="flex h-full cursor-text flex-col overflow-y-auto p-4 font-mono text-[13px]"
      style={{ background: "#1e1e1e", color: "#d4d4d4" }}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) => (
        <div key={i} className="leading-6 whitespace-pre-wrap">
          {line.type === "input" && (
            <span>
              <span style={{ color: "#50fa7b" }}>{userPrompt}</span>
              <span style={{ color: "#bd93f9" }}> ~ </span>
              <span style={{ color: "#8be9fd" }}>% </span>
              <span style={{ color: "#f8f8f2" }}>{line.content}</span>
            </span>
          )}
          {line.type === "output" && <span style={{ color: "#d4d4d4" }}>{line.content}</span>}
          {line.type === "error" && <span style={{ color: "#ff5555" }}>{line.content}</span>}
        </div>
      ))}

      <div className="mt-1 flex items-center leading-6">
        <span style={{ color: "#50fa7b" }}>{userPrompt}</span>
        <span style={{ color: "#bd93f9" }}> ~ </span>
        <span style={{ color: "#8be9fd" }}>% </span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent caret-white outline-none"
          style={{ color: "#f8f8f2", caretColor: "#f8f8f2" }}
          spellCheck={false}
        />
        <span className="animate-pulse" style={{ color: "#f8f8f2" }}>
          █
        </span>
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
