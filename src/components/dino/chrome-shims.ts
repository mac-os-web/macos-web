// Shim for Chromium internal resources (mapped via ES module alias).
// Files under ./dino/ import from chrome://resources/js/*.js, which doesn't
// exist in the browser, so vite alias redirects those imports to this file.

// Type augmentation for globals Chromium injects on window (no-op stub).
declare global {
  interface Window {
    initializeEasterEggHighScore?: (highScore: number) => void;
    errorPageController?: {
      trackEasterEgg: () => void;
      updateEasterEggHighScore: (score: number) => void;
      resetEasterEggHighScore: () => void;
      trackClick: (eventType: number) => void;
    };
  }
}

export function assert<T>(condition: T, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

// loadTimeData: Chromium's page-injected config store.
// The web port has no injected data, so this is a no-op stub that returns
// empty/false for every lookup. As a result, disabledEasterEgg /
// enableAltGameMode and related flags are always off.
export const loadTimeData = {
  valueExists(_key: string): boolean {
    return false;
  },
  getValue(_key: string): string {
    return "";
  },
  getBoolean(_key: string): boolean {
    return false;
  },
  getString(_key: string): string {
    return "";
  },
};
