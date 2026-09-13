import { createAdminClient } from "@/app/lib/supabase/admin";
import { startOfMonthISO } from "@/app/lib/dates";
import { EXPENSE_GROUPS } from "../types";
import BudgetsView from "./BudgetsView";
import type { Budget, BudgetRow } from "./types";

export default async function BudgetsPage() {
  const supabase = createAdminClient();
  const monthStart = startOfMonthISO();

  const [{ data: budgets, error }, { data: expenses }] = await Promise.all([
    supabase.from("budgets").select("*"),
    supabase
      .from("transactions")
      .select("category, amount")
      .eq("type", "expense")
      .gte("occurred_on", monthStart),
  ]);

  const spentByCategory = new Map<string, number>();
  for (const t of expenses ?? []) {
    spentByCategory.set(t.category, (spentByCategory.get(t.category) ?? 0) + t.amount);
  }

  const budgetByCategory = new Map((budgets as Budget[] | null ?? []).map((b) => [b.category, b.monthly_limit]));

  const rows: BudgetRow[] = EXPENSE_GROUPS.map((group) => ({
    category: group.label,
    monthlyLimit: budgetByCategory.get(group.label) ?? null,
    spent: spentByCategory.get(group.label) ?? 0,
  }));

  return <BudgetsView rows={rows} loadError={error?.message} />;
}
