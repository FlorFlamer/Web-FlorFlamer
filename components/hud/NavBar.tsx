"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import type { ChannelKey } from "@/lib/channels";
import { useHud } from "@/lib/hud-store";

type HudButtonProps = {
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

function HudButton({
  active,
  onClick,
  className,
  children,
  ariaLabel,
}: HudButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={!!active}
      className={[
        // base
        "pointer-events-auto select-none",
        "rounded-xl border border-neutral-700/60 bg-neutral-900/70",
        "px-2.5 pt-2 pb-2",
        // text
        "text-[12px] font-semibold tracking-wide text-neutral-100",
        // effects
        "shadow-sm",
        "hover:bg-neutral-900/85 active:translate-y-[1px]",
        // state
        active ? "ring-1 ring-neutral-200/60" : "",
        // extra
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function NavBar() {
  const { currentChannel, selectChannel } = useHud();

  const go = (c: ChannelKey) => selectChannel(c);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-40 w-full px-6 pt-3">
      <div className="mx-auto flex w-full items-center justify-between gap-3">
        
        {/* - Left */}
        
        <div className="flex items-center gap-3">
          <HudButton
            active={currentChannel === "home"}
            onClick={() => go("home")}
            ariaLabel="Go to Home"
          >
            <Image
              src="/img/hud/logo.webp"
              alt="Logo"
              width={18}
              height={18}
              className="mr-2 inline-block -translate-y-[1.5px] align-middle"
            />
            <span style={{ fontFamily: "KCPixelHand" }}>HOME</span>
          </HudButton>

          <HudButton
            active={currentChannel === "about"}
            onClick={() => go("about")}
            ariaLabel="Go to About"
          >
            <span style={{ fontFamily: "KCPixelHand" }}>ABOUT</span>
          </HudButton>

          <HudButton
            active={currentChannel === "projects"}
            onClick={() => go("projects")}
            ariaLabel="Go to Projects"
          >
            <span style={{ fontFamily: "KCPixelHand" }}>PROJECTS</span>
          </HudButton>
        </div>

        {/* Right - */}

        <HudButton
          active={currentChannel === "contact"}
          onClick={() => go("contact")}
          ariaLabel="Go to Contact"
        >
          <Image
            src="/img/hud/email.webp"
            alt="Email"
            width={18}
            height={14}
            className="mr-2 inline-block relative -top-[1px] align-middle"
          />
          <span style={{ fontFamily: "KCPixelHand" }}>CONTACT</span>
        </HudButton>
      </div>
    </div>
  );
}
