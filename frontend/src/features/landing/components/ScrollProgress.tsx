import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Smooth the raw progress value so the bar glides rather than snaps.
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 38,
    mass: 0.3,
  });

  // The head node uses the *smoothed* value so it stays glued to the bar's tip.
  // Compensated by half the head width so it never overflows the right edge.
  const headLeft = useTransform(scaleX, (v) => {
    const clamped = Math.min(1, Math.max(0, v));
    return `calc(${clamped * 100}% - ${clamped * 4}px)`;
  });

  // Whole component fades in after the first bit of scroll, dims at the very end.
  const containerOpacity = useTransform(
    scrollYProgress,
    [0, 0.015, 0.98, 1],
    [0, 1, 1, 0.5]
  );

  // Head node opacity — separate so it can vanish at both extremes.
  const headOpacity = useTransform(
    scrollYProgress,
    [0, 0.02, 0.97, 1],
    [0, 1, 1, 0]
  );

  // Head node scale — pops in gently at the start of the scroll.
  const headScale = useTransform(scrollYProgress, [0, 0.02, 1], [0.3, 1, 1]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity: containerOpacity }}
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[2px]"
    >
      {/* Base track — barely-there rail behind the progress bar */}
      <div
        className="absolute inset-x-0 top-0 h-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(79,142,255,0) 0%, rgba(79,142,255,0.04) 50%, rgba(79,142,255,0.04) 100%)",
        }}
      />

      {/* Progress bar — scales from left using the smoothed spring */}
      <motion.div
        style={{ scaleX }}
        className="absolute inset-x-0 top-0 h-full origin-left"
      >
        {/* Gradient fill */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(79,142,255,0.15) 0%, rgba(122,176,255,0.7) 30%, #7AB0FF 70%, #4F8EFF 100%)",
          }}
        />

        {/* Soft glow that bleeds down from the bar */}
        <div
          className="absolute inset-x-0 top-full h-4"
          style={{
            background:
              "linear-gradient(180deg, rgba(79,142,255,0.4) 0%, rgba(79,142,255,0.08) 40%, transparent 100%)",
            filter: "blur(2px)",
          }}
        />
      </motion.div>

      {/* Leading head node — tracks the tip of the bar */}
      <motion.div
        style={{ left: headLeft, opacity: headOpacity, scale: headScale }}
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="relative block h-2 w-2">
          {/* Pulsing halo */}
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(79,142,255,0.55)" }}
              animate={{ scale: [1, 2.6, 1], opacity: [0.55, 0, 0.55] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Bright core with layered glow */}
          <span
            className="relative block h-2 w-2 rounded-full"
            style={{
              background: "#FFFFFF",
              boxShadow:
                "0 0 6px #7AB0FF, 0 0 14px rgba(79,142,255,0.7), 0 0 22px rgba(79,142,255,0.35)",
            }}
          />
        </span>
      </motion.div>
    </motion.div>
  );
}