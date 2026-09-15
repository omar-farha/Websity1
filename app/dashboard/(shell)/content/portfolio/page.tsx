import { createAdminClient } from "@/app/lib/supabase/admin";
import PortfolioView from "./PortfolioView";
import type { PortfolioProject } from "./types";

export default async function PortfolioPage() {
  const supabase = createAdminClient();
  const [{ data, error }, { data: categories }] = await Promise.all([
    supabase.from("projects").select("*").order("sort_order", { ascending: true }),
    supabase.from("categories").select("name").order("sort_order", { ascending: true }),
  ]);

  return (
    <PortfolioView
      projects={(data as PortfolioProject[]) ?? []}
      categories={(categories ?? []).map((c) => c.name as string)}
      loadError={error?.message}
    />
  );
}
