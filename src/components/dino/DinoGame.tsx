import { useEffect, useRef } from "react";
import { Runner } from "./offline";
import "./runner.css";

function ensureSharedDom() {
  // 스프라이트 리소스 (Runner.loadImages가 id로 찾음) — 모든 인스턴스 공유.
  if (!document.getElementById("offline-resources")) {
    const resDiv = document.createElement("div");
    resDiv.id = "offline-resources";
    resDiv.style.display = "none";

    const img1x = document.createElement("img");
    img1x.id = "offline-resources-1x";
    img1x.src = "/100-offline-sprite.png";
    resDiv.appendChild(img1x);

    const img2x = document.createElement("img");
    img2x.id = "offline-resources-2x";
    img2x.src = "/200-offline-sprite.png";
    resDiv.appendChild(img2x);

    document.body.appendChild(resDiv);
  }

  // Runner.init()가 .icon-offline 엘리먼트를 assert로 요구.
  if (!document.querySelector(".icon-offline")) {
    const icon = document.createElement("div");
    icon.className = "icon icon-offline";
    icon.style.display = "none";
    document.body.appendChild(icon);
  }
}

interface DinoGameProps {
  /** 이 탭이 현재 활성 상태인가 — false면 Runner pause + 키 lock. */
  isActive: boolean;
}

export function DinoGame({ isActive }: DinoGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<Runner | null>(null);

  // 첫 activation 시점에 Runner 생성 (display:none 상태에서 init하면 dimensions이 0이라
  // 탭이 보이게 된 이후 lazy init). 이후 isActive 변화는 lock/unlock으로만 처리.
  useEffect(() => {
    if (!isActive || runnerRef.current || !containerRef.current) return;
    ensureSharedDom();
    runnerRef.current = new Runner(containerRef.current);
  }, [isActive]);

  // 활성 상태 변화 → lock/unlock.
  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner) return;
    runner.setExternallyLocked(!isActive);
  }, [isActive]);

  // 언마운트 시 Runner 해제 (탭 닫기 대응).
  useEffect(() => {
    return () => {
      runnerRef.current?.destroy();
      runnerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-[150px] w-full max-w-[600px]"
    />
  );
}
