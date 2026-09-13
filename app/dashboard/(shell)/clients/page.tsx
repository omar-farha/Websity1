import { createAdminClient } from "@/app/lib/supabase/admin";
import ClientsView from "./ClientsView";
import type { Client } from "./types";

export default async function ClientsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return <ClientsView clients={(data as Client[]) ?? []} loadError={error?.message} />;
}
