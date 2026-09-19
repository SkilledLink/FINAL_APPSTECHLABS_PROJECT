import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import SplitText from "./SplitText";
import { testimonials } from "../landingData";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const reduce = useReducedMotion();

  const go = (next: 1 | -1) => {
    setDir(next);
    setIndex((i) => (i + next + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % testimonials.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [reduce]);

  const active = testimonials[index];

  return (
    <section id="testimonials" className="relative py-24 md:py-40">
      <div className="mx-auto max-w-[1500px] px-5 md:px-12">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <span className="eyebrow">
            <span className="text-accent">05</span> — From the community
          </span>
          <SplitText
            as="h2"
            text="People sharing their experience."
            highlight="their"
            highlightClass="serif text-fg-3"
            className="max-w-[16ch] text-[10vw] font-medium leading-[0.95] tracking-[-0.045em] text-fg sm:text-6xl md:text-[4.5rem]"
            stagger={0.06}
          />
        </div>

        <div className="mt-16 grid gap-14 md:mt-20 md:grid-cols-[1fr_auto] md:items-end md:gap-20">
          <div className="relative min-h-[300px] md:min-h-[280px]">
            <span
              aria-hidden="true"
              className="serif pointer-events-none absolute -left-2 -top-16 select-none text-[12rem] leading-none text-fg-4 md:-top-24 md:text-[16rem]"
              style={{ opacity: 0.4 }}
            >
              &ldquo;
            </span>

            <AnimatePresence mode="wait" initial={false}>
              <motion.blockquote
                key={index}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <p className="max-w-[28ch] text-[24px] font-normal leading-[1.25] tracking-[-0.03em] text-fg md:max-w-[34ch] md:text-[2.35rem]">
                  {active.quote}
                </p>

                <footer className="mt-10 flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-soft bg-elevated text-[13px] font-semibold tracking-tight text-fg">
                    {active.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold tracking-wide text-fg">
                      {active.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-fg-3">
                      {active.role}
                    </p>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-hairline pt-6 md:flex-col md:items-end md:border-none md:pt-0">
            <div className="text-[11px] tracking-[0.32em] text-fg-3 tabular">
              <span className="text-fg">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mx-2 text-fg-4">/</span>
              {String(testimonials.length).padStart(2, "0")}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => go(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-soft text-fg-2 transition hover:border-medium hover:text-fg"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => go(1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-soft text-fg-2 transition hover:border-medium hover:text-fg"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}