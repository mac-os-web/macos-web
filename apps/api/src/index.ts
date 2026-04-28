import "dotenv/config";
import { serve } from "@hono/node-server";
import { getCookie, deleteCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { Hono } from "hono";
import type { Context } from "hono";
import { and, eq, gt, isNull } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkDbConnection, db } from "./db/client";
import { gmailTokens, sessions, users } from "./db/schema";
import { decryptToken, encryptToken } from "./lib/oauth-token-crypto";

const app = new Hono();

type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

type AuthSession = AuthUser & {
  sessionId: string;
};

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

function buildAllowedOrigins(raw: string): string[] {
  const seeds = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const out = new Set<string>();

  for (const seed of seeds) {
    out.add(seed);

    try {
      const url = new URL(seed);
      if (url.hostname === "localhost") {
        out.add(`${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ""}`);
      } else if (url.hostname === "127.0.0.1") {
        out.add(`${url.protocol}//localhost${url.port ? `:${url.port}` : ""}`);
      }
    } catch {
      // ignore invalid URL values
    }
  }

  return Array.from(out);
}

const ALLOWED_ORIGINS = buildAllowedOrigins(FRONTEND_ORIGIN);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GMAIL_OAUTH_REDIRECT_URI = process.env.GMAIL_OAUTH_REDIRECT_URI ?? "";
const GMAIL_OAUTH_SCOPES = (process.env.GMAIL_OAUTH_SCOPES ?? "https://www.googleapis.com/auth/gmail.send")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
const SESSION_COOKIE_NAME = "session";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
const _parsedTtl = parseInt(process.env.SESSION_TTL_SECONDS ?? "", 10);
const SESSION_TTL_SECONDS =
  Number.isInteger(_parsedTtl) && _parsedTtl > 0 ? _parsedTtl : 60 * 60 * 24 * 7;
const GMAIL_STATE_TTL_SECONDS = 60 * 10;
const IS_PROD = process.env.NODE_ENV === "production";

const googleClient = new OAuth2Client();
const rateLimitStore = new Map<string, number[]>();
const gmailOAuthStateStore = new Map<string, { userId: string; expiresAt: number }>();
const gmailOAuthStateByUser = new Map<string, string>(); // userId → state (중복 연결 방지)

// Prune IPs that have had no requests in the last minute to prevent unbounded growth.
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, timestamps] of rateLimitStore) {
    if (timestamps.every((ts) => ts < cutoff)) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60_000).unref();

// Prune expired OAuth states.
setInterval(() => {
  const now = Date.now();
  for (const [state, entry] of gmailOAuthStateStore) {
    if (entry.expiresAt <= now) {
      gmailOAuthStateStore.delete(state);
      gmailOAuthStateByUser.delete(entry.userId);
    }
  }
}, 5 * 60_000).unref();

const authGoogleBodySchema = z.object({
  idToken: z.string().min(1),
});

const gmailSendBodySchema = z
  .object({
    to: z.string().email(),
    subject: z.string().min(1).max(200),
    text: z.string().optional(),
    html: z.string().optional(),
  })
  .refine((data) => Boolean(data.text || data.html), {
    message: "Either text or html is required",
    path: ["text"],
  });

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) {
        return ALLOWED_ORIGINS[0] ?? FRONTEND_ORIGIN;
      }

      return ALLOWED_ORIGINS.includes(origin) ? origin : undefined;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

function readJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payloadRaw = Buffer.from(parts[1]!, "base64url").toString("utf8");
    return JSON.parse(payloadRaw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
}

function requireGoogleOAuthClientConfig() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GMAIL_OAUTH_REDIRECT_URI) {
    throw new Error(
      "Google OAuth env is not configured. Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_OAUTH_REDIRECT_URI"
    );
  }
}

function createGoogleOAuthClient() {
  requireGoogleOAuthClientConfig();
  return new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GMAIL_OAUTH_REDIRECT_URI,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function base64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sanitizeMimeHeader(value: string): string {
  return value.replace(/[\r\n]/g, "");
}

function buildMimeMessage(payload: { to: string; subject: string; text?: string; html?: string }) {
  const lines = [
    `To: ${sanitizeMimeHeader(payload.to)}`,
    `Subject: ${sanitizeMimeHeader(payload.subject)}`,
    "MIME-Version: 1.0",
    payload.html
      ? 'Content-Type: text/html; charset="UTF-8"'
      : 'Content-Type: text/plain; charset="UTF-8"',
    "",
    payload.html ?? payload.text ?? "",
  ];

  return lines.join("\r\n");
}

function clientKey(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || c.req.header("x-real-ip") || "unknown";
  const ua = c.req.header("user-agent") ?? "unknown";
  return `${ip}:${ua}`;
}

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const history = (rateLimitStore.get(key) ?? []).filter((ts) => now - ts < windowMs);
  history.push(now);
  rateLimitStore.set(key, history);
  return history.length > limit;
}

