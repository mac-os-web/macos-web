import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth, type User } from "../contexts/auth";
import { WALLPAPER } from "../lib/wallpaper";

const DEV_USER: User = {
  name: "Dev User",
  email: "dev@local",
  picture: null,
};

// Placeholder for real Google OAuth flow (to be wired by backend team).
// Returns a mock authenticated user for now.
const MOCK_GOOGLE_USER: User = {
  name: "Guest",
  email: "guest@google.com",
  picture: null,
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export function LockScreen() {
  const { state, signIn, unlock } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Temporal.Now.plainDateTimeISO());

  useEffect(() => {
    const timer = setInterval(() => setNow(Temporal.Now.plainDateTimeISO()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Preload the home chunk so login → home feels instant.
  // Direct dynamic import bypasses the auth redirect in beforeLoad.
  useEffect(() => {
    import("./Home").catch(() => {
      // preload 실패는 조용히 무시 (critical하지 않음)
    });
  }, []);

  const time = now.toLocaleString(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = now.toLocaleString(i18n.language, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const isLocked = state.status === "locked";
  const user = isLocked ? state.user : null;

  const handleGoogleSignIn = () => {
    if (isLocked) {
      unlock();
    } else {
      // Backend team will replace this with real Google OAuth flow
      signIn(MOCK_GOOGLE_USER);
    }
    navigate({ to: "/" });
  };

  const handleDevSkip = () => {
    signIn(DEV_USER);
    navigate({ to: "/" });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Blurred wallpaper */}
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url(${WALLPAPER})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(20px) brightness(0.55)",
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Clock */}
        <div
          className="mb-20 text-center text-white"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          <p className="text-[96px] leading-none font-thin tracking-tight">{time}</p>
          <p className="mt-2 text-[18px] font-medium opacity-90">{date}</p>
        </div>

        {/* Avatar + name (locked only) */}
        {isLocked && user && (
          <div className="mb-6 flex flex-col items-center gap-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-20 w-20 rounded-full border-2 border-white/60 object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/60 text-[32px] font-light text-white shadow-lg"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <p
              className="text-[16px] font-medium text-white"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
            >
              {user.name}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col items-stretch gap-2.5">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-[14px] font-medium text-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }}
          >
            <GoogleIcon />
            {isLocked ? "Continue with Google" : "Sign in with Google"}
          </button>

          {import.meta.env.DEV && (
            <button
              onClick={handleDevSkip}
              className="rounded-full px-6 py-2 text-[12px] font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Skip (Dev)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
