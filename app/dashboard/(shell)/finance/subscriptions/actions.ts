"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import type { SubscriptionInterval, SubscriptionStatus } from "./types";

export type SubscriptionFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function num(value: FormDataEntryValue | null): number | null {
  const s = str(value);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function revalidateAll() {
  revalidatePath("/dashboard/finance/subscriptions");
  revalidatePath("/dashboard/finance");
}

export async function saveSubscription(
  _prevState: SubscriptionFormState,
  formData: FormData
): Promise<SubscriptionFormState> {
  const name = str(formData.get("name"));
  const category = str(formData.get("category"));
  const cost = num(formData.get("cost"));
  const interval = str(formData.get("interval")) as SubscriptionInterval | null;
  const nextPaymentDate = str(formData.get("next_payment_date"));

  if (!name) return { error: "Name is required." };
  if (!category) return { error: "Choose a category." };
  if (!cost || cost <= 0) return { error: "Enter a valid cost." };
  if (!interval) return { error: "Choose monthly or yearly." };
  if (!nextPaymentDate) return { error: "Choose the next payment date." };

  const id = str(formData.get("id"));
  const supabase = createAdminClient();

  const payload = {
    name,
    category,
    subcategory: str(formData.get("subcategory")),
    vendor: str(formData.get("vendor")),
    cost,
    interval,
    payment_method: str(formData.get("payment_method")),
    start_date: str(formData.get("start_date")) ?? new Date().toISOString().slice(0, 10),
    next_payment_date: nextPaymentDate,
    status: (str(formData.get("status")) ?? "active") as SubscriptionStatus,
    notes: str(formData.get("notes")),
    client_id: str(formData.get("client_id")),
    client_project_id: str(formData.get("client_project_id")),
  };

  const { error } = id
    ? await supabase.from("subscriptions").update(payload).eq("id", id)
    : await supabase.from("subscriptions").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidateAll();
}

export async function setSubscriptionStatus(id: string, status: SubscriptionStatus) {
  const supabase = createAdminClient();
  await supabase.from("subscriptions").update({ status }).eq("id", id);
  revalidateAll();
}

export async function deleteSubscription(id: string) {
  const supabase = createAdminClient();
  await supabase.from("subscriptions").delete().eq("id", id);
  revalidateAll();
}
