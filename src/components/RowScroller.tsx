"use client";

import { useRef, useState } from "react";

/** Trilho horizontal com setas no computador; no celular basta arrastar. */
export function RowScroller({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState<"start" | "middle" | "end">("start");

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    if (el.scrollLeft < 8) setEdge("start");
    else if (el.scrollLeft + el.clientWidth > el.scrollWidth - 8) setEdge("end");
    else setEdge("middle");
  }

  function move(direction: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: still ? "auto" : "smooth" });
  }

  const arrow =
    "absolute top-[8.75rem] z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-foreground text-white transition hover:bg-accent disabled:invisible sm:grid";

  return (
    <div className="relative">
      <button type="button" aria-label={`Voltar em ${label}`} disabled={edge === "start"} onClick={() => move(-1)} className={`${arrow} -left-3`}>
        <Chevron d="M15 5l-7 7 7 7" />
      </button>
      <ul
        ref={ref}
        onScroll={onScroll}
        className="trilho -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pt-2 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {children}
      </ul>
      <button type="button" aria-label={`Avançar em ${label}`} disabled={edge === "end"} onClick={() => move(1)} className={`${arrow} -right-3`}>
        <Chevron d="M9 5l7 7-7 7" />
      </button>
    </div>
  );
}

function Chevron({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
