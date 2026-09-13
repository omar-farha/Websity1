import { getVisibleProjects } from "@/app/lib/projects";
import HeroView from "./HeroView";

export default async function Hero() {
  const projects = await getVisibleProjects();
  return <HeroView projects={projects.slice(0, 3)} />;
}
