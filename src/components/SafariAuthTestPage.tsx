import { useEffect, useMemo, useRef, useState } from "react";
import type { ApiResult } from "../lib/api";
import { normalizeBase } from "../lib/api";

type SafariAuthTestPageProps = {
  defaultApiBase: string;
};

const CFG_KEY = "safari-auth-test-config";

function pageHostApiBase(defaultApiBase: string) {
  return normalizeBase(defaultApiBase);
}


function isLoopbackHost(host: string) {
  return host === "localhost" || host === "127.0.0.1";
}

function alignLoopbackBaseToPage(base: string): string {
  if (typeof window === "undefined") {
    return normalizeBase(base);
  }

  try {
    const url = new URL(base);
    const pageHost = window.location.hostname;

    if (isLoopbackHost(url.hostname) && isLoopbackHost(pageHost) && url.hostname !== pageHost) {
      return normalizeBase(`${url.protocol}//${pageHost}${url.port ? `:${url.port}` : ""}`);
    }

    return normalizeBase(base);
  } catch {
    return normalizeBase(base);
  }
}

function buildFallbackBases(base: string): string[] {
  try {
    const url = new URL(base);
    const out = new Set<string>();

    if (url.hostname === "localhost") {
      out.add(`${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ""}`);
    } else if (url.hostname === "127.0.0.1") {
      out.add(`${url.protocol}//localhost${url.port ? `:${url.port}` : ""}`);
    }

    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host && host !== url.hostname) {
        out.add(`${url.protocol}//${host}${url.port ? `:${url.port}` : ""}`);
      }
    }

    return Array.from(out).map(normalizeBase).filter((x) => x !== normalizeBase(base));
  } catch {
    return [];
  }
}

function shouldRetryWithFallback(path: string, method: string): boolean {
  if (method === "GET" && (path === "/health" || path === "/health/db")) return true;
  return false;
}

