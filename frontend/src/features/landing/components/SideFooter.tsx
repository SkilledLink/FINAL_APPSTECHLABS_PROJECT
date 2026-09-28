// src/features/landing/components/SiteFooter.tsx

import React from "react";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Logo from "../../../assets/images/Logo.png";

const SideFooter: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);

    if (section) {
      const navbarHeight = 76;

      const sectionTop =
        section.getBoundingClientRect().top +
        window.scrollY -
        navbarHeight;

      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });
    }
  };

  const handleSectionNavigation = (id: string) => {
    if (window.location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }

    scrollToSection(id);
  };

  const handleHome = () => {
    if (window.location.pathname !== "/") {
      navigate("/");
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCreateProfile = () => {
    navigate("/onboarding");
  };

  const handleFindProfessional = () => {
    navigate("/home/professionals");
  };

  return (
    <footer className="bg-[#06142e] px-6 pb-8 pt-14 text-slate-300">
      <div className="mx-auto max-w-7xl">

        {/* MAIN FOOTER */}
        <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* BRAND */}
          <div className="lg:pr-8">
            <button
              type="button"
              onClick={handleHome}
              className="inline-flex items-center"
              aria-label="SkilledLink home"
            >
              <img
                src={Logo}
                alt="SkilledLink"
                className="h-12 w-auto object-contain"
              />
            </button>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
              Connecting people with skilled professionals and creating
              opportunities through real work.
            </p>

            {/* SOCIAL ICONS */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
              >
                <FaInstagram className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
              >
                <FaLinkedinIn className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
              >
                <FaTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <button
                  type="button"
                  onClick={handleHome}
                  className="transition-colors hover:text-blue-500"
                >
                  Home
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("trades")}
                  className="transition-colors hover:text-blue-500"
                >
                  Trades
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("professionals")}
                  className="transition-colors hover:text-blue-500"
                >
                  Professionals
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("need-work")}
                  className="transition-colors hover:text-blue-500"
                >
                  Need Work
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("reviews")}
                  className="transition-colors hover:text-blue-500"
                >
                  Testimonials
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("faq")}
                  className="transition-colors hover:text-blue-500"
                >
                  FAQ
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("contact")}
                  className="transition-colors hover:text-blue-500"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* FOR PROFESSIONALS */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              For Professionals
            </h4>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <button
                  type="button"
                  onClick={handleCreateProfile}
                  className="transition-colors hover:text-blue-500"
                >
                  Join SkilledLink
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={handleCreateProfile}
                  className="transition-colors hover:text-blue-500"
                >
                  Create Your Profile
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={handleFindProfessional}
                  className="transition-colors hover:text-blue-500"
                >
                  Get Discovered
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation("contact")}
                  className="transition-colors hover:text-blue-500"
                >
                  Get Help
                </button>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h4>

            <ul className="mt-5 space-y-4 text-sm">

              {/* LOCATION */}
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                <span className="leading-6">
                  Cameroon
                </span>
              </li>

              {/* EMAIL */}
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                <a
                  href="mailto:skilledLink@gmail.com"
                  className="break-all leading-6 transition-colors hover:text-blue-500"
                >
                  skilledLink@gmail.com
                </a>
              </li>

              {/* PHONE */}
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                <a
                  href="tel:+2376970755363"
                  className="leading-6 transition-colors hover:text-blue-500"
                >
                  +237 697 075 5363
                </a>
              </li>
            </ul>

            {/* CONTACT CTA */}
            <button
              type="button"
              onClick={() => handleSectionNavigation("contact")}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Send us a message
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM FOOTER */}
        <div className="flex flex-col items-center justify-between gap-4 pt-7 text-xs text-slate-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} SkilledLink. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="#"
              className="transition-colors hover:text-slate-300"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="transition-colors hover:text-slate-300"
            >
              Terms of Service
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default SideFooter;