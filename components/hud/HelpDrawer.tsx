"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useHud } from "@/lib/hud-store";

// Settings Animação

const DURATION_MS = 320;
const EASE = "cubic-bezier(0.2, 0.9, 0.2, 1)";

const PANEL_WIDTH = "clamp(320px, 42vw, 550px)";
const PANEL_PAD = "clamp(16px, 2.2vw, 24px)";
const PANEL_BG = "rgba(233, 233, 233, 1)";
const BACKDROP_BG = "rgba(0,0,0,0.25)";

//  Styles

const styles = {
  root: { position: "fixed" as const, inset: 0 },

  backdrop: (visible: boolean) => ({
    position: "absolute" as const,
    inset: 0,
    background: BACKDROP_BG,
    opacity: visible ? 1 : 0,
    transition: `opacity ${DURATION_MS}ms ${EASE}`,
  }),

  panel: (visible: boolean) => ({
    position: "absolute" as const,
    left: 0,
    top: 0,

    height: "100%",
    maxHeight: "100dvh",
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    overscrollBehavior: "contain" as const,

    width: PANEL_WIDTH,
    padding: PANEL_PAD,

    background: PANEL_BG,
    boxShadow: "0 0px 25px rgba(0, 0, 0, 0.1)",

    paddingTop: `calc(${PANEL_PAD} + env(safe-area-inset-top))`,
    paddingBottom: `calc(${PANEL_PAD} + env(safe-area-inset-bottom))`,

    transform: visible ? "translateX(0px)" : "translateX(-40px)",
    opacity: visible ? 1 : 0,
    transition: `transform ${DURATION_MS}ms ${EASE}, opacity ${DURATION_MS}ms ${EASE}`,
    willChange: "transform, opacity" as const,
  }),

  headerRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 16,
    marginBottom: 75,
  },

  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: 1,
    fontFamily: "inherit",
    fontWeight: 900,
    color: "#111",
    marginTop: 25,
  },

  closeBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    width: 56,
    height: 56,
  },

  closeImg: {
    display: "block",
    width: "80%",
    height: "80%",
  },

  sectionRow: (alignItems: "center" | "end" | "Center", marginBottom: number) => ({
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems,
    gap: 20,
    marginBottom,
  }),

  paragraph: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.5,
    color: "#111",
    fontFamily: "inherit",
    maxWidth: 280,
  },

  imageAuto: { display: "block", height: "auto" as const },

  secretsWrap: {
    display: "grid",
    gridTemplateRows: "auto auto",
    gap: 45,
    marginBottom: 80,
    justifyItems: "center",
  },

  secretsText: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.5,
    color: "#111",
    maxWidth: 520,
    textAlign: "center" as const,
  },

  flowersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(35px, 35px))",
    gap: "clamp(14px, 6vw, 60px)",
    alignItems: "end",
    justifyContent: "center",
    justifyItems: "center",
    width: "100%",
  },
};

