import { createAdminClient } from "@/app/lib/supabase/admin";
import PortfolioView from "./PortfolioView";
import type { PortfolioProject } from "./types";

export default async function PortfolioPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  return <PortfolioView projects={(data as PortfolioProject[]) ?? []} loadError={error?.message} />;
}
