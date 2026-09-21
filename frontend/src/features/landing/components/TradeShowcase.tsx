import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { trades } from "../landingData";

export default function TradeShowcase() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 6);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(".trade-card");
    const step = card ? card.getBoundingClientRect().width + 20 : 340;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <section id="trades" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <span className="eyebrow">
              <span className="text-accent">01</span> — Discover
            </span>
            <h2 className="mt-5 max-w-[16ch] text-[10vw] font-medium leading-[0.95] tracking-[-0.045em] text-fg sm:text-5xl md:text-[4rem]">
              Every trade has a{" "}
              <span className="serif text-fg-3">story.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="flex items-end justify-between gap-6 md:justify-end">
            <p className="hidden max-w-xs text-[13px] leading-6 text-fg-3 md:block">
              Browse the professionals who keep everyday life in Cameroon
              moving.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous trades"
                onClick={() => scrollBy(-1)}
                disabled={atStart}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-soft text-fg-2 transition hover:border-medium hover:text-fg disabled:opacity-30 disabled:hover:border-soft"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next trades"
                onClick={() => scrollBy(1)}
                disabled={atEnd}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-soft text-fg-2 transition hover:border-medium hover:text-fg disabled:opacity-30 disabled:hover:border-soft"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:px-12"
      >
        {trades.map((trade, i) => (
          <a
            key={trade.name}
            href="#professionals"
            data-cursor="view"
            data-cursor-label="EXPLORE"
            className="trade-card group relative h-[440px] w-[80vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-soft sm:h-[480px] sm:w-[340px] md:h-[520px] md:w-[360px]"
          >
            <img
              src={trade.image}
              alt={`${trade.name} in Cameroon`}
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-[1.02] object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.08]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/35 to-transparent" />

            <div className="absolute inset-x-5 top-5 flex items-start justify-between">
              <span className="serif text-[22px] italic leading-none text-white/75">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white/85 backdrop-blur-md transition-all duration-500 group-hover:border-white/60 group-hover:bg-white group-hover:text-[#08090C]">
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-500 group-hover:rotate-45"
                />
              </span>
            </div>

            <div className="absolute inset-x-5 bottom-5">
              <p className="text-[10px] tracking-[0.3em] text-white/55">TRADE</p>
              <h3 className="mt-2 text-[26px] font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-[30px]">
                {trade.name}
              </h3>

              <div className="mt-3 h-px w-8 bg-white/40 transition-all duration-700 group-hover:w-16 group-hover:bg-[#7AB0FF]" />

              <p className="mt-3 max-w-[26ch] text-[12px] leading-5 text-white/60">
                {trade.count}
              </p>
            </div>
          </a>
        ))}
      </div>

      <div className="mx-auto mt-6 flex max-w-[1500px] items-center gap-6 px-5 md:px-12">
        <span className="text-[10px] tracking-[0.32em] text-fg-4">
          DRAG OR USE ARROWS
        </span>
      </div>
    </section>
  );
}