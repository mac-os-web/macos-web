// ─── ログレベル定義 ──────────────────────────────────────────────────────────
type LogLevel = "debug" | "info" | "warn" | "error";

// ─── 環境別ログレベル設定 ────────────────────────────────────────────────────
// main(本番): errorのみ
// stage(ステージング): warn以上
// dev(開発): すべて出力
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getEnvironment(): "production" | "staging" | "development" {
  // CI/環境変数で判定（VITE_APP_ENVを優先）
  const env = import.meta.env.VITE_APP_ENV as string | undefined;
  if (env === "production" || env === "main") return "production";
  if (env === "staging" || env === "stage") return "staging";
  if (env === "development" || env === "dev") return "development";

  // フォールバック: Viteのモード
  return import.meta.env.PROD ? "production" : "development";
}

function getMinLevel(): LogLevel {
  const env = getEnvironment();
  switch (env) {
    case "production":
      return "error";
    case "staging":
      return "warn";
    case "development":
      return "debug";
  }
}

const minLevel = getMinLevel();

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

// ─── タイムスタンプフォーマット設定 ─────────────────────────────────────────
const TIMESTAMP_LOCALE = "en-US";
const TIMESTAMP_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
} as const;

// ─── タイムスタンプ ──────────────────────────────────────────────────────────
function timestamp(): string {
  return Temporal.Now.plainDateTimeISO().toLocaleString(TIMESTAMP_LOCALE, TIMESTAMP_OPTIONS);
}

// ─── ロガー本体 ──────────────────────────────────────────────────────────────
export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog("debug")) console.debug(`[DEBUG ${timestamp()}]`, ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog("info")) console.log(`[INFO ${timestamp()}]`, ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog("warn")) console.warn(`[WARN ${timestamp()}]`, ...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog("error")) console.error(`[ERROR ${timestamp()}]`, ...args);
  },

  // 現在の環境とログレベルを確認（デバッグ用）
  env: () => getEnvironment(),
  level: () => minLevel,
};
