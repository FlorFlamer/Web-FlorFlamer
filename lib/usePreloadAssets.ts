"use client";

import { useEffect, useMemo, useState } from "react";
import { PRELOAD_FONTS, PRELOAD_IMAGES } from "@/lib/assets-manifest";

type PreloadState = {
  progress: number;
  done: boolean;
  failed: string[];
  loaded: number;
  total: number;
  logs: string[];
};

const SESSION_KEY = "ff_assets_loaded_v1";

/* Utils */
function withTimeout<T>(p: Promise<T>, ms: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(`timeout:${label}`)), ms);
    p.then((v) => {
      window.clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      window.clearTimeout(t);
      reject(e);
    });
  });
}

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

async function preloadFont(fontFamily: string) {
  if (!("fonts" in document)) return;
  try {
    await (document as any).fonts.load(`1em "${fontFamily}"`);
  } catch {
    throw new Error(`font:${fontFamily}`);
  }
}

/* Hook */
export function usePreloadAssets() {
  const [state, setState] = useState<PreloadState>({
    progress: 0,
    done: false,
    failed: [],
    loaded: 0,
    total: 0,
    logs: [],
  });

  const items = useMemo(() => {
    const images = PRELOAD_IMAGES.map((s) => ({ kind: "img" as const, src: s }));
    const fonts = PRELOAD_FONTS.map((s) => ({ kind: "font" as const, src: s }));
    return [...images, ...fonts];
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setState((s) => ({
          ...s,
          progress: 1,
          done: true,
          total: items.length,
          loaded: items.length,
          logs: [
            "FLORFLAMER OS v0.9",
            "------------------------------------------",
            "BOOT/CACHE :: session cache hit",
            `BOOT/ASSETS:: ${items.length}/${items.length} (skipped)`,
            "BOOT/STATUS:: ready",
          ],
        }));
        return;
      }
    } catch {}

    let cancelled = false;

    const total = items.length;

    setState((s) => ({
      ...s,
      total,
      logs: [
        "FLORFLAMER OS v0.9",
        "------------------------------------------",
        "BOOT/INIT  :: building preload queue...",
      ],
    }));

    (async () => {
      const failed: string[] = [];
      const logs: string[] = [];
      let loaded = 0;

      const pushLog = (line: string) => {
        logs.push(line);
        const sliced = logs.length > 120 ? logs.slice(-120) : logs.slice();
        if (!cancelled) {
          setState((s) => ({ ...s, logs: sliced }));
        }
      };

      const tick = () => {
        if (cancelled) return;
        const progress = total === 0 ? 1 : loaded / total;
        setState((s) => ({
          ...s,
          progress,
          done: loaded >= total,
          failed,
          loaded,
          total,
        }));
      };

      pushLog(`BOOT/ASSETS:: ${total} assets detected`);
      pushLog("------------------------------------------");
      tick();

      for (const it of items) {
        const tag = it.kind === "img" ? "IMG" : "FONT";

        pushLog(`LOAD/${tag.padEnd(4)} :: ${it.src}`);

        try {
          if (it.kind === "img") {
            await withTimeout(preloadImage(it.src), 3500, it.src);
          } else {
            await withTimeout(preloadFont(it.src), 3500, `font:${it.src}`);
          }

          pushLog(`OK  /${tag.padEnd(4)} :: ${it.src}`);
        } catch (e: any) {
          const msg = String(e?.message || it.src);
          failed.push(msg);
          pushLog(`FAIL/${tag.padEnd(4)} :: ${msg}`);
        } finally {
          loaded++;
          tick();
        }
      }

      pushLog("------------------------------------------");

      if (failed.length === 0) {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
          pushLog("BOOT/CACHE :: session stored");
        } catch {
          pushLog("BOOT/CACHE :: failed to store");
        }
      } else {
        pushLog(`BOOT/WARN  :: ${failed.length} failures`);
      }

      pushLog("BOOT/STATUS:: preload complete");

      if (!cancelled) {
        setState((s) => ({
          ...s,
          progress: 1,
          done: true,
          failed,
          loaded: total,
          total,
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  return state;
}