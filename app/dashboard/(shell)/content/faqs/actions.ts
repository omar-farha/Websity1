"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { swapSortOrder } from "../reorder";

export type FaqFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function revalidatePublic() {
  revalidatePath("/dashboard/content/faqs");
  revalidatePath("/");
}

export async function saveFaq(
  _prevState: FaqFormState,
  formData: FormData
): Promise<FaqFormState> {
  const question = str(formData.get("question"));
  const answer = str(formData.get("answer"));
  if (!question || !answer) {
    return { error: "Question and answer are both required." };
  }

  const id = str(formData.get("id"));
  const supabase = createAdminClient();

  const payload = {
    question,
    answer,
    is_visible: formData.get("is_visible") === "on",
  };

  const { error } = id
    ? await supabase.from("faqs").update(payload).eq("id", id)
    : await supabase.from("faqs").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePublic();
}

export async function deleteFaq(id: string) {
  const supabase = createAdminClient();
  await supabase.from("faqs").delete().eq("id", id);
  revalidatePublic();
}

export async function toggleFaqVisible(id: string, visible: boolean) {
  const supabase = createAdminClient();
  await supabase.from("faqs").update({ is_visible: visible }).eq("id", id);
  revalidatePublic();
}

export async function reorderFaq(
  items: { id: string; sort_order: number }[],
  id: string,
  direction: "up" | "down"
) {
  const changed = await swapSortOrder("faqs", items, id, direction);
  if (changed) revalidatePublic();
}
