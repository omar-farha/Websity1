import { createAdminClient } from "@/app/lib/supabase/admin";
import ProjectsView from "./ProjectsView";
import type { ClientProjectWithClient } from "./types";

export default async function ProjectsPage() {
  const supabase = createAdminClient();

  const [{ data: projects, error }, { data: clients }] = await Promise.all([
    supabase
      .from("client_projects")
      .select("*, client:clients(id, name)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  return (
    <ProjectsView
      projects={(projects as unknown as ClientProjectWithClient[]) ?? []}
      clients={clients ?? []}
      loadError={error?.message}
    />
  );
}
