"use client";

let sfxEnabled = true;

export function setSfxEnabledGlobal(v: boolean) {
  sfxEnabled = v;
}

type SfxName = "click" | "hover" | "open" | "close" | "zap" | "warn" | "yesNo";

// Paths Base

const PATHS: Omit<Record<SfxName, string>, "click"> = {
  hover: "/audio/sfx/select/ui_hover.ogg",
  open: "/audio/sfx/menu_open.ogg",
  close: "/audio/sfx/menu_close.ogg",
  zap: "/audio/sfx/channel_zap.ogg",
  warn: "/audio/sfx/select/warn.ogg",
  yesNo: "/audio/sfx/select/yes_no.ogg",
};

const CLICK_VARIANTS = [
  "/audio/sfx/click/click1.ogg",
  "/audio/sfx/click/click2.ogg",
  "/audio/sfx/click/click3.ogg",
] as const;

let masterVolume = 0.6;

let ctx: AudioContext | null = null;
const buffers: Record<string, AudioBuffer | undefined> = {};

// Anti-Spam

const lastPlayAt: Record<string, number | undefined> = {};
const MIN_GAP_MS: Partial<Record<SfxName, number>> = {
  hover: 50,
};

export function setSfxEnabled(v: boolean) {
  sfxEnabled = v;
}

export function setSfxMasterVolume(v: number) {
  masterVolume = Math.max(0, Math.min(1, v));
}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

async function loadUrl(url: string) {
  const cached = buffers[url];
  if (cached) return cached;

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`[SFX] Failed to load ${url} (HTTP ${res.status})`);
  }

  const arr = await res.arrayBuffer();
  const audioCtx = getCtx();
  const buf = await audioCtx.decodeAudioData(arr);

  buffers[url] = buf;
  return buf;
}

export async function preloadSfx(
  names: SfxName[] = ["click", "hover", "open", "close", "zap", "warn", "yesNo"]
) {
  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch {}
  }

  const urls: string[] = [];

  for (const n of names) {
    if (n === "click") urls.push(...CLICK_VARIANTS);
    else urls.push(PATHS[n]);
  }

  await Promise.all(urls.map((u) => loadUrl(u)));
}

export async function playSfx(name: SfxName, opts: { volume?: number; rate?: number } = {}) {
  if (!sfxEnabled) return;

  const now = performance.now();
  const gap = MIN_GAP_MS[name] ?? 0;
  const last = lastPlayAt[name] ?? -1e9;
  if (now - last < gap) return;
  lastPlayAt[name] = now;

  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch {}
  }

  const url =
    name === "click"
      ? CLICK_VARIANTS[(Math.random() * CLICK_VARIANTS.length) | 0]
      : PATHS[name];

  const buf = buffers[url] ?? (await loadUrl(url));

  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = opts.rate ?? 1;

  const gain = audioCtx.createGain();
  gain.gain.value = Math.max(0, Math.min(1, (opts.volume ?? 1) * masterVolume));

  src.connect(gain);
  gain.connect(audioCtx.destination);

  src.start(0);
}
