"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

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

  const fxLayer = useMemo(() => {
    return (
      <div style={styles.fxLayer}>
        <ScreenFX
          intensity={0.85}
          scanlines={scanLinesEnabled ? 0.6 : 0}
          grime={grimeEnabled ? 1 : 0}
        />
        <GlitchPulse />
        <ChannelZapTransition durationMs={220} strength={0.85} />
      </div>
    );
  }, [scanLinesEnabled, grimeEnabled]);

  return (
    <div style={styles.root}>
      <HudRouteSync />
      <MusicPlayer targetVolume={0.35} fadeMs={900} />
      <div style={styles.content}>{children}</div>

      {fxLayer}

      <div
        style={{
          ...styles.drawerLayer,
          pointerEvents: helpOpen ? "auto" : "none",
        }}
      >
        <HelpDrawer />
      </div>

      <div
        style={{
          ...styles.windowLayer,
          pointerEvents: settingsOpen ? "auto" : "none",
        }}
      >
        <SettingsWindow />
      </div>

      <div style={styles.hudLayer}>
        <Hud />
      </div>
    </div>
  );
}
