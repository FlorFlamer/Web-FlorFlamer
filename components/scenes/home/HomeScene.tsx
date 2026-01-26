"use client";

type Rect = { x: number; y: number; w: number; h: number };

/**
 * FASE 1:
 * - Só layout (blocos/placeholder).
 * - Sem transform scale (para não cortar no resize).
 * - Tudo em % dentro de um frame com aspect-ratio.
 */

const BASE_W = 975;
const BASE_H = 478;

// vindo do mapa de cores
const RECTS: Record<"lamp" | "sofa" | "table" | "turntable", Rect> = {
  lamp: { x: 0, y: 0, w: 122, h: 475 }, // verde
  sofa: { x: 131, y: 169, w: 645, h: 306 }, // vermelho
  table: { x: 793, y: 298, w: 182, h: 180 }, // azul
  turntable: { x: 814, y: 266, w: 141, h: 28 }, // rosa
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

        // safe area do HUD (mantém como já tinhas)
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
        {/* FRAME:
            - respeita largura E altura (resolve o teu “meio do resize” / IMG2)
            - e ainda mantém margem lateral (não cola às bordas)
        */}
        <div
          style={{
            // ✅ largura limitada por:
            // 1) um máximo “normal” (860px)
            // 2) a viewport em largura (100vw - 48px)
            // 3) a viewport em altura (vh * aspectRatio)
            width: `min(
              860px,
              calc(100vw - 48px),
              calc((100vh - 110px - 96px) * 0.55 * ${BASE_W} / ${BASE_H})
            )`,

            // ✅ ESTES DOIS estavam no sítio errado (dentro do width)
            // agora são propriedades reais do style:
            transform: "scale(0.9)",
            transformOrigin: "top center",

            aspectRatio: `${BASE_W} / ${BASE_H}`,
            position: "relative",

            // (debug opcional)
            // outline: "1px solid rgba(0,0,0,0.12)",
          }}
        >
          {/* Lâmpada */}
          <div
            data-obj="lamp"
            style={{
              position: "absolute",
              left: pctX(RECTS.lamp.x),
              top: pctY(RECTS.lamp.y),
              width: pctX(RECTS.lamp.w),
              height: pctY(RECTS.lamp.h),
              background: "rgba(0, 255, 0, 0.25)",
              borderRadius: 10,
            }}
          />

          {/* Sofá */}
          <div
            data-obj="sofa"
            style={{
              position: "absolute",
              left: pctX(RECTS.sofa.x),
              top: pctY(RECTS.sofa.y),
              width: pctX(RECTS.sofa.w),
              height: pctY(RECTS.sofa.h),
              background: "rgba(255, 0, 0, 0.18)",
              borderRadius: 12,
            }}
          />

          {/* Mesa */}
          <div
            data-obj="table"
            style={{
              position: "absolute",
              left: pctX(RECTS.table.x),
              top: pctY(RECTS.table.y),
              width: pctX(RECTS.table.w),
              height: pctY(RECTS.table.h),
              background: "rgba(0, 0, 255, 0.18)",
              borderRadius: 12,
            }}
          />

          {/* Toca discos */}
          <div
            data-obj="turntable"
            style={{
              position: "absolute",
              left: pctX(RECTS.turntable.x),
              top: pctY(RECTS.turntable.y),
              width: pctX(RECTS.turntable.w),
              height: pctY(RECTS.turntable.h),
              background: "rgba(255, 105, 180, 0.28)",
              borderRadius: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
}
