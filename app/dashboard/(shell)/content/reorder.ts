"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";

// Shared by every content type's reordering (Portfolio/Services/FAQs/
// Approach) — swaps sort_order with the adjacent item. Simple up/down
// buttons instead of drag-and-drop, since there's no DnD library in this
// project and a handful of rows per content type doesn't need one.
type SortableTable = "projects" | "services" | "faqs" | "approach_steps" | "categories";

export async function swapSortOrder(
  table: SortableTable,
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

  // Two items tied on the same sort_order (e.g. both defaulted to 0)
  // would make this a no-op — force them apart first so the swap always
  // actually changes something.
  const orderA = a.sort_order;
  const orderB = orderA === b.sort_order ? orderA + 1 : b.sort_order;

  await supabase.from(table).update({ sort_order: orderB }).eq("id", a.id);
  await supabase.from(table).update({ sort_order: orderA }).eq("id", b.id);
  return true;
}

// New rows must never be left at the column's default of 0 — with more
// than one row already there, that creates a tie that makes the up/down
// reorder buttons behave unpredictably (ties break by whatever order
// Postgres happens to return, not creation order).
export async function nextSortOrder(table: SortableTable): Promise<number> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const max = data?.[0]?.sort_order;
  return typeof max === "number" ? max + 1 : 0;
}
