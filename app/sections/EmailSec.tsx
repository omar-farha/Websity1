"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function EmailSubscription() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.sheetbest.com/sheets/85dbd2db-2740-4424-aead-801f98624b27",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            date: new Date().toISOString().split("T")[0], // Adds current date
          }),
        }
      );

      if (!response.ok) throw new Error("Submission failed");

      setIsSubscribed(true);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-16 md:py-24 ">
      <div className="container px-4 mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Stay Updated
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-gray-600 mb-8 text-lg"
          >
            Subscribe to our newsletter for the latest updates, tips, and
            offers.
          </motion.p>

          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-lg bg-[#0fd8d7] bg-opacity-10 text-[#0fd8d7]"
            >
              <p className="font-medium text-white">
                Thank you for subscribing!
              </p>
              <p className="text-sm mt-1">
                You&apos;ve been added to our list.
              </p>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-5 pr-24 py-4 rounded-lg border border-gray-300 focus:border-[#0fd8d7] focus:ring-2 focus:ring-[#0fd8d7] focus:ring-opacity-50 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-2 rounded-md bg-[#0fd8d7] hover:bg-[#0bc5c4] text-white font-medium transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <span>Subscribe</span>
                    )}
                  </button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-2 text-left"
                  >
                    {error}
                  </motion.p>
                )}
              </form>
            </motion.div>
          )}

          <motion.p
            variants={itemVariants}
            className="text-xs text-gray-400 mt-6"
          >
            We respect your privacy. Unsubscribe at any time.
          </motion.p>
        </motion.div>
      </div>
      <form className="flex border bg-black border-white/15 rounded-full p-2 mt-8 max-w-lg mx-5 md:mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          className="bg-transparent px-4 flex-1 outline-none text-white"
        />
        <button
          type="submit"
          className="border border-[#0fd8d7] bg-[#0fd8d7]  text-neutral-950 h-10 rounded-full px-6 font-medium   items-center whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}
