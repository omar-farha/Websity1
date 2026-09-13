"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Clapperboard,
  HeartPulse,
  Sparkles,
  Star,
} from "lucide-react";
import Ballpit from "../components/Ballpit";
import { TiltCard } from "../components/TiltCard";
import type { Project } from "@/app/lib/projects";

const AUDIENCES = ["Brands", "Celebrities", "Clinics", "Companies", "Systems"];

const CATEGORIES = [
  { label: "Brands & Products", icon: Sparkles },
  { label: "Celebrities & Public Figures", icon: Clapperboard },
  { label: "Clinics & Healthcare", icon: HeartPulse },
  { label: "Companies & Systems", icon: Building2 },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function RotatingAudience() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % AUDIENCES.length),
      2200
    );
    return () => clearInterval(id);
  }, []);

  return (
    <motion.span
      layout
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      className="relative inline-flex h-[1.15em] overflow-hidden align-bottom whitespace-nowrap"
    >
      {/* The box's width tracks the current word exactly (no leftover gap
          for short words) and animates smoothly to its new width whenever
          the word changes, so the rest of the line eases into place
          instead of jumping. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={AUDIENCES[index]}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block whitespace-nowrap text-[#0fd8d7]"
        >
          {AUDIENCES[index]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

function ShowcaseStack({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.label}
            variants={itemVariants}
            animate={{ y: [0, -8, 0] }}
            transition={{
              y: {
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              },
            }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 flex flex-col gap-3 hover:border-[#0fd8d7]/40 transition-colors"
          >
            <cat.icon className="w-6 h-6 text-[#0fd8d7]" />
            <p className="text-sm font-medium text-white/80 leading-snug">
              {cat.label}
            </p>
          </motion.div>
        ))}
      </div>
    );
  }

  const featured = projects[0];
  const rest = projects.slice(1, 3);

  return (
    <div className="relative w-full max-w-sm">
      {/* Ambient glow pulsing behind the stack */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] blur-3xl"
        style={{ background: "radial-gradient(circle, #0fd8d780 0%, transparent 70%)" }}
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex flex-col gap-4">
        <motion.div
          variants={itemVariants}
          animate={{ y: [0, -8, 0] }}
          transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        >
          <TiltCard
            maxTilt={7}
            className="relative rounded-2xl border border-white/10 bg-neutral-900 shadow-xl shadow-black/30 overflow-hidden"
          >
            <div className="relative w-full aspect-[4/3] bg-black">
              <Image
                src={featured.image_url}
                alt={featured.title}
                fill
                className="object-cover"
                sizes="384px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              {/* Shine sweep */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
                initial={{ x: "-150%" }}
                animate={{ x: "350%" }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
            </div>
            <div className="absolute bottom-0 inset-x-0 p-4">
              <p className="text-white text-sm font-semibold leading-snug truncate">
                {featured.title}
              </p>
              <p className="text-white/60 text-xs mt-0.5 truncate">
                {featured.tagline}
              </p>
            </div>
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-white bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live
            </span>
          </TiltCard>
        </motion.div>

        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {rest.map((project, i) => (
              <motion.div
                key={project.slug}
                variants={itemVariants}
                animate={{ y: [0, -7, 0] }}
                transition={{
                  y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 + i * 0.5 },
                }}
              >
                <TiltCard
                  maxTilt={8}
                  className="relative rounded-xl border border-white/10 bg-neutral-900 shadow-lg shadow-black/20 overflow-hidden"
                >
                  <div className="relative w-full aspect-square bg-black">
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-white text-xs font-semibold leading-snug truncate">
                      {project.title}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeroView({ projects }: { projects: Project[] }) {
  return (
    <section className="relative overflow-hidden bg-neutral-950 pb-16 pt-8 md:pb-20 lg:h-[calc(100vh-150px)] lg:py-4 lg:flex lg:flex-col lg:items-center">
      {/* Ambient background layer */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #0fd8d7 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff22 1px, transparent 1px), linear-gradient(to bottom, #ffffff22 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 opacity-60">
          <Ballpit
            count={70}
            gravity={0.2}
            friction={1}
            wallBounce={0.5}
            followCursor={true}
            colors={[
              "#0fd8d7",
              "#0fcac8",
              "#0fe4e1",
              "#0f9fa5",
              "#ffffff",
              "#1b1b1f",
            ]}
            maxVelocity={1.1}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/60 to-neutral-950/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950 to-transparent" />
      </div>

      <div className="w-full lg:flex-1 lg:flex lg:items-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto px-6 md:px-8 relative w-full"
      >
        <div className="grid lg:grid-cols-[1fr_24rem] gap-14 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 text-xs md:text-sm font-medium text-white/80"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0fd8d7] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0fd8d7]" />
              </span>
              Web Design &amp; Development Studio
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-[3.1rem] font-medium leading-[1.1] tracking-tight text-white"
            >
              Unforgettable websites{" "}
              <span className="whitespace-nowrap">
                for <RotatingAudience />
              </span>{" "}
              that turn visitors into clients.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-3 text-base md:text-lg text-white/60 leading-relaxed max-w-xl"
            >
              From public figures to clinics and growing companies — we
              design and build websites made to convert.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-5 flex flex-wrap items-center gap-4"
            >
              <Link
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-[#0fd8d7] hover:bg-[#0bc5c4] text-neutral-950 font-semibold h-12 pl-6 pr-5 transition-colors"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 hover:border-white/30 text-white font-medium h-12 px-6 transition-colors"
              >
                See Our Work
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2.5"
            >
              <div className="flex items-center gap-1.5 pr-3 border-r border-white/10">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-[#0fd8d7] text-[#0fd8d7]"
                  />
                ))}
                <span className="ml-1.5 text-sm text-white/60 whitespace-nowrap">
                  25+ clients
                </span>
              </div>
              {CATEGORIES.map((cat) => (
                <span
                  key={cat.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70"
                >
                  <cat.icon className="w-3.5 h-3.5 text-[#0fd8d7]" />
                  {cat.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: showcase */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center lg:justify-start"
          >
            <ShowcaseStack projects={projects} />
          </motion.div>
        </div>
      </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="hidden lg:flex flex-col items-center gap-1.5 text-white/40 mt-6 lg:flex-shrink-0"
      >
        <span className="text-xs uppercase tracking-widest">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
