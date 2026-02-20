"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useHud } from "@/lib/hud-store";

function pathToChannel(path: string) {
  if (path === "/" || path.startsWith("/home")) return "home";
  if (path.startsWith("/about")) return "about";
  if (path.startsWith("/projects")) return "projects";
  if (path.startsWith("/contact")) return "contact";
  return "home";
}

export default function HudRouteSync() {
  const pathname = usePathname();
  const { currentChannel, setCurrentChannel, pendingPath, setPendingPath } = useHud();

  useLayoutEffect(() => {
    if (pendingPath && pathname !== pendingPath) return;

    if (pendingPath && pathname === pendingPath) {
      setPendingPath(null);
    }

    const next = pathToChannel(pathname);
    if (next !== currentChannel) setCurrentChannel(next);
  }, [pathname, pendingPath, currentChannel, setCurrentChannel, setPendingPath]);

  return null;
}