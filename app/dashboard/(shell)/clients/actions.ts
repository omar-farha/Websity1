"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logActivity } from "@/app/lib/activityLog";
import type { ClientStatus, WebsiteType } from "./types";

export type ClientFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function saveClient(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const name = str(formData.get("name"));
  if (!name) {
    return { error: "Name is required." };
  }

  const id = str(formData.get("id"));
  const supabase = createAdminClient();
  const status = (str(formData.get("status")) ?? "lead") as ClientStatus;

  const payload = {
    name,
    email: str(formData.get("email")),
    phone: str(formData.get("phone")),
    company: str(formData.get("company")),
    notes: str(formData.get("notes")),
    status,
    start_date: str(formData.get("start_date")) ?? new Date().toISOString().slice(0, 10),
    end_date: status === "completed" ? str(formData.get("end_date")) : null,
    website_type: str(formData.get("website_type")) as WebsiteType | null,
  };

  const { error } = id
    ? await supabase.from("clients").update(payload).eq("id", id)
    : await supabase.from("clients").insert(payload);

  if (error) {
    return { error: error.message };
  }

  await logActivity("client", id ?? name, name, id ? "Client updated" : "Client added");

  revalidatePath("/dashboard/clients");
  if (id) revalidatePath(`/dashboard/clients/${id}`);
}

export async function deleteClient(id: string) {
  const supabase = createAdminClient();
  await supabase.from("clients").delete().eq("id", id);
  await logActivity("client", id, id, "Client deleted");
  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}
