"use client";

import { useEffect, useRef } from "react";
import { useHud } from "@/lib/hud-store";

type MusicPlayerProps = {
  targetVolume?: number; // 0..1
  fadeMs?: number;
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function MusicPlayer({
  targetVolume = 0.35,
  fadeMs = 900,
}: MusicPlayerProps) {
  const { musicEnabled, audioUnlocked, toggleMusic } = useHud();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fadeIntervalRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);

  const shouldPlayRef = useRef(false);

  // Fade Music

  const clearFade = () => {
    if (fadeIntervalRef.current !== null) {
      window.clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    if (pauseTimeoutRef.current !== null) {
      window.clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  };

  const fadeTo = (toRaw: number, ms: number, onDone?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    clearFade();

    const from = clamp01(audio.volume ?? 0);
    const to = clamp01(toRaw);
    const start = performance.now();

    if (ms <= 0) {
      audio.volume = to;
      onDone?.();
      return;
    }

    const stepEvery = 30;

    fadeIntervalRef.current = window.setInterval(() => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / ms);

      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      audio.volume = from + (to - from) * eased;

      if (t >= 1) {
        clearFade();
        onDone?.();
      }
    }, stepEvery);
  };

  const fadeOutAndPause = () => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;

    fadeTo(0, fadeMs, () => {
      audio.pause();
    });

    // safety timeout (garante pausa mesmo se intervalo falhar)

    pauseTimeoutRef.current = window.setTimeout(() => {
      const a = audioRef.current;
      if (!a) return;
      a.volume = 0;
      a.pause();
    }, fadeMs + 80);
  };

  const ensurePlayAndFadeIn = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      fadeTo(targetVolume, fadeMs);
      return;
    }

    audio.volume = 0;

    try {
      await audio.play();
      fadeTo(targetVolume, fadeMs);
    } catch {
    }
  };

  // Effect: liga/desliga

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    shouldPlayRef.current = !!(audioUnlocked && musicEnabled);

    if (!audioUnlocked) {
      clearFade();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      return;
    }

    if (musicEnabled) {
      ensurePlayAndFadeIn();
    } else {
      fadeTo(0, fadeMs, () => {
        const a = audioRef.current;
        if (!a) return;
        a.pause();
      });
    }

    return () => clearFade();
  }, [musicEnabled, audioUnlocked, targetVolume, fadeMs]);


  // Effect: Window Foco

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) fadeOutAndPause();
      else if (shouldPlayRef.current) ensurePlayAndFadeIn();
    };

    const onBlur = () => fadeOutAndPause();
    const onFocus = () => shouldPlayRef.current && ensurePlayAndFadeIn();
    const onPageHide = () => fadeOutAndPause();
    const onPageShow = () => shouldPlayRef.current && ensurePlayAndFadeIn();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [targetVolume, fadeMs]);

  // Hotkey: "M"

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key.toLowerCase() !== "m") return;

      const el = document.activeElement as HTMLElement | null;
      const isTyping =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);

      if (isTyping) return;

      toggleMusic();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleMusic]);

  return (
    <audio ref={audioRef} loop preload="auto" crossOrigin="anonymous">
      <source src="/audio/music/ambient.mp3" type="audio/mpeg" />
    </audio>
  );
}
