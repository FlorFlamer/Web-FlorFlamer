"use client";

import { useEffect } from "react";

export default function NoZoom() {
  useEffect(() => {
    const onWheel: EventListener = (e) => {
      const we = e as WheelEvent;

      if (we.ctrlKey) {
        we.preventDefault();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);
  return null;
}