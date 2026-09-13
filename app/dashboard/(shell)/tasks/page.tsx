import { createAdminClient } from "@/app/lib/supabase/admin";
import TasksView from "./TasksView";
import type { TaskWithRelations } from "./types";

export default async function TasksPage() {
  const supabase = createAdminClient();

  const [{ data: tasks, error }, { data: clients }, { data: projects }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*, client_project:client_projects(id, name), client:clients(id, name)")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("clients").select("id, name").order("name"),
      supabase.from("client_projects").select("id, name, client_id").order("name"),
    ]);

  return (
    <TasksView
      tasks={(tasks as unknown as TaskWithRelations[]) ?? []}
      clients={clients ?? []}
      projects={projects ?? []}
      loadError={error?.message}
    />
  );
}
