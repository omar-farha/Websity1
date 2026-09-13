import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllVisibleSlugs, getProjectBySlug, getVisibleProjects } from "@/app/lib/projects";
import ProjectDetailView from "./ProjectDetailView";

export async function generateStaticParams() {
  const slugs = await getAllVisibleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Websity`,
    description: project.tagline,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = await getVisibleProjects();
  const index = allProjects.findIndex((p) => p.slug === slug);
  const previous =
    index === -1 ? project : allProjects[(index - 1 + allProjects.length) % allProjects.length];
  const next = index === -1 ? project : allProjects[(index + 1) % allProjects.length];

  return <ProjectDetailView project={project} previous={previous} next={next} />;
}
