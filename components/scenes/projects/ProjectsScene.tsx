"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECTS } from ".";
import VhsTapeCard from "./VhsTapeCard";

export default function ProjectsScene() {
  const [query, setQuery] = useState("");
  const [emptySlots, setEmptySlots] = useState(0);
  const [tapeMetrics, setTapeMetrics] = useState({ h: 78, gap: 12 });

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [caretX, setCaretX] = useState(2);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [thumb, setThumb] = useState({ top: 0, height: 40 });
  const draggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);

  const minThumbPx = 28;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const updateThumb = () => {
    const sc = scrollRef.current;
    const tr = trackRef.current;
    if (!sc || !tr) return;

    const scrollHeight = sc.scrollHeight;
    const clientHeight = sc.clientHeight;
    const trackHeight = tr.clientHeight;

    if (scrollHeight <= 0 || clientHeight <= 0 || trackHeight <= 0) return;

    const ratio = clientHeight / scrollHeight;
    const rawHeight = Math.round(trackHeight * ratio);
    const height = clamp(rawHeight, minThumbPx, trackHeight);

    const maxScrollTop = Math.max(1, scrollHeight - clientHeight);
    const maxThumbTop = Math.max(0, trackHeight - height);

    const top = Math.round((sc.scrollTop / maxScrollTop) * maxThumbTop);

    setThumb({ top, height });
  };

  useEffect(() => {
    updateThumb();

    const sc = scrollRef.current;
    if (!sc) return;

    const onScroll = () => updateThumb();
    sc.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => updateThumb();
    window.addEventListener("resize", onResize);

    return () => {
      sc.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize);
    };  
  }, []);

  const visibleProjects = PROJECTS.filter((p) =>
    p.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    requestAnimationFrame(() => {
      let h = tapeMetrics.h;
      let gap = tapeMetrics.gap;

      if (visibleProjects.length > 0) {
        const first = sc.querySelector<HTMLElement>("[data-vhs-card]");
        if (first) {
          h = first.offsetHeight;
          gap = parseFloat(getComputedStyle(first).marginBottom || String(gap));
          setTapeMetrics({ h, gap });
        }
      }

      const itemStep = h + gap;
      const capacity = Math.max(0, Math.floor((sc.clientHeight + gap) / itemStep));
      const missing = Math.max(0, capacity - visibleProjects.length);

      setEmptySlots(missing);

      requestAnimationFrame(() => updateThumb());
    });
  }, [query, visibleProjects.length, tapeMetrics.h, tapeMetrics.gap]);

  useEffect(() => {
    const onResize = () => requestAnimationFrame(() => updateThumb());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);  

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    sc.scrollTop = 0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => updateThumb());
    });
  }, [query]);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => updateThumb());
    });
  }, [emptySlots]);

  useEffect(() => {
    if (!isSearchFocused) return;
    const el = measureRef.current;
    if (!el) return;

    setCaretX(el.offsetWidth + 2);
  }, [query, isSearchFocused]);

  return (
    <section className="pointer-events-none relative h-full w-full">
      <div className="pointer-events-none mx-auto grid h-full w-full grid-cols-12 gap-5 px-6 pt-15 pb-17">
        {/* LEFT */}
        <aside className="pointer-events-none col-span-10 h-full min-h-0 md:col-span-5 lg:col-span-4">
          <div className="pointer-events-none flex h-full min-h-0 flex-col">

            {/* Search bar */}
            <div
              className={[
                "pointer-events-auto",
                "h-[35px] w-full",
                "shrink-0 self-start",
                "bg-neutral-600/80",
                "px-2",
                "overflow-hidden",
                "focus-within:outline-none",
                "focus-within:ring-0",
                "focus-within:shadow-none",
              ].join(" ")}
            >
              <style jsx>{`
                /* Kill total focus visuals (Firefox/Chromium) só neste input */
                #projects-search,
                #projects-search:focus,
                #projects-search:focus-visible {
                  outline: none !important;
                  box-shadow: none !important;
                  border: 0 !important;
                  -moz-appearance: none !important;
                  appearance: none !important;
                }

                /* Firefox specific */
                #projects-search::-moz-focus-inner {
                  border: 0 !important;
                  padding: 0 !important;
                }

                #projects-search:-moz-focusring {
                  outline: none !important;
                }

                /* (Opcional) se o focus estiver a vir do botão do filtro */
                button:focus,
                button:focus-visible {
                  outline: none !important;
                  box-shadow: none !important;
                }
              `}</style>

              <div className="flex h-full items-center gap-2">
                <button
                  type="button"
                  aria-label="Open filters"
                  className="pointer-events-auto flex h-full items-center px-1 hover:opacity-80 active:translate-y-[1px]"
                >
                  <img
                    src="/img/search/filter.webp"
                    alt="Filter"
                    className="h-[18px] w-[18px] object-contain"
                  />
                </button>

                <div className="h-[60%] w-[2px] bg-neutral-200/70" />

                <div className="relative flex-1">
                  <label className="sr-only" htmlFor="projects-search">
                    Search projects
                  </label>

                  <span
                    ref={measureRef}
                    aria-hidden="true"
                    style={{ fontFamily: "KCPixelHand" }}
                    className={[
                      "pointer-events-none absolute left-0 top-0 opacity-0",
                      "text-[14px] font-extrabold tracking-widest",
                    ].join(" ")}
                  >
                    {query.length ? query : ""}
                  </span>

                  <input
                    id="projects-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="SEARCH..."
                    style={{ fontFamily: "KCPixelHand" }}
                    className={[
                      "w-full bg-transparent",
                      "selection:bg-white/20 selection:text-white",
                      "h-[46px]",
                      "leading-[46px]",
                      "text-[14px] font-extrabold tracking-widest text-neutral-50",
                      "placeholder:text-neutral-50/70",
                      "focus:placeholder-transparent",
                      "outline-none focus:outline-none focus:ring-0 focus:border-none",
                      "[&:focus]:shadow-none [&:focus]:outline-none",
                      "focus-visible:outline-none focus-visible:ring-0",
                      "appearance-none border-0",
                      "caret-transparent",
                    ].join(" ")}
                  />

                  {/* Cursor estilo terminal */}
                  {isSearchFocused && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 h-[22px] w-[3px] -translate-y-1/2 bg-neutral-50 animate-pulse"
                      style={{ left: caretX }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Lista VHS + Scrollbar custom */}
            <div className="pointer-events-none mt-3 min-h-0 flex-1 overflow-hidden py-1.5">
              <div className="pointer-events-auto relative h-full">
                <div className="flex h-full">

                  {/* Track/rail */}
                  <div className="w-[10px] border-0 bg-neutral-800/40">
                    <div
                      ref={trackRef}
                      className="relative h-full"
                      onMouseDown={(e) => {
                        const sc = scrollRef.current;
                        const tr = trackRef.current;
                        if (!sc || !tr) return;

                        const rect = tr.getBoundingClientRect();
                        const y = e.clientY - rect.top;

                        const trackHeight = tr.clientHeight;
                        const height = thumb.height;
                        const maxThumbTop = Math.max(0, trackHeight - height);
                        const newThumbTop = clamp(y - height / 2, 0, maxThumbTop);

                        const maxScrollTop = Math.max(
                          1,
                          sc.scrollHeight - sc.clientHeight
                        );
                        const nextScrollTop =
                          (newThumbTop / Math.max(1, maxThumbTop)) * maxScrollTop;

                        sc.scrollTop = nextScrollTop;
                      }}
                    >

                      {/* Sinalizador ScrollBar */}
                      <div
                        className="absolute  w-[10px] bg-orange-500/90"
                        style={{ top: thumb.top, height: thumb.height }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          draggingRef.current = true;
                          dragStartYRef.current = e.clientY;
                          dragStartScrollTopRef.current =
                            scrollRef.current?.scrollTop ?? 0;

                          const onMove = (ev: MouseEvent) => {
                            if (!draggingRef.current) return;
                            const sc = scrollRef.current;
                            const tr = trackRef.current;
                            if (!sc || !tr) return;

                            const dy = ev.clientY - dragStartYRef.current;

                            const trackHeight = tr.clientHeight;
                            const height = thumb.height;
                            const maxThumbTop = Math.max(1, trackHeight - height);
                            const maxScrollTop = Math.max(
                              1,
                              sc.scrollHeight - sc.clientHeight
                            );

                            const scrollDelta = (dy / maxThumbTop) * maxScrollTop;
                            sc.scrollTop = dragStartScrollTopRef.current + scrollDelta;
                          };

                          const onUp = () => {
                            draggingRef.current = false;
                            window.removeEventListener("mousemove", onMove);
                            window.removeEventListener("mouseup", onUp);
                          };

                          window.addEventListener("mousemove", onMove);
                          window.addEventListener("mouseup", onUp);
                        }}
                      />
                    </div>
                  </div>

                  {/* Conteúdo scrollável */}
                  <div className="relative flex-1 py-1">

                    <div
                      ref={scrollRef}
                      className="hide-scrollbar h-full overflow-y-auto pl-[10px]"
                      style={{
                        scrollbarWidth: "none", // Firefox
                        msOverflowStyle: "none", // IE/Edge antigo
                      }}
                    >

                      {/* VHS (CMS local) */}
                      {visibleProjects.map((p) => (
                        <VhsTapeCard
                          key={p.id}
                          title={p.title}
                          code={p.vhsCode}
                          logo={p.logo}
                          icon={p.icon}
                          heroImage={p.heroImage}
                          accent={p.accent}
                          onClick={() => console.log("select", p.id)}
                        />
                      ))}

                      {/* Placeholders “slots” */}
                      {Array.from({ length: emptySlots }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className={[
                            "w-full",
                            "bg-neutral-800/35",
                            "shadow-[0_3px_0_rgba(0,0,0,0.18)]",
                          ].join(" ")}
                          style={{ height: tapeMetrics.h, marginBottom: tapeMetrics.gap }}
                        />
                      ))}
                    </div>

                    {/* esconde scrollbar no Chrome/Safari */}
                    <style jsx>{`
                      .hide-scrollbar::-webkit-scrollbar {
                        width: 0px;
                        height: 0px;
                      }
                    `}</style>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT placeholder */}
        <main className="pointer-events-none col-span-12 h-full min-h-0 md:col-span-7 lg:col-span-8">
          <div className="h-full min-h-0" />
        </main>
      </div>
    </section>
  );
}