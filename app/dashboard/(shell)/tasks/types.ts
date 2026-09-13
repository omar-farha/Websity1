export type TaskStatus = "to_do" | "in_progress" | "review" | "done";

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "to_do", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

export const TASK_STATUS_COLOR: Record<
  TaskStatus,
  "default" | "primary" | "warning" | "success"
> = {
  to_do: "default",
  in_progress: "primary",
  review: "warning",
  done: "success",
};

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const TASK_PRIORITY_COLOR: Record<
  TaskPriority,
  "default" | "info" | "warning" | "error"
> = {
  low: "default",
  medium: "info",
  high: "warning",
  urgent: "error",
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  client_project_id: string | null;
  client_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
};

export type TaskWithRelations = Task & {
  client_project: { id: string; name: string } | null;
  client: { id: string; name: string } | null;
};
