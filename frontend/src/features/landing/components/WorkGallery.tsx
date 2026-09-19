import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import SplitText from "./SplitText";
import { workProjects } from "../landingData";

export default function WorkGallery() {
  return (
    <section id="work" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-12">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <span className="eyebrow">
            <span className="text-accent">03</span> — Selected work
          </span>

          <div>
            <SplitText
              as="h2"
              text="Don't just say you can. Show it."
              highlight="Show"
              highlightClass="serif text-fg-3"
              className="max-w-[18ch] text-[10vw] font-medium leading-[0.95] tracking-[-0.045em] text-fg sm:text-6xl md:text-[4.5rem]"
              stagger={0.055}
            />
            <p className="mt-7 max-w-xl text-[15px] leading-7 text-fg-2">
              Completed work gives people confidence. See the projects,
              details and craft behind every professional.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-12 md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <ProjectCell project={workProjects[0]} size="large" index={0} />
          <ProjectCell project={workProjects[1]} size="small" index={1} />
          <ProjectCell project={workProjects[2]} size="small" index={2} />
        </div>
      </div>
    </section>
  );
}

function ProjectCell({
  project,
  size,
  index,
}: {
  project: (typeof workProjects)[number];
  size: "large" | "small";
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const clip = useTransform(
    scrollYProgress,
    [0.12, 0.55],
    ["inset(16% 16% 16% 16% round 16px)", "inset(0% 0% 0% 0% round 16px)"]
  );
  const scale = useTransform(scrollYProgress, [0.12, 0.55], [1.07, 1]);
  const parallax = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const layout =
    size === "large"
      ? "md:col-span-7 md:row-span-2 h-[420px] sm:h-[520px] md:h-auto md:min-h-[640px]"
      : "md:col-span-5 h-[280px] sm:h-[340px] md:h-full";

  return (
    <motion.div
      ref={ref}
      style={{ clipPath: reduce ? "none" : clip }}
      className={`group relative overflow-hidden rounded-2xl border border-soft ${layout}`}
      data-cursor="view"
      data-cursor-label="VIEW PROJECT"
    >
      <motion.div
        style={{ y: reduce ? 0 : parallax, scale: reduce ? 1 : scale }}
        className="absolute inset-0"
      >
        <img
          src={project.image}
          alt={project.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className="absolute inset-x-6 top-6 flex items-start justify-between">
        <span className="serif text-[22px] italic leading-none text-white/75">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/[0.08] text-white/90 backdrop-blur-md transition-all duration-500 group-hover:border-white/70 group-hover:bg-white group-hover:text-[#08090C]">
          <ArrowUpRight size={14} />
        </span>
      </div>

      <div className="absolute inset-x-6 bottom-6 md:inset-x-8 md:bottom-8">
        <h3
          className={`font-medium leading-[1.05] tracking-[-0.03em] text-white ${
            size === "large"
              ? "text-[26px] md:text-[34px]"
              : "text-[20px] md:text-[22px]"
          }`}
        >
          {project.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-white/70">
          <span>{project.location}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-white/50" />
          <span>{project.tags}</span>
        </div>
      </div>
    </motion.div>
  );
}