import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import MagneticButton from "./MagneticButton";
import SplitText from "./SplitText";
import { sectionBackdrops } from "../landingData";

const words = ["Find work", "Hire skill", "Build trust", "Cameroon", "SkilledLink"];

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-hairline py-28 md:py-48"
    >
      <div className="section-bg-image" style={{ opacity: 0.55 }}>
        <motion.img
          src={sectionBackdrops.finalCta}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{ y: reduce ? 0 : bgY }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--bg-0)] via-transparent to-[var(--bg-0)]" />
      <div className="pointer-events-none absolute inset-0 bg-[var(--bg-0)]/55" />
      <div className="pointer-events-none absolute inset-0 grain" />

      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none opacity-[0.05]">
        <div className="kinetic-marquee items-center gap-16">
          {[...words, ...words, ...words, ...words].map((w, i) => (
            <span
              key={i}
              className="flex items-center gap-16 whitespace-nowrap text-[15vw] font-medium leading-none tracking-[-0.06em] text-fg"
            >
              {w}
              <span className="h-3 w-3 rounded-full bg-fg" />
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[1100px] px-5 text-center md:px-12">
        <span className="eyebrow no-line justify-center">Start with SkilledLink</span>

        <SplitText
          as="h2"
          text="Good work deserves to be discovered."
          highlight="discovered"
          highlightClass="serif text-fg-3"
          className="mx-auto mt-8 max-w-[18ch] text-[12vw] font-medium leading-[0.94] tracking-[-0.05em] text-fg sm:text-6xl md:text-[5.5rem]"
          stagger={0.07}
        />

        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton
            href="#trades"
            strength={0.35}
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-semibold btn-invert"
          >
            Find a professional
            <ArrowUpRight
              size={15}
              className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </MagneticButton>

          <MagneticButton
            href="#contact"
            strength={0.35}
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-semibold btn-outline"
          >
            Join SkilledLink
            <ArrowUpRight
              size={15}
              className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}