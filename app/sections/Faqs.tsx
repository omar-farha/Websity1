"use client";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    question: "What is Websity and what services do you offer?",
    answer:
      "Websity is a digital service studio that specializes in website design & development, Shopify store setup and optimization, dashboard management, and ongoing website maintenance and fixes.",
  },
  {
    question: "How long does it take to complete a project?",
    answer:
      "Timelines vary depending on the project scope. Simple websites may take a few days, while more complex dashboards or e-commerce stores can take 1–3 weeks. We always provide a clear timeline before starting.",
  },
  {
    question: "Do you only build websites from scratch?",
    answer:
      "No. In addition to building websites from the ground up, we also enhance, redesign, or troubleshoot existing websites to match your evolving business needs.",
  },
  {
    question: "Can you help me manage my Shopify store?",
    answer:
      "Absolutely! We offer expert Shopify support—from custom theme setup and design tweaks to performance optimization and store management.",
  },
  {
    question: "What does your dashboard management service include?",
    answer:
      "We help you build and manage admin dashboards tailored to your business. This includes managing analytics, orders, users, and content with a clean and intuitive interface.",
  },
  {
    question: "Do you offer support after the project is done?",
    answer:
      "Yes! We offer flexible maintenance plans or one-time support packages to help with updates, troubleshooting, or enhancements after your site goes live.",
  },
];

export default function Faqs() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 sm:px-16">
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
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 cursor-pointer"
                onClick={() =>
                  setSelectedIndex(selectedIndex === faqIndex ? null : faqIndex)
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
              </motion.div>

              <AnimatePresence>
                {selectedIndex === faqIndex && (
                  <motion.div
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
    </section>
  );
}
