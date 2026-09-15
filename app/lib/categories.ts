import { createClient } from "@/app/lib/supabase/server";

// The set of client categories (Brands, Gym & Sportswear, etc.) is admin-
// managed via the `categories` table (see supabase/migrations/016_categories.sql)
// instead of being a fixed list in code — used by the public projects filter
// and the contact form.
export async function getCategoryNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    if (error) console.warn("Failed to load categories:", error.message);
    return [];
  }

  return data.map((row) => row.name as string);
}
