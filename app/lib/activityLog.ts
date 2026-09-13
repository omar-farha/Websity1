import { createAdminClient } from "@/app/lib/supabase/admin";

export type EntityType = "client" | "client_project" | "task" | "transaction";

export async function logActivity(
  entityType: EntityType,
  entityId: string,
  entityLabel: string,
  action: string
) {
  const supabase = createAdminClient();
  await supabase.from("activity_log").insert({
    entity_type: entityType,
    entity_id: entityId,
    entity_label: entityLabel,
    action,
  });
}
