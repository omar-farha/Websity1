"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logActivity } from "@/app/lib/activityLog";
import type { CommunicationType } from "./types";

export type CommunicationFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function logCommunication(
  _prevState: CommunicationFormState,
  formData: FormData
): Promise<CommunicationFormState> {
  const clientId = str(formData.get("client_id"));
  const type = str(formData.get("type")) as CommunicationType | null;
  const contactedAt = str(formData.get("contacted_at"));

  if (!clientId) return { error: "Missing client." };
  if (!type) return { error: "Choose a contact type." };
  if (!contactedAt) return { error: "Choose a date." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("communications").insert({
    client_id: clientId,
    type,
    notes: str(formData.get("notes")),
    contacted_at: contactedAt,
    next_follow_up_date: str(formData.get("next_follow_up_date")),
  });

  if (error) {
    return { error: error.message };
  }

  await logActivity("client", clientId, clientId, "Contact logged");
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/follow-ups");
}

export async function deleteCommunication(id: string, clientId: string) {
  const supabase = createAdminClient();
  await supabase.from("communications").delete().eq("id", id);
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/follow-ups");
}
