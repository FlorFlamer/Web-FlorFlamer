"use client";

import { useEffect, useMemo, useState } from "react";
import { PRELOAD_FONTS, PRELOAD_IMAGES } from "@/lib/assets-manifest";

type PreloadState = {
  progress: number; // 0..1
  done: boolean;
  failed: string[];
  loaded: number;
  total: number;
};

const SESSION_KEY = "ff_assets_loaded_v1";

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

async function preloadFont(fontFamily: string) {
  // Só funciona bem se a font estiver declarada em @font-face (ou next/font).
  // Se falhar, não bloqueamos o site — só registamos.
  if (!("fonts" in document)) return;
  try {
    // 1em é suficiente para disparar o load
    await (document as any).fonts.load(`1em "${fontFamily}"`);
  } catch {
    // Ignorar, o caller é que decide marcar como failed
    throw new Error(`font:${fontFamily}`);
  }
}

export function usePreloadAssets() {
  const [state, setState] = useState<PreloadState>({
    progress: 0,
    done: false,
    failed: [],
    loaded: 0,
    total: 0,
  });

  const items = useMemo(() => {
    const images = PRELOAD_IMAGES.map((s) => ({ kind: "img" as const, src: s }));
    const fonts = PRELOAD_FONTS.map((s) => ({ kind: "font" as const, src: s }));
    return [...images, ...fonts];
  }, []);

  useEffect(() => {
    // já carregado nesta sessão? entra direto
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setState((s) => ({ ...s, progress: 1, done: true, total: items.length, loaded: items.length }));
        return;
      }
    } catch {}

    let cancelled = false;

    const total = items.length;
    setState((s) => ({ ...s, total }));

    (async () => {
      const failed: string[] = [];
      let loaded = 0;

      const tick = () => {
        if (cancelled) return;
        const progress = total === 0 ? 1 : loaded / total;
        setState({ progress, done: loaded >= total, failed, loaded, total });
      };

      tick();

      for (const it of items) {
        try {
          if (it.kind === "img") await preloadImage(it.src);
          else await preloadFont(it.src);
        } catch (e: any) {
          failed.push(String(e?.message || it.src));
        } finally {
          loaded++;
          tick();
        }
      }

      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}

      if (!cancelled) {
        setState({ progress: 1, done: true, failed, loaded: total, total });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  return state;
}