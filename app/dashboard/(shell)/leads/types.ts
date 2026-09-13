export type LeadStatus = "new" | "contacted" | "won" | "lost";

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const LEAD_STATUS_COLOR: Record<
  LeadStatus,
  "default" | "primary" | "success" | "warning"
> = {
  new: "warning",
  contacted: "primary",
  won: "success",
  lost: "default",
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  category: string;
  budget: string;
  monthly_clients: string;
  timeline: string;
  status: LeadStatus;
  created_at: string;
};
