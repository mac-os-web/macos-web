import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export interface User {
  name: string;
  email: string;
  picture: string | null;
}

export type AuthState =
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: User }
  | { status: "locked"; user: User };

interface AuthContextValue {
  state: AuthState;
  signIn: (user: User) => void;
  signOut: () => void;
  lock: () => void;
  unlock: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "macos-web-auth";
const STORE_EVENT = "macos-web-auth:change";

const ERRORS = {
  PROVIDER_NOT_FOUND: "useAuth must be used within an AuthProvider",
} as const;

function isUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const u = value as Record<string, unknown>;
  return (
    typeof u.name === "string" &&
    typeof u.email === "string" &&
    (u.picture === null || typeof u.picture === "string")
  );
}

export function isAuthState(value: unknown): value is AuthState {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  if (s.status === "unauthenticated") return true;
  if (s.status === "authenticated" || s.status === "locked") return isUser(s.user);
  return false;
}

function parseAuthState(raw: string | null): AuthState {
  if (!raw) return { status: "unauthenticated" };
  try {
    const parsed: unknown = JSON.parse(raw);
    return isAuthState(parsed) ? parsed : { status: "unauthenticated" };
  } catch {
    return { status: "unauthenticated" };
  }
}

// ── Cached snapshot ─────────────────────────────────────────────────────────
// useSyncExternalStore requires getSnapshot to return a stable reference when
// the underlying value hasn't changed (otherwise infinite re-renders).
let cachedRaw: string | null =
  typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
let cachedState: AuthState = parseAuthState(cachedRaw);

// Imperative read — used both by useSyncExternalStore and by route guards.
export function readAuthState(): AuthState {
  if (typeof window === "undefined") return cachedState;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseAuthState(raw);
  }
  return cachedState;
}

function subscribe(callback: () => void) {
  // storage event: other tabs. custom event: same tab.
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function writeAuthState(next: AuthState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (quota / security) — UI는 계속 동작
  }
  // storage 이벤트는 자기 탭에서 fire되지 않으므로 수동 전파
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, readAuthState);

  const signIn = useCallback((user: User) => {
    writeAuthState({ status: "authenticated", user });
  }, []);

  const signOut = useCallback(() => {
    writeAuthState({ status: "unauthenticated" });
  }, []);

  const lock = useCallback(() => {
    if (cachedState.status === "authenticated") {
      writeAuthState({ status: "locked", user: cachedState.user });
    }
  }, []);

  const unlock = useCallback(() => {
    if (cachedState.status === "locked") {
      writeAuthState({ status: "authenticated", user: cachedState.user });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, signIn, signOut, lock, unlock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(ERRORS.PROVIDER_NOT_FOUND);
  }
  return context;
}
