"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logActivity } from "@/app/lib/activityLog";
import type { RecurringInterval, TransactionType } from "./types";

export type TransactionFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function revalidateAll() {
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/expenses");
  revalidatePath("/dashboard");
}

export async function saveTransaction(
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const amountStr = str(formData.get("amount"));
  const category = str(formData.get("category"));
  const occurredOn = str(formData.get("occurred_on"));
  const type = str(formData.get("type")) as TransactionType | null;

  const amount = amountStr ? Number(amountStr) : NaN;

  if (!type || (type !== "income" && type !== "expense")) {
    return { error: "Choose income or expense." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount." };
  }
  if (!category) {
    return { error: "Choose a category." };
  }
  if (!occurredOn) {
    return { error: "Choose a date." };
  }

  const isRecurring = formData.get("is_recurring") === "on";

  const id = str(formData.get("id"));
  const supabase = createAdminClient();

  const payload = {
    type,
    amount,
    category,
    subcategory: str(formData.get("subcategory")),
    description: str(formData.get("description")),
    occurred_on: occurredOn,
    client_id: str(formData.get("client_id")),
    client_project_id: str(formData.get("client_project_id")),
    payment_method: str(formData.get("payment_method")),
    vendor: str(formData.get("vendor")),
    is_recurring: isRecurring,
    recurring_interval: isRecurring
      ? (str(formData.get("recurring_interval")) as RecurringInterval | null)
      : null,
  };

  const { error } = id
    ? await supabase.from("transactions").update(payload).eq("id", id)
    : await supabase.from("transactions").insert(payload);

  if (error) {
    return { error: error.message };
  }

  await logActivity(
    "transaction",
    id ?? category,
    `${type === "income" ? "Income" : "Expense"}: ${category}`,
    id ? "Transaction updated" : "Transaction recorded"
  );

  revalidateAll();
}

export async function deleteTransaction(id: string) {
  const supabase = createAdminClient();
  await supabase.from("transactions").delete().eq("id", id);
  await logActivity("transaction", id, id, "Transaction deleted");
  revalidateAll();
}
