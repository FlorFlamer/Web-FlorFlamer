"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useHud } from "@/lib/hud-store";
import { playSfx } from "@/lib/sfx";

export default function FirstRunWindow() {
  const {
    setupDone,
    setSetupDone,

    musicEnabled,
    toggleMusic,

    sfxEnabled,
    toggleSfx,
  } = useHud();

  if (setupDone) return null;

  const [fadeIn, setFadeIn] = useState(false);
  const [closing, setClosing] = useState(false);

  const [hoverTheme, setHoverTheme] = useState(false);
  const [hoverLang, setHoverLang] = useState(false);

  const visible = fadeIn && !closing;

  const iconBtnStyle: React.CSSProperties = {
    width: 35,
    height: 35,
    background: "rgba(255,255,255,0.65)",
    cursor: "pointer",
    padding: 0,
    display: "grid",
    placeItems: "center",
    border: "none",
  };

  const finish = () => {
    if (closing) return;

    playSfx("yesNo", { volume: 1 });
    setClosing(true);
    window.setTimeout(() => {
      setSetupDone(true);
    }, 320);
  };

  // icons Theme/Language/Music/SFX
  const themeIconFixed = "/img/settings/light_mode.webp";
  const langIconFixed = "/img/settings/ing.webp";
  const musicIcon = musicEnabled 
    ? "/img/settings/music_on.webp" 
    : "/img/settings/music_off.webp";
  const sfxIcon = sfxEnabled
    ? "/img/settings/sound_effect_on.webp"
    : "/img/settings/sound_effect_off.webp";

  const TITLE_H = 30;
  const W = 520;

  useEffect(() => {
    const t = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <>
      {/* Fundo Preto trasparente */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          pointerEvents: "auto",

          opacity: visible ? 1 : 0,
          transition: "opacity 240ms ease",
        }}
      />

      {/* Window */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",

          opacity: visible ? 1 : 0,
          transform: visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -48%) scale(0.98)",
          transition: "opacity 260ms ease, transform 420ms ease",

          width: W,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100vh - 24px)",
          overflow: "auto",
          pointerEvents: "auto",
          border: "1px solid rgba(255,255,255,0.65)",
          background: "rgba(235,235,235,0.90)",
          boxShadow: "0 18px 80px rgba(0,0,0,0.55)",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            height: TITLE_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
            background: "rgba(0,0,0,0.88)",
            color: "rgba(255,255,255,0.92)",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <div
            style={{
              fontFamily: "BNWolfstar",
              fontSize: 12,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            Hydralis // FIRST BOOT
          </div>

          <button
            type="button"
            data-nosfx
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              finish();
            }}
            style={{
              width: 34,
              height: 26,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.35)",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Close"
            title="Close"
          >
            <Image
              src="/img/X.webp"
              alt="Close"
              width={22}
              height={22}
              draggable={false}
              unoptimized
            />
          </button>
        </div>

        {/* content */}
        <div
          style={{
            padding: 14,
            userSelect: "text",
            WebkitUserSelect: "text",

            opacity: visible ? 1 : 0,
            transform: visible 
              ? "translateY(0px)" 
              : "translateY(6px)",
            transition: visible
              ? "opacity 220ms ease 120ms, transform 320ms ease 120ms"
              : "opacity 180ms ease, transform 220ms ease",
          }}
        >
          <div
            style={{
              fontFamily: "BNWolfstar",
              fontSize: 12,
              letterSpacing: 0.7,
              textTransform: "uppercase",
              color: "#111",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Attention
          </div>

          <div
            style={{
              fontFamily: "KCPixelHand",
              fontSize: 12,
              lineHeight: 1.35,
              color: "rgba(0,0,0,0.85)",
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(0,0,0,0.12)",
              padding: 12,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              Este website ainda está em <b>BETA</b>.
            </div>

            <div style={{ marginBottom: 8 }}>
              Uma grande parte do site ainda não está finalizada. Se encontrares bugs ou algo estranho,
              isso é “normal” por agora...
            </div>

            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px dashed rgba(0,0,0,0.25)",
                opacity: 0.9,
              }}
            >
              <div>• <b>H</b> = Help / atalhos</div>
              <div>• <b>O</b> = Settings</div>
              <div>• <b>TAB</b> = Channel Pick</div>
            </div>
          </div>

          {/* bottom row */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {/* left icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Theme */}
              <button
                type="button"
                data-nosfx
                onMouseEnter={() => setHoverTheme(true)}
                onMouseLeave={() => setHoverTheme(false)}
                onClick={() => playSfx("warn", { volume: 1 })}
                style={{ ...iconBtnStyle, position: "relative" }}
                aria-label="Theme (in the works)"
                title="(IN THE WORKS)"
              >
                <Image
                  src={themeIconFixed}
                  alt="Theme"
                  width={35}
                  height={35}
                  draggable={false}
                  unoptimized
                />
                <Image
                  src="/img/settings/block.webp"
                  alt=""
                  width={35}
                  height={35}
                  draggable={false}
                  unoptimized
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    opacity: hoverTheme ? 1 : 0,
                    transition: "opacity 80ms ease-out",
                    pointerEvents: "none",
                    imageRendering: "pixelated",
                  }}
                />
              </button>

              {/* Language */}
              <button
                type="button"
                data-nosfx
                onMouseEnter={() => setHoverLang(true)}
                onMouseLeave={() => setHoverLang(false)}
                onClick={() => playSfx("warn", { volume: 1 })}
                style={{ ...iconBtnStyle, position: "relative" }}
                aria-label="Language (in the works)"
                title="(IN THE WORKS)"
              >
                <Image
                  src={langIconFixed}
                  alt="Language"
                  width={35}
                  height={35}
                  draggable={false}
                  unoptimized
                />
                <Image
                  src="/img/settings/block.webp"
                  alt=""
                  width={35}
                  height={35}
                  draggable={false}
                  unoptimized
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    opacity: hoverLang ? 1 : 0,
                    transition: "opacity 80ms ease-out",
                    pointerEvents: "none",
                    imageRendering: "pixelated",
                  }}
                />
              </button>

              {/* Music */}
              <button
                type="button"
                data-nosfx
                onClick={() => {
                  playSfx("yesNo", { volume: 1 });
                  toggleMusic();
                }}
                style={iconBtnStyle}
                aria-label="Music"
                title="Music"
              >
                <Image src={musicIcon} alt="Music" width={35} height={35} draggable={false} unoptimized />
              </button>

              {/* SFX */}
              <button
                type="button"
                data-nosfx
                onClick={() => {
                  if (!sfxEnabled) {
                    toggleSfx();
                    requestAnimationFrame(() => {
                      playSfx("yesNo", { volume: 1 });
                    });
                    return;
                  }

                  playSfx("yesNo", { volume: 1 });
                  toggleSfx();
                }}
                style={iconBtnStyle}
                aria-label="Sound effects"
                title="Sound effects"
              >
                <Image src={sfxIcon} alt="SFX" width={35} height={35} draggable={false} unoptimized />
              </button>
            </div>

            {/* OK */}
            <button
              type="button"
              data-nosfx
              onClick={finish}
              style={{
                height: 34,
                padding: "0 16px",
                border: "1px solid rgba(0,0,0,0.35)",
                background: "rgba(0,0,0,0.92)",
                color: "rgba(255,255,255,0.95)",
                fontFamily: "BNWolfstar",
                fontSize: 12,
                letterSpacing: 0.7,
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}