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
};

export default function LoadingScreen({
  progress,
  done,
  forceFinish = false,
  failedCount = 0,
  logs = [],
  onFinish,
  onStartFinish,
}: Props) {
  const pct = Math.round(progress * 100);

  const [finishing, setFinishing] = useState(false);
  const startedFinishRef = useRef(false);

  const termRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("[LS] props", { done, forceFinish, progress, failedCount, logsLen: logs.length });
  }, [done, forceFinish, progress, failedCount, logs.length]);

  useEffect(() => {
    console.log("[LS] finishing:", finishing);
  }, [finishing]);

  useEffect(() => {
    const el = termRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs.length]);

  useEffect(() => {
    if (!finishing) return;

    const hard = window.setTimeout(() => {
      console.log("[LS] HARD onFinish()");
      onFinish?.();
    }, 2200);

    return () => window.clearTimeout(hard);
  }, [finishing, onFinish]);

  useEffect(() => {
    if (!(done || forceFinish)) return;
    if (startedFinishRef.current) return;

    startedFinishRef.current = true;
    console.log("[LS] START OUTRO", { done, forceFinish });

    // ✅ entra em finishing já (sem delay) -> garante classe ff-crt-exit aparece
    setFinishing(true);
    onStartFinish?.();

    const outroMs = 760;

    const t1 = window.setTimeout(() => {
      console.log("[LS] CALL onFinish()");
      onFinish?.();
    }, outroMs);

    return () => window.clearTimeout(t1);
  }, [done, forceFinish, onFinish, onStartFinish]);

  useEffect(() => {
    if (!finishing) return;

    const hard = window.setTimeout(() => {
      console.log("[LS] HARD onFinish()");
      onFinish?.();
    }, 2200);

    return () => window.clearTimeout(hard);
  }, [finishing, onFinish]);

  const bootLines = useMemo(
    () => [
      "FLORFLAMER OS v0.9  (CRT BOOT)",
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

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] flex items-center justify-center",
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

      <div className={["relative w-[min(520px,90vw)] px-6 py-6", "ff-ui z-[5]"].join(" ")}>
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

      <style jsx>{`
        .ff-bg {
          background: #0b0b0f;
        }

        .ff-termWrap {
          opacity: 0.34;
          filter: blur(0.3px);
        }

        .ff-crt-exit {
          animation: ffOverlayOut 760ms ease forwards;
        }

        @keyframes ffOverlayOut {
          0% {
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          70% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
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
          color: rgba(160, 255, 200, 0.55);
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
          0% {
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          70% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        .ff-crt-exit .ff-vignette {
          animation: ffVignetteHoldFade 760ms ease forwards;
        }

        @keyframes ffVignetteHoldFade {
          0% {
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          70% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
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
          0% {
            transform: scaleY(0.02) scaleX(0.92);
            opacity: 0;
          }
          12% {
            transform: scaleY(0.02) scaleX(1);
            opacity: 1;
          }
          35% {
            transform: scaleY(0.22) scaleX(1);
            opacity: 1;
          }
          60% {
            transform: scaleY(1) scaleX(1);
            opacity: 0.95;
          }
          100% {
            transform: scaleY(1) scaleX(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}