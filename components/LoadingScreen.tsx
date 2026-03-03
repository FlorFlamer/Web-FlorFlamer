"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  progress: number;
  done: boolean;
  forceFinish?: boolean;
  failedCount?: number;
  logs?: string[];

  onFinish?: () => void;
  onStartFinish?: () => void;

  requireUserStart?: boolean;
  onUserStart?: () => void;
};

export default function LoadingScreen({
  progress,
  done,
  forceFinish = false,
  failedCount = 0,
  logs = [],
  onFinish,
  onStartFinish,
  requireUserStart = true,
  onUserStart,
}: Props) {
  const pct = Math.round(progress * 100);

  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showStart, setShowStart] = useState(false);

  const startedRef = useRef(false);
  const finishingRef = useRef(false);

  const tFinishRef = useRef<number | null>(null);
  const tHardRef = useRef<number | null>(null);
  const tShowStartRef = useRef<number | null>(null);

  const termRef = useRef<HTMLDivElement | null>(null);

    const beginExit = () => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    setFinishing(true);
    onStartFinish?.();

    const outroMs = 760;

    if (tFinishRef.current) window.clearTimeout(tFinishRef.current);
    tFinishRef.current = window.setTimeout(() => {
      onFinish?.();
    }, outroMs);

    if (tHardRef.current) window.clearTimeout(tHardRef.current);
    tHardRef.current = window.setTimeout(() => {
      onFinish?.();
    }, 2200);
  };

  useEffect(() => {
    const el = termRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs.length]);

  useEffect(() => {
    if (!(done || forceFinish)) return;

    setReady(true);

    if (tShowStartRef.current) window.clearTimeout(tShowStartRef.current);
    tShowStartRef.current = window.setTimeout(() => {
      setShowStart(true);
    }, 160);
  }, [done, forceFinish]);

  const startNow = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    setStarted(true);
    onUserStart?.();
    beginExit();
  };

  useEffect(() => {
    if (!showStart) return;
    if (!requireUserStart) return;
    if (startedRef.current) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startNow();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showStart, requireUserStart]);

  useEffect(() => {
    if (!showStart) return;
    if (startedRef.current) return;
    if (!requireUserStart) startNow();
  }, [showStart, requireUserStart]);

  useEffect(() => {
    return () => {
      if (tFinishRef.current) window.clearTimeout(tFinishRef.current);
      if (tHardRef.current) window.clearTimeout(tHardRef.current);
      if (tShowStartRef.current) window.clearTimeout(tShowStartRef.current);
    };
  }, []);

  const bootLines = useMemo(
    () => [
      "Hydralis OS v0.0.8  (CRT BOOT)",
      "------------------------------------------",
      "BOOT/INIT :: building preload queue...",
      "BOOT/GFX  :: initializing CRT pipeline...",
      "BOOT/AUDIO:: calibrating channel_zap...",
      "BOOT/IO   :: waiting for preload events...",
      "------------------------------------------",
    ],
    []
  );

  const shownLogs = useMemo(() => {
    const max = 200;
    return logs.length > max ? logs.slice(-max) : logs;
  }, [logs]);

  const swapping = ready && !started && !finishing;

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] flex items-center justify-center",
        swapping ? "ff-swap" : "",
        finishing ? "ff-crt-exit" : "pointer-events-auto",
      ].join(" ")}
      style={{ pointerEvents: finishing ? "none" : "auto" }}
    >
      <div className="ff-bg pointer-events-none absolute inset-0 z-[0]" />

      <div className="ff-termWrap pointer-events-none absolute inset-0 z-[1]">
        <div className="ff-termNoise absolute inset-0" />
        <div ref={termRef} className="ff-term absolute inset-0 px-6 py-5" aria-hidden="true">
          {bootLines.map((l, i) => (
            <div key={`boot-${i}`}>{l}</div>
          ))}
          {shownLogs.length === 0 ? (
            <>
              <div>WAIT/ASSETS:: listening…</div>
              <div>TIP/USER  :: just vibe.</div>
            </>
          ) : (
            shownLogs.map((l, i) => <div key={`log-${i}`}>{l}</div>)
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-20 z-[2]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
        }}
      />

      <div className="ff-vignette pointer-events-none absolute inset-0 z-[3]" />
      <div className="ff-crt-power pointer-events-none absolute inset-0 z-[4]" />

      {/* LOADING UI */}
      <div className="relative w-[min(520px,90vw)] px-6 py-6 ff-ui z-[5]" aria-hidden={swapping}>
        <div className="flex items-center justify-between gap-4">
          <div
            className="ff-ui-text"
            style={{
              fontFamily: "KCPixelHand, monospace",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.92)",
              fontSize: 22,
              textTransform: "uppercase",
            }}
          >
            LOADING…
          </div>

          {/* Flamer animado */}
          <div className="ff-loadingSprite" aria-hidden="true" />
        </div>

        <div className="ff-ui-bar mt-4 h-[10px] w-full overflow-hidden border border-white/40">
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              background: "rgba(255,255,255,0.85)",
              transition: "width 120ms linear",
            }}
          />
        </div>

        <div className="ff-ui-meta mt-3 flex items-center justify-between text-white/70">
          <div style={{ fontFamily: "BNWolfstar, system-ui, sans-serif", fontSize: 12 }}>
            {pct}%
          </div>
          <div style={{ fontFamily: "BNWolfstar, system-ui, sans-serif", fontSize: 12 }}>
            {failedCount > 0 ? `missing: ${failedCount}` : "assets ok"}
          </div>
        </div>
      </div>

      {/* START button */}
      {showStart && requireUserStart && !started && (
        <div className="absolute inset-0 z-[6] flex items-center justify-center">
          <div className="ff-startWrap">
            <button
              type="button"
              onClick={startNow}
              className="ff-startBtn border border-white/40 px-8 py-4 text-white/90 hover:bg-white/10 active:bg-white/15"
              style={{
                fontFamily: "KCPixelHand, monospace",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontSize: 18,
              }}
            >
              CLICK TO START / PRESS ENTER
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .ff-bg {
          background: #0b0b0f;
        }

        .ff-termWrap {
          opacity: 0.34;
          filter: blur(0.3px);
        }

        .ff-startBtn {
          animation: ffBlink 1.05s steps(2, end) infinite;
        }

        @keyframes ffBlink {
          0% { opacity: 1; }
          50% { opacity: 0.55; }
          100% { opacity: 1; }
        }

        .ff-swap .ff-ui {
          animation: ffUiFade 220ms ease forwards;
          pointer-events: none;
        }

        .ff-startWrap {
          opacity: 0;
          transform: translateY(4px);
          filter: blur(1.2px);
          pointer-events: none;
        }

        .ff-swap .ff-startWrap {
          animation: ffStartFadeIn 220ms ease forwards;
          pointer-events: auto;
        }

        @keyframes ffStartFadeIn {
          0% {
            opacity: 0;
            transform: translateY(4px);
            filter: blur(1.2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
            filter: blur(0px);
          }
        }

        .ff-crt-exit {
          animation: ffOverlayOut 760ms ease forwards;
        }

        @keyframes ffOverlayOut {
          0% { opacity: 1; }
          25% { opacity: 1; }
          70% { opacity: 0; }
          100% { opacity: 0; }
        }

        .ff-crt-exit .ff-termWrap,
        .ff-crt-exit .ff-termNoise {
          animation: ffOverlayOut 760ms ease forwards;
        }

        .ff-term {
          overflow-y: auto;
          overflow-x: hidden;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          font-size: 12px;
          line-height: 1.4;
          letter-spacing: 0.03em;
          color: rgba(160, 255, 200, 0.25);
          white-space: pre;
          text-shadow: 0 0 10px rgba(120, 255, 180, 0.12);
          scrollbar-width: none;
        }

        .ff-term::-webkit-scrollbar {
          display: none;
        }

        .ff-termNoise {
          opacity: 0.1;
          background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 34px 34px, 21px 21px;
          background-position: 0 0, 10px 12px;
        }

        .ff-vignette {
          box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.85);
          opacity: 1;
        }

        .ff-crt-exit .ff-ui {
          animation: ffUiFade 220ms ease forwards;
        }

        @keyframes ffUiFade {
          0% {
            opacity: 1;
            transform: translateY(0px);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(4px);
            filter: blur(1.2px);
          }
        }

        .ff-crt-exit .ff-bg {
          animation: ffBgFade 760ms ease forwards;
        }

        @keyframes ffBgFade {
          0% { opacity: 1; }
          25% { opacity: 1; }
          70% { opacity: 0; }
          100% { opacity: 0; }
        }

        .ff-crt-exit .ff-vignette {
          animation: ffVignetteHoldFade 760ms ease forwards;
        }

        @keyframes ffVignetteHoldFade {
          0% { opacity: 1; }
          25% { opacity: 1; }
          70% { opacity: 0; }
          100% { opacity: 0; }
        }

        .ff-crt-power {
          opacity: 0;
        }

        .ff-crt-exit .ff-crt-power {
          opacity: 1;
          animation: ffPowerOn 720ms ease forwards;
          background: radial-gradient(
              ellipse at center,
              rgba(255, 255, 255, 0.55) 0%,
              rgba(255, 255, 255, 0.12) 35%,
              rgba(0, 0, 0, 0) 70%
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0) 46%,
              rgba(255, 255, 255, 0.95) 50%,
              rgba(255, 255, 255, 0) 54%,
              rgba(255, 255, 255, 0) 100%
            );
          filter: blur(1.2px);
        }

        @keyframes ffPowerOn {
          0% { transform: scaleY(0.02) scaleX(0.92); opacity: 0; }
          12% { transform: scaleY(0.02) scaleX(1); opacity: 1; }
          35% { transform: scaleY(0.22) scaleX(1); opacity: 1; }
          60% { transform: scaleY(1) scaleX(1); opacity: 0.95; }
          100% { transform: scaleY(1) scaleX(1); opacity: 0; }
        }

        .ff-loadingSprite {
          width: 25px;
          height: 25px;

          background-image: url("/img/anima_loding.webp");
          background-repeat: no-repeat;
          background-position: 0 0;
          background-size: 200px 25px;

          /* scaling (mantém o frame certo) */
          transform: scale(1.2);
          transform-origin: right center;

          image-rendering: pixelated;
          opacity: 0.9;

          will-change: background-position;
          animation: ffSpritePlay 0.85s steps(8) infinite;
        }

        @keyframes ffSpritePlay {
          from { background-position: 0 0; }
          to { background-position: -200px 0; }
        }

        /* respeita reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .ff-loadingSprite {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}