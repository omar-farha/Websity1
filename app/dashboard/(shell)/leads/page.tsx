import { createAdminClient } from "@/app/lib/supabase/admin";
import LeadsView from "./LeadsView";
import type { Lead } from "./types";

export default async function LeadsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return <LeadsView leads={(data as Lead[]) ?? []} loadError={error?.message} />;
}
