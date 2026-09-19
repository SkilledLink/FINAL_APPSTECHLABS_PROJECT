import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import SplitText from "./SplitText";
import { priceExamples } from "../landingData";

function useCountUp(target: number, duration = 1400) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, reduce]);

  return { ref, value };
}

function PriceRow({
  label,
  amount,
  detail,
  index,
}: {
  label: string;
  amount: number;
  detail: string;
  index: number;
}) {
  const { ref, value } = useCountUp(amount);
  const formatted = value.toLocaleString("en-US");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.85, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative grid grid-cols-[1fr_auto] items-baseline gap-4 border-t border-hairline py-8 transition-colors duration-500 hover:border-medium md:grid-cols-[2.5rem_1.3fr_1fr] md:gap-8 md:py-10"
    >
      <span className="hidden font-serif text-[15px] italic text-fg-4 md:block">
        {String(index + 1).padStart(2, "0")}
      </span>

      <p className="text-[11px] uppercase tracking-[0.32em] text-fg-3 md:text-[12px]">
        {label}
      </p>

      <p className="justify-self-end text-right text-[34px] font-medium leading-none tracking-[-0.04em] text-fg tabular md:justify-self-start md:text-left md:text-[3.25rem]">
        {formatted}
        <span className="ml-2 text-sm font-normal tracking-normal text-fg-3">
          FCFA
        </span>
      </p>

      <p className="col-span-2 text-[12px] text-fg-4 md:col-span-1 md:justify-self-end md:text-right md:text-[13px]">
        {detail}
      </p>

      <span className="pointer-events-none absolute left-0 right-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#7AB0FF] to-transparent transition-transform duration-700 group-hover:scale-x-100" />
    </motion.div>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-12">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <span className="eyebrow">
            <span className="text-accent">04</span> — Local pricing
          </span>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SplitText
                as="h2"
                text="Clear numbers. No dollar signs."
                highlight="No"
                highlightClass="serif text-fg-3"
                className="max-w-[16ch] text-[10vw] font-medium leading-[0.95] tracking-[-0.045em] text-fg sm:text-6xl md:text-[4.5rem]"
                stagger={0.06}
              />
              <span className="pill">XAF · FCFA</span>
            </div>

            <p className="mt-7 max-w-xl text-[15px] leading-7 text-fg-2">
              Examples below are illustrative, not fixed SkilledLink prices.
              Final prices can depend on the professional, scope, materials
              and location.
            </p>
          </div>
        </div>

        <div className="mt-14 md:mt-16">
          {priceExamples.map((item, i) => (
            <PriceRow
              key={item.label}
              label={item.label}
              amount={item.amount}
              detail={item.detail}
              index={i}
            />
          ))}
          <div className="border-t border-hairline" />
        </div>

        <p className="mt-8 max-w-md text-[12px] leading-6 text-fg-4">
          Illustrative examples only. Actual quotes are agreed directly
          between you and the professional.
        </p>
      </div>
    </section>
  );
}