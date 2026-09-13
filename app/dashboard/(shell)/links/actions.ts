"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import type { LinkCategory } from "./types";

export type LinkFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function revalidateParents(clientId: string | null, clientProjectId: string | null) {
  if (clientId) revalidatePath(`/dashboard/clients/${clientId}`);
  if (clientProjectId) revalidatePath(`/dashboard/projects/${clientProjectId}`);
}

export async function addLink(
  _prevState: LinkFormState,
  formData: FormData
): Promise<LinkFormState> {
  const label = str(formData.get("label"));
  const url = str(formData.get("url"));
  const category = str(formData.get("category")) as LinkCategory | null;
  if (!label || !url || !category) {
    return { error: "Label, URL, and category are all required." };
  }

  const clientId = str(formData.get("client_id"));
  const clientProjectId = str(formData.get("client_project_id"));
  if (!clientId && !clientProjectId) {
    return { error: "Missing link owner." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("links").insert({
    client_id: clientId,
    client_project_id: clientProjectId,
    category,
    label,
    url,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateParents(clientId, clientProjectId);
}

export async function deleteLink(
  id: string,
  clientId: string | null,
  clientProjectId: string | null
) {
  const supabase = createAdminClient();
  await supabase.from("links").delete().eq("id", id);
  revalidateParents(clientId, clientProjectId);
}
