"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useHud } from "@/lib/hud-store";
import { playSfx } from "@/lib/sfx";

// Types / constants

type Anchor = "free" | "tl" | "tr" | "bl" | "br";

const PAD = 12;
const SNAP = 24;

const MIN_W = 420;
const MIN_H = 420;
const MAX_W = 760;
const MAX_H = 760;
const RESIZE_GRAB = 18;

const WINDOW_W = MIN_W;
const WINDOW_H = MIN_H;

const TITLE_H = 30;

// Helpers

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function computeXYFromAnchor(
  anchor: Exclude<Anchor, "free">,
  dx: number,
  dy: number,
  vw: number,
  vh: number,
  w: number,
  h: number
) {
  const left = anchor === "tl" || anchor === "bl" ? dx : vw - w - dx;
  const top = anchor === "tl" || anchor === "tr" ? dy : vh - h - dy;

  return {
    x: clamp(left, PAD, vw - w - PAD),
    y: clamp(top, PAD, vh - h - PAD),
  };
}

// All Box Styles

const rowWrapStyle = {
  display: "grid",
  gridTemplateColumns: "45px 1fr",
  gap: 16,
  alignItems: "center",
  padding: 3,
} as const;

const iconBoxStyle = {
  width: 45,
  height: 45,
  display: "grid",
  placeItems: "center",
} as const;

const titleStyle = {
  fontFamily: "BNWolfstar",
  fontSize: 13,
  letterSpacing: 0.35,
  textTransform: "uppercase",
  color: "#111",
  lineHeight: 1.05,
} as const;

const descStyle = {
  marginTop: 6,
  fontFamily: "KCPixelHand",
  fontSize: 9,
  lineHeight: 1.35,
  color: "#111",
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
} as const;

const descStyleSoft = { ...descStyle, opacity: 0.85 } as const;

// UI atoms

function SettingsRowBase({
  iconSrc,
  title,
  desc,
  note,
}: {
  iconSrc: string;
  title: string;
  desc: string;
  note?: string;
}) {
  return (
    <div style={rowWrapStyle}>
      <div style={iconBoxStyle}>
        <Image src={iconSrc} alt="" width={52} height={52} draggable={false} />
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={titleStyle}>{title}</div>

        <div style={descStyleSoft}>
          <span>{desc}</span>
          {note ? <span style={{ opacity: 0.95 }}>{note}</span> : null}
        </div>
      </div>
    </div>
  );
}

function SettingsRowBlocked({
  iconSrc,
  title,
  desc,
  note,
}: {
  iconSrc: string;
  title: string;
  desc: string;
  note?: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      data-nosfx
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => playSfx("warn", { volume: 1 })}
      style={{
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
      }}
    >
      <SettingsRowBase iconSrc={iconSrc} title={title} desc={desc} note={note} />

      <div
        style={{
          position: "absolute",
          left: 3,
          top: 3,
          width: 45,
          height: 45,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          opacity: hover ? 1 : 0,
          transition: "opacity 80ms ease-out",
        }}
      >
        <Image
          src="/img/settings/block.webp"
          alt=""
          width={45}
          height={45}
          draggable={false}
          style={{
            imageRendering: "pixelated",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}

function ToggleSquare({
  checked,
  onToggle,
  size = 64,
  playAfterToggle = false,
}: {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  playAfterToggle?: boolean;
}) {
  const onClick = () => {
    if (playAfterToggle) {
      onToggle();
      requestAnimationFrame(() => {
        playSfx("yesNo", { volume: 1 });
      });
      return;
    }

    playSfx("yesNo", { volume: 1 });
    onToggle();
  };

  return (
    <button
      type="button"
      aria-label={checked ? "Disable" : "Enable"}
      onClick={onClick}
      data-nosfx
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "grid",
        placeItems: "center",
        padding: 0,
        border: "none",
        background: "rgba(0,0,0,0.001)",
        cursor: "pointer",
        overflow: "visible",
      }}
    >
      <Image
        src="/img/settings/no.webp"
        alt=""
        width={size}
        height={size}
        draggable={false}
        style={{ imageRendering: "pixelated", display: "block" }}
      />

      {checked ? (
        <img
          src="/img/settings/yes.webp"
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
            imageRendering: "pixelated",
          }}
        />
      ) : null}
    </button>
  );
}

