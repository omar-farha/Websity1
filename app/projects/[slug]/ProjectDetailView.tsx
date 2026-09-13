"use client";

import { motion } from "framer-motion";
import { Newsreader } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/app/lib/projects";
import { fadeIn, fadeInUp } from "@/app/lib/motionVariants";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
});

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[#f3b653] tracking-wide" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("")}
    </span>
  );
}

export default function ProjectDetailView({
  project,
  previous,
  next,
}: {
  project: Project;
  previous: Project;
  next: Project;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="container max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-[220px_1fr] gap-12 md:gap-16">
        {/* ---------- sidebar: case study metadata ---------- */}
        <motion.aside
          initial="start"
          animate="end"
          variants={fadeIn}
          className="md:sticky md:top-24 md:self-start"
        >
          <Link
            href="/#projects"
            className="text-sm text-white/60 hover:text-[#0fd8d7] transition-colors"
          >
            ← Back to projects
          </Link>

          <dl className="mt-8">
            <dt className="text-[11px] uppercase tracking-wider text-white/40 font-mono">
              Client
            </dt>
            <dd className="mt-1 text-sm">{project.title}</dd>

            <dt className="mt-5 text-[11px] uppercase tracking-wider text-white/40 font-mono">
              Role
            </dt>
            <dd className="mt-1 text-sm">{project.role}</dd>

            <dt className="mt-5 text-[11px] uppercase tracking-wider text-white/40 font-mono">
              Year
            </dt>
            <dd className="mt-1 text-sm">{project.year}</dd>

            <dt className="mt-5 text-[11px] uppercase tracking-wider text-white/40 font-mono">
              Live site
            </dt>
            <dd className="mt-2">
              {project.live_url ? (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#0fd8d7] text-neutral-950 px-3 py-1.5 rounded-full hover:bg-[#0fd8d7]/90 transition-colors"
                >
                  Visit site ↗
                </a>
              ) : (
                <span className="inline-flex items-center text-xs text-white/40 border border-white/15 px-3 py-1.5 rounded-full">
                  Coming soon
                </span>
              )}
            </dd>

            <dt className="mt-5 text-[11px] uppercase tracking-wider text-white/40 font-mono">
              Stack
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] font-mono text-white/60 border border-white/15 px-2 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </dd>
          </dl>
        </motion.aside>

        {/* ---------- main: figure, story, pull-quote ---------- */}
        <div>
          <motion.figure
            initial="start"
            animate="end"
            variants={fadeInUp}
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="mt-3 text-[11px] font-mono text-white/40">
              Fig. 01 — {project.title}, homepage
            </figcaption>
          </motion.figure>

          <motion.h1
            initial="start"
            animate="end"
            variants={fadeInUp}
            className="mt-10 text-3xl md:text-4xl font-bold"
          >
            {project.title}
          </motion.h1>

          <motion.p
            initial="start"
            animate="end"
            variants={fadeInUp}
            className="mt-6 max-w-[64ch] text-white/70 text-base md:text-lg leading-relaxed"
          >
            {project.description}
          </motion.p>

          <motion.blockquote
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUp}
            className="mt-10 max-w-[52ch] border-l-2 border-[#0fd8d7] pl-6"
          >
            <p className={`${newsreader.className} text-xl md:text-2xl leading-snug`}>
              “{project.testimonial.quote}”
            </p>
            <cite className="mt-4 flex items-center gap-2 not-italic text-sm text-white/50">
              {project.testimonial.name} — {project.testimonial.role}
              <Stars rating={project.testimonial.rating} />
            </cite>
          </motion.blockquote>

          <nav className="mt-16 pt-6 border-t border-white/10 flex justify-between text-sm font-mono text-white/50">
            <Link
              href={`/projects/${previous.slug}`}
              className="hover:text-[#0fd8d7] transition-colors"
            >
              ← {previous.title}
            </Link>
            <Link
              href={`/projects/${next.slug}`}
              className="hover:text-[#0fd8d7] transition-colors"
            >
              {next.title} →
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
