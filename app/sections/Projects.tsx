import { getVisibleProjects } from "@/app/lib/projects";
import { getCategoryNames } from "@/app/lib/categories";
import ProjectsView from "./ProjectsView";

export default async function Projects() {
  const [projects, categories] = await Promise.all([getVisibleProjects(), getCategoryNames()]);
  return <ProjectsView projects={projects} categories={categories} />;
}
