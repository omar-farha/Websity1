"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logActivity } from "@/app/lib/activityLog";
import type { ProjectStatus } from "./types";
import type { WebsiteType } from "../clients/types";

export type ProjectFormState = { error?: string } | undefined;

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

export async function saveProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const name = str(formData.get("name"));
  const clientId = str(formData.get("client_id"));

  if (!name) {
    return { error: "Project name is required." };
  }
  if (!clientId) {
    return { error: "Choose a client." };
  }

  const id = str(formData.get("id"));
  const supabase = createAdminClient();
  const status = (str(formData.get("status")) ?? "planning") as ProjectStatus;

  // Fetch the current status before overwriting it, so the auto-payment
  // below only fires on the transition INTO "completed", not on every
  // subsequent edit of an already-completed project.
  let previousStatus: ProjectStatus | null = null;
  if (id) {
    const { data: existing } = await supabase
      .from("client_projects")
      .select("status")
      .eq("id", id)
      .single();
    previousStatus = (existing?.status as ProjectStatus) ?? null;
  }

  const payload = {
    name,
    client_id: clientId,
    website_type: str(formData.get("website_type")) as WebsiteType | null,
    status,
    start_date: str(formData.get("start_date")),
    due_date: str(formData.get("due_date")),
    end_date: str(formData.get("end_date")),
    cost: num(formData.get("cost")),
    // paid_amount is intentionally not set here — it only ever changes via
    // recordPayment/updateClientPayment/deleteClientPayment below, so it
    // can never drift out of sync with the transactions ledger.
    live_url: str(formData.get("live_url")),
    github_url: str(formData.get("github_url")),
    figma_url: str(formData.get("figma_url")),
    description: str(formData.get("description")),
    notes: str(formData.get("notes")),
  };

  const { data: saved, error } = id
    ? await supabase
        .from("client_projects")
        .update(payload)
        .eq("id", id)
        .select("id, cost, paid_amount")
        .single()
    : await supabase
        .from("client_projects")
        .insert(payload)
        .select("id, cost, paid_amount")
        .single();

  if (error) {
    return { error: error.message };
  }

  // Marking a project Completed implies it's fully paid — automatically
  // record whatever's still outstanding as a final payment, through the
  // same atomic record_payment() used everywhere else, so this can never
  // double-count money already recorded via "Record payment". Covers both
  // editing an existing project into Completed, AND creating a brand new
  // one that's already Completed from the start (e.g. logging past work).
  const justCompleted = status === "completed" && (!id || previousStatus !== "completed");
  if (justCompleted && saved.cost !== null) {
    const remaining = saved.cost - saved.paid_amount;
    if (remaining > 0) {
      await supabase.rpc("record_payment", {
        p_client_project_id: saved.id,
        p_amount: remaining,
        p_occurred_on: new Date().toISOString().slice(0, 10),
        p_payment_method: null,
        p_description: "Final payment — recorded automatically on completion",
      });
    }
  }

  await logActivity(
    "client_project",
    saved.id,
    name,
    id ? "Project updated" : "Project created"
  );

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/finance");
  revalidatePath(`/dashboard/projects/${saved.id}`);
}

export async function deleteProject(id: string, clientId: string) {
  const supabase = createAdminClient();
  await supabase.from("client_projects").delete().eq("id", id);
  await logActivity("client_project", id, id, "Project deleted");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect("/dashboard/projects");
}

export type PaymentFormState = { error?: string } | undefined;

// The only three places paid_amount ever changes — each goes through the
// matching Postgres function (see supabase/migrations/006_record_payment.sql)
// so the project's paid_amount and the transactions ledger can never drift
// apart or record the same payment twice.

export async function recordPayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const clientProjectId = str(formData.get("client_project_id"));
  const amount = num(formData.get("amount"));
  const occurredOn = str(formData.get("occurred_on"));

  if (!clientProjectId) return { error: "Missing project." };
  if (!amount || amount <= 0) return { error: "Enter a valid amount." };
  if (!occurredOn) return { error: "Choose a date." };

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("record_payment", {
    p_client_project_id: clientProjectId,
    p_amount: amount,
    p_occurred_on: occurredOn,
    p_payment_method: str(formData.get("payment_method")),
    p_description: str(formData.get("description")),
  });

  if (error) {
    return { error: error.message };
  }

  await logActivity("client_project", clientProjectId, clientProjectId, "Payment recorded");
  revalidatePath(`/dashboard/projects/${clientProjectId}`);
  revalidatePath("/dashboard/finance");
}

export async function updateClientPayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const transactionId = str(formData.get("transaction_id"));
  const clientProjectId = str(formData.get("client_project_id"));
  const amount = num(formData.get("amount"));
  const occurredOn = str(formData.get("occurred_on"));

  if (!transactionId) return { error: "Missing payment." };
  if (!amount || amount <= 0) return { error: "Enter a valid amount." };
  if (!occurredOn) return { error: "Choose a date." };

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("update_payment", {
    p_transaction_id: transactionId,
    p_amount: amount,
    p_occurred_on: occurredOn,
    p_payment_method: str(formData.get("payment_method")),
    p_description: str(formData.get("description")),
  });

  if (error) {
    return { error: error.message };
  }

  await logActivity("client_project", clientProjectId ?? transactionId, transactionId, "Payment updated");
  if (clientProjectId) revalidatePath(`/dashboard/projects/${clientProjectId}`);
  revalidatePath("/dashboard/finance");
}

export async function deleteClientPayment(transactionId: string, clientProjectId: string) {
  const supabase = createAdminClient();
  await supabase.rpc("delete_payment", { p_transaction_id: transactionId });
  await logActivity("client_project", clientProjectId, transactionId, "Payment deleted");
  revalidatePath(`/dashboard/projects/${clientProjectId}`);
  revalidatePath("/dashboard/finance");
}
