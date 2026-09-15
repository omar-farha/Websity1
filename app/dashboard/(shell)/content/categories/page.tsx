import { createAdminClient } from "@/app/lib/supabase/admin";
import CategoriesView from "./CategoriesView";
import type { Category } from "./types";

export default async function CategoriesPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return <CategoriesView categories={(data as Category[]) ?? []} loadError={error?.message} />;
}
