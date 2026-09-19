import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, ArrowUpRight, Mail, Phone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { navLinks } from "../landingData";

type Props = {
  activeNav: string;
  onNavigate: (id: string) => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

const springSpatial = {
  type: "spring" as const,
  stiffness: 320,
  damping: 38,
  mass: 0.9,
};
const springUi = {
  type: "spring" as const,
  stiffness: 480,
  damping: 38,
  mass: 0.7,
};

export default function Navbar({ activeNav, onNavigate }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ribbonOpen, setRibbonOpen] = useState(true);
  const reduce = useReducedMotion();

  const navPillRef = useRef<HTMLDivElement>(null);
  const [glowX, setGlowX] = useState(0);
  const [glowActive, setGlowActive] = useState(false);

  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [ctaGlow, setCtaGlow] = useState({ x: 0, y: 0, active: false });

  const [brandHover, setBrandHover] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const navigate = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  const handlePillMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = navPillRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setGlowX(e.clientX - rect.left);
    },
    []
  );

  const handleCtaMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ctaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCtaGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleCtaLeave = () => setCtaGlow((g) => ({ ...g, active: false }));

  return (
    <>
      <motion.header
        initial={reduce ? false : { y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduce ? { duration: 0 } : springSpatial}
        className="fixed left-0 right-0 top-0 z-50"
      >
        <div className="relative w-full">
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ opacity: scrolled ? 1 : 0 }}
            transition={{ duration: 0.55, ease }}
            className="pointer-events-none absolute inset-0"
            style={{
              background: "var(--nav-bg)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--line-2) 25%, var(--line-2) 75%, transparent 100%)",
            }}
          />

          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ opacity: scrolled ? 1 : 0, scaleX: scrolled ? 1 : 0.6 }}
            transition={{ duration: 0.6, ease }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-center"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--nav-border) 30%, var(--nav-border) 70%, transparent 100%)",
            }}
          />

          <AnimatePresence initial={false}>
            {ribbonOpen && !scrolled && (
              <motion.div
                key="ribbon"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: 32, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease }}
                className="overflow-hidden"
              >
                <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-between gap-4 px-5 md:px-10">
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-fg-3">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F8EFF] opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4F8EFF]" />
                    </span>
                    <span className="hidden sm:inline">
                      NOW SERVING DOUALA · YAOUNDÉ · MAROUA
                    </span>
                    <span className="sm:hidden">DOUALA · YAOUNDÉ · MAROUA</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href="#contact"
                      className="link-underline hidden text-[10px] tracking-[0.24em] text-fg-3 transition hover:text-fg md:inline"
                    >
                      CONTACT US
                    </a>
                    <button
                      type="button"
                      aria-label="Dismiss announcement"
                      onClick={() => setRibbonOpen(false)}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-fg-4 transition hover:bg-elevated hover:text-fg"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="relative mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 transition-[padding] duration-500 md:px-10"
            style={{
              paddingTop: scrolled ? 10 : 16,
              paddingBottom: scrolled ? 10 : 16,
              transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
            }}
          >
            <a
              href="#"
              onMouseEnter={() => setBrandHover(true)}
              onMouseLeave={() => setBrandHover(false)}
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2.5 text-fg"
              aria-label="SkilledLink home"
            >
              <motion.span
                className="relative flex h-[26px] w-[26px] items-center justify-center"
                animate={{ rotate: brandHover && !reduce ? 24 : 0 }}
                transition={reduce ? { duration: 0 } : springUi}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[22px] w-[22px]"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M12 2.5 L20.5 7.25 L20.5 16.75 L12 21.5 L3.5 16.75 L3.5 7.25 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                    style={{ color: "var(--accent)" }}
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease, delay: 0.3 }}
                  />
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="2.1"
                    fill="currentColor"
                    style={{ color: "var(--accent)" }}
                    initial={reduce ? false : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease, delay: 1.1 }}
                  />
                </svg>
              </motion.span>
              <span className="inline-flex items-baseline text-[16px] font-semibold tracking-[-0.01em]">
                <span className="text-accent">Skilled</span>
                <span>Link</span>
                <motion.span
                  className="ml-0.5 inline-block h-1 w-1 rounded-full"
                  style={{ background: "var(--accent)" }}
                  animate={{ y: brandHover ? -2 : -6, scale: brandHover ? 1.6 : 1 }}
                  transition={reduce ? { duration: 0 } : springUi}
                />
              </span>
            </a>

            <div
              ref={navPillRef}
              onMouseMove={handlePillMove}
              onMouseEnter={() => setGlowActive(true)}
              onMouseLeave={() => setGlowActive(false)}
              className="relative hidden items-center rounded-full p-1 transition-colors duration-500 lg:flex"
              style={{
                background: scrolled ? "var(--surface-tint)" : "transparent",
                border: `1px solid ${scrolled ? "var(--line-2)" : "transparent"}`,
                boxShadow: scrolled
                  ? "inset 0 1px 0 rgba(255,255,255,0.03)"
                  : "none",
              }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 rounded-full transition-opacity duration-300"
                style={{
                  opacity: glowActive ? 1 : 0,
                  background: `radial-gradient(160px circle at ${glowX}px 50%, var(--accent-soft), transparent 60%)`,
                }}
              />

              {navLinks.map((link, i) => {
                const isActive = activeNav === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={() => onNavigate(link.id)}
                    className="group relative z-10 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] tracking-tight transition-colors duration-300"
                    style={{ color: isActive ? "var(--fg)" : "var(--fg-3)" }}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -z-20 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "var(--surface-tint)" }}
                    />
                    <span
                      className="font-serif text-[10px] italic opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ color: isActive ? "var(--accent)" : "var(--fg-4)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="transition-colors duration-300 group-hover:text-fg">
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={springUi}
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-full"
                        style={{
                          background: "var(--bg-1)",
                          border: "1px solid var(--line-2)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.25)",
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="hidden rounded-full px-3.5 py-2 text-[12.5px] font-medium text-fg-2 transition hover:text-fg lg:inline-flex"
              >
                Log in
              </a>

              <a
                href="/register"
                ref={ctaRef}
                onMouseMove={handleCtaMove}
                onMouseLeave={handleCtaLeave}
                className="group relative hidden items-center gap-2 overflow-hidden rounded-full px-1 py-1 lg:inline-flex"
                style={{
                  background: "var(--btn-invert-bg)",
                  boxShadow:
                    "0 1px 2px rgba(0,0,0,0.25), 0 8px 24px -10px rgba(79,142,255,0.35)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)",
                  }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-300"
                  style={{
                    opacity: ctaGlow.active ? 1 : 0,
                    background: `radial-gradient(120px circle at ${ctaGlow.x}px ${ctaGlow.y}px, rgba(79,142,255,0.35), transparent 65%)`,
                  }}
                />
                <span
                  className="relative pl-4 text-[12.5px] font-semibold tracking-tight"
                  style={{ color: "var(--btn-invert-fg)" }}
                >
                  Join SkilledLink
                </span>
                <motion.span
                  className="relative ml-1 flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    background: "var(--btn-invert-fg)",
                    color: "var(--btn-invert-bg)",
                  }}
                  whileHover={reduce ? undefined : { rotate: 45 }}
                  transition={springUi}
                >
                  <ArrowUpRight size={13} />
                </motion.span>
              </a>

              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-soft bg-elevated text-fg transition hover:border-medium lg:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={menuOpen ? "close" : "open"}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, rotate: -60, scale: 0.6 }
                    }
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, rotate: 60, scale: 0.6 }
                    }
                    transition={springUi}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {menuOpen ? <X size={16} /> : <Menu size={16} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-md lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={reduce ? { duration: 0 } : springSpatial}
              className="fixed bottom-0 right-0 top-0 z-[56] flex w-[min(92vw,440px)] flex-col border-l border-soft lg:hidden"
              style={{
                backgroundColor: "var(--drawer-bg)",
                backdropFilter: "blur(28px) saturate(180%)",
                WebkitBackdropFilter: "blur(28px) saturate(180%)",
              }}
              aria-hidden={!menuOpen}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-px"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)",
                }}
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.045]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--fg) 1px, transparent 1px), linear-gradient(to bottom, var(--fg) 1px, transparent 1px)",
                  backgroundSize: "64px 64px",
                  maskImage:
                    "radial-gradient(ellipse at top right, black 20%, transparent 70%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at top right, black 20%, transparent 70%)",
                }}
              />

              <div className="relative flex items-center justify-between border-b border-hairline px-6 py-5">
                <div>
                  <span className="inline-flex items-baseline text-[15px] font-semibold tracking-tight text-fg">
                    <span className="text-accent">Skilled</span>
                    <span>Link</span>
                    <span
                      className="ml-0.5 inline-block h-1 w-1 -translate-y-[6px] rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  </span>
                  <p className="mt-1 text-[10px] tracking-[0.24em] text-fg-4">
                    EVERY TRADE · CAMEROON
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-soft text-fg-2 transition hover:border-medium hover:text-fg"
                >
                  <X size={15} />
                </button>
              </div>

              <nav
                className="relative flex-1 overflow-y-auto px-6 py-6"
                aria-label="Mobile"
              >
                {navLinks.map((link, i) => {
                  const isActive = activeNav === link.id;
                  return (
                    <motion.a
                      key={link.id}
                      href={`#${link.id}`}
                      onClick={() => navigate(link.id)}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease }}
                      className="group flex items-center justify-between border-b border-hairline py-4 text-[26px] font-medium tracking-[-0.03em] transition-colors duration-300"
                      style={{ color: isActive ? "var(--accent)" : "var(--fg)" }}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-serif text-[13px] italic" style={{ opacity: 0.5 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{link.label}</span>
                      </span>
                      <ArrowUpRight
                        size={16}
                        className="opacity-0 transition-all duration-500 group-hover:opacity-70"
                      />
                    </motion.a>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45, ease }}
                  className="mt-8 space-y-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-fg-4">
                    Get in touch
                  </p>
                  <a
                    href="mailto:hello@skilledlink.com"
                    className="group flex items-center gap-3 text-[13px] text-fg-2 transition hover:text-fg"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-soft transition group-hover:border-medium">
                      <Mail size={13} />
                    </span>
                    hello@skilledlink.com
                  </a>
                  <a
                    href="tel:+237690000000"
                    className="group flex items-center gap-3 text-[13px] text-fg-2 transition hover:text-fg"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-soft transition group-hover:border-medium">
                      <Phone size={13} />
                    </span>
                    +237 690 000 000
                  </a>
                </motion.div>
              </nav>

              <div className="relative space-y-3 border-t border-hairline px-6 py-5">
                <a
                  href="/login"
                  className="block rounded-full border border-soft py-3 text-center text-[13px] font-medium text-fg-2 transition hover:border-medium hover:text-fg"
                >
                  Log in
                </a>
                <a
                  href="/register"
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full py-3 text-center text-[13px] font-semibold"
                  style={{
                    background: "var(--btn-invert-bg)",
                    color: "var(--btn-invert-fg)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.25), 0 8px 24px -10px rgba(79,142,255,0.35)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)",
                    }}
                  />
                  Join SkilledLink
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}