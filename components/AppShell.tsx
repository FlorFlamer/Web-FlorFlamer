"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

// Loading
import LoadingScreen from "@/components/LoadingScreen";
import { usePreloadAssets } from "@/lib/usePreloadAssets";

// UI layers
import Hud from "@/components/hud/Hud";
import SettingsWindow from "@/components/hud/SettingsWindow";
import HelpDrawer from "@/components/hud/HelpDrawer";

// FX / audio
import MusicPlayer from "@/components/effects/MusicPlayer";
import ScreenFX from "@/components/effects/ScreenFX";
import GlitchPulse from "@/components/effects/GlitchPulse";
import ChannelZapTransition from "@/components/effects/ChannelZapTransition";

// State
import { useHud } from "@/lib/hud-store";
import HudRouteSync from "@/components/HudRouteSync";
import { HUD_Z } from "@/lib/hud-layers";

const styles = {
  root: {
    position: "fixed" as const,
    inset: 0,
    overflow: "hidden",
    overflowX: "hidden" as const,
    isolation: "isolate" as const,
  },
  content: {
    position: "absolute" as const,
    inset: 0,
    zIndex: 0,
  },
  fxLayer: {
    position: "absolute" as const,
    inset: 0,
    pointerEvents: "none" as const,
    zIndex: HUD_Z.scanlines,
  },
  windowLayer: {
    position: "absolute" as const,
    inset: 0,
    zIndex: HUD_Z.window,
  },
  hudLayer: {
    position: "absolute" as const,
    inset: 0,
    pointerEvents: "none" as const,
    zIndex: HUD_Z.hud,
  },
  drawerLayer: {
    position: "absolute" as const,
    inset: 0,
    zIndex: HUD_Z.drawer,
  },
};

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const { scanLinesEnabled, grimeEnabled, settingsOpen, helpOpen, hudReady } = useHud();
  const preload = usePreloadAssets() as any;

  const [showLoading, setShowLoading] = useState(true);
  const [bootFocus, setBootFocus] = useState(false);
  const [forceFinish, setForceFinish] = useState(false);

  // ✅ evita reativar o loading depois de já ter terminado uma vez
  const finishedOnceRef = useRef(false);

  const done = !!preload?.done;
  const progress = typeof preload?.progress === "number" ? preload.progress : 0;
  const logs: string[] = Array.isArray(preload?.logs) ? preload.logs : [];
  const failedCount =
    Array.isArray(preload?.failed)
      ? preload.failed.length
      : typeof preload?.failedCount === "number"
        ? preload.failedCount
        : 0;

  // ✅ FAILSAFE: se hudReady não vier, força o finish (MAS sem "matar" já)
  useEffect(() => {
    if (!done) return;
    if (!showLoading) return;
    if (hudReady) return;

    const t = window.setTimeout(() => {
      setForceFinish(true);
    }, 2500);

    return () => window.clearTimeout(t);
  }, [done, showLoading, hudReady]);

  // Overlay ativo enquanto carrega (anti-flash)
  useEffect(() => {
    if (!done && !finishedOnceRef.current) setShowLoading(true);
  }, [done]);

  // Blur durante o "power-on" (timing)
  useEffect(() => {
    if (!done) return;

    const t0 = window.setTimeout(() => setBootFocus(true), 80);
    const t1 = window.setTimeout(() => setBootFocus(false), 730);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [done]);

  return (
    <div
      style={{
        ...styles.root,
        background: showLoading && !done ? "#0b0b0f" : "#f8f8f8ff",
      }}
    >
      <HudRouteSync />

      <div
        style={{
          ...styles.content,
          opacity: done ? 1 : 0,
          transition: "opacity 180ms ease, filter 520ms ease, transform 520ms ease",
          filter: bootFocus ? "blur(10px)" : "blur(0px)",
          transform: bootFocus ? "scale(1.01)" : "scale(1)",
        }}
      >
        {children}
      </div>

      {/* ✅ Monta HUD/FX assim que assets ok (mesmo com loading ainda por cima) */}
      {done && (
        <>
          <MusicPlayer targetVolume={0.35} fadeMs={900} />

          <div style={styles.fxLayer}>
            <ScreenFX
              intensity={0.85}
              scanlines={scanLinesEnabled ? 0.6 : 0}
              grime={grimeEnabled ? 1 : 0}
            />
            <GlitchPulse />
            <ChannelZapTransition durationMs={220} strength={0.85} />
          </div>

          <div
            style={{
              ...styles.drawerLayer,
              pointerEvents: !showLoading && helpOpen ? "auto" : "none",
            }}
          >
            <HelpDrawer />
          </div>

          <div
            style={{
              ...styles.windowLayer,
              pointerEvents: !showLoading && settingsOpen ? "auto" : "none",
            }}
          >
            <SettingsWindow />
          </div>

          <div style={styles.hudLayer}>
            <Hud />
          </div>
        </>
      )}

      {/* Loading */}
        {showLoading && (
          <LoadingScreen
            key="boot-loading"
            progress={progress}
            logs={logs}
            failedCount={failedCount}
            done={done && (hudReady || forceFinish)}
            forceFinish={forceFinish}
            onFinish={() => {
              finishedOnceRef.current = true;
              setShowLoading(false);
              setForceFinish(false);
            }}
          />
        )}
    </div>
  );
}