import { createAdminClient } from "@/app/lib/supabase/admin";
import OverviewView from "./OverviewView";
import type { ClientStatus } from "./clients/types";
import type { AlertProject, AlertTask, LastContact } from "./follow-ups/types";

export type OverviewClient = { id: string; status: ClientStatus; created_at: string };
export type OverviewTransaction = { type: "income" | "expense"; amount: number; occurred_on: string };
export type ActivityEntry = {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_label: string;
  action: string;
  created_at: string;
};

export default async function DashboardOverviewPage() {
  const supabase = createAdminClient();

  const [
    { data: clients, error },
    { data: projects },
    { data: tasks },
    { data: transactions },
    { data: allCommunications },
    { data: activity },
  ] = await Promise.all([
    supabase.from("clients").select("id, status, created_at"),
    supabase
      .from("client_projects")
      .select("id, name, client_id, cost, paid_amount, status, due_date, client:clients(id, name)"),
    supabase
      .from("tasks")
      .select("id, title, due_date, status, priority, client_id, client_project_id, client:clients(id, name)")
      .neq("status", "done")
      .not("due_date", "is", null),
    supabase.from("transactions").select("type, amount, occurred_on"),
    supabase
      .from("communications")
      .select("client_id, contacted_at, client:clients(id, name)")
      .order("contacted_at", { ascending: false }),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(12),
  ]);

  return (
    <OverviewView
      clients={(clients as OverviewClient[]) ?? []}
      projects={(projects as unknown as AlertProject[]) ?? []}
      tasks={(tasks as unknown as AlertTask[]) ?? []}
      transactions={(transactions as OverviewTransaction[]) ?? []}
      allCommunications={(allCommunications as unknown as LastContact[]) ?? []}
      activity={(activity as ActivityEntry[]) ?? []}
      loadError={error?.message}
    />
  );
}
