import { createAdminClient } from "@/app/lib/supabase/admin";
import FinanceView from "./FinanceView";
import { monthlyEquivalent } from "./subscriptions/types";
import type { TransactionWithRelations } from "./types";

export default async function FinancePage() {
  const supabase = createAdminClient();

  const [
    { data: transactions, error },
    { data: clients },
    { data: projects },
    { data: projectFinancials },
    { data: activeSubscriptions },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, client:clients(id, name), client_project:client_projects(id, name)")
      .order("occurred_on", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("client_projects").select("id, name, client_id").order("name"),
    supabase.from("client_projects").select("cost, paid_amount"),
    supabase.from("subscriptions").select("cost, interval").eq("status", "active"),
  ]);

  const outstanding = (projectFinancials ?? []).reduce((sum, p) => {
    if (p.cost === null) return sum;
    const remaining = p.cost - p.paid_amount;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  const monthlyCommitted = (activeSubscriptions ?? []).reduce(
    (sum, s) => sum + monthlyEquivalent(s),
    0
  );

  return (
    <FinanceView
      transactions={(transactions as unknown as TransactionWithRelations[]) ?? []}
      clients={clients ?? []}
      projects={projects ?? []}
      outstanding={outstanding}
      monthlyCommitted={monthlyCommitted}
      loadError={error?.message}
    />
  );
}
