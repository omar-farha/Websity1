import { notFound } from "next/navigation";
import { createAdminClient } from "@/app/lib/supabase/admin";
import ClientDetailView from "./ClientDetailView";
import type { Client } from "../types";
import type { ClientProject } from "../../projects/types";
import type { TaskWithRelations } from "../../tasks/types";
import type { Note } from "../../notes/types";
import type { Communication } from "../../communications/types";
import type { LinkItem } from "../../links/types";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [
    { data: client, error },
    { data: projects },
    { data: allProjects },
    { data: tasks },
    { data: notes },
    { data: communications },
    { data: links },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("client_projects")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("client_projects").select("id, name, client_id").order("name"),
    supabase
      .from("tasks")
      .select("*, client_project:client_projects(id, name), client:clients(id, name)")
      .eq("client_id", id)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("notes")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("communications")
      .select("*")
      .eq("client_id", id)
      .order("contacted_at", { ascending: false }),
    supabase
      .from("links")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (error || !client) {
    notFound();
  }

  return (
    <ClientDetailView
      client={client as Client}
      projects={(projects as ClientProject[]) ?? []}
      allProjects={allProjects ?? []}
      tasks={(tasks as unknown as TaskWithRelations[]) ?? []}
      notes={(notes as Note[]) ?? []}
      communications={(communications as Communication[]) ?? []}
      links={(links as LinkItem[]) ?? []}
    />
  );
}
