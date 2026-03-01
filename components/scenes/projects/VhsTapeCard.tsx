"use client";

import type { CSSProperties } from "react";

type VhsTapeCardProps = {
  title: string;
  code: string;
  logo?: string;
  icon?: string;
  heroImage?: string;
  accent?: string;
  onClick?: () => void;
};

export default function VhsTapeCard({
  title,
  code,
  logo,
  icon,
  heroImage,
  accent,
  onClick,
}: VhsTapeCardProps) {
  const iconSrc = icon?.trim() || "";
  const heroSrc = heroImage?.trim() || "";

  const hasIcon = iconSrc.length > 0;
  const hasHeroImage = heroSrc.length > 0;

  return (
    <button
      data-vhs-card
      type="button"
      onClick={onClick}
      className={[
        "mx-auto max-w-[900px] px-0 py-9",
        "group mb-3 w-full text-left",
        "flex items-stretch",
        "h-[76px] rounded-none",
        "bg-[var(--vhs-accent)]",
        "shadow-[0_3px_0_color-mix(in_srgb,var(--vhs-accent),black_30%)]",
        "hover:brightness-[1.03] active:translate-y-[1px]",
      ].join(" ")}
      style={
        {
          ["--vhs-accent" as any]: accent ?? "#afafaf",
        } as CSSProperties
      }
    >
      {/* LEFT block (icon area) */}
      <div className="flex h-full items-center justify-center">
        <div className="flex w-[76px] items-center justify-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center">
            {hasIcon ? (
              <img
                src={iconSrc}
                alt=""
                className="h-20 w-20 object-contain"
                draggable={false}
              />
            ) : (
              // mantém o espaço, mas sem imagem (para perceber logo que falta icon)
              <div className="h-20 w-20" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      {/* CENTER (title/logo) */}
      <div className="flex h-full flex-1 items-center justify-center px-4">
        {hasHeroImage ? (
          <img
            src={heroSrc}
            alt=""
            className="h-[55px] object-contain"
            draggable={false}
          />
        ) : (
          <div
            style={{
              fontFamily: "KCPixelHand, monospace",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "0.18em",
              transform: "translateY(2px)",
              color: "rgba(255,255,255,0.9)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              textAlign: "center",
            }}
          >
            {title}
          </div>
        )}
      </div>

      {/* RIGHT: VHS label */}
      <div className="flex h-full items-center justify-end pr-3">
        <div className="flex items-center">
          <div className="origin-center -rotate-90 text-center">
            <div className="text-[14px] font-extrabold tracking-wide text-white/90">
              VHS
            </div>
            <div className="mt-[0px] text-[10px] font-extrabold tracking-wide text-white/90">
              {code}
            </div>
          </div>
        </div>

        <div className="ml-0 h-[56px] w-[2px] bg-white/90" />
      </div>
    </button>
  );
}