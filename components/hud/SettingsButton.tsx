"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useHud } from "@/lib/hud-store";

export default function SettingsButton() {
  const { settingsOpen, setSettingsOpen } = useHud();

  // KEYBIND: "O"

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        setSettingsOpen(!settingsOpen);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen, setSettingsOpen]);

  return (
    <button
      type="button"
      aria-label="Toggle settings"
      onClick={() => setSettingsOpen(!settingsOpen)}
      className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-200/70 opacity-75 text-xl font-black text-neutral-700 shadow hover:bg-neutral-200 active:translate-y-[1px]"
    >
      <Image
        src="/img/hud/settings.webp"
        alt="Settings"
        width={22}
        height={22}
        style={{
          opacity: 0.75,
          transition: "opacity 0.75s",
        }}
      />
    </button>
  );
}
