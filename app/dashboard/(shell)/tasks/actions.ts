"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logActivity } from "@/app/lib/activityLog";
import type { TaskPriority, TaskStatus } from "./types";

export type TaskFormState = { error?: string } | undefined;

function str(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function revalidateTaskParents(clientId: string | null, projectId: string | null) {
  revalidatePath("/dashboard/tasks");
  if (clientId) revalidatePath(`/dashboard/clients/${clientId}`);
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function saveTask(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const title = str(formData.get("title"));
  if (!title) {
    return { error: "Task title is required." };
  }

  const id = str(formData.get("id"));
  const clientProjectId = str(formData.get("client_project_id"));
  const clientId = str(formData.get("client_id"));
  const supabase = createAdminClient();

  const payload = {
    title,
    description: str(formData.get("description")),
    client_project_id: clientProjectId,
    client_id: clientId,
    status: (str(formData.get("status")) ?? "to_do") as TaskStatus,
    priority: (str(formData.get("priority")) ?? "medium") as TaskPriority,
    due_date: str(formData.get("due_date")),
  };

  const { error } = id
    ? await supabase.from("tasks").update(payload).eq("id", id)
    : await supabase.from("tasks").insert(payload);

  if (error) {
    return { error: error.message };
  }

  await logActivity("task", id ?? title, title, id ? "Task updated" : "Task added");
  revalidateTaskParents(clientId, clientProjectId);
}

export async function setTaskStatus(
  id: string,
  status: TaskStatus,
  clientId: string | null,
  clientProjectId: string | null
) {
  const supabase = createAdminClient();
  await supabase.from("tasks").update({ status }).eq("id", id);
  await logActivity("task", id, id, `Task marked ${status.replace("_", " ")}`);
  revalidateTaskParents(clientId, clientProjectId);
}

export async function deleteTask(
  id: string,
  clientId: string | null,
  clientProjectId: string | null
) {
  const supabase = createAdminClient();
  await supabase.from("tasks").delete().eq("id", id);
  await logActivity("task", id, id, "Task deleted");
  revalidateTaskParents(clientId, clientProjectId);
}
