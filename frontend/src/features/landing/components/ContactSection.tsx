import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { createContactMessage } from '../../../api/Contact/ContactMessages';
import Container from '../../../components/ui/Container';
import SectionLabel from '../../../components/ui/SectionLabel';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';
import ImageReveal from '../../../components/motion/ImageReveal';

const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      await createContactMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setName('');
      setEmail('');
      setMessage('');
      setStatus('success');
    } catch (error) {
      console.error('Failed to send contact message:', error);
      setStatus('error');
    }
  };

  const fieldClass =
    'w-full border-b border-slate-200 bg-transparent py-3 text-[15px] text-[#06142e] outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2563EB] disabled:opacity-60 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#4F8EFF]';
  const labelClass =
    'block text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400';

  return (
    <section
      id="contact"
      className="relative bg-[#f8fafc] py-24 dark:bg-slate-950 lg:py-32"
    >
      <Container width="wide">
        <Reveal className="mb-16 md:mb-24">
          <SectionLabel>
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB] align-middle dark:bg-[#4F8EFF]" />
            07 / Get in touch
          </SectionLabel>
          <LineReveal
            lines={['Have a question, or', 'need a hand?']}
            className="mt-6 max-w-2xl font-normal leading-[1.05] tracking-[-0.035em] text-[#06142e] dark:text-white text-[clamp(2rem,4.5vw,3.5rem)]"
          />
          <p className="mt-6 max-w-[52ch] text-[16px] leading-8 text-slate-600 dark:text-slate-300">
            Tell us what&apos;s on your mind. We reply as soon as we can —
            usually within a day.
          </p>
        </Reveal>

        <div className="grid gap-16 lg:grid-cols-[1.35fr_1fr] lg:gap-24">
          {/* Form */}
          <Reveal>
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={status === 'sending'}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={status === 'sending'}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message…"
                  disabled={status === 'sending'}
                  className={`${fieldClass} resize-none`}
                />
              </div>

              {status === 'success' && (
                <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                  Your message has been sent successfully.
                </p>
              )}

              {status === 'error' && (
                <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-400">
                  Please fill in all fields and try again.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 pt-2">
                {/* Blue solid submit button — the change */}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#2563EB] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_14px_32px_-10px_rgba(37,99,235,0.75)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#4F8EFF] dark:hover:bg-[#3d7df5]"
                >
                  <span>
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                  </span>
                  {status !== 'sending' && (
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                    >
                      →
                    </span>
                  )}
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            </form>
          </Reveal>

          {/* Side image */}
          <Reveal delay={0.15}>
            <ImageReveal pattern="scale" className="aspect-[4/5] w-full">
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/050/822/031/small/customer-support-concept-young-afro-female-manager-wearing-headset-using-laptop-at-workplace-and-looking-at-camera-free-space-photo.jpg"
                  alt="SkilledLink customer support"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#06142e]/40 to-transparent"
                />
              </div>
            </ImageReveal>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};

export default ContactSection;