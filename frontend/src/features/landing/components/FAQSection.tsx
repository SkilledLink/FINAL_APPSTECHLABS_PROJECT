import React, { useState } from 'react';
import SectionLabel from '../../../components/ui/SectionLabel';
import Container from '../../../components/ui/Container';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';

const faqs = [
  {
    question: 'What is SkilledLink?',
    answer:
      'SkilledLink is a platform that connects people who need work done with skilled professionals who are ready to provide their services.',
  },
  {
    question: 'How does SkilledLink work?',
    answer:
      'SkilledLink helps you discover professionals based on the type of work you need. You can explore their profiles, see their skills and services, and connect with the right person for your job.',
  },
  {
    question: 'How do I find a professional?',
    answer:
      'SkilledLink helps you discover skilled professionals based on the type of work you need. You can explore their profiles, check their skills, reviews and ratings, and connect with the right person for your job.',
  },
  {
    question: 'How can I join as a professional?',
    answer:
      'Professionals can create a profile on SkilledLink, showcase their skills and services, and make it easier for customers to discover and contact them.',
  },
  {
    question: 'What types of services are available?',
    answer:
      'SkilledLink is designed for different types of skilled work and trades, helping customers discover professionals based on the service they need.',
  },
  {
    question: 'How can I contact a professional?',
    answer:
      'Once you find a professional who matches your needs, you can use the available contact options on their profile to get in touch and discuss your work.',
  },
  {
    question: 'Is SkilledLink available in Cameroon?',
    answer:
      'SkilledLink is designed to connect customers and skilled professionals in Cameroon, making it easier to discover and connect with people who can get the job done.',
  },
  {
    question: 'How can I contact the SkilledLink team?',
    answer:
      'You can contact the SkilledLink team through the Contact section on the landing page. Send us your question or message and the team will get back to you.',
  },
];

function Item({
  q,
  a,
  index,
}: {
  q: string;
  a: string;
  index: number;
}) {
  const [open, setOpen] = useState(index === 2);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-start justify-between gap-6 py-6 text-left md:py-8"
      >
        <div className="flex items-baseline gap-6 md:gap-10">
          <span className="hidden text-[10px] font-medium tracking-[0.3em] text-[#2563EB] md:block dark:text-[#4F8EFF]">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className="font-normal leading-snug text-[#06142e] dark:text-white text-[19px] md:text-[22px]"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            {q}
          </span>
        </div>

        <span className="relative mt-2 block h-3 w-3 shrink-0">
          <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-[#06142e] dark:bg-white" />
          <span
            className={`absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-[#06142e] transition-transform duration-300 dark:bg-white ${
              open ? 'scale-y-0' : 'scale-y-100'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </span>
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        <div className="min-h-0">
          <p className="max-w-[65ch] pb-8 text-[15px] leading-relaxed text-slate-600 md:pl-[4.25rem] dark:text-slate-300">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

const FAQSection: React.FC = () => {
  return (
    <section
      id="faq"
      className="relative bg-[#f8fafc] py-24 dark:bg-slate-950 lg:py-32"
    >
      <Container width="wide">
        <Reveal className="mb-12 md:mb-20">
          <SectionLabel>06 / Common questions</SectionLabel>
          <LineReveal
            lines={['Things people', 'usually want to know.']}
            className="mt-6 max-w-2xl font-normal leading-[1.1] tracking-[-0.03em] text-[#06142e] dark:text-white text-[clamp(1.75rem,3.4vw,2.75rem)]"
          />
        </Reveal>

        <div className="border-t border-slate-200 dark:border-slate-800">
          {faqs.map((f, i) => (
            <Item key={f.question} q={f.question} a={f.answer} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FAQSection;