function SettingsRowToggle({
  checked,
  onToggle,
  title,
  desc,
  note,
  playAfterToggle,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  desc: string;
  note?: string;
  playAfterToggle?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "45px 1fr",
        gap: 16,
        alignItems: "center",
        padding: 3,
      }}
    >
      <div style={{ width: 45, height: 45, display: "grid", placeItems: "center" }}>
        <ToggleSquare
          checked={checked}
          onToggle={onToggle}
          size={45}
          playAfterToggle={playAfterToggle}
        />
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "BNWolfstar",
            fontSize: 13,
            letterSpacing: 0.35,
            textTransform: "uppercase",
            color: "#111",
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 6,
            fontFamily: "KCPixelHand",
            fontSize: 9,
            lineHeight: 1.35,
            color: "#111",
            opacity: 0.85,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <span>{desc}</span>
          {note ? <span style={{ opacity: 0.95 }}>{note}</span> : null}
        </div>
      </div>
    </div>
  );
}

//  Main window

export default function SettingsWindow() {
  const [transitions, setTransitions] = useState(true);
  const [projectViewEffects, setProjectViewEffects] = useState(false);

  // RESET CACHE (press & hold)

  const RESET_HOLD_MS = 1400;

  const [resetPct, setResetPct] = useState(0);
  const resetRafRef = useRef<number | null>(null);
  const resetStartRef = useRef(0);
  const resetDoneRef = useRef(false);
  const resetPidRef = useRef<number | null>(null);

  const stopResetHold = (resetVisual = true) => {
    if (resetRafRef.current) {
      cancelAnimationFrame(resetRafRef.current);
      resetRafRef.current = null;
    }
    resetDoneRef.current = false;
    resetStartRef.current = 0;
    if (resetVisual) setResetPct(0);
  };

    const releaseResetCapture = (el?: HTMLButtonElement) => {
    try {
      const pid = resetPidRef.current;
      if (el && pid != null) el.releasePointerCapture(pid);
    } catch {}
    resetPidRef.current = null;
  };

  const performReset = () => {
    
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith("ff_")) localStorage.removeItem(k);
      }
    } catch {}

    // SessionStorage
    try {
      sessionStorage.clear();
    } catch {}

    // Limpar CacheStorage
    const clearCaches = async () => {
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {}
    };

    // Desregistrar service workers
    const unregisterSW = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch {}
    };

    Promise.all([clearCaches(), unregisterSW()]).finally(() => {

      window.setTimeout(() => window.location.reload(), 120);
    });
  };

    const startResetHold = (e: PointerEvent<HTMLButtonElement>) => {
    if (typeof e.button === "number" && e.button !== 0) return;

    const btn = e.currentTarget;

    e.preventDefault();
    e.stopPropagation();

    try {
      btn.setPointerCapture(e.pointerId);
      resetPidRef.current = e.pointerId;
    } catch {}

    playSfx("click", { volume: 1 });

    stopResetHold(false);
    setResetPct(0);
    resetStartRef.current = performance.now();

    const tick = (now: number) => {
      const t = now - resetStartRef.current;
      const pct = clamp(t / RESET_HOLD_MS, 0, 1);
      setResetPct(pct);

      if (pct >= 1) {
        if (resetDoneRef.current) return;
        resetDoneRef.current = true;

        if (resetRafRef.current) cancelAnimationFrame(resetRafRef.current);
        resetRafRef.current = null;

        playSfx("zap", { volume: 1 });
        releaseResetCapture(btn);
        performReset();
        return;
      }

      resetRafRef.current = requestAnimationFrame(tick);
    };

    resetRafRef.current = requestAnimationFrame(tick);
  };

  const endResetHold = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    releaseResetCapture(e.currentTarget);

    if (!resetDoneRef.current) stopResetHold(true);
  };

  const {
    settingsOpen,
    setSettingsOpen,

    scanLinesEnabled,
    setScanLinesEnabled,

    sfxEnabled,
    setSfxEnabled,

    grimeEnabled,
    setGrimeEnabled,

  } = useHud();

  // Mover / Mecher / Aumentar window

  const [x, setX] = useState(120);
  const [y, setY] = useState(120);

  const [anchor, setAnchor] = useState<Anchor>("free");
  const [dx, setDx] = useState(24);
  const [dy, setDy] = useState(24);

  const [winW, setWinW] = useState(WINDOW_W);
  const [winH, setWinH] = useState(WINDOW_H);

  const dragRef = useRef<{
    pid: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
  } | null>(null);

  const resizeRef = useRef<{
    pid: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    mode: "r" | "b" | "br";
  } | null>(null);

  const close = () => setSettingsOpen(false);

  const startResize =
    (mode: "r" | "b" | "br") => (e: PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);

      resizeRef.current = {
        pid: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startW: winW,
        startH: winH,
        mode,
      };
    };

  const onResizeMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = resizeRef.current;
    if (!r || r.pid !== e.pointerId) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const dxp = e.clientX - r.startX;
    const dyp = e.clientY - r.startY;

    let nextW = r.startW;
    let nextH = r.startH;

    if (r.mode === "r" || r.mode === "br") nextW = r.startW + dxp;
    if (r.mode === "b" || r.mode === "br") nextH = r.startH + dyp;

    nextW = clamp(nextW, MIN_W, Math.min(MAX_W, vw - PAD * 2));
    nextH = clamp(nextH, MIN_H, Math.min(MAX_H, vh - PAD * 2));

    setWinW(nextW);
    setWinH(nextH);

    setX((px) => clamp(px, PAD, vw - nextW - PAD));
    setY((py) => clamp(py, PAD, vh - nextH - PAD));
  };

  const endResize = (e: PointerEvent<HTMLDivElement>) => {
    const r = resizeRef.current;
    if (!r || r.pid !== e.pointerId) return;
    resizeRef.current = null;
  };

  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      setWinW((w) => clamp(w, MIN_W, Math.min(MAX_W, vw - PAD * 2)));
      setWinH((h) => clamp(h, MIN_H, Math.min(MAX_H, vh - PAD * 2)));

      if (anchor !== "free") {
        const next = computeXYFromAnchor(anchor, dx, dy, vw, vh, winW, winH);
        setX(next.x);
        setY(next.y);
        return;
      }

      setX((prev) => clamp(prev, PAD, vw - winW - PAD));
      setY((prev) => clamp(prev, PAD, vh - winH - PAD));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [anchor, dx, dy, winW, winH]);

  useEffect(() => {
    if (!settingsOpen) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (anchor !== "free") {
      const next = computeXYFromAnchor(anchor, dx, dy, vw, vh, winW, winH);
      setX(next.x);
      setY(next.y);
    } else {
      setX((prev) => clamp(prev, PAD, vw - winW - PAD));
      setY((prev) => clamp(prev, PAD, vh - winH - PAD));
    }
  }, [settingsOpen, anchor, dx, dy, winW, winH]);

  const onTitlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target?.dataset?.role === "close") return;

    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    dragRef.current = {
      pid: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: x,
      startTop: y,
      moved: false,
    };
  };

  const onTitlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pid !== e.pointerId) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const nx = d.startLeft + (e.clientX - d.startX);
    const ny = d.startTop + (e.clientY - d.startY);

    if (Math.abs(nx - d.startLeft) + Math.abs(ny - d.startTop) > 1) {
      d.moved = true;
      if (anchor !== "free") setAnchor("free");
    }

    setX(clamp(nx, PAD, vw - winW - PAD));
    setY(clamp(ny, PAD, vh - winH - PAD));
  };

  const onTitlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pid !== e.pointerId) return;
    dragRef.current = null;

    if (!d.moved) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const left = x;
    const top = y;
    const right = vw - (x + winW);
    const bottom = vh - (y + winH);

    let nextAnchor: Anchor = "free";
    if (left <= SNAP && top <= SNAP) nextAnchor = "tl";
    else if (right <= SNAP && top <= SNAP) nextAnchor = "tr";
    else if (left <= SNAP && bottom <= SNAP) nextAnchor = "bl";
    else if (right <= SNAP && bottom <= SNAP) nextAnchor = "br";

    if (nextAnchor !== "free") {
      const ndx = nextAnchor === "tl" || nextAnchor === "bl" ? left : right;
      const ndy = nextAnchor === "tl" || nextAnchor === "tr" ? top : bottom;

      setAnchor(nextAnchor);
      setDx(clamp(ndx, 0, 10_000));
      setDy(clamp(ndy, 0, 10_000));

      const snapped = computeXYFromAnchor(
        nextAnchor as Exclude<Anchor, "free">,
        ndx,
        ndy,
        vw,
        vh,
        winW,
        winH
      );
      setX(snapped.x);
      setY(snapped.y);
    }
  };

  // Render

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: winW,
        height: winH,

        opacity: settingsOpen ? 1 : 0,
        transform: settingsOpen ? "translateY(0px)" : "translateY(6px)",
        pointerEvents: settingsOpen ? "auto" : "none",
        transition: "opacity 160ms ease, transform 160ms ease",

        background: "#d7d7d7",
        border: "2px solid #efefef",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
      role="dialog"
      aria-label="Settings window"
    >
      {/* TITLE BAR */}

      <div
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        style={{
          height: TITLE_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          cursor: "grab",
          userSelect: "none",
          background: "#b6b6b6",
          borderBottom: "2px solid rgba(255,255,255,0.55)",
        }}
      >
        <div
          style={{
            fontFamily: "BNWolfstar",
            fontSize: 16,
            letterSpacing: 0.3,
            color: "#000000",
            whiteSpace: "nowrap",
          }}
        >
          Settings.exe
        </div>

        <button
          data-role="close"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          aria-label="Close settings"
          style={{
            width: 22,
            height: 22,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.001)",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Image
            src="/img/X.webp"
            alt="Close"
            width={22}
            height={22}
            draggable={false}
          />
        </button>
      </div>

      {/* BODY */}

      <div
        style={{
          height: winH - TITLE_H,
          background: "#d7d7d7",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* LIST (SCROLL) */}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <SettingsRowBlocked
            iconSrc="/img/settings/light_mode.webp"
            title="LIGHT/NIGHT MODE"
            desc="For those who prefer a different tone."
            note="(⚠ IN THE WORKS)"
          />

          <SettingsRowBlocked
            iconSrc="/img/settings/language.webp"
            title="LANGUAGE"
            desc="To change the language of all menus (PT/ENG/ES/FR)"
            note="(⚠ IN THE WORKS)"
          />

          <SettingsRowToggle
            checked={scanLinesEnabled}
            onToggle={() => setScanLinesEnabled(!scanLinesEnabled)}
            title="Scan Lines"
            desc="A small CRT effect with lines fading across the screen."
            note="(OLD TV)"
          />

          <SettingsRowToggle
            checked={grimeEnabled}
            onToggle={() => setGrimeEnabled(!grimeEnabled)}
            title="Screen Textures"
            desc="Fingerprints on the screen, Dirt, chromatic aberration, etc..."
            note="(OLD TV)"
          />

          <SettingsRowToggle
            checked={sfxEnabled}
            onToggle={() => setSfxEnabled(!sfxEnabled)}
            title="Sound Effects"
            desc="Pressing buttons, changing screens, asset sounds, etc..."
            note="(Ambient sounds)"
            playAfterToggle={!sfxEnabled}
          />

          <SettingsRowToggle
            checked={transitions}
            onToggle={() => setTransitions((v) => !v)}
            title="Transitions"
            desc="Channel Trasitions, UI open/close, etc..."
            note="(Ambient sounds)"
          />

          <SettingsRowToggle
            checked={projectViewEffects}
            onToggle={() => setProjectViewEffects((v) => !v)}
            title="Effects on Project View"
            desc='Activate all "OLD TV" effects on project view.'
            note="(Not recommended)"
          />

          {/* RESET CACHE */}

          <button
            type="button"
            data-nosfx
            onPointerDown={startResetHold}
            onPointerUp={endResetHold}
            onPointerCancel={endResetHold}
            onPointerLeave={endResetHold}
            aria-label="Press and hold to reset cache"
            style={{
              height: 46,
              minHeight: 46,
              flexShrink: 0,
              width: "100%",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              border: "none",
              padding: 5,

              backgroundColor: "#d15858",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "center",
              backgroundSize: "auto 100%",

              borderBottom: "5px solid #7a2e47",

              position: "relative",
              overflow: "hidden",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "none",
            }}
          >
            {/* barra a encher */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.round(resetPct * 100)}%`,
                background: "rgba(0,0,0,0.22)",
                pointerEvents: "none",
              }}
            />

            <span
              style={{
                position: "relative",
                zIndex: 1,
                fontFamily: "BNWolfstar",
                fontSize: 16,
                letterSpacing: 0.3,
                display: "grid",
                lineHeight: 1,
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <span>RESET CACHE</span>

              {resetPct > 0 && resetPct < 1 && (
                <span style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>
                  Resetting… {Math.round(resetPct * 100)}%
                </span>
              )}
            </span>
          </button>
        </div>

        {/* RESIZE HANDLES */}

        <div
          onPointerDown={startResize("r")}
          onPointerMove={onResizeMove}
          onPointerUp={endResize}
          style={{
            position: "absolute",
            right: 0,
            top: TITLE_H,
            width: RESIZE_GRAB,
            height: winH - TITLE_H,
            cursor: "ew-resize",
            background: "rgba(0,0,0,0.001)",
          }}
        />

        <div
          onPointerDown={startResize("b")}
          onPointerMove={onResizeMove}
          onPointerUp={endResize}
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: winW,
            height: RESIZE_GRAB,
            cursor: "ns-resize",
            background: "rgba(0,0,0,0.001)",
          }}
        />

        <div
          onPointerDown={startResize("br")}
          onPointerMove={onResizeMove}
          onPointerUp={endResize}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 18,
            height: 18,
            cursor: "nwse-resize",
            background: "rgba(0,0,0,0.001)",
          }}
        />
      </div>
    </div>
  );
}
