import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";

type Variant = "default" | "hover" | "view" | "text";
type State = { label: string; variant: Variant };

const ease = [0.22, 1, 0.36, 1] as const;

export default function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<State>({
    label: "",
    variant: "default",
  });

  // Instant position for the dot
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Lagged position for the ring (spring)
  const rx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.55 });
  const ry = useSpring(y, { stiffness: 260, damping: 30, mass: 0.55 });

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;

    const hasFine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!hasFine) return;

    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      ) {
        setState({ label: "", variant: "text" });
        return;
      }

      const hit = target.closest("[data-cursor], a, button") as
        | HTMLElement
        | null;

      if (!hit) {
        setState({ label: "", variant: "default" });
        return;
      }

      const explicit = hit.getAttribute("data-cursor");
      if (explicit === "view") {
        setState({
          label: hit.getAttribute("data-cursor-label") || "VIEW",
          variant: "view",
        });
      } else if (explicit) {
        setState({ label: explicit, variant: "hover" });
      } else {
        setState({ label: "", variant: "hover" });
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseleave", leave);
    window.addEventListener("mouseenter", enter);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseleave", leave);
      window.removeEventListener("mouseenter", enter);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [reduce, x, y, visible]);

  if (!enabled) return null;

  const isText = state.variant === "text";
  const isView = state.variant === "view";
  const isHover = state.variant === "hover";

  const ringSize = isView ? 96 : isHover ? 44 : 30;
  const dotSize = isText ? 2 : isView ? 0 : isHover ? 4 : 5;

  return (
    <>
      {/* Outer ring — springs behind the dot */}
      <motion.div
        aria-hidden="true"
        style={{ x: rx, y: ry }}
        className="pointer-events-none fixed left-0 top-0 z-[200] hidden md:block"
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            opacity: visible && !isText ? (isView ? 1 : isHover ? 1 : 0.5) : 0,
            borderColor: isView
              ? "var(--accent)"
              : isHover
              ? "var(--accent)"
              : "var(--fg-3)",
            backgroundColor: isView
              ? "var(--accent-soft)"
              : "transparent",
          }}
          transition={{ duration: 0.36, ease }}
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
          style={{ borderWidth: 1 }}
        >
          {isView && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              {state.label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Inner dot — instant */}
      <motion.div
        aria-hidden="true"
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[201] hidden md:block"
      >
        <motion.div
          animate={{
            width: dotSize,
            height: dotSize,
            opacity: visible ? 1 : 0,
            backgroundColor: isHover || isView
              ? "var(--accent)"
              : "var(--fg)",
          }}
          transition={{ duration: 0.24, ease }}
          className="-translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      </motion.div>
    </>
  );
}