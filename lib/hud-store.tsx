"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChannelKey } from "./channels";
import { CHANNEL_ORDER } from "./channels";
import { preloadSfx, playSfx, setSfxEnabled } from "@/lib/sfx";

// Keybinds

const KEY_HELP = "h";
const KEY_SETTINGS = "o";
const KEY_MUSIC = "m";

type HudState = {
  currentChannel: ChannelKey;
  setCurrentChannel: (c: ChannelKey) => void;

  pendingPath: string | null;
  setPendingPath: (v: string | null) => void;

  setupDone: boolean;
  language: "pt" | "en";
  theme: "light" | "night";

  setSetupDone: (v: boolean) => void;
  setLanguage: (v: "pt" | "en") => void;
  setTheme: (v: "light" | "night") => void;

  selectChannel: (c: ChannelKey) => void;

  channelPickMode: boolean;
  channelPickSelected: ChannelKey;
  startChannelPick: () => void;
  stepChannelPick: (delta: -1 | 1) => void;
  confirmChannelPick: () => void;
  cancelChannelPick: () => void;

  helpOpen: boolean;
  setHelpOpen: (v: boolean) => void;

  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;

  musicEnabled: boolean;
  toggleMusic: () => void;
  audioUnlocked: boolean;

  scanLinesEnabled: boolean;
  setScanLinesEnabled: (v: boolean) => void;

  sfxEnabled: boolean;
  setSfxEnabled: (v: boolean) => void;
  toggleSfx: () => void;

  grimeEnabled: boolean;
  setGrimeEnabled: (v: boolean) => void;

  glitchPulseId: number;
  triggerGlitchPulse: () => void;

  channelZapId: number;
  triggerChannelZap: () => void;
};

const HudContext = createContext<HudState | null>(null);

// LocalStorage

const LS_MUSIC = "ff_music_enabled";
const LS_SCANLINES = "ff_fx_scanlines";
const LS_SFX = "ff_sfx_enabled";
const LS_GRIME = "ff_fx_grime";
const LS_SETUP_DONE = "ff_setup_done";
const LS_LANG = "ff_lang";
const LS_THEME = "ff_theme";

function safeLSGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLSSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function HudProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

  const channelToPath = (c: ChannelKey) => 
    (c === "home" ? "/" : `/${c}`);

  const pushChannelRoute = (c: ChannelKey) => {
    const nextPath = channelToPath(c);
    if (typeof window !== "undefined" && window.location.pathname !== nextPath) {
      router.push(nextPath);
    }
  };

  const digitBufferRef = useRef("");
  const digitTimerRef = useRef<number | null>(null);

  const [currentChannel, setCurrentChannel] = useState<ChannelKey>("home");
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [channelPickMode, setChannelPickMode] = useState(false);
  const [channelPickSelected, setChannelPickSelected] = useState<ChannelKey>("home");
  const [channelPickOrigin, setChannelPickOrigin] = useState<ChannelKey>("home");

  const [musicEnabled, setMusicEnabled] = useState(true);
  const [scanLinesEnabled, setScanLinesEnabled] = useState(true);

  const [sfxEnabled, setSfxEnabledState] = useState(true);

  const [grimeEnabled, setGrimeEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // First-run setup (defaults)

  const [setupDone, setSetupDoneState] = useState(false);
  const [language, setLanguageState] = useState<"pt" | "en">("pt");
  const [theme, setThemeState] = useState<"light" | "night">("light");

  const audioUnlockedRef = useRef(audioUnlocked);
  useEffect(() => {
    audioUnlockedRef.current = audioUnlocked;
  }, [audioUnlocked]);

  const [glitchPulseId, setGlitchPulseId] = useState(0);
  const triggerGlitchPulse = () => setGlitchPulseId((p) => p + 1);

  const [channelZapId, setChannelZapId] = useState(0);
  const triggerChannelZap = () => {
    setChannelZapId((p) => p + 1);

    if (audioUnlockedRef.current) {
      playSfx("zap", { volume: 1 });
    }
  };

  const prevHelpOpenRef = useRef(helpOpen);
  useEffect(() => {
    const prev = prevHelpOpenRef.current;
    if (prev === helpOpen) return;
    prevHelpOpenRef.current = helpOpen;

    if (!audioUnlockedRef.current) return;

    if (helpOpen) playSfx("open", { volume: 1 });
    else playSfx("close", { volume: 1 });
  }, [helpOpen]);

  const prevSettingsOpenRef = useRef(settingsOpen);
  useEffect(() => {
    const prev = prevSettingsOpenRef.current;
    if (prev === settingsOpen) return;
    prevSettingsOpenRef.current = settingsOpen;

    if (!audioUnlockedRef.current) return;

    if (settingsOpen) playSfx("open", { volume: 1 });
    else playSfx("close", { volume: 1 });
  }, [settingsOpen]);

  const currentChannelRef = useRef<ChannelKey>(currentChannel);
  const channelPickSelectedRef = useRef<ChannelKey>(channelPickSelected);

  const channelPickModeRef = useRef(channelPickMode);

  useEffect(() => {
    currentChannelRef.current = currentChannel;
  }, [currentChannel]);

  useEffect(() => {
    channelPickSelectedRef.current = channelPickSelected;
  }, [channelPickSelected]);

  useEffect(() => {
    channelPickModeRef.current = channelPickMode;
  }, [channelPickMode]);

  const selectChannel = (c: ChannelKey) => {
    triggerChannelZap();
    setCurrentChannel(c);
    setPendingPath(channelToPath(c));
    pushChannelRoute(c);
    setChannelPickMode(false);
  };

  const startChannelPick = () => {
    const origin = currentChannelRef.current;
    setChannelPickOrigin(origin);
    setChannelPickSelected(origin);
    setChannelPickMode(true);
  };

  const PICK_ANIM_MS = 180;
  const pickLockRef = useRef(false);
  const pickQueuedRef = useRef(0);
  const pickTimerRef = useRef<number | null>(null);

  const applyStep = (dir: -1 | 1) => {
    const keys = CHANNEL_ORDER;
    const cur = currentChannelRef.current;

    const idx = keys.indexOf(cur);
    if (idx < 0) return;

    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= keys.length) return;

    const next = keys[nextIdx];

    triggerChannelZap();
    setCurrentChannel(next);
    setChannelPickSelected(next);
    setPendingPath(channelToPath(next));
    pushChannelRoute(next);

    currentChannelRef.current = next;
    channelPickSelectedRef.current = next;
  };

  const flushQueue = () => {
    const q = pickQueuedRef.current;

    if (q === 0) {
      pickLockRef.current = false;
      return;
    }

    const dir: -1 | 1 = q > 0 ? 1 : -1;
    pickQueuedRef.current = q - dir;

    applyStep(dir);
    pickTimerRef.current = window.setTimeout(flushQueue, PICK_ANIM_MS);
  };

  const stepChannelPick = (dir: -1 | 1) => {
    if (pickLockRef.current) {
      pickQueuedRef.current = Math.max(-8, Math.min(8, pickQueuedRef.current + dir));
      return;
    }

    pickLockRef.current = true;
    applyStep(dir);

    if (pickTimerRef.current) window.clearTimeout(pickTimerRef.current);
    pickTimerRef.current = window.setTimeout(flushQueue, PICK_ANIM_MS);
  };

  const confirmChannelPick = () => setChannelPickMode(false);

  const cancelChannelPick = () => {
    setChannelPickSelected(channelPickOrigin);
    setChannelPickMode(false);
  };

  const toggleMusic = () => setMusicEnabled((p) => !p);

  const toggleMusicRef = useRef(toggleMusic);
  useEffect(() => {
    toggleMusicRef.current = toggleMusic;
  }, [toggleMusic]);

  const setSfxEnabledHud = (v: boolean) => setSfxEnabledState(v);
  const toggleSfx = () => setSfxEnabledState((p) => !p);

  const setSetupDone = (v: boolean) => setSetupDoneState(v);
  const setLanguage = (v: "pt" | "en") => setLanguageState(v);
  const setTheme = (v: "light" | "night") => setThemeState(v);

  // LocalStorage: load (1x)

  useEffect(() => {
    const v = safeLSGet(LS_MUSIC);
    if (v === "0") setMusicEnabled(false);
    if (v === "1") setMusicEnabled(true);

    const s = safeLSGet(LS_SCANLINES);
    if (s === "0") setScanLinesEnabled(false);
    if (s === "1") setScanLinesEnabled(true);

    const fx = safeLSGet(LS_SFX);
    if (fx === "0") setSfxEnabledState(false);
    if (fx === "1") setSfxEnabledState(true);

    const g = safeLSGet(LS_GRIME);
    if (g === "0") setGrimeEnabled(false);
    if (g === "1") setGrimeEnabled(true);

    const sd = safeLSGet(LS_SETUP_DONE);
    if (sd === "1") setSetupDoneState(true);
    if (sd === "0") setSetupDoneState(false);

    const lg = safeLSGet(LS_LANG);
    if (lg === "pt" || lg === "en") setLanguageState(lg);

    const th = safeLSGet(LS_THEME);
    if (th === "light" || th === "night") setThemeState(th);
  }, []);

  // Persistência: save

  useEffect(() => {
    safeLSSet(LS_MUSIC, musicEnabled ? "1" : "0");
  }, [musicEnabled]);

  useEffect(() => {
    safeLSSet(LS_SCANLINES, scanLinesEnabled ? "1" : "0");
  }, [scanLinesEnabled]);

  useEffect(() => {
    safeLSSet(LS_SFX, sfxEnabled ? "1" : "0");
  }, [sfxEnabled]);

  useEffect(() => {
    safeLSSet(LS_GRIME, grimeEnabled ? "1" : "0");
  }, [grimeEnabled]);

  useEffect(() => {
    safeLSSet(LS_SETUP_DONE, setupDone ? "1" : "0");
  }, [setupDone]);

  useEffect(() => {
    safeLSSet(LS_LANG, language);
  }, [language]);

  useEffect(() => {
    safeLSSet(LS_THEME, theme);
  }, [theme]);

  // Ligar / Desligar SFX

  useEffect(() => {
    setSfxEnabled(sfxEnabled);
  }, [sfxEnabled]);

  useEffect(() => {
    if (!audioUnlocked) return;
    preloadSfx(["click", "zap", "open", "close"]);
  }, [audioUnlocked]);

  useEffect(() => {
    if (!audioUnlocked) return;

    const shouldIgnoreTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el) return false;

      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if ((el as any).isContentEditable) return true;
      if (el.closest?.("[data-nosfx]")) return true;

      return false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (typeof e.button === "number" && e.button !== 0) return;
      if (shouldIgnoreTarget(e.target)) return;

      playSfx("click", { volume: 1 });
    };

    window.addEventListener("pointerdown", onPointerDown, true);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [audioUnlocked]);

  // KEYBINDS

  useLayoutEffect(() => {
    const clearDigitTimer = () => {
      if (digitTimerRef.current) {
        window.clearTimeout(digitTimerRef.current);
        digitTimerRef.current = null;
      }
    };

    const pushDigit = (d: string) => {
      clearDigitTimer();
      digitBufferRef.current = (digitBufferRef.current + d).slice(0, 2);

      digitTimerRef.current = window.setTimeout(() => {
        digitBufferRef.current = "";
        digitTimerRef.current = null;
      }, 650);

      const n = Number(digitBufferRef.current);
      if (!Number.isFinite(n)) return;

      if (n >= 1 && n <= CHANNEL_ORDER.length) {
        const next = CHANNEL_ORDER[n - 1];
        triggerChannelZap();
        setCurrentChannel(next);
        setPendingPath(channelToPath(next));
        pushChannelRoute(next);
        setChannelPickSelected(next);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const t = e.target as HTMLElement | null;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || (t as any).isContentEditable);

      if (e.key === "Tab") {
        e.preventDefault();
        if (!channelPickModeRef.current) startChannelPick();
        else confirmChannelPick();
        digitBufferRef.current = "";
        return;
      }

      if (typing) return;

      const k = e.key.toLowerCase();
      const pickMode = channelPickModeRef.current;

      if (!pickMode && k === KEY_HELP) {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }

      if (!pickMode && k === KEY_SETTINGS) {
        e.preventDefault();
        setSettingsOpen((v) => !v);
        return;
      }

      if (!pickMode && k === KEY_MUSIC) {
        e.preventDefault();
        toggleMusicRef.current();
        return;
      }

      if (pickMode) {
        if (e.key >= "0" && e.key <= "9") {
          e.preventDefault();
          pushDigit(e.key);
          return;
        }

        if (e.code?.startsWith("Numpad") && e.key >= "0" && e.key <= "9") {
          e.preventDefault();
          pushDigit(e.key);
          return;
        }

        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          confirmChannelPick();
          digitBufferRef.current = "";
          return;
        }
      }

      if (e.key === "Escape") {
        setHelpOpen(false);
        setSettingsOpen(false);
        return;
      }

      if (!pickMode) return;

      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        stepChannelPick(1);
        digitBufferRef.current = "";
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        stepChannelPick(-1);
        digitBufferRef.current = "";
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearDigitTimer();

      if (pickTimerRef.current) {
        window.clearTimeout(pickTimerRef.current);
        pickTimerRef.current = null;
      }
      pickQueuedRef.current = 0;
      pickLockRef.current = false;
    };
  }, []);

  useEffect(() => {
    const unlock = async () => {
      setAudioUnlocked(true);

      try {
        await preloadSfx(["click", "zap", "open", "close"]);
      } catch {}
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const value = useMemo(
    () => ({
      currentChannel,
      setCurrentChannel,
      selectChannel,
      pendingPath,
      setPendingPath,

      setupDone,
      language,
      theme,
      setSetupDone,
      setLanguage,
      setTheme,

      channelPickMode,
      channelPickSelected,
      startChannelPick,
      stepChannelPick,
      confirmChannelPick,
      cancelChannelPick,

      helpOpen,
      setHelpOpen,

      settingsOpen,
      setSettingsOpen,

      musicEnabled,
      toggleMusic,
      audioUnlocked,

      scanLinesEnabled,
      setScanLinesEnabled,

      sfxEnabled,
      setSfxEnabled: setSfxEnabledHud,
      toggleSfx,

      grimeEnabled,
      setGrimeEnabled,

      glitchPulseId,
      triggerGlitchPulse,

      channelZapId,
      triggerChannelZap,
    }),
    [
      currentChannel,
      setupDone,
      language,
      theme,
      channelPickMode,
      channelPickSelected,
      helpOpen,
      settingsOpen,
      musicEnabled,
      audioUnlocked,
      scanLinesEnabled,
      sfxEnabled,
      grimeEnabled,
      glitchPulseId,
      channelZapId,
    ]
  );

  return <HudContext.Provider value={value}>{children}</HudContext.Provider>;
}

export function useHud() {
  const ctx = useContext(HudContext);
  if (!ctx) throw new Error("useHud must be used inside <HudProvider />");
  return ctx;
}
