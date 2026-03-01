"use client";

type Props = {
  progress: number; // 0..1
  failedCount?: number;
};

export default function LoadingScreen({ progress, failedCount = 0 }: Props) {
  const pct = Math.round(progress * 100);

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: "#0b0b0f",
      }}
    >
      {/* scanlines + vignette simples (base) */}
      <div className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
        }}
      />
      <div className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: "inset 0 0 180px rgba(0,0,0,0.85)",
        }}
      />

      <div className="relative w-[min(520px,90vw)] px-6 py-6">
        <div
          style={{
            fontFamily: "KCPixelHand, monospace",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.92)",
            fontSize: 22,
            textTransform: "uppercase",
          }}
        >
          LOADING…
        </div>

        <div className="mt-4 h-[10px] w-full overflow-hidden border border-white/40">
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              background: "rgba(255,255,255,0.85)",
              transition: "width 120ms linear",
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-white/70">
          <div style={{ fontFamily: "BNWolfstar Rounded, system-ui, sans-serif", fontSize: 12 }}>
            {pct}%
          </div>
          <div style={{ fontFamily: "BNWolfstar Rounded, system-ui, sans-serif", fontSize: 12 }}>
            {failedCount > 0 ? `missing: ${failedCount}` : "assets ok"}
          </div>
        </div>
      </div>
    </div>
  );
}