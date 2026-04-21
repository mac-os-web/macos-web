import { createContext, useCallback, useContext, useEffect, useState } from "react";

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

function isAuthState(value: unknown): value is AuthState {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  if (s.status === "unauthenticated") return true;
  if (s.status === "authenticated" || s.status === "locked") return isUser(s.user);
  return false;
}

function loadAuthState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { status: "unauthenticated" };
    const parsed: unknown = JSON.parse(raw);
    return isAuthState(parsed) ? parsed : { status: "unauthenticated" };
  } catch {
    return { status: "unauthenticated" };
  }
}

function persistAuthState(state: AuthState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (quota / security) — UI는 계속 동작
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuthState);

  useEffect(() => {
    persistAuthState(state);
  }, [state]);

  const signIn = useCallback((user: User) => {
    setState({ status: "authenticated", user });
  }, []);

  const signOut = useCallback(() => {
    setState({ status: "unauthenticated" });
  }, []);

  const lock = useCallback(() => {
    setState((prev) => (prev.status === "authenticated" ? { status: "locked", user: prev.user } : prev));
  }, []);

  const unlock = useCallback(() => {
    setState((prev) => (prev.status === "locked" ? { status: "authenticated", user: prev.user } : prev));
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
