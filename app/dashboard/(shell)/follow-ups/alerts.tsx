import { AlertTriangle, CalendarClock, CheckSquare, MessageCircleWarning, Wallet } from "lucide-react";
import { isDueSoon, isPastDue } from "@/app/lib/dates";
import type { AlertProject, AlertTask, LastContact } from "./types";

export const NOT_CONTACTED_THRESHOLD_DAYS = 14;

export type AlertItem = {
  key: string;
  icon: React.ReactNode;
  message: string;
  href: string;
};

// Shared between the Follow-ups page and the Overview page — one
// definition of "what needs attention" so the two views can never disagree.
export function computeAlerts({
  projects,
  tasks,
  allCommunications,
  today,
}: {
  projects: AlertProject[];
  tasks: AlertTask[];
  allCommunications: LastContact[];
  today: string;
}): AlertItem[] {
  const items: AlertItem[] = [];

  // Outstanding balances, grouped by client.
  const outstandingByClient = new Map<string, { name: string; total: number }>();
  for (const p of projects) {
    if (p.cost === null || !p.client) continue;
    const remaining = p.cost - p.paid_amount;
    if (remaining <= 0) continue;
    const entry = outstandingByClient.get(p.client_id) ?? { name: p.client.name, total: 0 };
    entry.total += remaining;
    outstandingByClient.set(p.client_id, entry);
  }
  for (const [clientId, { name, total }] of outstandingByClient) {
    items.push({
      key: `outstanding-${clientId}`,
      icon: <Wallet size={16} />,
      message: `${name} owes ${new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(total)}`,
      href: `/dashboard/clients/${clientId}`,
    });
  }

  // Projects overdue or due soon.
  for (const p of projects) {
    if (!p.due_date) continue;
    if (isPastDue(p.due_date, today)) {
      items.push({
        key: `project-overdue-${p.id}`,
        icon: <AlertTriangle size={16} />,
        message: `"${p.name}"${p.client ? ` (${p.client.name})` : ""} is overdue`,
        href: `/dashboard/projects/${p.id}`,
      });
    } else if (isDueSoon(p.due_date, 3, today)) {
      items.push({
        key: `project-soon-${p.id}`,
        icon: <CalendarClock size={16} />,
        message: `"${p.name}"${p.client ? ` (${p.client.name})` : ""} is due soon`,
        href: `/dashboard/projects/${p.id}`,
      });
    }
  }

  // Overdue tasks.
  for (const t of tasks) {
    if (isPastDue(t.due_date, today)) {
      const href = t.client_project_id
        ? `/dashboard/projects/${t.client_project_id}`
        : t.client_id
          ? `/dashboard/clients/${t.client_id}`
          : "/dashboard/tasks";
      items.push({
        key: `task-${t.id}`,
        icon: <CheckSquare size={16} />,
        message: `Task "${t.title}" is overdue`,
        href,
      });
    }
  }

  // Clients not contacted in a while (only for clients with at least one
  // logged contact — a client nobody's logged yet isn't "overdue", it's
  // just unused data, and flagging it would just be noise).
  const latestByClient = new Map<string, LastContact>();
  for (const c of allCommunications) {
    if (!latestByClient.has(c.client_id)) latestByClient.set(c.client_id, c);
  }
  for (const last of latestByClient.values()) {
    if (!last.client) continue;
    const daysSince = Math.floor(
      (new Date(today).getTime() - new Date(last.contacted_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince >= NOT_CONTACTED_THRESHOLD_DAYS) {
      items.push({
        key: `stale-${last.client_id}`,
        icon: <MessageCircleWarning size={16} />,
        message: `${last.client.name} hasn't been contacted in ${daysSince} days`,
        href: `/dashboard/clients/${last.client_id}`,
      });
    }
  }

  return items;
}
