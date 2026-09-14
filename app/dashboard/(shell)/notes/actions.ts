"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logActivity } from "@/app/lib/activityLog";

export type NoteFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function revalidateParents(
  clientId: string | null,
  clientProjectId: string | null,
  leadId: string | null
) {
  if (clientId) revalidatePath(`/dashboard/clients/${clientId}`);
  if (clientProjectId) revalidatePath(`/dashboard/projects/${clientProjectId}`);
  if (leadId) revalidatePath("/dashboard/leads");
}

export async function addNote(
  _prevState: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const body = str(formData.get("body"));
  if (!body) {
    return { error: "Note can't be empty." };
  }

  const clientId = str(formData.get("client_id"));
  const clientProjectId = str(formData.get("client_project_id"));
  const leadId = str(formData.get("lead_id"));
  if (!clientId && !clientProjectId && !leadId) {
    return { error: "Missing note owner." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("notes").insert({
    client_id: clientId,
    client_project_id: clientProjectId,
    lead_id: leadId,
    body,
  });

  if (error) {
    return { error: error.message };
  }

  if (clientId || clientProjectId) {
    await logActivity(
      clientProjectId ? "client_project" : "client",
      (clientProjectId ?? clientId) as string,
      body.length > 40 ? `${body.slice(0, 40)}…` : body,
      "Note added"
    );
  }

  revalidateParents(clientId, clientProjectId, leadId);
}

export async function deleteNote(
  id: string,
  clientId: string | null,
  clientProjectId: string | null,
  leadId: string | null = null
) {
  const supabase = createAdminClient();
  await supabase.from("notes").delete().eq("id", id);
  revalidateParents(clientId, clientProjectId, leadId);
}
