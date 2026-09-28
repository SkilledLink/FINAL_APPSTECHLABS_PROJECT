// src/features/landing/components/Hero.tsx

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Wrench,
  Building2,
  Zap,
  Hammer,
  HardHat,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const HeroSplit: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleExplore = () => {
    const section = document.getElementById("trades");

    if (section) {
      const offset = 100;

      const top =
        section.getBoundingClientRect().top +
        window.scrollY -
        offset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="home"
      className="
        relative
        min-h-screen
        w-full
        overflow-hidden

        bg-[#f7faff]
        dark:bg-[#050b14]

        text-slate-900
        dark:text-white

        transition-colors
        duration-500
      "
    >
      {/* =========================================================
          PREMIUM BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {/* Main blue glow */}

        <div
          className="
            absolute
            -left-40
            top-20

            h-[500px]
            w-[500px]

            rounded-full

            bg-blue-500/15
            dark:bg-blue-600/10

            blur-[120px]
          "
        />

        {/* Cyan glow */}

        <div
          className="
            absolute
            right-[-180px]
            top-[20%]

            h-[600px]
            w-[600px]

            rounded-full

            bg-cyan-400/15
            dark:bg-cyan-500/10

            blur-[140px]
          "
        />

        {/* Bottom glow */}

        <div
          className="
            absolute
            bottom-[-250px]
            left-1/2

            h-[500px]
            w-[700px]

            -translate-x-1/2

            rounded-full

            bg-blue-500/10
            dark:bg-blue-700/10

            blur-[140px]
          "
        />

        {/* Grid */}

        <div
          className="
            absolute
            inset-0

            opacity-[0.35]
            dark:opacity-[0.12]

            [background-image:linear-gradient(rgba(37,99,235,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.06)_1px,transparent_1px)]
            [background-size:64px_64px]

            [mask-image:linear-gradient(to_bottom,black_0%,transparent_85%)]
          "
        />

        {/* Radial center */}

        <div
          className="
            absolute
            inset-0

            bg-[radial-gradient(circle_at_50%_35%,rgba(37,99,235,0.08),transparent_42%)]
            dark:bg-[radial-gradient(circle_at_50%_35%,rgba(14,165,233,0.08),transparent_42%)]
          "
        />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div
        className="
          relative
          z-10

          mx-auto
          flex
          min-h-screen
          max-w-[1500px]

          items-center

          px-5
          pb-16
          pt-32

          sm:px-8
          sm:pt-36

          lg:px-12
          lg:pb-20
          lg:pt-40

          xl:px-16
        "
      >
        <div
          className="
            grid
            w-full

            grid-cols-1

            items-center

            gap-16

            lg:grid-cols-[0.9fr_1.1fr]
            lg:gap-12

            xl:gap-20
          "
        >
          {/* =====================================================
              LEFT SIDE
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              relative
              z-20

              max-w-2xl

              text-center
              lg:text-left
            "
          >
            {/* Eyebrow */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
                duration: 0.6,
              }}
              className="
                mb-7

                inline-flex
                items-center
                gap-2

                rounded-full

                border
                border-blue-200/80
                dark:border-blue-400/15

                bg-white/75
                dark:bg-white/[0.04]

                px-4
                py-2

                shadow-sm
                dark:shadow-none

                backdrop-blur-xl
              "
            >
              <span
                className="
                  flex
                  h-6
                  w-6

                  items-center
                  justify-center

                  rounded-full

                  bg-gradient-to-br
                  from-blue-600
                  to-cyan-400

                  text-white
                "
              >
                <ShieldCheck size={13} />
              </span>

              <span
                className="
                  text-[11px]
                  font-bold

                  uppercase
                  tracking-[0.14em]

                  text-slate-600
                  dark:text-slate-300
                "
              >
                Trusted Skilled Professionals
              </span>

              <span
                className="
                  h-1.5
                  w-1.5

                  rounded-full

                  bg-cyan-400

                  shadow-[0_0_10px_rgba(34,211,238,0.8)]
                "
              />
            </motion.div>

            {/* Main Heading */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                text-[3.25rem]
                font-black
                leading-[0.98]
                tracking-[-0.055em]

                sm:text-[4.25rem]

                lg:text-[4.4rem]

                xl:text-[5.25rem]
              "
            >
              <span className="block">
                Skilled people.
              </span>

              <span
                className="
                  mt-1
                  block

                  bg-gradient-to-r
                  from-blue-600
                  via-blue-500
                  to-cyan-400

                  bg-clip-text

                  text-transparent
                "
              >
                Real work.
              </span>
            </motion.h1>

            {/* Description */}

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                duration: 0.7,
              }}
              className="
                mx-auto
                mt-7

                max-w-xl

                text-base
                leading-7

                text-slate-600
                dark:text-slate-400

                sm:text-lg
                sm:leading-8

                lg:mx-0
              "
            >
              Connect with trusted artisans, technicians,
              professionals, and service companies ready to
              get the job done — from everyday repairs to
              major projects.
            </motion.p>

            {/* =================================================
                CTA
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.5,
                duration: 0.7,
              }}
              className="
                mt-9

                flex
                flex-col

                items-center

                gap-3

                sm:flex-row

                lg:items-center
              "
            >
              {/* Primary */}

              <button
                type="button"
                onClick={handleGetStarted}
                className="
                  group

                  relative

                  flex
                  w-full
                  sm:w-auto

                  items-center
                  justify-center
                  gap-3

                  overflow-hidden

                  rounded-2xl

                  bg-gradient-to-r
                  from-blue-600
                  via-blue-600
                  to-cyan-500

                  px-7
                  py-4

                  text-sm
                  font-bold

                  text-white

                  shadow-[0_18px_45px_-15px_rgba(37,99,235,0.65)]

                  transition-all
                  duration-300

                  hover:-translate-y-1

                  hover:shadow-[0_24px_55px_-15px_rgba(37,99,235,0.7)]

                  active:translate-y-0
                "
              >
                {/* Shine */}

                <span
                  className="
                    absolute
                    inset-0

                    -translate-x-full

                    bg-gradient-to-r
                    from-transparent
                    via-white/25
                    to-transparent

                    transition-transform
                    duration-700

                    group-hover:translate-x-full
                  "
                />

                <span className="relative z-10">
                  Find Skilled Professionals
                </span>

                <ArrowRight
                  size={17}
                  className="
                    relative
                    z-10

                    transition-transform
                    duration-300

                    group-hover:translate-x-1
                  "
                />
              </button>

              {/* Secondary */}

              <button
                type="button"
                onClick={handleExplore}
                className="
                  group

                  flex
                  w-full
                  sm:w-auto

                  items-center
                  justify-center
                  gap-2

                  rounded-2xl

                  border
                  border-slate-200
                  dark:border-white/[0.09]

                  bg-white/70
                  dark:bg-white/[0.035]

                  px-7
                  py-4

                  text-sm
                  font-bold

                  text-slate-700
                  dark:text-slate-200

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:-translate-y-1

                  hover:border-blue-200
                  dark:hover:border-cyan-400/20

                  hover:bg-white
                  dark:hover:bg-white/[0.06]
                "
              >
                <Wrench
                  size={16}
                  className="
                    text-blue-600
                    dark:text-cyan-400
                  "
                />

                Explore Services
              </button>
            </motion.div>

            {/* =================================================
                TRUST LINE
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.7,
                duration: 0.8,
              }}
              className="
                mt-8

                flex
                flex-wrap

                items-center
                justify-center
                gap-x-5
                gap-y-3

                text-xs
                font-medium

                text-slate-500
                dark:text-slate-500

                lg:justify-start
              "
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                  className="text-blue-500"
                />
                Verified professionals
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                  className="text-cyan-500"
                />
                Local services
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                  className="text-blue-500"
                />
                Real reviews
              </span>
            </motion.div>
          </motion.div>

          {/* =====================================================
              RIGHT SIDE — PREMIUM VISUAL
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 40,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.25,
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              relative

              mx-auto

              w-full

              max-w-[680px]

              lg:ml-auto
            "
          >
            {/* Decorative orbit */}

            <div
              className="
                pointer-events-none

                absolute
                -inset-8

                rounded-[3rem]

                border
                border-blue-500/[0.08]
                dark:border-cyan-400/[0.07]

                rotate-2
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                -inset-14

                rounded-[4rem]

                border
                border-blue-500/[0.045]
                dark:border-blue-400/[0.04]

                -rotate-3
              "
            />

            {/* Main image frame */}

            <div
              className="
                relative

                overflow-hidden

                rounded-[2.5rem]

                border
                border-white
                dark:border-white/[0.08]

                bg-white
                dark:bg-[#0a1422]

                p-2

                shadow-[0_35px_100px_-30px_rgba(15,23,42,0.35)]
                dark:shadow-[0_35px_100px_-30px_rgba(0,0,0,0.65)]
              "
            >
              {/* IMAGE */}

              <div
                className="
                  relative

                  h-[440px]
                  sm:h-[500px]
                  lg:h-[560px]

                  overflow-hidden

                  rounded-[2rem]

                  bg-slate-900
                "
              >
                <motion.img
                  src="https://gbengineering.cm/wp-content/uploads/2025/04/blog_post-6.png"
                  alt="Skilled professional working on a project"
                  initial={{
                    scale: 1.08,
                  }}
                  animate={{
                    scale: [1.08, 1.13, 1.08],
                  }}
                  transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    absolute
                    inset-0

                    h-full
                    w-full

                    object-cover
                    object-center
                  "
                />

                {/* Image overlay */}

                <div
                  className="
                    absolute
                    inset-0

                    bg-gradient-to-tr
                    from-[#03101e]/90
                    via-[#071a2f]/20
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute
                    inset-0

                    bg-gradient-to-t
                    from-[#020b16]/80
                    via-transparent
                    to-transparent
                  "
                />

                {/* Cyan light */}

                <motion.div
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    absolute

                    -right-24
                    top-20

                    h-72
                    w-72

                    rounded-full

                    bg-cyan-400/30

                    blur-[90px]
                  "
                />

                {/* =================================================
                    IMAGE TOP BADGE
                ================================================== */}

                <div
                  className="
                    absolute
                    left-5
                    top-5

                    flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-white/15

                    bg-slate-950/55

                    px-3.5
                    py-2

                    text-[10px]
                    font-bold

                    uppercase
                    tracking-[0.12em]

                    text-white

                    backdrop-blur-xl
                  "
                >
                  <span
                    className="
                      flex
                      h-5
                      w-5

                      items-center
                      justify-center

                      rounded-full

                      bg-cyan-400

                      text-slate-950
                    "
                  >
                    <ShieldCheck size={11} />
                  </span>

                  Trusted network
                </div>

                {/* =================================================
                    PROFESSIONAL CARD
                ================================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 1,
                    duration: 0.7,
                  }}
                  className="
                    absolute

                    bottom-5
                    left-5
                    right-5

                    sm:left-6
                    sm:right-auto

                    sm:w-[310px]

                    rounded-[1.5rem]

                    border
                    border-white/15

                    bg-slate-950/65

                    p-4

                    text-white

                    shadow-2xl

                    backdrop-blur-2xl
                  "
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0

                        items-center
                        justify-center

                        rounded-xl

                        bg-gradient-to-br
                        from-blue-500
                        to-cyan-400

                        text-white
                      "
                    >
                      <HardHat size={22} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-sm font-bold">
                          Skilled Professional
                        </h3>

                        <CheckCircle2
                          size={14}
                          className="shrink-0 text-cyan-400"
                        />
                      </div>

                      <p className="mt-0.5 text-xs text-slate-300">
                        Verified service provider
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-4

                      flex
                      items-center
                      justify-between

                      border-t
                      border-white/10

                      pt-3
                    "
                  >
                    <div className="flex items-center gap-1.5">
                      <Star
                        size={13}
                        className="fill-amber-400 text-amber-400"
                      />

                      <span className="text-xs font-bold">
                        4.9
                      </span>

                      <span className="text-[10px] text-slate-400">
                        rating
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin
                        size={13}
                        className="text-cyan-400"
                      />
                      Cameroon
                    </div>
                  </div>
                </motion.div>

                {/* =================================================
                    FLOATING SERVICE CARD
                ================================================== */}

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    absolute

                    right-5
                    top-24

                    hidden

                    w-[185px]

                    rounded-2xl

                    border
                    border-white/15

                    bg-white/90

                    p-3.5

                    text-slate-900

                    shadow-2xl

                    backdrop-blur-xl

                    sm:block
                  "
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="
                        flex
                        h-9
                        w-9

                        items-center
                        justify-center

                        rounded-xl

                        bg-blue-50

                        text-blue-600
                      "
                    >
                      <Wrench size={17} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Services
                      </p>

                      <p className="text-xs font-bold">
                        Available nearby
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-3

                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        h-2
                        w-2

                        rounded-full

                        bg-emerald-500

                        shadow-[0_0_10px_rgba(16,185,129,0.5)]
                      "
                    />

                    <span className="text-[10px] font-semibold text-slate-500">
                      Professionals online
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* =====================================================
                FLOATING STATS
            ====================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 1.15,
                duration: 0.7,
              }}
              className="
                absolute

                -bottom-7
                right-4

                sm:right-8

                flex
                items-center

                rounded-2xl

                border
                border-slate-200/80
                dark:border-white/[0.08]

                bg-white/90
                dark:bg-[#0b1625]/90

                px-4
                py-3

                shadow-[0_20px_50px_-15px_rgba(15,23,42,0.25)]
                dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.55)]

                backdrop-blur-xl
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10

                  items-center
                  justify-center

                  rounded-xl

                  bg-blue-50
                  dark:bg-blue-500/10

                  text-blue-600
                  dark:text-cyan-400
                "
              >
                <Users size={18} />
              </div>

              <div className="ml-3">
                <p
                  className="
                    text-lg
                    font-black
                    tracking-tight
                  "
                >
                  Growing
                </p>

                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]

                    text-slate-400
                  "
                >
                  Professional network
                </p>
              </div>
            </motion.div>

            {/* Decorative icons */}

            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute

                -left-5
                top-[28%]

                hidden

                h-14
                w-14

                items-center
                justify-center

                rounded-2xl

                border
                border-blue-100
                dark:border-white/[0.08]

                bg-white/80
                dark:bg-[#0b1625]/80

                text-blue-600
                dark:text-cyan-400

                shadow-xl

                backdrop-blur-xl

                xl:flex
              "
            >
              <Hammer size={22} />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -3, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute

                -right-5
                bottom-[24%]

                hidden

                h-14
                w-14

                items-center
                justify-center

                rounded-2xl

                border
                border-cyan-100
                dark:border-white/[0.08]

                bg-white/80
                dark:bg-[#0b1625]/80

                text-cyan-500

                shadow-xl

                backdrop-blur-xl

                xl:flex
              "
            >
              <Zap size={22} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM TRUST STRIP
      ========================================================== */}

      <div
        className="
          relative
          z-20

          mx-auto

          max-w-[1500px]

          px-5
          pb-8

          sm:px-8
          lg:px-12
          xl:px-16
        "
      >
        <div
          className="
            flex
            flex-col

            items-center
            justify-between

            gap-5

            border-t
            border-slate-200/70
            dark:border-white/[0.06]

            pt-6

            sm:flex-row
          "
        >
          <div
            className="
              flex
              items-center
              gap-2

              text-[10px]
              font-bold

              uppercase
              tracking-[0.14em]

              text-slate-400
              dark:text-slate-500
            "
          >
            <Building2 size={14} />

            Built for Cameroon&apos;s skilled workforce
          </div>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <ShieldCheck
                size={13}
                className="text-blue-500"
              />
              Verified
            </span>

            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Star
                size={13}
                className="fill-amber-400 text-amber-400"
              />
              Trusted
            </span>

            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Users
                size={13}
                className="text-cyan-500"
              />
              Connected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplit