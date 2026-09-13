import { createAdminClient } from "@/app/lib/supabase/admin";
import ApproachAdminView from "./ApproachAdminView";
import type { ApproachStep } from "./types";

export default async function ApproachAdminPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("approach_steps")
    .select("*")
    .order("sort_order", { ascending: true });

  return <ApproachAdminView steps={(data as ApproachStep[]) ?? []} loadError={error?.message} />;
}
