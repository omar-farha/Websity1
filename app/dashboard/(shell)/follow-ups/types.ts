import type { ProjectStatus } from "../projects/types";
import type { TaskPriority, TaskStatus } from "../tasks/types";

export type ClientRef = { id: string; name: string } | null;

export type AlertProject = {
  id: string;
  name: string;
  client_id: string;
  cost: number | null;
  paid_amount: number;
  status: ProjectStatus;
  due_date: string | null;
  client: ClientRef;
};

export type AlertTask = {
  id: string;
  title: string;
  due_date: string | null;
  status: TaskStatus;
  priority?: TaskPriority;
  client_id: string | null;
  client_project_id: string | null;
  client: ClientRef;
};

export type LastContact = {
  client_id: string;
  contacted_at: string;
  client: ClientRef;
};
