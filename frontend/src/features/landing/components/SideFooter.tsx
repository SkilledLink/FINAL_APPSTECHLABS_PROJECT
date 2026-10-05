import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from 'react-icons/fa';
import Container from '../../../components/ui/Container';

const SideFooter: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    const navbarHeight = 76;
    const top =
      section.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const goSection = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    scrollToSection(id);
  };

  const goHome = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#06142e] text-slate-300 dark:bg-black">
      <Container width="wide" className="py-20 md:py-24">
        {/* Row 1 — brand + tagline */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-20">
          <div>
            <button
              type="button"
              onClick={goHome}
              aria-label="SkilledLink home"
              className="inline-flex"
            >
              <span className="text-[24px] font-bold tracking-tight">
                <span className="text-white">Skilled</span>
                <span className="text-[#4F8EFF]">Link</span>
              </span>
            </button>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400 md:text-[15px]">
              Connecting people with skilled professionals and creating
              opportunities through real work.
            </p>
          </div>

          <button
            type="button"
            onClick={() => goSection('contact')}
            className="group inline-flex items-center gap-3 self-start border-b border-white/25 pb-1 text-[12px] font-semibold uppercase tracking-[0.22em] text-white transition-colors duration-300 hover:border-[#4F8EFF] hover:text-[#4F8EFF] md:self-auto"
          >
            <span>Get in touch</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
              style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
            >
              →
            </span>
          </button>
        </div>

        {/* Row 2 — link columns */}
        <div className="mt-16 grid grid-cols-1 gap-12 border-t border-white/10 pt-12 sm:grid-cols-3 md:mt-20 md:gap-16 md:pt-16">
          {/* Explore */}
          <nav aria-label="Footer navigation">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              Explore
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <button
                  type="button"
                  onClick={goHome}
                  className="relative inline-block text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goSection('trades')}
                  className="relative inline-block text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  Trades
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goSection('professionals')}
                  className="relative inline-block text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  Professionals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goSection('need-work')}
                  className="relative inline-block text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  Why SkilledLink
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goSection('faq')}
                  className="relative inline-block text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </nav>

          {/* For professionals */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              For professionals
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/onboarding')}
                  className="relative inline-block text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  Join SkilledLink
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/onboarding')}
                  className="relative inline-block text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  Create your profile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/home/professionals')}
                  className="relative inline-block text-slate-400 transition-colors duration-300 hover:text-white"
                >
                  Get discovered
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              Contact
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#4F8EFF]" />
                <span className="leading-6 text-slate-400">Cameroon</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={14} className="mt-0.5 shrink-0 text-[#4F8EFF]" />
                <a
                  href="mailto:hello@skilledlink.com"
                  className="break-all leading-6 text-slate-400 transition-colors hover:text-white"
                >
                  hello@skilledlink.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={14} className="mt-0.5 shrink-0 text-[#4F8EFF]" />
                <a
                  href="tel:+2376970755363"
                  className="leading-6 text-slate-400 transition-colors hover:text-white"
                >
                  +237 697 075 5363
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-8 flex items-center gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
              >
                <FaFacebookF size={13} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
              >
                <FaInstagram size={13} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
              >
                <FaLinkedinIn size={13} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
              >
                <FaTwitter size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Row 3 — legal */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs tracking-wider text-slate-500 md:mt-20 md:flex-row md:items-center md:justify-between md:gap-8">
          <p>© {new Date().getFullYear()} SkilledLink. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors duration-300 hover:text-slate-300">
              Privacy
            </a>
            <a href="#" className="transition-colors duration-300 hover:text-slate-300">
              Terms
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default SideFooter;