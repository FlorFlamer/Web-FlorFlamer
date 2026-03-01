"use client";

import type { ReactNode } from "react";

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
    background: "#f8f8f8ff",
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

  // ✅ HOOK TEM DE SER AQUI (top-level)
  const preload = usePreloadAssets();

  return (
    <div style={styles.root}>
      <HudRouteSync />
      <MusicPlayer targetVolume={0.35} fadeMs={900} />

      <div style={styles.content}>{children}</div>

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

      {/* ✅ Loading Screen por cima de tudo */}
      {!preload.done && (
        <LoadingScreen
          progress={preload.progress}
          failedCount={preload.failed.length}
        />
      )}
    </div>
  );
}