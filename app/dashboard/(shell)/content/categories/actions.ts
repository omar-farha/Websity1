"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { swapSortOrder } from "../reorder";

export type CategoryFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function revalidatePublic() {
  revalidatePath("/dashboard/content/categories");
  revalidatePath("/dashboard/content/portfolio");
  revalidatePath("/dashboard/leads");
  revalidatePath("/");
}

export async function saveCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const name = str(formData.get("name"));
  if (!name) {
    return { error: "Name is required." };
  }

  const id = str(formData.get("id"));
  const previousName = str(formData.get("previous_name"));
  const supabase = createAdminClient();

  if (id) {
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) {
      return { error: error.message.includes("duplicate") ? "That category already exists." : error.message };
    }

    // Renaming keeps existing projects/leads pointed at the right category
    // instead of silently orphaning them under the old name.
    if (previousName && previousName !== name) {
      await supabase.from("leads").update({ category: name }).eq("category", previousName);
      const { data: matchingProjects } = await supabase
        .from("projects")
        .select("id, tags")
        .contains("tags", [previousName]);
      for (const project of matchingProjects ?? []) {
        const tags = ((project.tags as string[]) ?? []).map((t) =>
          t === previousName ? name : t
        );
        await supabase.from("projects").update({ tags }).eq("id", project.id);
      }
    }
  } else {
    const { count } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });
    const { error } = await supabase
      .from("categories")
      .insert({ name, sort_order: count ?? 0 });
    if (error) {
      return { error: error.message.includes("duplicate") ? "That category already exists." : error.message };
    }
  }

  revalidatePublic();
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePublic();
}

export async function reorderCategory(
  items: { id: string; sort_order: number }[],
  id: string,
  direction: "up" | "down"
) {
  const changed = await swapSortOrder("categories", items, id, direction);
  if (changed) revalidatePublic();
}
