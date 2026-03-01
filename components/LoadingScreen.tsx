"use client";

import { useEffect, useState } from "react";

type Props = {
  progress: number;
  done: boolean;
  failedCount?: number;
  onFinish?: () => void;
  onStartFinish?: () => void;
};

export default function LoadingScreen({
  progress,
  done,
  failedCount = 0,
  onFinish,
  onStartFinish,
}: Props) {
  const pct = Math.round(progress * 100);

  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!done) return;
    setFinishing(true);
    onStartFinish?.();

    const t = window.setTimeout(() => {
      onFinish?.();
    }, 760);

    return () => window.clearTimeout(t);
  }, [done, onFinish, onStartFinish]);

  return (
    <div
      className={[
        "pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center",
        finishing ? "ff-crt-exit" : "",
      ].join(" ")}
    >
      {/* background base */}
      <div className="ff-bg pointer-events-none absolute inset-0" />

      {/* scanlines base */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
        }}
      />

      {/* vignette */}
      <div className="ff-vignette pointer-events-none absolute inset-0" />

      {/* CRT POWER-ON layer */}
      <div className="ff-crt-power pointer-events-none absolute inset-0" />

      {/* Loading Bar */}
      <div className={["relative w-[min(520px,90vw)] px-6 py-6", "ff-ui"].join(" ")}>
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
          <div
            style={{
              fontFamily: "BNWolfstar Rounded, system-ui, sans-serif",
              fontSize: 12,
            }}
          >
            {pct}%
          </div>
          <div
            style={{
              fontFamily: "BNWolfstar Rounded, system-ui, sans-serif",
              fontSize: 12,
            }}
          >
            {failedCount > 0 ? `missing: ${failedCount}` : "assets ok"}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ff-bg {
          background: #0b0b0f;
        }

        .ff-vignette {
          box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.85);
          opacity: 1;
        }

        /* UI desaparece */

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

        /* Fundo */

        .ff-crt-exit .ff-bg {
          animation: ffBgFade 760ms ease forwards;
        }

        @keyframes ffBgFade {
          0% {
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          85% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        /* Vignette */

        .ff-crt-exit .ff-vignette {
          animation: ffVignetteHoldFade 760ms ease forwards;
        }

        @keyframes ffVignetteHoldFade {
          0% {
            opacity: 1;
            box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.85);
          }
          40% {
            opacity: 1;
            box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.85);
          }
          85% {
            opacity: 0;
            box-shadow: inset 0 0 180px rgba(0, 0, 0, 0);
          }
          100% {
            opacity: 0;
            box-shadow: inset 0 0 180px rgba(0, 0, 0, 0);
          }
        }

        /* Power layer (desligada) */

        .ff-crt-power {
          opacity: 0;
        }

        /* Power-on começa logo */

        .ff-crt-exit .ff-crt-power {
          opacity: 1;
          animation: ffPowerOn 720ms ease forwards;
          animation-delay: 0ms;
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
          transform-origin: center;
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