export function SafariAuthTestPage({ defaultApiBase }: SafariAuthTestPageProps) {
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [googleClientId, setGoogleClientId] = useState("");
  const [gmailTo, setGmailTo] = useState("");
  const [gmailSubject, setGmailSubject] = useState("Hello from Gmail API");
  const [gmailText, setGmailText] = useState("This mail was sent using Gmail API.");
  const [status, setStatus] = useState("준비됨");
  const [output, setOutput] = useState("{}");
  const apiBaseRef = useRef(defaultApiBase);
  const googleClientIdRef = useRef("");

  const origin = useMemo(() => window.location.origin, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(CFG_KEY);
    const hostBase = pageHostApiBase(defaultApiBase);
    setApiBase(hostBase);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        googleClientId?: string;
      };
      setGoogleClientId(parsed.googleClientId ?? "");
    } catch {
      setApiBase(hostBase);
    }
  }, [defaultApiBase]);

  useEffect(() => {
    apiBaseRef.current = apiBase;
  }, [apiBase]);

  useEffect(() => {
    googleClientIdRef.current = googleClientId;
  }, [googleClientId]);

  useEffect(() => {
    if (document.querySelector('script[data-gsi="true"]')) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.gsi = "true";
    document.head.appendChild(script);
  }, []);

  function saveConfig() {
    const payload = {
      googleClientId: googleClientId.trim(),
    };
    window.localStorage.setItem(CFG_KEY, JSON.stringify(payload));
    setStatus("설정 저장됨");
  }

  async function callApi(
    path: string,
    options?: { method?: string; body?: unknown },
    baseOverride?: string
  ): Promise<ApiResult> {
    const pageBase = normalizeBase(pageHostApiBase(defaultApiBase));
    const rawBase = typeof baseOverride === "string" ? baseOverride : apiBaseRef.current;
    const aligned = alignLoopbackBaseToPage(rawBase.trim());
    const base = pageBase || aligned;
    if (!base) {
      throw new Error("API Base URL이 비어 있습니다.");
    }

    if (base !== normalizeBase(apiBaseRef.current.trim())) {
      setApiBase(base);
      apiBaseRef.current = base;
      window.localStorage.setItem(
        CFG_KEY,
        JSON.stringify({
          googleClientId: googleClientIdRef.current.trim(),
        })
      );
    }

    const method = options?.method ?? "GET";

    const request = async (targetBase: string) => {
      const res = await fetch(targetBase + path, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        credentials: "include",
      });

      const bodyText = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(bodyText);
      } catch {
        data = { raw: bodyText };
      }

      return {
        ok: res.ok,
        status: res.status,
        data,
      };
    };

    try {
      return await request(base);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("Failed to fetch") || !shouldRetryWithFallback(path, method)) {
        throw error;
      }

      const fallbacks = buildFallbackBases(base);
      for (const nextBase of fallbacks) {
        try {
          const result = await request(nextBase);
          setApiBase(nextBase);
          apiBaseRef.current = nextBase;
          window.localStorage.setItem(
            CFG_KEY,
            JSON.stringify({
              googleClientId: googleClientIdRef.current.trim(),
            })
          );
          setStatus(`API Base 자동 전환됨: ${nextBase}`);
          return result;
        } catch {
          // Try next fallback base.
        }
      }

      throw error;
    }
  }

  async function run(label: string, fn: () => Promise<ApiResult>): Promise<ApiResult | null> {
    setStatus(`${label} 실행 중...`);

    try {
      const result = await fn();
      setStatus(`${label} ${result.ok ? "성공" : "실패"} (${result.status})`);
      setOutput(JSON.stringify(result.data, null, 2));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`${label} 예외`);

      if (message.includes("Failed to fetch")) {
        const base = normalizeBase(apiBase.trim());
        setOutput(
          JSON.stringify(
            {
              error: message,
              debug: {
                apiBase: base,
                hint1: "API 서버가 꺼져 있거나 포트(8080)가 열려 있지 않으면 이 에러가 납니다.",
                hint2: "루트에서 pnpm dev 실행 후 /health 먼저 눌러서 연결 확인하세요.",
                hint3: "브라우저 주소가 127.0.0.1이면 API Base도 http://127.0.0.1:8080 으로 맞추세요.",
              },
            },
            null,
            2
          )
        );
        return null;
      }

      setOutput(JSON.stringify({ error: message }, null, 2));
      return null;
    }
  }

  async function startGmailConnect() {
    const result = await run("POST /gmail/connect/start", () =>
      callApi("/gmail/connect/start", { method: "POST" })
    );

    if (!result?.ok) {
      return;
    }

    const payload = result.data as { authUrl?: string };
    if (!payload?.authUrl) {
      setStatus("Gmail 연결 URL을 받지 못했습니다.");
      return;
    }

    const popup = window.open(payload.authUrl, "gmail-oauth", "width=520,height=740");
    if (!popup) {
      setStatus("팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.");
      return;
    }

    setStatus("Gmail 권한 연결 창이 열렸습니다. 승인 후 상태 확인을 눌러주세요.");
  }

  function renderGoogleButton() {
    const host = document.getElementById("safari-google-login-host");
    if (!host) return;

    const clientId = googleClientIdRef.current.trim();
    if (!clientId) {
      setStatus("Google Client ID를 입력하세요.");
      return;
    }

    if (!window.google?.accounts?.id) {
      setStatus("Google 스크립트 로딩 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }

    host.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        const latestBaseRaw =
          apiBaseRef.current ||
          (() => {
            const raw = window.localStorage.getItem(CFG_KEY);
            if (!raw) return pageHostApiBase(defaultApiBase);
            try {
              return pageHostApiBase(defaultApiBase);
            } catch {
              return pageHostApiBase(defaultApiBase);
            }
          })();

        await run("POST /auth/google", () =>
          callApi("/auth/google", {
            method: "POST",
            body: { idToken: response.credential },
          }, latestBaseRaw)
        );
      },
    });

    const target = document.createElement("div");
    host.appendChild(target);
    window.google.accounts.id.renderButton(target, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: 280,
    });

    setStatus("Google 로그인 버튼 렌더 완료");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.85)" }}
      >
        <h3 className="mb-2 text-[18px] font-semibold text-gray-800">Google 로그인/메일 연동 테스트</h3>
        <p className="text-[12px] text-gray-500">현재 오리진: {origin}</p>
        <p className="text-[12px] text-gray-500">테스트 URL 힌트: auth.test 또는 login.test 입력</p>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.85)" }}
      >
        <p className="mb-2 text-[13px] font-semibold text-gray-700">설정</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            value={apiBase}
            readOnly
            placeholder="API Base URL"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800"
          />
          <input
            value={googleClientId}
            onChange={(e) => setGoogleClientId(e.target.value)}
            placeholder="Google Client ID"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveConfig}
            className="rounded-lg bg-blue-600 px-3 py-2 text-[12px] text-white"
          >
            설정 저장
          </button>
          <button
            type="button"
            onClick={renderGoogleButton}
            className="rounded-lg bg-gray-700 px-3 py-2 text-[12px] text-white"
          >
            구글 로그인 버튼 렌더
          </button>
          <button
            type="button"
            onClick={() => run("POST /auth/logout", () => callApi("/auth/logout", { method: "POST" }))}
            className="rounded-lg bg-gray-700 px-3 py-2 text-[12px] text-white"
          >
            로그아웃
          </button>
        </div>
        <div id="safari-google-login-host" className="mt-2" />
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.85)" }}
      >
        <p className="mb-2 text-[13px] font-semibold text-gray-700">상태 점검</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => run("GET /health", () => callApi("/health"))}
            className="rounded-lg bg-blue-600 px-3 py-2 text-[12px] text-white"
          >
            /health
          </button>
          <button
            type="button"
            onClick={() => run("GET /health/db", () => callApi("/health/db"))}
            className="rounded-lg bg-gray-700 px-3 py-2 text-[12px] text-white"
          >
            /health/db
          </button>
          <button
            type="button"
            onClick={() => run("GET /auth/me", () => callApi("/auth/me"))}
            className="rounded-lg bg-gray-700 px-3 py-2 text-[12px] text-white"
          >
            /auth/me
          </button>
        </div>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.85)" }}
      >
        <p className="mb-2 text-[13px] font-semibold text-gray-700">Gmail API</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startGmailConnect}
            className="rounded-lg bg-blue-600 px-3 py-2 text-[12px] text-white"
          >
            Gmail 연결 시작
          </button>
          <button
            type="button"
            onClick={() => run("GET /gmail/status", () => callApi("/gmail/status"))}
            className="rounded-lg bg-gray-700 px-3 py-2 text-[12px] text-white"
          >
            Gmail 연결 상태
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <input
            value={gmailTo}
            onChange={(e) => setGmailTo(e.target.value)}
            placeholder="receiver@gmail.com"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800"
          />
          <input
            value={gmailSubject}
            onChange={(e) => setGmailSubject(e.target.value)}
            placeholder="Subject"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800"
          />
          <textarea
            value={gmailText}
            onChange={(e) => setGmailText(e.target.value)}
            rows={4}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-800"
          />
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() =>
              run("POST /gmail/send", () =>
                callApi("/gmail/send", {
                  method: "POST",
                  body: {
                    to: gmailTo.trim(),
                    subject: gmailSubject.trim(),
                    text: gmailText,
                  },
                })
              )
            }
            className="rounded-lg bg-blue-600 px-3 py-2 text-[12px] text-white"
          >
            Gmail 보내기
          </button>
        </div>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.85)" }}
      >
        <p className="text-[13px] font-semibold text-gray-700">결과</p>
        <p className="mt-1 text-[12px] text-gray-600">{status}</p>
        <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-gray-900 p-3 text-[12px] text-gray-100">
          {output}
        </pre>
      </div>
    </div>
  );
}
