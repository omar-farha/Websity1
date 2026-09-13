"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";

export type BudgetFormState = { error?: string } | undefined;

function revalidateAll() {
  revalidatePath("/dashboard/finance/budgets");
  revalidatePath("/dashboard/finance");
}

export async function setBudget(category: string, monthlyLimit: number): Promise<BudgetFormState> {
  if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
    return { error: "Enter a valid amount." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("budgets")
    .upsert({ category, monthly_limit: monthlyLimit }, { onConflict: "category" });

  if (error) {
    return { error: error.message };
  }

  revalidateAll();
}

export async function clearBudget(category: string) {
  const supabase = createAdminClient();
  await supabase.from("budgets").delete().eq("category", category);
  revalidateAll();
}
