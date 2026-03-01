"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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
  const { scanLinesEnabled, grimeEnabled, settingsOpen, helpOpen } = useHud();
  const preload = usePreloadAssets();

  const [showLoading, setShowLoading] = useState(true);
  const [bootFocus, setBootFocus] = useState(false);

  // Overlay ativo enquanto carrega (anti-flash)
  useEffect(() => {
    if (!preload.done) setShowLoading(true);
  }, [preload.done]);

  // Blur durante o "power-on" (timing)
  useEffect(() => {
    if (!preload.done) return;

    const t0 = window.setTimeout(() => setBootFocus(true), 80);
    const t1 = window.setTimeout(() => setBootFocus(false), 730);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [preload.done]);

  return (
    <div
      style={{
        ...styles.root,
        background: showLoading && !preload.done ? "#0b0b0f" : "#f8f8f8ff",
      }}
    >
      <HudRouteSync />
      <div
        style={{
          ...styles.content,
          
          // Mostrar (apenas quando tiver tudo carregado)
          opacity: preload.done ? 1 : 0,
          transition:
            "opacity 180ms ease, filter 520ms ease, transform 520ms ease",

          // Blur/Focus
          filter: bootFocus ? "blur(10px)" : "blur(0px)",
          transform: bootFocus ? "scale(1.01)" : "scale(1)",
        }}
      >
        {children}
      </div>

      {/* Loading */}
      {showLoading && (
        <LoadingScreen
          progress={preload.progress}
          done={preload.done}
          failedCount={preload.failed.length}
          onFinish={() => setShowLoading(false)}
        />
      )}

      {/* HUD/FX */}
      {!showLoading && (
        <>
          <MusicPlayer targetVolume={0.35} fadeMs={900} />

          {/* FX Layer */}

          <div style={styles.fxLayer}>
            <ScreenFX
              intensity={0.85}
              scanlines={scanLinesEnabled ? 0.6 : 0}
              grime={grimeEnabled ? 1 : 0}
            />
            <GlitchPulse />
            <ChannelZapTransition durationMs={220} strength={0.85} />
          </div>

          {/* Help Drawer */}

          <div
            style={{
              ...styles.drawerLayer,
              pointerEvents: helpOpen ? "auto" : "none",
            }}
          >
            <HelpDrawer />
          </div>
          
          {/* Settings Window */}

          <div
            style={{
              ...styles.windowLayer,
              pointerEvents: settingsOpen ? "auto" : "none",
            }}
          >
            <SettingsWindow />
          </div>
            
          {/* HUD */}

          <div style={styles.hudLayer}>
            <Hud />
          </div>
        </>
      )}
    </div>
  );
}