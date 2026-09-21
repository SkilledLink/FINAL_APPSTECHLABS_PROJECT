import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { faqs } from "../landingData";

const ease = [0.22, 1, 0.36, 1] as const;

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative py-24 md:py-40"
    >
      <div className="mx-auto max-w-[1300px] px-5 md:px-12">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.4fr] lg:gap-24">
          {/* ── Left: sticky heading ───────────────────────── */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.85, ease }}
            >
              <span className="eyebrow">
                <span className="text-accent">06</span> / Questions
              </span>

              <h2
                id="faq-heading"
                className="mt-8 max-w-[12ch] text-[10vw] font-medium leading-[0.95] tracking-[-0.045em] text-fg sm:text-5xl md:text-[3.75rem]"
              >
                Answers before you{" "}
                <span className="serif text-fg-3">start.</span>
              </h2>

              <p className="mt-8 max-w-sm text-[15px] leading-7 text-fg-2">
                A few useful things to know about finding trusted hands and
                joining the SkilledLink community.
              </p>

              <a
                href="#contact"
                className="group mt-10 inline-flex items-center gap-2 text-[13px] font-medium text-fg-2 transition-colors duration-300 hover:text-fg"
              >
                <span className="link-underline">
                  Still have a question?
                </span>
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </motion.div>
          </div>

          {/* ── Right: question list ──────────────────────── */}
          <motion.ul
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.9, ease }}
            className="border-t border-hairline"
          >
            {faqs.map((faq, i) => {
              const isOpen = open === i;

              return (
                <li
                  key={faq.question}
                  className="border-b border-hairline"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-start gap-5 py-7 text-left md:gap-8 md:py-8"
                  >
                    {/* Index */}
                    <span
                      className={`mt-1 shrink-0 text-[11px] tabular transition-colors duration-300 md:text-[12px] ${
                        isOpen
                          ? "text-accent"
                          : "text-fg-4 group-hover:text-fg-3"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Question */}
                    <span className="relative flex-1">
                      <span
                        className={`block text-[16px] font-medium leading-[1.35] tracking-[-0.015em] transition-colors duration-300 md:text-[19px] ${
                          isOpen
                            ? "text-fg"
                            : "text-fg-2 group-hover:text-fg"
                        }`}
                      >
                        {faq.question}
                      </span>

                      {/* Hover underline — only when closed */}
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute -bottom-1 left-0 h-px bg-fg-3 transition-all duration-500 ${
                          isOpen
                            ? "w-0 opacity-0"
                            : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60"
                        }`}
                        style={{ transitionTimingFunction: "cubic-bezier(.22,1,.36,1)" }}
                      />
                    </span>

                    {/* Indicator — bare plus that morphs to × */}
                    <span
                      aria-hidden="true"
                      className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
                    >
                      <span
                        className={`absolute h-px w-3.5 transition-colors duration-300 ${
                          isOpen ? "bg-accent" : "bg-fg-3 group-hover:bg-fg"
                        }`}
                      />
                      <motion.span
                        animate={{
                          rotate: isOpen ? 90 : 0,
                          opacity: isOpen ? 0 : 1,
                        }}
                        transition={{ duration: 0.4, ease }}
                        className={`absolute h-3.5 w-px transition-colors duration-300 ${
                          isOpen ? "bg-accent" : "bg-fg-3 group-hover:bg-fg"
                        }`}
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${i}`}
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: reduce ? 0.001 : 0.45,
                          ease,
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[52ch] pb-8 pl-10 pr-8 text-[14.5px] leading-[1.75] text-fg-2 md:pl-[68px] md:pr-16 md:text-[15px]">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}