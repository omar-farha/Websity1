import { createAdminClient } from "@/app/lib/supabase/admin";
import ExpensesView from "./ExpensesView";
import type { TransactionWithRelations } from "../types";
import type { Subscription } from "../subscriptions/types";

export default async function ExpensesPage() {
  const supabase = createAdminClient();

  const [{ data: expenses, error }, { data: clients }, { data: projects }, { data: subscriptions }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("*, client:clients(id, name), client_project:client_projects(id, name)")
        .eq("type", "expense")
        .order("occurred_on", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
      supabase.from("client_projects").select("id, name, client_id").order("name"),
      supabase.from("subscriptions").select("*").eq("status", "active"),
    ]);

  return (
    <ExpensesView
      expenses={(expenses as unknown as TransactionWithRelations[]) ?? []}
      clients={clients ?? []}
      projects={projects ?? []}
      subscriptions={(subscriptions as Subscription[]) ?? []}
      loadError={error?.message}
    />
  );
}
