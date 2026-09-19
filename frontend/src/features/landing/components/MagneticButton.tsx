import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  strength?: number;
  scaleOnHover?: number;
  dataCursor?: string;
};

export default function MagneticButton({
  children,
  className = "",
  href,
  type = "button",
  disabled,
  onClick,
  strength = 0.28,
  scaleOnHover = 1,
  dataCursor,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.35 });
  const scale = useMotionValue(1);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const handleEnter = () => {
    if (reduce || !scaleOnHover) return;
    scale.set(scaleOnHover);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  const inner = href ? (
    <a href={href} className={className} onClick={onClick} data-cursor={dataCursor}>
      {children}
    </a>
  ) : (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      data-cursor={dataCursor}
    >
      {children}
    </button>
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy, scale }}
      className="inline-flex"
    >
      {inner}
    </motion.div>
  );
}