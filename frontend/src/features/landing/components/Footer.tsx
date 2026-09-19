import { navLinks } from "../landingData";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-[16px] font-semibold tracking-tight text-fg"
            >
              <span className="text-accent">Skilled</span>
              <span>Link</span>
            </a>
            <p className="mt-5 max-w-xs text-[13px] leading-6 text-fg-3">
              A professional discovery platform built around skilled work in
              Cameroon.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-fg-4">
              Explore
            </p>
            <ul className="mt-5 space-y-3 text-[13px] text-fg-2">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="transition hover:text-fg">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-fg-4">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-[13px] text-fg-2">
              <li>
                <a href="mailto:hello@skilledlink.com" className="transition hover:text-fg">
                  hello@skilledlink.com
                </a>
              </li>
              <li>
                <a href="tel:+237690000000" className="transition hover:text-fg">
                  +237 690 000 000
                </a>
              </li>
              <li>
                <a href="#contact" className="transition hover:text-fg">
                  Send a message
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-7 text-[11px] tracking-[0.18em] text-fg-4 md:flex-row md:items-center">
          <span>© {year} SKILLEDLINK</span>
          <span>MADE FOR CAMEROON · XAF</span>
        </div>
      </div>
    </footer>
  );
}