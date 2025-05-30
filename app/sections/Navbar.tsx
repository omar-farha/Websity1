"use client";
import Image from "next/image";
import logo from "@/app/assets/images/weblogo.png";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
const navLinks = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "FAQs", href: "#faqs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <section className="py-4 lg:py-8 fixed w-full  top-0 z-50 ">
        <div className="container sm:max-w-7xl md:max-w-4xl lg:max-w-5xl mx-auto md:px-8 px-6">
          <div className="border border-white/15 rounded-[27px] md:rounded-[37px] lg:rounded-full bg-neutral-950/70 backdrop-blur-xs">
            <div className="grid grid-cols-2 lg:grid-cols-3  p-2 px-4 md:pr-2 items-center ">
              <div>
                <Image
                  src={logo}
                  alt="logo"
                  className="h-10 md:h-15 w-auto"
                  priority
                />
              </div>
              <div className="lg:flex justify-center items-center hidden">
                <nav className="flex gap-6 font-medium  text-white">
                  {navLinks.map((link) => (
                    <a
                      href={link.href}
                      key={link.label}
                      className="hover:text-[#0fd8d7] transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex justify-end items-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-menu lg:hidden cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <line
                    x1="3"
                    y1="6"
                    x2="21"
                    y2="6"
                    className={twMerge(
                      " origin-left transition",
                      isOpen && " rotate-45 -translate-y-1"
                    )}
                  />
                  <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                    className={twMerge(" transition", isOpen && " opacity-0")}
                  />
                  <line
                    x1="3"
                    y1="18"
                    x2="21"
                    y2="18"
                    className={twMerge(
                      " origin-left transition",
                      isOpen && " -rotate-45 translate-y-1"
                    )}
                  />
                </svg>
                {/* <button className="border border-white h-12 rounded-full px-6 font-medium hidden md:inline-flex items-center">
                Log In
              </button> */}
                <button className="border border-[#0fd8d7] bg-[#0fd8d7] text-neutral-950 h-12 rounded-full px-6 font-medium hidden md:inline-flex items-center hover:bg-[#0fd8d7]/90 transition-colors cursor-pointer">
                  Get In Touch
                </button>
              </div>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className=" overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-4 py-4">
                    {navLinks.map((link) => (
                      <a href={link.href} key={link.label} className="">
                        {link.label}
                      </a>
                    ))}
                    <button className="border border-[#0fd8d7] bg-[#0fd8d7] text-neutral-950 h-10 rounded-full px-6 font-medium items-center">
                      Get In Touch
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
      <div className="pb-[86px] md:pb-[98px] lg:pb-[150px]"></div>
    </>
  );
}
