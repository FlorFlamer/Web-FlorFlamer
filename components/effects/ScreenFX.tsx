"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ScreenFXProps = {
  intensity?: number;
  scanlines?: number;
  vignette?: number;
  noise?: number;
  grime?: number;
  scanRollSpeed?: number;
};

const MQ_REDUCED = "(prefers-reduced-motion: reduce)";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function ScreenFX({
  intensity = 1,
  scanlines = 0.6,
  vignette = 0.55,
  noise = 0.25,
  grime = 1,
  scanRollSpeed = 22,
}: ScreenFXProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const scanRef = useRef<HTMLDivElement | null>(null);

  // Reduced motion

  useEffect(() => {
    const mq = window.matchMedia?.(MQ_REDUCED);
    if (!mq) return;

    const apply = () => setReducedMotion(!!mq.matches);
    apply();

    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Strength params

  const I = clamp01(intensity);
  const S = clamp01(scanlines) * I;
  const V = clamp01(vignette) * I;
  const N = clamp01(noise) * I;
  const G = clamp01(grime) * I;

  // Styles

  const css = useMemo(() => {
    return {
      wrapper: {
        position: "absolute" as const,
        inset: 0,
        pointerEvents: "none" as const,
      },

      scan: {
        position: "absolute" as const,
        inset: 0,
        opacity: S,
        mixBlendMode: "multiply" as const,
        backgroundImage:
          "repeating-linear-gradient(to bottom, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, rgba(255,255,255,0) 2px, rgba(255,255,255,0) 4px)",
        backgroundSize: "auto",
        willChange: "background-position",
      },

      vignette: {
        position: "absolute" as const,
        inset: 0,
        opacity: V,
        background:
          "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        mixBlendMode: "multiply" as const,
      },

      noise: {
        position: "absolute" as const,
        inset: 0,
        opacity: N,
        backgroundImage: "url(/fx/noise.webp)",
        backgroundRepeat: "repeat",
        mixBlendMode: "overlay" as const,
      },

      grime: {
        position: "absolute" as const,
        inset: 0,
        pointerEvents: "none" as const,
        backgroundImage: "url(/img/textures/grime.webp)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.10 * G,
        mixBlendMode: "overlay" as const,
        filter: "blur(0.15px)",
        transform: "translateZ(0)",
      },
    };
  }, [S, V, N, G]);

  // Effect: scanlines roll

  useEffect(() => {
    const el = scanRef.current;
    if (!el) return;

    if (reducedMotion || S <= 0.0001) {
      el.style.backgroundPosition = "0px 0px";
      return;
    }

    let y = 0;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      y -= scanRollSpeed * dt;

      if (y < -10000) y = 0;

      el.style.backgroundPosition = `0px ${y.toFixed(2)}px`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, scanRollSpeed, S]);

  return (
    <div style={css.wrapper}>
      <div ref={scanRef} style={css.scan} />
      <div style={css.vignette} />
      <div style={css.noise} />
      <div style={css.grime} />
    </div>
  );
}
