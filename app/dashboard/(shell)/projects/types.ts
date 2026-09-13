import type { WebsiteType } from "../clients/types";

export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "review"
  | "completed"
  | "on_hold"
  | "cancelled";

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

export const PROJECT_STATUS_COLOR: Record<
  ProjectStatus,
  "default" | "primary" | "success" | "warning" | "error"
> = {
  planning: "default",
  in_progress: "primary",
  review: "warning",
  completed: "success",
  on_hold: "warning",
  cancelled: "error",
};

export type ClientProject = {
  id: string;
  name: string;
  client_id: string;
  website_type: WebsiteType | null;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  end_date: string | null;
  cost: number | null;
  paid_amount: number;
  live_url: string | null;
  github_url: string | null;
  figma_url: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
};

export type ClientProjectWithClient = ClientProject & {
  client: { id: string; name: string } | null;
};

export type { WebsiteType };
export { WEBSITE_TYPES } from "../clients/types";
