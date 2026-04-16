// Chromium 내부 리소스 대체 shim (ES module alias로 매핑)
// ./dino/ 폴더의 ts 파일들이 chrome://resources/js/*.js를 import하는데,
// 브라우저에선 존재하지 않으므로 vite alias로 이 파일을 대체.

// Chromium이 window에 주입하는 전역 필드 타입 확장 (no-op stub)
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

// loadTimeData: Chromium이 페이지에 주입하는 설정 저장소.
// 웹 포트에선 주입 데이터가 없으니 모든 조회를 빈 값/false로 반환하는 no-op 스텁.
// 결과적으로 disabledEasterEgg / enableAltGameMode 등은 항상 꺼진 상태.
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