async function upsertGoogleUser(payload: {
  id: string;
  email: string;
  name: string;
  picture?: string;
}): Promise<AuthUser> {
  if (!db) {
    throw new Error("Database is not configured");
  }

  try {
    const [user] = await db
      .insert(users)
      .values({
        id: payload.id,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          lastLoginAt: new Date(),
        },
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        picture: users.picture,
      });

    if (!user) {
      throw new Error("Failed to upsert user");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture ?? undefined,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const isEmailUniqueConflict =
      reason.includes("users_email_unique") || reason.includes('duplicate key value');

    // If same email already exists with a different id, reuse existing user record.
    if (!isEmailUniqueConflict) {
      throw error;
    }

    const [existing] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        picture: users.picture,
      })
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!existing) {
      throw error;
    }

    const [updated] = await db
      .update(users)
      .set({
        name: payload.name,
        picture: payload.picture,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        picture: users.picture,
      });

    if (!updated) {
      throw new Error("Failed to update existing user by email");
    }

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      picture: updated.picture ?? undefined,
    };
  }
}

async function createDbSession(userId: string): Promise<string> {
  if (!db) {
    throw new Error("Database is not configured");
  }

  const sessionId = randomUUID();
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt: sessionExpiresAt(),
  });

  return sessionId;
}

async function readSessionById(sessionId: string): Promise<AuthSession | null> {
  if (!sessionId || !db) {
    return null;
  }

  const now = new Date();
  const [row] = await db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      email: users.email,
      name: users.name,
      picture: users.picture,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now)
      )
    )
    .limit(1);

  if (!row) {
    return null;
  }

  await db
    .update(sessions)
    .set({
      lastSeenAt: now,
    })
    .where(eq(sessions.id, sessionId));

  return {
    sessionId: row.sessionId,
    id: row.userId,
    email: row.email,
    name: row.name,
    picture: row.picture ?? undefined,
  };
}

async function readSession(c: Context): Promise<AuthSession | null> {
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  if (!sessionId) {
    return null;
  }

  return readSessionById(sessionId);
}

async function revokeSession(sessionId: string): Promise<void> {
  if (!db) {
    return;
  }

  await db
    .update(sessions)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));
}

async function ensureAuth(c: Context): Promise<AuthSession | null> {
  return readSession(c);
}

async function upsertGmailTokens(
  userId: string,
  tokens: {
    accessToken?: string | null;
    refreshToken?: string | null;
    scope?: string | null;
    tokenType?: string | null;
    expiryDate?: Date | null;
  }
) {
  if (!db) {
    throw new Error("Database is not configured");
  }

  const [existing] = await db
    .select({
      refreshTokenEnc: gmailTokens.refreshTokenEnc,
    })
    .from(gmailTokens)
    .where(eq(gmailTokens.userId, userId))
    .limit(1);

  const refreshTokenToStore = tokens.refreshToken ?? decryptToken(existing?.refreshTokenEnc ?? null);

  await db
    .insert(gmailTokens)
    .values({
      userId,
      accessTokenEnc: encryptToken(tokens.accessToken ?? null),
      refreshTokenEnc: encryptToken(refreshTokenToStore),
      scope: tokens.scope ?? null,
      tokenType: tokens.tokenType ?? null,
      expiryDate: tokens.expiryDate ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: gmailTokens.userId,
      set: {
        accessTokenEnc: encryptToken(tokens.accessToken ?? null),
        refreshTokenEnc: encryptToken(refreshTokenToStore),
        scope: tokens.scope ?? null,
        tokenType: tokens.tokenType ?? null,
        expiryDate: tokens.expiryDate ?? null,
        updatedAt: new Date(),
      },
    });
}

