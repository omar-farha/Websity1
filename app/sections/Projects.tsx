import { getVisibleProjects } from "@/app/lib/projects";
import ProjectsView from "./ProjectsView";

export default async function Projects() {
  const projects = await getVisibleProjects();
  return <ProjectsView projects={projects} />;
}
