"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useHud } from "@/lib/hud-store";

type GlitchPulseProps = {
  durationMs?: number;
  intensity?: number;
  fine?: number;
  ultraFine?: number;
  bands?: number;
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function GlitchPulse({
  durationMs = 120,
  intensity = 0.55,
  fine = 0.75,
  ultraFine = 0.55,
  bands = 0.35,
}: GlitchPulseProps) {
  const { glitchPulseId } = useHud();

  const [on, setOn] = useState(false);
  const tRef = useRef<number | null>(null);

  const seed = useMemo(() => Math.floor(Math.random() * 9999) + 1, []);

  // Trigger pulse

  useEffect(() => {
    setOn(true);

    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setOn(false), durationMs);

    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, [glitchPulseId, durationMs]);

  if (!on) return null;

  // Strength params

  const I = clamp01(intensity);
  const F = clamp01(fine);
  const U = clamp01(ultraFine);
  const B = clamp01(bands);

  const filterId = `ffTvStatic_${seed}`;
  const fineWeight = String(0.7 + 0.3 * F);
  const ultraWeight = String(0.55 + 0.35 * U);
  const bandsWeight = String(0.12 + 0.35 * B);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        opacity: I,
        transform: "translateZ(0)",
      }}
    >
      
      {/* TV Static (SVG filter) */}

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "overlay",
        }}
      >
        <filter id={filterId}>

          {/* 1) Noise fino */}

          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.75"
            numOctaves="2"
            seed={seed}
            result="fineNoise"
          >
            <animate
              attributeName="baseFrequency"
              dur="0.06s"
              values="1.6;2.0;1.75"
              repeatCount="indefinite"
            />
          </feTurbulence>

          {/* 2) Noise ultra-fino */}

          <feTurbulence
            type="fractalNoise"
            baseFrequency="3.4"
            numOctaves="1"
            seed={seed + 13}
            result="ultraNoise"
          >
            <animate
              attributeName="baseFrequency"
              dur="0.05s"
              values="3.0;3.9;3.4"
              repeatCount="indefinite"
            />
          </feTurbulence>

          {/* 3) Banding horizontal */}

          <feTurbulence
            type="turbulence"
            baseFrequency="0.02 0.75"
            numOctaves="1"
            seed={seed + 27}
            result="bandsNoise"
          >
            <animate
              attributeName="baseFrequency"
              dur="0.10s"
              values="0.02 0.65;0.02 0.9;0.02 0.75"
              repeatCount="indefinite"
            />
          </feTurbulence>

          {/* 4) Mixer (fine + ultra) */}
          
          <feComposite
            in="fineNoise"
            in2="ultraNoise"
            operator="arithmetic"
            k1="0"
            k2={fineWeight}
            k3={ultraWeight}
            k4="0"
            result="mixed"
          />

          {/* 5) Mixer + bands */}

          <feComposite
            in="mixed"
            in2="bandsNoise"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3={bandsWeight}
            k4="0"
            result="mixed2"
          />

          {/* 6) Forçar preto & branco (luminance) */}

          <feColorMatrix
            in="mixed2"
            type="matrix"
            values="
              0.2126 0.7152 0.0722 0 0
              0.2126 0.7152 0.0722 0 0
              0.2126 0.7152 0.0722 0 0
              0      0      0      1 0
            "
            result="bw"
          />

          {/* 7) Contraste / salt & pepper */}

          <feComponentTransfer in="bw" result="finalNoise">
            <feFuncR type="gamma" amplitude="1.1" exponent="1.35" offset="-0.08" />
            <feFuncG type="gamma" amplitude="1.1" exponent="1.35" offset="-0.08" />
            <feFuncB type="gamma" amplitude="1.1" exponent="1.35" offset="-0.08" />
          </feComponentTransfer>
        </filter>

        <rect x="0" y="0" width="100" height="100" filter={`url(#${filterId})`} />
      </svg>

      {/* Micro roll */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: "ffTvRoll 0.12s linear infinite",
          mixBlendMode: "multiply",
          opacity: 0.15,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.12), rgba(0,0,0,0.0))",
        }}
      />

      {/* Tiny jitter */}
      
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: "ffTvJitter 0.12s steps(2,end) infinite",
        }}
      />

      <style>{`
        @keyframes ffTvRoll {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        @keyframes ffTvJitter {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(1px, -1px); }
          100% { transform: translate(0px, 0px); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="ffTvRoll"], div[style*="ffTvJitter"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