async function getUserGmailAccessToken(userId: string): Promise<string> {
  if (!db) {
    throw new Error("Database is not configured");
  }

  const [row] = await db
    .select({
      accessTokenEnc: gmailTokens.accessTokenEnc,
      refreshTokenEnc: gmailTokens.refreshTokenEnc,
      expiryDate: gmailTokens.expiryDate,
      scope: gmailTokens.scope,
      tokenType: gmailTokens.tokenType,
    })
    .from(gmailTokens)
    .where(eq(gmailTokens.userId, userId))
    .limit(1);

  if (!row) {
    throw new Error("Gmail is not connected");
  }

  let accessToken = decryptToken(row.accessTokenEnc);
  const refreshToken = decryptToken(row.refreshTokenEnc);

  const expiresSoon =
    !row.expiryDate || row.expiryDate.getTime() <= Date.now() + 60 * 1000 || !accessToken;

  if (!expiresSoon && accessToken) {
    return accessToken;
  }

  if (!refreshToken) {
    throw new Error("Gmail refresh token is missing");
  }

  const oauthClient = createGoogleOAuthClient();
  oauthClient.setCredentials({
    refresh_token: refreshToken,
    access_token: accessToken ?? undefined,
    expiry_date: row.expiryDate?.getTime(),
  });

  const refreshed = await oauthClient.refreshAccessToken();
  const next = refreshed.credentials;
  accessToken = next.access_token ?? accessToken;

  if (!accessToken) {
    throw new Error("Failed to refresh Gmail access token");
  }

  await upsertGmailTokens(userId, {
    accessToken,
    refreshToken: next.refresh_token ?? refreshToken,
    scope: next.scope ?? row.scope ?? null,
    tokenType: next.token_type ?? row.tokenType ?? null,
    expiryDate: next.expiry_date ? new Date(next.expiry_date) : row.expiryDate,
  });

  return accessToken;
}

// ヘルスチェック
app.get("/", (c) => c.json({ status: "ok", service: "macos-web-api" }));

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
);

app.get("/health/db", async (c) => {
  try {
    const result = await checkDbConnection();

    if (!result.ok) {
      if (!IS_PROD) {
        return c.json({ status: "ng", reason: result.reason }, 500);
      }
      return c.json({ status: "ng" }, 500);
    }

    return c.json({ status: "ok" });
  } catch {
    return c.json({ status: "ng" }, 500);
  }
});

// Google ログイン
app.post("/auth/google", async (c) => {
  if (isRateLimited(`auth-google:${clientKey(c)}`, 20, 60_000)) {
    return c.json({ error: "Too many requests" }, 429);
  }

  if (!GOOGLE_CLIENT_ID) {
    return c.json(
      {
        error: "Server auth env is not configured",
        required: ["GOOGLE_CLIENT_ID", "DATABASE_URL"],
      },
      500
    );
  }

  const body = await c.req.json().catch(() => null);
  const parsed = authGoogleBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid body", issues: parsed.error.issues }, 400);
  }

  let googlePayload:
    | {
        sub?: string;
        email?: string;
        name?: string;
        picture?: string;
      }
    | undefined;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    googlePayload = ticket.getPayload();
  } catch (error) {
    if (IS_PROD) {
      return c.json({ error: "Google token verification failed" }, 401);
    }

    const tokenPayload = readJwtPayload(parsed.data.idToken);

    return c.json(
      {
        error: "Google token verification failed",
        reason: error instanceof Error ? error.message : "Unknown error",
        debug: {
          expectedAudience: GOOGLE_CLIENT_ID,
          tokenAudience: tokenPayload?.aud ?? null,
          tokenIssuer: tokenPayload?.iss ?? null,
          hint: "Google Button에 입력한 Client ID와 서버 .env GOOGLE_CLIENT_ID가 정확히 같은 Web Client ID여야 합니다.",
        },
      },
      401
    );
  }

  if (!googlePayload?.sub || !googlePayload.email || !googlePayload.name) {
    return c.json({ error: "Invalid Google token payload" }, 401);
  }

  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  try {
    const user = await upsertGoogleUser({
      id: googlePayload.sub,
      email: googlePayload.email,
      name: googlePayload.name,
      picture: googlePayload.picture,
    });

    const sessionId = await createDbSession(user.id);

    setCookie(c, SESSION_COOKIE_NAME, sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: IS_PROD ? "Strict" : "Lax",
      secure: IS_PROD || COOKIE_SECURE,
      maxAge: SESSION_TTL_SECONDS,
    });

    return c.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: "Auth persistence failed", reason }, 500);
  }
});

// セッション確認
app.get("/auth/me", async (c) => {
  const session = await ensureAuth(c);
  if (!session) {
    if (IS_PROD) {
      return c.json({ authenticated: false }, 401);
    }

    const rawCookie = c.req.header("cookie") ?? "";
    const cookieValue = getCookie(c, SESSION_COOKIE_NAME);

    return c.json(
      {
        authenticated: false,
        debug: {
          sessionCookiePresent: Boolean(cookieValue),
          cookieHeaderPresent: Boolean(rawCookie),
          cookieHeaderLength: rawCookie.length,
          origin: c.req.header("origin") ?? null,
          host: c.req.header("host") ?? null,
          cookieName: SESSION_COOKIE_NAME,
        },
      },
      401
    );
  }

  return c.json({
    authenticated: true,
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      picture: session.picture,
    },
  });
});

