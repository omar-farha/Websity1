"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { nextSortOrder, swapSortOrder } from "../reorder";

export type ApproachFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function lines(value: FormDataEntryValue | null): string[] {
  const s = str(value);
  if (!s) return [];
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function revalidatePublic() {
  revalidatePath("/dashboard/content/approach");
  revalidatePath("/");
}

export async function saveApproachStep(
  _prevState: ApproachFormState,
  formData: FormData
): Promise<ApproachFormState> {
  const title = str(formData.get("title"));
  const icon = str(formData.get("icon"));
  if (!title || !icon) {
    return { error: "Title and icon are both required." };
  }

  const id = str(formData.get("id"));
  const supabase = createAdminClient();

  const payload = {
    title,
    company_name: str(formData.get("company_name")) ?? "",
    icon,
    icon_bg: str(formData.get("icon_bg")) ?? "#0fd8d7",
    date_label: str(formData.get("date_label")) ?? "Stage",
    points: lines(formData.get("points")),
    is_visible: formData.get("is_visible") === "on",
  };

  const { error } = id
    ? await supabase.from("approach_steps").update(payload).eq("id", id)
    : await supabase.from("approach_steps").insert({ ...payload, sort_order: await nextSortOrder("approach_steps") });

  if (error) {
    return { error: error.message };
  }

  revalidatePublic();
}

export async function deleteApproachStep(id: string) {
  const supabase = createAdminClient();
  await supabase.from("approach_steps").delete().eq("id", id);
  revalidatePublic();
}

export async function toggleApproachVisible(id: string, visible: boolean) {
  const supabase = createAdminClient();
  await supabase.from("approach_steps").update({ is_visible: visible }).eq("id", id);
  revalidatePublic();
}

export async function reorderApproach(
  items: { id: string; sort_order: number }[],
  id: string,
  direction: "up" | "down"
) {
  const changed = await swapSortOrder("approach_steps", items, id, direction);
  if (changed) revalidatePublic();
}
