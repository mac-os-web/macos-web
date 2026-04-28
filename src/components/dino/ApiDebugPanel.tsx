import { useEffect, useMemo, useState } from "react";
import type { ApiResult } from "../../lib/api";
import { normalizeBase } from "../../lib/api";

const CFG_KEY = "dino-api-debug-config";

function detectDefaultApiBase() {
  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const host = window.location.hostname || "localhost";
  return `http://${host}:8080`;
}

export function ApiDebugPanel() {
  const [apiBase, setApiBase] = useState(() => {
    if (typeof window === "undefined") return "http://localhost:8080";

    const raw = window.localStorage.getItem(CFG_KEY);
    if (!raw) return detectDefaultApiBase();

    try {
      const parsed = JSON.parse(raw) as { apiBase?: string; googleClientId?: string };
      return parsed.apiBase ? normalizeBase(parsed.apiBase) : detectDefaultApiBase();
    } catch {
      return detectDefaultApiBase();
    }
  });

  const [googleClientId, setGoogleClientId] = useState(() => {
    if (typeof window === "undefined") return "";

    const raw = window.localStorage.getItem(CFG_KEY);
    if (!raw) return "";

    try {
      const parsed = JSON.parse(raw) as { apiBase?: string; googleClientId?: string };
      return parsed.googleClientId ?? "";
    } catch {
      return "";
    }
  });

  const [status, setStatus] = useState("Ready");
  const [output, setOutput] = useState("{}");

  const currentOrigin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector('script[data-gsi="true"]')) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.gsi = "true";
    document.head.appendChild(script);
  }, []);

  function saveConfig() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        CFG_KEY,
        JSON.stringify({ apiBase: normalizeBase(apiBase.trim()), googleClientId: googleClientId.trim() })
      );
    }
    setStatus("Config saved");
  }

  async function callApi(path: string, options?: { method?: string; body?: unknown }): Promise<ApiResult> {
    const base = normalizeBase(apiBase.trim());
    const res = await fetch(base + path, {
      method: options?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      credentials: "include",
    });

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    return {
      ok: res.ok,
      status: res.status,
      data: parsed,
    };
  }

  async function run(label: string, fn: () => Promise<ApiResult>) {
    setStatus(`${label} running...`);
    try {
      const result = await fn();
      setStatus(`${label} ${result.ok ? "success" : "failed"} (${result.status})`);
      setOutput(JSON.stringify(result.data, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`${label} error`);
      setOutput(JSON.stringify({ error: message }, null, 2));
    }
  }

  function renderGoogleButton() {
    const host = document.getElementById("dino-google-host");
    if (!host) return;

    const clientId = googleClientId.trim();
    if (!clientId) {
      setStatus("Google Client ID is empty");
      return;
    }

    if (!window.google?.accounts?.id) {
      setStatus("Google script not loaded. Refresh and retry.");
      return;
    }

    host.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        await run("POST /auth/google", () =>
          callApi("/auth/google", {
            method: "POST",
            body: { idToken: response.credential },
          })
        );
      },
    });

    const button = document.createElement("div");
    host.appendChild(button);
    window.google.accounts.id.renderButton(button, {
      theme: "outline",
      size: "medium",
      width: 220,
      text: "signin_with",
    });

    setStatus("Google button rendered");
  }

  return (
    <div className="mt-6 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-left">
      <p className="mb-2 text-xs font-semibold text-gray-700">API Quick Test (Dino)</p>
      <p className="mb-2 text-[11px] text-gray-500">Current origin: {currentOrigin}</p>

      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-xs"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          placeholder="http://localhost:8080"
        />
        <input
          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-xs"
          value={googleClientId}
          onChange={(e) => setGoogleClientId(e.target.value)}
          placeholder="Google Client ID"
        />
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700"
          onClick={saveConfig}
        >
          Save
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700"
          onClick={() => run("GET /health", () => callApi("/health"))}
        >
          /health
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700"
          onClick={() => run("GET /health/db", () => callApi("/health/db"))}
        >
          /health/db
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700"
          onClick={() => run("GET /auth/me", () => callApi("/auth/me"))}
        >
          /auth/me
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700"
          onClick={() => run("POST /auth/logout", () => callApi("/auth/logout", { method: "POST" }))}
        >
          logout
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700"
          onClick={renderGoogleButton}
        >
          Render Google Login
        </button>
      </div>

      <div id="dino-google-host" className="mb-2" />
      <p className="mb-1 text-[11px] text-gray-600">{status}</p>
      <pre className="max-h-36 overflow-auto rounded border border-gray-200 bg-white p-2 text-[11px] text-gray-700">{output}</pre>
    </div>
  );
}
