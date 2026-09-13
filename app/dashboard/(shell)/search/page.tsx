import { createAdminClient } from "@/app/lib/supabase/admin";
import SearchView from "./SearchView";
import type { SearchClient, SearchProject, SearchTask } from "./types";

export default async function SearchPage() {
  const supabase = createAdminClient();

  const [{ data: clients, error }, { data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("clients").select("id, name, company, email, phone").order("name"),
    supabase.from("client_projects").select("id, name, client:clients(id, name)").order("name"),
    supabase
      .from("tasks")
      .select("id, title, client_id, client_project_id, client:clients(id, name), client_project:client_projects(id, name)")
      .order("title"),
  ]);

  return (
    <SearchView
      clients={(clients as SearchClient[]) ?? []}
      projects={(projects as unknown as SearchProject[]) ?? []}
      tasks={(tasks as unknown as SearchTask[]) ?? []}
      loadError={error?.message}
    />
  );
}
