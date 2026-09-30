// src/features/landing/components/FAQSection.tsx

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is SkilledLink?",
    answer:
      "SkilledLink is a platform that connects people who need work done with skilled professionals who are ready to provide their services.",
  },
  {
    question: "How does SkilledLink work?",
    answer:
      "SkilledLink helps you discover professionals based on the type of work you need. You can explore their profiles, see their skills and services, and connect with the right person for your job.",
  },
  {
    question: "How do I find a professional?",
    answer:
      "SkilledLink helps you discover skilled professionals based on the type of work you need. You can explore their profiles, check their skills, reviews and ratings, and connect with the right person for your job.",
  },
  {
    question: "How can I join as a professional?",
    answer:
      "Professionals can create a profile on SkilledLink, showcase their skills and services, and make it easier for customers to discover and contact them.",
  },
  {
    question: "What types of services are available?",
    answer:
      "SkilledLink is designed for different types of skilled work and trades, helping customers discover professionals based on the service they need.",
  },
  {
    question: "How can I contact a professional?",
    answer:
      "Once you find a professional who matches your needs, you can use the available contact options on their profile to get in touch and discuss your work.",
  },
  {
    question: "Is SkilledLink available in Cameroon?",
    answer:
      "SkilledLink is designed to connect customers and skilled professionals in Cameroon, making it easier to discover and connect with people who can get the job done.",
  },
  {
    question: "How can I contact the SkilledLink team?",
    answer:
      "You can contact the SkilledLink team through the Contact section on the landing page. Send us your question or message and the team will get back to you.",
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(2);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative bg-[#f8fafc] px-6 py-16 sm:py-20 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-blue-600 sm:text-xs dark:text-blue-400">
            <span className="h-[2px] w-6 bg-blue-500 sm:w-8" />
            <span>FAQ</span>
            <span className="h-[2px] w-6 bg-blue-500 sm:w-8" />
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#06142e] sm:text-4xl dark:text-white">
            Frequently Asked <span className="text-blue-600 dark:text-blue-400">Questions</span>
          </h2>

          <p className="mt-3 text-sm text-slate-500 sm:text-base dark:text-slate-400">
            Everything you need to know about SkilledLink.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <div className="flex flex-col">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <HelpCircle className="h-3.5 w-3.5" />
              Got Questions?
            </div>

            <h3 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-[#06142e] sm:text-4xl dark:text-white">
              We’re here to <br />
              <span className="text-blue-600 dark:text-blue-400">help you.</span>
            </h3>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
              Find quick answers to the most common questions about SkilledLink.
              If you don’t see your question here, feel free to contact us.
            </p>

            <div className="relative mt-8 h-36 w-48">
              <div className="absolute left-2 top-2 flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 shadow-md sm:h-28 sm:w-28 dark:bg-blue-500">
                <span className="text-5xl font-bold text-white sm:text-6xl">?</span>
                <div className="absolute -bottom-1 left-5 h-5 w-5 rotate-45 bg-blue-600 dark:bg-blue-500" />
              </div>

              <div className="absolute bottom-4 right-2 flex h-20 w-20 items-center justify-center rounded-full bg-blue-200 sm:h-24 sm:w-24 dark:bg-blue-500/30">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-white dark:bg-blue-400" />
                  <span className="h-3 w-3 rounded-full bg-white dark:bg-blue-400" />
                  <span className="h-3 w-3 rounded-full bg-white dark:bg-blue-400" />
                </div>
                <div className="absolute -bottom-1 right-5 h-5 w-5 rotate-45 bg-blue-200 dark:bg-blue-500/30" />
              </div>

              <span className="absolute left-[-8px] top-10 h-1.5 w-5 -rotate-12 rounded-full bg-blue-400" />
              <span className="absolute left-[-4px] top-28 h-1.5 w-4 rotate-12 rounded-full bg-blue-400" />
              <span className="absolute right-14 top-[-4px] h-1.5 w-4 -rotate-45 rounded-full bg-blue-400" />

              <div className="absolute bottom-0 left-6 h-2.5 w-32 rounded-[100%] bg-blue-100 dark:bg-blue-500/15" />
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-xl border bg-white transition-all duration-300 dark:bg-slate-900 ${
                    isOpen
                      ? "border-blue-500 shadow-sm dark:border-blue-400"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <span className="text-base font-semibold text-[#06142e] sm:text-[17px] dark:text-white">
                      {faq.question}
                    </span>

                    <span className="shrink-0 text-xl font-medium text-blue-600 dark:text-blue-400">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-100 px-5 pb-4 pt-3 sm:px-6 dark:border-slate-800">
                        <p className="text-sm leading-6 text-slate-500 sm:text-[15px] dark:text-slate-400">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;