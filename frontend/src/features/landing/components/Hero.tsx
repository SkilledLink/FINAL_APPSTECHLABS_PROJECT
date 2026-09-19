import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, ShieldCheck, Star } from "lucide-react";
import type { MouseEvent } from "react";
import MagneticButton from "./MagneticButton";
import { heroImage, professionals, heroStats } from "../landingData";

type Props = { ready: boolean };

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ ready }: Props) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const imgY = useTransform(scrollY, [0, 900], [0, 140]);
  const imgScale = useTransform(scrollY, [0, 900], [1, 1.06]);
  const contentY = useTransform(scrollY, [0, 900], [0, 70]);
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0.4]);

  // Floating chips drift independently
  const chip1Y = useTransform(scrollY, [0, 900], [0, -80]);
  const chip2Y = useTransform(scrollY, [0, 900], [0, -120]);
  const chip3Y = useTransform(scrollY, [0, 900], [0, -50]);

  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const lensX = useSpring(mx, { stiffness: 200, damping: 30 });
  const lensY = useSpring(my, { stiffness: 200, damping: 30 });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
  };
  const fade = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease } },
  };
  const wordMask = {
    hidden: { y: "115%" },
    show: { y: "0%", transition: { duration: 1.15, ease } },
  };
  const chipFade = {
    hidden: { opacity: 0, y: 18, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease },
    },
  };

  const [p1, p2, p3] = professionals;

  return (
    <section
      id="hero"
      onMouseMove={onMove}
      className="hero-section relative isolate flex min-h-screen w-full flex-col overflow-hidden"
      style={{ background: "var(--bg-0)" }}
    >
      {/* Background image */}
      <motion.div
        className="absolute inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1.6, ease }}
        style={{ y: reduce ? 0 : imgY, scale: reduce ? 1 : imgScale }}
      >
        <img
          src={heroImage}
          alt="A skilled tailor working at her atelier in Cameroon"
          className="hero-img h-full w-full object-cover object-[58%_40%]"
          fetchPriority="high"
          style={{ filter: "var(--hero-img-filter)" }}
        />
      </motion.div>

      {/* Theme scrims */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--hero-overlay-top) 0%, var(--hero-overlay-mid) 42%, var(--hero-overlay-bot) 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to right, var(--hero-overlay-top) 0%, transparent 55%)",
        }}
      />
      <div className="grain pointer-events-none absolute inset-0 -z-10" />

      {/* Atmosphere */}
      <div className="pointer-events-none absolute -left-40 top-1/3 -z-10 h-[640px] w-[640px] rounded-full glow-blue blur-[120px] opacity-40" />
      <div className="pointer-events-none absolute right-[-8%] bottom-[-10%] -z-10 h-[520px] w-[520px] rounded-full bg-[#2563EB]/[0.06] blur-[140px]" />

      {!reduce && (
        <motion.div
          aria-hidden="true"
          style={{ x: lensX, y: lensY }}
          className="pointer-events-none absolute left-0 top-0 -z-10 hidden h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7AB0FF]/[0.05] blur-2xl md:block"
        />
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        style={{
          y: reduce ? 0 : contentY,
          opacity: reduce ? 1 : contentOpacity,
        }}
        className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-end px-5 pb-12 pt-32 md:px-12 md:pb-16 md:pt-40"
      >
        {/* Copy block — now full width, no right-side column competition */}
        <div className="max-w-[1180px]">
          <motion.div
            variants={fade}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-[10px] tracking-[0.24em] backdrop-blur-md"
            style={{
              background: "var(--hero-chip-bg)",
              borderColor: "var(--hero-chip-border)",
              color: "var(--hero-fg-2)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F8EFF] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4F8EFF]" />
            </span>
            CAMEROON · EVERY TRADE
          </motion.div>

          <h1
            className="max-w-[16ch] text-[14vw] font-medium leading-[0.88] tracking-[-0.05em] sm:text-[11.5vw] md:text-[8.5vw] lg:text-[7.2vw]"
            style={{ color: "var(--hero-fg)" }}
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={wordMask} className="block">
                Find the
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={wordMask} className="block">
                <span className="serif pr-2">skill</span>
                <span className="text-[#4F8EFF]">.</span>
              </motion.span>
            </span>
          </h1>

          <motion.div
            variants={fade}
            className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:gap-12"
          >
            <p
              className="max-w-lg text-[15px] leading-7 md:text-base"
              style={{ color: "var(--hero-fg-2)" }}
            >
              Discover the people who build, repair, create and make things
              happen across Cameroon — barbers, tailors, electricians,
              welders and every trade in between.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton
                href="#trades"
                strength={0.32}
                className="group inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-[13px] font-semibold"
                style={{
                  background: "var(--hero-btn-primary-bg)",
                  color: "var(--hero-btn-primary-fg)",
                }}
              >
                Start exploring
                <ArrowDown
                  size={15}
                  className="transition-transform duration-500 group-hover:translate-y-0.5"
                />
              </MagneticButton>

              <a
                href="#professionals"
                className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[13px] font-medium backdrop-blur-md transition-colors duration-500"
                style={{
                  color: "var(--hero-fg-2)",
                  borderColor: "var(--hero-border)",
                  background: "var(--hero-chip-bg)",
                }}
              >
                Meet professionals
                <ArrowUpRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          variants={fade}
          className="stat-row mt-16 md:mt-20"
          style={{ borderColor: "var(--hero-border)" }}
        >
          {heroStats.map((item, i) => (
            <div
              key={item.label}
              className="stat-cell"
              style={{
                borderColor: "var(--hero-border)",
                borderLeft: i === 0 ? "none" : undefined,
              }}
            >
              <p className="stat-value" style={{ color: "var(--hero-fg)" }}>
                {item.value}
              </p>
              <p className="stat-label" style={{ color: "var(--hero-fg-3)" }}>
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating professional chips — over the image on the right */}
      <motion.div
        variants={chipFade}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        style={{ y: reduce ? 0 : chip1Y }}
        className="pointer-events-none absolute right-[8%] top-[26%] z-10 hidden lg:block"
      >
        <div
          className="flex items-center gap-3 rounded-full border px-4 py-2.5 backdrop-blur-xl"
          style={{
            background: "var(--hero-chip-bg)",
            borderColor: "var(--hero-border)",
            boxShadow: "0 12px 32px -18px rgba(0,0,0,0.8)",
          }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "rgba(79,142,255,0.16)" }}
          >
            <ShieldCheck size={12} className="text-[#7AB0FF]" />
          </span>
          <div className="flex flex-col leading-none">
            <span
              className="text-[11px] font-semibold tracking-tight"
              style={{ color: "var(--hero-fg)" }}
            >
              {p1.name} · {p1.role}
            </span>
            <span
              className="mt-1 text-[10px] tracking-[0.14em]"
              style={{ color: "var(--hero-fg-3)" }}
            >
              {p1.location.toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={chipFade}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        style={{ y: reduce ? 0 : chip2Y }}
        className="pointer-events-none absolute right-[24%] top-[46%] z-10 hidden lg:block"
      >
        <div
          className="flex items-center gap-3 rounded-full border px-4 py-2.5 backdrop-blur-xl"
          style={{
            background: "var(--hero-chip-bg)",
            borderColor: "var(--hero-border)",
            boxShadow: "0 12px 32px -18px rgba(0,0,0,0.8)",
          }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "rgba(251,191,36,0.16)" }}
          >
            <Star size={11} className="fill-[#FBBF24] text-[#FBBF24]" />
          </span>
          <div className="flex flex-col leading-none">
            <span
              className="text-[11px] font-semibold tracking-tight"
              style={{ color: "var(--hero-fg)" }}
            >
              {p2.name} · {p2.rating} rating
            </span>
            <span
              className="mt-1 text-[10px] tracking-[0.14em]"
              style={{ color: "var(--hero-fg-3)" }}
            >
              {p2.role.toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={chipFade}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        style={{ y: reduce ? 0 : chip3Y }}
        className="pointer-events-none absolute right-[12%] top-[64%] z-10 hidden lg:block"
      >
        <div
          className="flex items-center gap-3 rounded-full border px-4 py-2.5 backdrop-blur-xl"
          style={{
            background: "var(--hero-chip-bg)",
            borderColor: "var(--hero-border)",
            boxShadow: "0 12px 32px -18px rgba(0,0,0,0.8)",
          }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "rgba(122,176,255,0.16)" }}
          >
            <ShieldCheck size={12} className="text-[#7AB0FF]" />
          </span>
          <div className="flex flex-col leading-none">
            <span
              className="text-[11px] font-semibold tracking-tight"
              style={{ color: "var(--hero-fg)" }}
            >
              {p3.name} · {p3.role}
            </span>
            <span
              className="mt-1 text-[10px] tracking-[0.14em]"
              style={{ color: "var(--hero-fg-3)" }}
            >
              {p3.location.toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}