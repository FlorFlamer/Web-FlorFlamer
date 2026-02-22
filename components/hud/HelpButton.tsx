"use client";

import { useHud } from "@/lib/hud-store";

export default function HelpButton() {
  const { setHelpOpen } = useHud();

  return (
    <button
      type="button"
      aria-label="Open help"
      onClick={() => setHelpOpen(true)}
      className="
        grid place-items-center
        h-10 w-10
        rounded-sm
        bg-neutral-200/70
        text-xl font-black text-neutral-700
        opacity-75
        shadow
        hover:bg-neutral-200
        active:translate-y-[1px]
      "
    >
      <span style={{ fontFamily: "KCPixelHand" }}>?</span>
    </button>
  );
}