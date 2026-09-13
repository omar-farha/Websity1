export type ClientStatus = "lead" | "active" | "completed" | "archived";

export const CLIENT_STATUSES: { value: ClientStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export const CLIENT_STATUS_COLOR: Record<
  ClientStatus,
  "default" | "primary" | "success" | "warning"
> = {
  lead: "warning",
  active: "primary",
  completed: "success",
  archived: "default",
};

export type WebsiteType =
  | "portfolio"
  | "ecommerce"
  | "dashboard"
  | "landing_page"
  | "maintenance"
  | "other";

export const WEBSITE_TYPES: { value: WebsiteType; label: string }[] = [
  { value: "portfolio", label: "Portfolio" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "dashboard", label: "Dashboard" },
  { value: "landing_page", label: "Landing Page" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

// Note: the `clients` table still has legacy `cost`/`paid_amount` columns
// from before the Projects module existed. They're no longer read or
// written here — financial tracking now lives on client_projects, rolled up
// per client. The columns stay in the DB (a one-time migration already
// copied any existing values into a client_project) but are intentionally
// omitted from this type.
export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  status: ClientStatus;
  start_date: string;
  end_date: string | null;
  website_type: WebsiteType | null;
  created_at: string;
};
