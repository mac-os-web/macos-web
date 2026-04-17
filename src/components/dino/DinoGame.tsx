import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Runner, type GameState } from "./offline";
import "./runner.css";

function ensureSharedDom() {
  // Sprite resources (Runner.loadImages looks them up by id) — shared across all instances.
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

  // Runner.init() asserts the presence of a .icon-offline element.
  if (!document.querySelector(".icon-offline")) {
    const icon = document.createElement("div");
    icon.className = "icon icon-offline";
    icon.style.display = "none";
    document.body.appendChild(icon);
  }
}

interface DinoGameProps {
  /** Whether this tab is currently active — when false, the Runner pauses and keys are locked. */
  isActive: boolean;
}

export function DinoGame({ isActive }: DinoGameProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<Runner | null>(null);
  const [gameState, setGameState] = useState<GameState>("idle");

  // Create Runner on first activation (init with display:none would give 0
  // dimensions, so defer until the tab becomes visible). After that, isActive
  // changes only toggle lock/unlock.
  useEffect(() => {
    if (!isActive || runnerRef.current || !containerRef.current) return;
    ensureSharedDom();
    runnerRef.current = new Runner(containerRef.current, setGameState);
  }, [isActive]);

  // Active-state change → lock/unlock.
  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner) return;
    runner.setExternallyLocked(!isActive);
  }, [isActive]);

  // Tear down the Runner on unmount (handles tab close).
  useEffect(() => {
    return () => {
      runnerRef.current?.destroy();
      runnerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      title={t(`safari.offline.dinoTooltip.${gameState}`)}
      className="relative mx-auto h-[150px] w-full max-w-[600px]"
    />
  );
}
