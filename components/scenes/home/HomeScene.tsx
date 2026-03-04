"use client";

import Image from "next/image";

type Rect = { x: number; y: number; w: number; h: number; z: number };

const BASE_W = 975;
const BASE_H = 478;

const RECTS: Record<"aquario" | "sofa" | "tv", Rect> = {
  aquario: { x: -55, y: -40, w: 250, h: 500, z: 1 },
  sofa: { x: 111, y: 149, w: 685, h: 326, z: 2 },
  tv: { x: 735, y: 178, w: 300, h: 300, z: 1 },
};

function pctX(v: number) {
  return `${(v / BASE_W) * 100}%`;
}
function pctY(v: number) {
  return `${(v / BASE_H) * 100}%`;
}

export default function HomeScene() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,

        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",

        paddingTop: 110,
        paddingBottom: 96,

        userSelect: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            width: `min(
              860px,
              calc(100vw - 48px),
              calc((100vh - 110px - 96px) * 0.55 * ${BASE_W} / ${BASE_H})
            )`,

            transform: "scale(0.9)",
            transformOrigin: "top center",

            aspectRatio: `${BASE_W} / ${BASE_H}`,
            position: "relative",
          }}
        >
          {/* Aquário */}
          <div
            data-obj="aquario"
            style={{
              position: "absolute",
              left: pctX(RECTS.aquario.x),
              top: pctY(RECTS.aquario.y),
              width: pctX(RECTS.aquario.w),
              height: pctY(RECTS.aquario.h),
              zIndex: RECTS.aquario.z,
              pointerEvents: "none",
            }}
          >
            <Image
              src="/img/home/aquario.webp"
              alt="Aquário"
              fill
              priority
              sizes="(max-width: 900px) 70vw, 860px"
              style={{ objectFit: "contain" }}
              draggable={false}
            />
          </div>

          {/* Sofá */}
          <div
            data-obj="sofa"
            style={{
              position: "absolute",
              left: pctX(RECTS.sofa.x),
              top: pctY(RECTS.sofa.y),
              width: pctX(RECTS.sofa.w),
              height: pctY(RECTS.sofa.h),
              zIndex: RECTS.sofa.z,
              pointerEvents: "none",
            }}
          >
            <Image
              src="/img/home/sofa.webp"
              alt="Sofá"
              fill
              priority
              sizes="(max-width: 900px) 70vw, 860px"
              style={{ objectFit: "contain" }}
              draggable={false}
            />
          </div>

          {/* TV */}
          <div
            data-obj="tv"
            style={{
              position: "absolute",
              left: pctX(RECTS.tv.x),
              top: pctY(RECTS.tv.y),
              width: pctX(RECTS.tv.w),
              height: pctY(RECTS.tv.h),
              zIndex: RECTS.tv.z,
              pointerEvents: "none",
            }}
          >
            <Image
              src="/img/home/tv.webp"
              alt="TV"
              fill
              priority
              sizes="(max-width: 900px) 70vw, 860px"
              style={{ objectFit: "contain" }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
