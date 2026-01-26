"use client";

import { useEffect, useRef } from "react";
import { useHud } from "@/lib/hud-store";

//  ONDINHA YUPIII ... quer dizer... SVG wave

const W = 24;
const H = 12;
const STEPS = 64;
const FREQ = 1.6;

function makeWavePath(opts: {
  width: number;
  height: number;
  amplitude: number;
  frequency: number;
  phase: number;
}) {
  const { width, height, amplitude, frequency, phase } = opts;

  const midY = height / 2;
  let d = `M 0 ${midY}`;

  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    const x = t * width;
    const y = midY + Math.sin(t * Math.PI * 2 * frequency + phase) * amplitude;
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  return d;
}

function getPrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

// Component

export default function MusicToggle() {
  const { musicEnabled, toggleMusic } = useHud();

  const pathRef = useRef<SVGPathElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const phaseRef = useRef(0);
  const ampRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = getPrefersReducedMotion();

    if (prefersReducedMotion) {
      const d = makeWavePath({
        width: W,
        height: H,
        amplitude: musicEnabled ? H * 0.22 : 0,
        frequency: FREQ,
        phase: 0,
      });
      pathRef.current?.setAttribute("d", d);
      return;
    }

    let mounted = true;

    const tick = () => {
      if (!mounted) return;

      // Amplitude Easing (ON/OFF)

      const targetAmp = musicEnabled ? H * 0.24 : 0;
      ampRef.current += (targetAmp - ampRef.current) * 0.02;

      // Fase (velocidade visual)

      phaseRef.current += musicEnabled ? 0.06 : 0.12;

      const d = makeWavePath({
        width: W,
        height: H,
        amplitude: ampRef.current,
        frequency: FREQ,
        phase: phaseRef.current,
      });

      pathRef.current?.setAttribute("d", d);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [musicEnabled]);

  return (
    <button
      type="button"
      aria-label={musicEnabled ? "Music on" : "Music off"}
      onClick={toggleMusic}
      className="
        flex items-center justify-center
        h-10 w-10
        rounded-sm
        bg-neutral-200/70
        opacity-75
        shadow
        hover:bg-neutral-200
        active:translate-y-[1px]
      "
    >
      <div className="relative h-4 w-6">
        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            d={makeWavePath({
              width: W,
              height: H,
              amplitude: 0,
              frequency: FREQ,
              phase: 0,
            })}
            fill="none"
            stroke="rgb(64 64 64)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </button>
  );
}
