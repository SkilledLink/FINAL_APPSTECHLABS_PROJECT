import { motion, useReducedMotion } from "framer-motion";

type As = "h1" | "h2" | "h3" | "p" | "span";

type Props = {
  text: string;
  as?: As;
  className?: string;
  delay?: number;
  stagger?: number;
  highlight?: string;
  highlightClass?: string;
  y?: string;
  duration?: number;
};

export default function SplitText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.05,
  highlight,
  highlightClass = "serif text-fg-3",
  y = "110%",
  duration = 1,
}: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return (
      <Tag className={className}>
        {words.map((w, i) => (
          <span key={i}>
            <span className={w === highlight ? highlightClass : undefined}>
              {w}
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
    );
  }

  const MotionTag = motion[Tag] as any;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  const child = {
    hidden: { y, opacity: 0 },
    show: {
      y: "0%",
      opacity: 1,
      transition: { duration, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <MotionTag
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      className={className}
      style={{ display: "block" }}
    >
      {words.map((word, wi) => (
        <span
          key={wi}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "top",
            paddingBottom: "0.09em",
          }}
        >
          <motion.span variants={child} style={{ display: "inline-block" }}>
            <span className={word === highlight ? highlightClass : undefined}>
              {word}
            </span>
          </motion.span>
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </MotionTag>
  );
}