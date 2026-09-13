import { createAdminClient } from "@/app/lib/supabase/admin";
import FollowUpsView from "./FollowUpsView";
import type { CommunicationWithClient } from "../communications/types";
import type { AlertProject, AlertTask, LastContact } from "./types";

export default async function FollowUpsPage() {
  const supabase = createAdminClient();

  const [
    { data: communications, error },
    { data: projects },
    { data: tasks },
    { data: allCommunications },
  ] = await Promise.all([
    supabase
      .from("communications")
      .select("*, client:clients(id, name)")
      .not("next_follow_up_date", "is", null)
      .order("next_follow_up_date", { ascending: true }),
    supabase
      .from("client_projects")
      .select("id, name, client_id, cost, paid_amount, status, due_date, client:clients(id, name)")
      .not("status", "in", "(completed,cancelled)"),
    supabase
      .from("tasks")
      .select("id, title, due_date, status, priority, client_id, client_project_id, client:clients(id, name)")
      .neq("status", "done")
      .not("due_date", "is", null),
    supabase
      .from("communications")
      .select("client_id, contacted_at, client:clients(id, name)")
      .order("contacted_at", { ascending: false }),
  ]);

  return (
    <FollowUpsView
      communications={(communications as unknown as CommunicationWithClient[]) ?? []}
      projects={(projects as unknown as AlertProject[]) ?? []}
      tasks={(tasks as unknown as AlertTask[]) ?? []}
      allCommunications={(allCommunications as unknown as LastContact[]) ?? []}
      loadError={error?.message}
    />
  );
}
