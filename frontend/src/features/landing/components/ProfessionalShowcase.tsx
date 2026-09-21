import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import MagneticButton from "./MagneticButton";
import { professionals } from "../landingData";

type Professional = (typeof professionals)[number];

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const imageReveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 1.05, ease } },
};

export default function ProfessionalShowcase() {
  const reduce = useReducedMotion();
  const [featured, ...roster] = professionals;

  return (
    <section
      id="professionals"
      aria-labelledby="professionals-heading"
      className="relative py-24 md:py-40"
    >
      <div className="mx-auto max-w-[1500px] px-5 md:px-12">
        <SectionHeader reduce={!!reduce} />
        <FeaturedProfile pro={featured} reduce={!!reduce} />
        {roster.length > 0 && (
          <RosterGrid items={roster} reduce={!!reduce} />
        )}
      </div>
    </section>
  );
}

/* ============================================================
   SECTION HEADER
   ============================================================ */

function SectionHeader({ reduce }: { reduce: boolean }) {
  const cities = Array.from(
    new Set(professionals.map((p) => p.location.split(",")[0].trim()))
  );

  return (
    <motion.div
      variants={stagger}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div variants={fadeUp}>
        <span className="eyebrow">
          <span className="text-accent">02</span> / Local skills
        </span>
      </motion.div>

      <motion.h2
        id="professionals-heading"
        variants={fadeUp}
        className="mt-8 max-w-[15ch] text-[10vw] font-medium leading-[0.95] tracking-[-0.045em] text-fg sm:text-5xl md:mt-10 md:text-[4rem] lg:text-[4.75rem]"
      >
        People who know how to{" "}
        <span className="serif text-fg-3">get it done.</span>
      </motion.h2>

      <motion.div
        variants={fadeUp}
        className="mt-10 grid gap-6 md:mt-14 md:grid-cols-[1fr_auto] md:items-end md:gap-12"
      >
        <p className="max-w-md text-[15px] leading-7 text-fg-2">
          Find experienced people nearby, see what they do, and contact
          them directly.
        </p>

        <span className="text-[10px] uppercase tracking-[0.28em] text-fg-3 md:text-right">
          {String(professionals.length).padStart(2, "0")} profiles ·{" "}
          {cities.join(" · ")}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   FEATURED PROFILE
   ============================================================ */

function FeaturedProfile({
  pro,
  reduce,
}: {
  pro: Professional;
  reduce: boolean;
}) {
  return (
    <motion.article
      variants={stagger}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.1 }}
      className="mt-20 grid gap-10 md:mt-28 lg:grid-cols-[1.25fr_1fr] lg:gap-16"
    >
      <motion.a
        variants={imageReveal}
        href="#work"
        aria-label={`View ${pro.name}'s profile`}
        data-cursor="view"
        data-cursor-label="VIEW PROFILE"
        className="group relative block overflow-hidden rounded-xl"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={pro.image}
            alt={`${pro.name}, ${pro.role} in ${pro.location}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
          />
        </div>
      </motion.a>

      <motion.div
        variants={stagger}
        className="flex flex-col justify-between gap-10 lg:py-2"
      >
        <div>
          <motion.span
            variants={fadeUp}
            className="text-[10px] uppercase tracking-[0.3em] text-accent"
          >
            Featured
          </motion.span>

          <motion.h3
            variants={fadeUp}
            className="mt-6 text-[36px] font-medium leading-[0.98] tracking-[-0.035em] text-fg sm:text-[44px] lg:text-[52px]"
          >
            {pro.name}
          </motion.h3>

          <motion.p
            variants={fadeUp}
            className="mt-3 text-[17px] text-fg-2 md:text-[19px]"
          >
            {pro.role}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-fg-2"
          >
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              {pro.location}
            </span>
            {pro.verified && (
              <span className="flex items-center gap-1.5 text-accent">
                <ShieldCheck size={13} />
                Verified
              </span>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-6"
          >
            <Rating value={pro.rating} />
            <span
              aria-hidden="true"
              className="hidden h-[3px] w-[3px] rounded-full bg-fg-4 sm:block"
            />
            <span className="text-[13px] tabular text-fg-2">
              {pro.projects} completed jobs
            </span>
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <MagneticButton
            href="#work"
            strength={0.24}
            className="group inline-flex items-center gap-2 rounded-full border border-medium px-5 py-3 text-[13px] font-medium text-fg transition-all duration-500 hover:border-[#4F8EFF] hover:bg-[#2563EB] hover:text-white"
          >
            View profile
            <ArrowRight
              size={15}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </MagneticButton>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

/* ============================================================
   ROSTER GRID
   ============================================================ */

function RosterGrid({
  items,
  reduce,
}: {
  items: Professional[];
  reduce: boolean;
}) {
  return (
    <motion.div
      variants={stagger}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.15 }}
      className="mt-24 grid gap-12 md:mt-32 md:grid-cols-2 md:gap-10 lg:gap-14"
    >
      {items.map((pro) => (
        <RosterItem key={pro.name} pro={pro} />
      ))}
    </motion.div>
  );
}

function RosterItem({ pro }: { pro: Professional }) {
  return (
    <motion.a
      variants={fadeUp}
      href="#work"
      aria-label={`View ${pro.name}'s profile`}
      data-cursor="view"
      data-cursor-label="VIEW PROFILE"
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
        <img
          src={pro.image}
          alt={`${pro.name}, ${pro.role} in ${pro.location}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[22px] font-medium tracking-[-0.02em] text-fg transition-colors duration-300 group-hover:text-accent md:text-[26px]">
            {pro.name}
          </h3>
          <ArrowUpRight
            size={16}
            className="mt-1.5 shrink-0 text-fg-4 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
          />
        </div>

        <p className="mt-2 text-[14px] text-fg-2">{pro.role}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-fg-3">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} />
            {pro.location}
          </span>
          {pro.verified && (
            <span className="flex items-center gap-1.5 text-accent">
              <ShieldCheck size={12} />
              Verified
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 text-[12.5px]">
          <Rating value={pro.rating} compact />
          <span className="tabular text-fg-3">{pro.projects} projects</span>
        </div>
      </div>
    </motion.a>
  );
}

/* ============================================================
   RATING
   ============================================================ */

function Rating({
  value,
  compact = false,
}: {
  value: string;
  compact?: boolean;
}) {
  const numeric = Math.floor(parseFloat(value));

  return (
    <span
      className="flex items-center gap-2"
      aria-label={`Rated ${value} out of 5`}
    >
      <span aria-hidden="true" className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) =>
          i < numeric ? (
            <Star
              key={i}
              size={compact ? 10 : 12}
              fill="#FBBF24"
              stroke="none"
            />
          ) : (
            <Star
              key={i}
              size={compact ? 10 : 12}
              className="text-fg-4 opacity-50"
              strokeWidth={1.5}
            />
          )
        )}
      </span>
      <span
        className={`tabular text-fg ${
          compact ? "text-[12.5px]" : "text-[13px]"
        }`}
      >
        {value}
      </span>
    </span>
  );
}