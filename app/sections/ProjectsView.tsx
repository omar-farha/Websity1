"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/app/lib/projects";
import { Spotlight } from "@/app/components/Spotlight";

function trackSpotlight(e: MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "60%" : "-60%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-60%" : "60%",
    opacity: 0,
  }),
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const filterContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const filterItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AUTOPLAY_MS = 2000;

export default function ProjectsView({
  projects,
  categories: categoryNames,
}: {
  projects: Project[];
  categories: string[];
}) {
  const categories = ["All", ...categoryNames];
  const [active, setActive] = useState("All");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const filtered =
    active === "All"
      ? projects
      : projects.filter((project) =>
          project.tags.some((tag) => tag.trim().toLowerCase() === active.toLowerCase())
        );

  useEffect(() => {
    setIndex(0);
  }, [active]);

  const current = filtered[index];

  function goTo(next: number) {
    if (filtered.length === 0) return;
    setDirection(next > index ? 1 : -1);
    setIndex(((next % filtered.length) + filtered.length) % filtered.length);
  }

  function goPrev() {
    setDirection(-1);
    setIndex((i) => (i - 1 + filtered.length) % filtered.length);
  }

  function goNext() {
    setDirection(1);
    setIndex((i) => (i + 1) % filtered.length);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    setIsDragging(false);
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
  }

  // Auto-advance every couple of seconds; pauses on hover/drag and resets
  // its countdown whenever the slide changes (manually or automatically),
  // so a manual flip doesn't get instantly overridden.
  useEffect(() => {
    if (filtered.length <= 1 || isHovering || isDragging) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % filtered.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [filtered.length, isHovering, isDragging, index]);

  return (
    <section className="relative py-16 md:py-24" id="projects">
      <div className="container px-4 mx-auto">
        <motion.div
          className="services_titles"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Our Recent Projects
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-400">
            Real work for brands, public figures, clinics, and companies —
            browse by category to see what we&apos;ve built.
          </p>
        </motion.div>

        {categories.length > 1 && (
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={filterContainerVariants}
          >
            {categories.map((category) => {
              const isActive = active === category;
              return (
                <motion.button
                  key={category}
                  variants={filterItemVariants}
                  onClick={() => setActive(category)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className={`relative rounded-full px-5 py-2 text-sm font-medium border transition-colors cursor-pointer ${
                    isActive
                      ? "text-neutral-950 border-transparent"
                      : "text-white/70 border-white/10 hover:text-white hover:border-white/25"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="projects-active-pill"
                      className="absolute inset-0 bg-[#0fd8d7] rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {current && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div
              onMouseMove={trackSpotlight}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="group relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-black"
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={current.slug}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 32 },
                    opacity: { duration: 0.2 },
                  }}
                  drag={filtered.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                  <Image
                    src={current.image_url}
                    alt={current.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 896px, 100vw"
                    className="object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <motion.div
                    key={`shine-${current.slug}`}
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                    initial={{ x: "-150%" }}
                    animate={{ x: "500%" }}
                    transition={{ duration: 1.6, delay: 0.3, ease: "easeInOut" }}
                  />
                </motion.div>
              </AnimatePresence>

              <Spotlight />

              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous project"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 text-white hover:bg-black/70 hover:scale-110 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next project"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 text-white hover:bg-black/70 hover:scale-110 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <span className="absolute top-4 left-4 z-20 text-xs font-medium text-white/70 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
                {index + 1} / {filtered.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
              >
                <div>
                  <h3 className="text-white text-xl md:text-2xl font-semibold leading-snug">
                    {current.title}
                  </h3>
                  <p className="mt-1.5 text-white/50 text-sm md:text-base max-w-lg">
                    {current.tagline}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {current.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-white/60 bg-white/10 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/projects/${current.slug}`}
                  className="shrink-0 group/cta inline-flex items-center gap-2 rounded-full bg-[#0fd8d7] hover:bg-[#0bc5c4] text-neutral-950 font-semibold h-11 px-5 transition-colors"
                >
                  View case study
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                </Link>
              </motion.div>
            </AnimatePresence>

            {filtered.length > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {filtered.map((project, i) => (
                  <button
                    key={project.slug}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to ${project.title}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === index ? "w-6 bg-[#0fd8d7]" : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="text-center text-white/50 mt-16">
            No projects in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
