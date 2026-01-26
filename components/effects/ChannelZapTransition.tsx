"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useHud } from "@/lib/hud-store";

type Props = {
  durationMs?: number;
  strength?: number;
};

const MQ_REDUCED = "(prefers-reduced-motion: reduce)";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function ChannelZapTransition({
  durationMs = 420,
  strength = 0.85,
}: Props) {
  const { channelZapId } = useHud();

  const [on, setOn] = useState(false);
  const tRef = useRef<number | null>(null);

  const seed = useMemo(() => Math.floor(Math.random() * 9999) + 1, []);
  const filterId = `ffChannelWarp_${seed}`;

  // Redusir motion

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.(MQ_REDUCED);
    if (!mq) return;

    const apply = () => setReducedMotion(!!mq.matches);
    apply();

    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Trigger: Troca de Channel

  useEffect(() => {
    setOn(true);

    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setOn(false), durationMs);

    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, [channelZapId, durationMs]);

  if (!on) return null;

  const S = clamp01(strength);

  // Reduced motion: flash
  if (reducedMotion) {
    return (
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "rgba(255,255,255,0.08)",
          animation: "ffZapFlash 0.18s ease-out",
        }}
      >
        <style>{`
          @keyframes ffZapFlash {
            0% { opacity: 0; }
            20% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
      }}
    >

      {/* SVG defs: Effeitos */}

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="turbulence"
              baseFrequency="0.012 0.35"
              numOctaves="1"
              seed={seed}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="0.12s"
                values="0.010 0.25; 0.018 0.55; 0.012 0.35"
                repeatCount="indefinite"
              />
            </feTurbulence>

            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={35 * S}
              xChannelSelector="R"
              yChannelSelector="G"
            >
              <animate
                attributeName="scale"
                dur={`${durationMs}ms`}
                values={`${38 * S}; ${12 * S}; 0`}
                keyTimes="0; 0.35; 1"
                calcMode="spline"
                keySplines="0.2 0.9 0.2 1; 0.2 0.9 0.2 1"
                fill="freeze"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>

      {/* Layer */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `url(#${filterId})`,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.00) 55%, rgba(0,0,0,0.12))",
          mixBlendMode: "overlay",
          animation: `ffZapFade ${durationMs}ms ease-out`,
        }}
      >
        {/* Scanlines */}

        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 7px)",
            mixBlendMode: "multiply",
            filter: "blur(0.25px)",
          }}
        />

        {/* Tear bar */}

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "40%",
            height: "14%",
            opacity: 0.18,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))",
            mixBlendMode: "screen",
            animation: "ffZapBar 0.18s ease-out",
          }}
        />

        {/* Micro jitter */}
        
        <div
          style={{
            position: "absolute",
            inset: 0,
            animation: "ffZapJitter 0.12s steps(2,end) infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes ffZapFade {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes ffZapBar {
          0% { transform: translateY(20px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(-40px); opacity: 0; }
        }
        @keyframes ffZapJitter {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(2px, -1px); }
          100% { transform: translate(0px, 0px); }
        }
      `}</style>
    </div>
  );
}
