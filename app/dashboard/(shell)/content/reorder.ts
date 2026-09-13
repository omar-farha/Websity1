"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";

// Shared by every content type's reordering (Portfolio/Services/FAQs/
// Approach) — swaps sort_order with the adjacent item. Simple up/down
// buttons instead of drag-and-drop, since there's no DnD library in this
// project and a handful of rows per content type doesn't need one.
export async function swapSortOrder(
  table: "projects" | "services" | "faqs" | "approach_steps",
  items: { id: string; sort_order: number }[],
  id: string,
  direction: "up" | "down"
): Promise<boolean> {
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((i) => i.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= sorted.length) return false;

  const a = sorted[idx];
  const b = sorted[swapIdx];
  const supabase = createAdminClient();
  await supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id);
  return true;
}
