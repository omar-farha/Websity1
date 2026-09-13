"use client";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqsView({ faqs }: { faqs: FaqItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 sm:px-16" id="faqs">
      <div className="container px-4 mx-auto">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-medium text-center max-w-xl mx-auto"
          >
            Questions? we&apos;ve got{" "}
            <span className="text-[#0fd8d7]">answers</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-col gap-4 sm:gap-6 max-w-xl mx-auto"
          >
            {faqs.map((faq, faqIndex) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
                className="bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left p-6 cursor-pointer"
                  aria-expanded={selectedIndex === faqIndex}
                  aria-controls={`faq-answer-${faq.id}`}
                  onClick={() =>
                    setSelectedIndex(
                      selectedIndex === faqIndex ? null : faqIndex
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg sm:text-xl">
                      {faq.question}
                    </h3>
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={twMerge(
                        "feather feather-plus text-[#0fd8d7] flex-shrink-0 transition-transform duration-300",
                        selectedIndex === faqIndex && "rotate-45"
                      )}
                      initial={false}
                      animate={{ rotate: selectedIndex === faqIndex ? 45 : 0 }}
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </motion.svg>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {selectedIndex === faqIndex && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.2, delay: 0.1 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.2 },
                          opacity: { duration: 0.1 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6 text-white/50"
                      >
                        {faq.answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
