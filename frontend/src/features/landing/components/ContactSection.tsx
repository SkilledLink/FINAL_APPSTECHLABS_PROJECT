import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import Reveal from "./Reveal";
import { createContactMessage } from "./../../../../src/api/Contact/ContactMessages";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      await createContactMessage({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });

      setName("");
      setEmail("");
      setMessage("");
      setStatus("sent");
    } catch (error) {
      console.error("Failed to send contact message:", error);
      setStatus("error");
    }
  };

  const resetOnChange = () => {
    if (status === "error" || status === "sent") setStatus("idle");
  };

  return (
    <section id="contact" className="relative py-24 md:py-36">
      <div className="mx-auto grid max-w-[1200px] gap-14 px-5 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:px-10">
        <Reveal>
          <span className="eyebrow">
            <span className="text-accent">07</span> — Contact SkilledLink
          </span>
          <h2 className="mt-6 max-w-[12ch] text-[11vw] font-medium leading-[0.95] tracking-[-0.045em] text-fg sm:text-5xl md:text-[3.75rem]">
            Let&rsquo;s <span className="serif text-fg-3">talk.</span>
          </h2>
          <p className="mt-6 max-w-sm text-[14px] leading-7 text-fg-2">
            Need help finding a trade, joining the network or partnering
            with us? Write to our team. We keep the experience local,
            simple and clear.
          </p>

          <ul className="mt-10 space-y-4 text-[13px] text-fg-2">
            <li>
              <a
                href="mailto:hello@skilledlink.com"
                className="group inline-flex items-center gap-3 transition hover:text-fg"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-soft transition group-hover:border-medium">
                  <Mail size={14} />
                </span>
                hello@skilledlink.com
              </a>
            </li>
            <li>
              <a
                href="tel:+237690000000"
                className="group inline-flex items-center gap-3 transition hover:text-fg"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-soft transition group-hover:border-medium">
                  <Phone size={14} />
                </span>
                +237 690 000 000
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="group inline-flex items-center gap-3 transition hover:text-fg"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-soft transition group-hover:border-medium">
                  <MessageCircle size={14} />
                </span>
                Read FAQs
                <ArrowRight
                  size={13}
                  className="transition-transform duration-500 group-hover:translate-x-1"
                />
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} noValidate className="space-y-9">
            <div className="grid gap-9 sm:grid-cols-2">
              <Field
                id="contact-name"
                label="Your name"
                value={name}
                onChange={(v) => {
                  setName(v);
                  resetOnChange();
                }}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                focused={focused === "name"}
                autoComplete="name"
                required
              />
              <Field
                id="contact-email"
                label="Your email"
                type="email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  resetOnChange();
                }}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                focused={focused === "email"}
                autoComplete="email"
                required
              />
            </div>

            <Field
              id="contact-message"
              label="Your message"
              value={message}
              onChange={(v) => {
                setMessage(v);
                resetOnChange();
              }}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
              focused={focused === "message"}
              multiline
              required
            />

            <div className="flex flex-wrap items-center gap-5">
              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold btn-invert disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? (
                  <>
                    Sending
                    <Loader2 size={14} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-500 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              <AnimatePresence mode="wait">
                {status === "sent" && (
                  <motion.p
                    key="sent"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 text-[12px] font-medium text-emerald-500"
                  >
                    <Check size={14} />
                    Message sent. We&rsquo;ll be in touch soon.
                  </motion.p>
                )}

                {status === "error" && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 text-[12px] font-medium text-red-500"
                  >
                    <AlertCircle size={14} />
                    Please check your information and try again.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  focused: boolean;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
  required?: boolean;
};

function Field({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  focused,
  type = "text",
  multiline = false,
  autoComplete,
  required,
}: FieldProps) {
  const className =
    "w-full bg-transparent pb-3 pt-2 text-[15px] text-fg outline-none placeholder:text-transparent";

  return (
    <div className={`field-line ${focused || value ? "is-focused" : ""}`}>
      <label
        htmlFor={id}
        className={`block text-[10px] uppercase tracking-[0.28em] transition-all duration-300 ${
          focused ? "text-accent translate-x-0.5" : "text-fg-3 translate-x-0"
        }`}
      >
        {label}
      </label>

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={4}
          required={required}
          className={`${className} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete={autoComplete}
          required={required}
          className={className}
        />
      )}
    </div>
  );
}