export default function HelpDrawer() {
  const { helpOpen, setHelpOpen } = useHud();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Open/close:

  useEffect(() => {
    let raf1: number | null = null;
    let raf2: number | null = null;

    if (helpOpen) {
      setIsMounted(true);
      setIsVisible(false);

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setIsVisible(true));
      });

      return () => {
        if (raf1) cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }

    setIsVisible(false);
    const t = window.setTimeout(() => setIsMounted(false), DURATION_MS);
    return () => window.clearTimeout(t);
  }, [helpOpen]);

  // ESC fecha

  useEffect(() => {
    if (!helpOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelpOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpOpen, setHelpOpen]);

  // H abre/fecha (ignora quando estás a escrever)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || target?.isContentEditable;

      if (isTyping) return;

      if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        setHelpOpen(!helpOpen);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpOpen, setHelpOpen]);

  useEffect(() => {
    if (!helpOpen) return;
    const t = window.setTimeout(() => panelRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [helpOpen]);

  if (!isMounted) return null;

  // Layout

  return (
    <div style={styles.root} role="dialog" aria-modal="true">
      <div onClick={() => setHelpOpen(false)} style={styles.backdrop(isVisible)} />

      <div ref={panelRef} tabIndex={-1} style={styles.panel(isVisible)}>
        <div style={styles.headerRow}>
          <h2 style={styles.title}>
            <span style={{ fontFamily: "BNWolfstar", marginBottom: 1 }}>
              How to Use?
            </span>
            <br />
            <span
              style={{
                fontFamily: "KCPixelHand",
                fontSize: 12,
                display: "inline-block",
                marginTop: 5,
              }}
            >
              scroll tho see more ...
            </span>
          </h2>

          <button
            type="button"
            onClick={() => setHelpOpen(false)}
            aria-label="Close help"
            style={styles.closeBtn}
          >
            <Image
              src="/img/X.webp"
              alt="Close"
              width={56}
              height={56}
              priority
              style={styles.closeImg}
            />
          </button>
        </div>

        {/* SECTION: MOVE (WASD) */}

        <div style={styles.sectionRow("center", 80)}>
          <p style={styles.paragraph}>
            <span style={{ fontFamily: "KCPixelHand" }}>
              USE THE ARROWS OR “WASD” <br /> TO NAVIGATE in the Menus.
            </span>
          </p>

          <Image
            src="/img/help/move_help.webp"
            alt="Move controls (WASD)"
            width={140}
            height={110}
            style={styles.imageAuto}
          />
        </div>

        {/* SECTION: TAB */}

        <div style={styles.sectionRow("center", 80)}>
          <p style={styles.paragraph}>
            <span style={{ fontFamily: "KCPixelHand" }}>
              PRESS “TAB” TO OPEN <br /> THE NAVIGATION MENU.
            </span>
          </p>

          <Image
            src="/img/help/tab_help.webp"
            alt="Tab key"
            width={140}
            height={90}
            style={styles.imageAuto}
          />
        </div>

        {/* SECTION: OPTIONS */}

        <div style={styles.sectionRow("Center", 80)}>
          <p style={styles.paragraph}>
            <span style={{ fontFamily: "KCPixelHand" }}>
              PRESS “O” to see <br /> more options within performance and style.
            </span>
          </p>

          <Image
            src="/img/help/options_help.webp"
            alt="Options key"
            width={100}
            height={60}
            style={{
              ...styles.imageAuto,
              transform: "translateX(-20px)",
            }}
          />
        </div>

        {/* SECTION: MUSIC */}

        <div style={styles.sectionRow("Center", 80)}>
          <p style={styles.paragraph}>
            <span style={{ fontFamily: "KCPixelHand" }}>
              PRESS “M” to mute & unmute <br /> the music (sound effects is on options).
            </span>
          </p>

          <Image
            src="/img/help/music_help.webp"
            alt="Music key"
            width={65}
            height={25}
            style={{
              ...styles.imageAuto,
              transform: "translateX(-48px)",
            }}
          />
        </div>

        {/* SECTION: PRESS */}

        <div style={styles.sectionRow("end", 120)}>
          <p style={styles.paragraph}>
            <span style={{ fontFamily: "KCPixelHand" }}>
              PRESS “ENTER” <br /> TO CONFIRM & ADVANCE.
            </span>
          </p>

          <Image
            src="/img/help/press_help.webp"
            alt="Press key"
            width={140}
            height={90}
            style={{
              ...styles.imageAuto,
              transform: "translateX(-5px)",
            }}
          />
        </div>

        {/* SECTION: SECRETS */}

        <div style={styles.secretsWrap}>
          <p style={styles.secretsText}>
            <span style={{ fontFamily: "KCPixelHand" }}>
              Some things react. Some don’t. <br /> If something does, you probably did the <br /> right thing!
            </span>
          </p>

          <div style={styles.flowersGrid}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Image
                key={i}
                src="/img/flower.webp"
                alt={`Flower ${i + 1}`}
                width={35}
                height={35}
                style={{ display: "block", width: 35, height: 35 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
