import { getVisibleProjects } from "@/app/lib/projects";
import HeroView from "./HeroView";

export default async function Hero() {
  const projects = await getVisibleProjects();

  // Show whatever's marked "Featured" in the dashboard's Portfolio editor;
  // fall back to the first few visible projects if nothing is featured yet,
  // so the showcase is never empty.
  const featured = projects.filter((p) => p.featured);
  const showcase = (featured.length > 0 ? featured : projects).slice(0, 3);

  return <HeroView projects={showcase} />;
}
