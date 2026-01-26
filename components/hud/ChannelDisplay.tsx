"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CHANNELS, CHANNEL_ORDER } from "@/lib/channels";
import { useHud } from "@/lib/hud-store";
import type { ChannelKey } from "@/lib/channels";

//  Constants / helpers

const PICK_COLOR: Record<string, string> = {
  home: "text-red-500/80",
  about: "text-blue-500/80",
  projects: "text-fuchsia-500/80",
  contact: "text-green-500/80",
};

const SLOT_W = 36;
const GAP = 8;
const STEP = SLOT_W + GAP;

const ORDER = CHANNEL_ORDER as readonly ChannelKey[];

function idxOf(k: ChannelKey) {
  return Math.max(0, ORDER.indexOf(k));
}

function calcWindow(centerKey: ChannelKey): Array<ChannelKey | null> {
  const idx = idxOf(centerKey);
  const left = idx > 0 ? ORDER[idx - 1] : null;
  const right = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
  return [left, centerKey, right];
}

 //  Component

export default function ChannelDisplay() {
  const { currentChannel, channelPickMode, channelPickSelected } = useHud();

  const metaCurrent = CHANNELS[currentChannel];
  const metaPicked = CHANNELS[channelPickSelected];

  const font = useMemo(() => ({ fontFamily: "KCPixelHand" }), []);

  // Scale do TAB MODE

  const rootScale = channelPickMode ? 1.14 : 1;
  const rootTransition = "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)";


  // 3 Canais Display (em TAB MODE)

  const [windowKeys, setWindowKeys] = useState<Array<ChannelKey | null>>(() =>
    calcWindow(channelPickSelected)
  );

  const prevIdxRef = useRef<number>(idxOf(channelPickSelected));

  const [animating, setAnimating] = useState(false);
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    if (!channelPickMode) return;

    setAnimating(false);
    setOffsetPx(0);
    setWindowKeys(calcWindow(channelPickSelected));
    prevIdxRef.current = idxOf(channelPickSelected);
  }, [channelPickMode, channelPickSelected]);

  // TAB MODE 1 passo "snap"

  useEffect(() => {
    if (!channelPickMode) return;

    const newIdx = idxOf(channelPickSelected);
    const oldIdx = prevIdxRef.current;
    if (newIdx === oldIdx) return;

    const dir: -1 | 1 = newIdx > oldIdx ? 1 : -1;

    setAnimating(true);
    setOffsetPx(dir === 1 ? -STEP : STEP);

    prevIdxRef.current = newIdx;
  }, [channelPickSelected, channelPickMode]);

  const onTrackTransitionEnd = () => {
    if (!animating) return;

    setAnimating(false);
    setOffsetPx(0);
    setWindowKeys(calcWindow(channelPickSelected));
  };

  // UI blocks

  const PickUI = (
    <div className="select-none text-right" style={{ position: "relative", top: "3px" }}>
      <div
        className="ml-auto overflow-hidden"
        style={{
          width: SLOT_W * 3 + GAP * 2,
          transform: "translateX(13px)",
        }}
      >
        <div
          onTransitionEnd={onTrackTransitionEnd}
          style={{
            display: "flex",
            gap: GAP,
            alignItems: "flex-end",
            justifyContent: "flex-end",
            transform: `translateX(${offsetPx}px)`,
            transition: animating
              ? "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
            willChange: "transform",
          }}
        >
          {windowKeys.map((key, slotIndex) => {
            const isCenter = slotIndex === 1;

            if (!key) {
              return (
                <span
                  key={`empty-${slotIndex}`}
                  style={{ width: SLOT_W }}
                  className="inline-block opacity-0"
                >
                  0
                </span>
              );
            }

            const colorClass = PICK_COLOR[key] ?? "text-neutral-500/80";

            return (
              <span
                key={`${key}-${slotIndex}`}
                style={{ width: SLOT_W, lineHeight: "1", ...font }}
                className={[
                  "inline-block text-center font-extrabold tracking-wide text-3xl",
                  "origin-bottom transform-gpu",
                  colorClass,
                  isCenter ? "opacity-100 scale-[1.12]" : "opacity-35 scale-[0.72]",
                  "transition-[transform,opacity] duration-220 ease-in-out will-change-transform",
                ].join(" ")}
              >
                {idxOf(key) + 1}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-end gap-3 text-[11px] font-semibold tracking-wide text-neutral-500/70">
        <span style={font} className="opacity-70">
          ◄ TAB ►
        </span>
        <span style={font} className="opacity-60">
          {metaPicked.version}
        </span>
      </div>
    </div>
  );

  const ChUI = (
    <div className="select-none text-right">
      <div className="flex items-baseline justify-end gap-3">
        <span className="text-3xl font-extrabold tracking-wide text-neutral-500/70">
          <span style={font} className="opacity-70">
            CH
          </span>
        </span>

        <span
          className={[
            "text-3xl font-extrabold tracking-wide opacity-70",
            PICK_COLOR[currentChannel] ?? "text-neutral-500/80",
          ].join(" ")}
          style={font}
        >
          {metaCurrent.ch}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-end gap-3 text-[11px] font-semibold tracking-wide text-neutral-500/70">
        <span className="flex items-center gap-1">
          <span style={font} className="opacity-60">
            ◄
          </span>
          <span style={font} className="uppercase opacity-70">
            TAB
          </span>
          <span style={font} className="opacity-60">
            ►
          </span>
        </span>

        <span style={font} className="opacity-60">
          {metaCurrent.version}
        </span>
      </div>
    </div>
  );

  // Channel switch

  const chLayerClass =
    "transition-opacity duration-200 ease-out will-change-opacity " +
    (channelPickMode ? "opacity-0 pointer-events-none" : "opacity-100");

  const pickLayerClass =
    "transition-opacity duration-200 ease-out will-change-opacity " +
    (channelPickMode ? "opacity-100" : "opacity-0 pointer-events-none");

  return (
    <div
      className="relative grid justify-items-end min-h-[56px]"
      style={{
        transform: `scale(${rootScale})`,
        transformOrigin: "right center",
        transition: rootTransition,
        willChange: "transform",
      }}
    >
      <div className={"col-start-1 row-start-1 " + chLayerClass}>{ChUI}</div>
      <div className={"col-start-1 row-start-1 " + pickLayerClass}>{PickUI}</div>
    </div>
  );
}
