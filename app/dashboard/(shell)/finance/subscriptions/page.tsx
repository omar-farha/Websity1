import { createAdminClient } from "@/app/lib/supabase/admin";
import SubscriptionsView from "./SubscriptionsView";
import type { SubscriptionWithRelations } from "./types";

export default async function SubscriptionsPage() {
  const supabase = createAdminClient();

  const [{ data: subscriptions, error }, { data: clients }, { data: projects }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*, client:clients(id, name), client_project:client_projects(id, name)")
      .order("next_payment_date", { ascending: true }),
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("client_projects").select("id, name, client_id").order("name"),
  ]);

  return (
    <SubscriptionsView
      subscriptions={(subscriptions as unknown as SubscriptionWithRelations[]) ?? []}
      clients={clients ?? []}
      projects={projects ?? []}
      loadError={error?.message}
    />
  );
}