// ログアウト
app.post("/auth/logout", async (c) => {
  const session = await ensureAuth(c);
  if (session?.sessionId) {
    await revokeSession(session.sessionId);
  }

  deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
  return c.json({ ok: true });
});

app.post("/gmail/connect/start", async (c) => {
  if (isRateLimited(`gmail-connect:${clientKey(c)}`, 20, 60_000)) {
    return c.json({ error: "Too many requests" }, 429);
  }

  const session = await ensureAuth(c);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const oauthClient = createGoogleOAuthClient();
    const state = randomUUID();

    // 이전 미완료 state가 있으면 제거 (버튼 중복 클릭 방지)
    const prevState = gmailOAuthStateByUser.get(session.id);
    if (prevState) {
      gmailOAuthStateStore.delete(prevState);
    }

    gmailOAuthStateStore.set(state, {
      userId: session.id,
      expiresAt: Date.now() + GMAIL_STATE_TTL_SECONDS * 1000,
    });
    gmailOAuthStateByUser.set(session.id, state);

    const authUrl = oauthClient.generateAuthUrl({
      access_type: "offline",
      include_granted_scopes: true,
      prompt: "consent",
      scope: GMAIL_OAUTH_SCOPES,
      state,
    });

    return c.json({ ok: true, authUrl, scopes: GMAIL_OAUTH_SCOPES });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: "Failed to start Gmail OAuth", reason }, 500);
  }
});

app.get("/gmail/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.html("<h3>Gmail 연결 실패: 필수 파라미터 누락</h3>", 400);
  }

  const stateEntry = gmailOAuthStateStore.get(state);
  gmailOAuthStateStore.delete(state);

  if (!stateEntry || stateEntry.expiresAt <= Date.now()) {
    return c.html("<h3>Gmail 연결 실패: state 검증 실패 (만료되었거나 유효하지 않음)</h3>", 400);
  }

  gmailOAuthStateByUser.delete(stateEntry.userId);

  try {
    const oauthClient = createGoogleOAuthClient();
    const tokenResult = await oauthClient.getToken(code);
    const credentials = tokenResult.tokens;

    await upsertGmailTokens(stateEntry.userId, {
      accessToken: credentials.access_token ?? null,
      refreshToken: credentials.refresh_token ?? null,
      scope: credentials.scope ?? null,
      tokenType: credentials.token_type ?? null,
      expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
    });

    return c.html(`<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Gmail Connected</title></head>
  <body style="font-family: sans-serif; padding: 24px;">
    <h3>Gmail 연결이 완료되었습니다.</h3>
    <p>원래 창으로 돌아가 상태 확인을 눌러주세요.</p>
    <script>window.close();</script>
  </body>
</html>`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    return c.html(`<h3>Gmail 연결 실패</h3><pre>${escapeHtml(reason)}</pre>`, 500);
  }
});

app.get("/gmail/status", async (c) => {
  const session = await ensureAuth(c);
  if (!session) {
    return c.json({ connected: false, reason: "unauthorized" }, 401);
  }

  if (!db) {
    return c.json({ connected: false, reason: "database-not-configured" }, 500);
  }

  const [row] = await db
    .select({
      userId: gmailTokens.userId,
      scope: gmailTokens.scope,
      expiryDate: gmailTokens.expiryDate,
      refreshTokenEnc: gmailTokens.refreshTokenEnc,
    })
    .from(gmailTokens)
    .where(eq(gmailTokens.userId, session.id))
    .limit(1);

  if (!row) {
    return c.json({ connected: false });
  }

  return c.json({
    connected: true,
    scope: row.scope,
    expiresAt: row.expiryDate?.toISOString() ?? null,
    hasRefreshToken: Boolean(decryptToken(row.refreshTokenEnc)),
  });
});

app.post("/gmail/send", async (c) => {
  if (isRateLimited(`gmail-send:${clientKey(c)}`, 10, 60_000)) {
    return c.json({ error: "Too many requests" }, 429);
  }

  const session = await ensureAuth(c);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = gmailSendBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid body", issues: parsed.error.issues }, 400);
  }

  try {
    const accessToken = await getUserGmailAccessToken(session.id);
    const mime = buildMimeMessage(parsed.data);
    const raw = base64Url(mime);

    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      return c.json({ error: "Failed to send via Gmail API", details: data }, 500);
    }

    return c.json({ ok: true, result: data });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: "Failed to send via Gmail API", reason }, 500);
  }
});

const port = Number(process.env.PORT) || 8080;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 API server running at http://localhost:${info.port}`);
});
