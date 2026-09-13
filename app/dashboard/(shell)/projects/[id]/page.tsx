import { notFound } from "next/navigation";
import { createAdminClient } from "@/app/lib/supabase/admin";
import ProjectDetailView from "./ProjectDetailView";
import type { ClientProjectWithClient } from "../types";
import type { TaskWithRelations } from "../../tasks/types";
import type { Transaction } from "../../finance/types";
import type { Note } from "../../notes/types";
import type { LinkItem } from "../../links/types";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [
    { data: project, error },
    { data: clients },
    { data: projects },
    { data: tasks },
    { data: payments },
    { data: notes },
    { data: links },
  ] = await Promise.all([
    supabase
      .from("client_projects")
      .select("*, client:clients(id, name)")
      .eq("id", id)
      .single(),
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("client_projects").select("id, name, client_id").order("name"),
    supabase
      .from("tasks")
      .select("*, client_project:client_projects(id, name), client:clients(id, name)")
      .eq("client_project_id", id)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("transactions")
      .select("*")
      .eq("client_project_id", id)
      .eq("type", "income")
      .order("occurred_on", { ascending: false }),
    supabase
      .from("notes")
      .select("*")
      .eq("client_project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("links")
      .select("*")
      .eq("client_project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (error || !project) {
    notFound();
  }

  return (
    <ProjectDetailView
      project={project as unknown as ClientProjectWithClient}
      clients={clients ?? []}
      projects={projects ?? []}
      tasks={(tasks as unknown as TaskWithRelations[]) ?? []}
      payments={(payments as Transaction[]) ?? []}
      notes={(notes as Note[]) ?? []}
      links={(links as LinkItem[]) ?? []}
    />
  );
}
