"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart } from "@mui/x-charts/BarChart";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { monthLabel, startOfMonthISO, isPastDue, isDueSoon, todayISO } from "@/app/lib/dates";
import { computeAlerts } from "./follow-ups/alerts";
import type { AlertProject, AlertTask, LastContact } from "./follow-ups/types";
import type { OverviewClient, OverviewTransaction, ActivityEntry } from "./page";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(value);
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityHref(entry: ActivityEntry): string | null {
  if (entry.entity_type === "client") return `/dashboard/clients/${entry.entity_id}`;
  if (entry.entity_type === "client_project") return `/dashboard/projects/${entry.entity_id}`;
  return null;
}

function StatGroup({ title, stats }: { title: string; stats: { label: string; value: string; color?: string }[] }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderColor: "divider" }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mt: 1 }}>
        {stats.map((s) => (
          <Box key={s.label}>
            <Typography variant="h6" fontWeight={700} color={s.color}>
              {s.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export default function OverviewView({
  clients,
  projects,
  tasks,
  transactions,
  allCommunications,
  activity,
  loadError,
}: {
  clients: OverviewClient[];
  projects: AlertProject[];
  tasks: AlertTask[];
  transactions: OverviewTransaction[];
  allCommunications: LastContact[];
  activity: ActivityEntry[];
  loadError?: string;
}) {
  const today = todayISO();
  const monthStart = startOfMonthISO(0, today);

  const clientStats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "active").length;
    const completed = clients.filter((c) => c.status === "completed").length;
    const newThisMonth = clients.filter((c) => c.created_at.slice(0, 10) >= monthStart).length;
    return { total, active, completed, newThisMonth };
  }, [clients, monthStart]);

  const projectStats = useMemo(() => {
    const active = projects.filter((p) => p.status !== "completed" && p.status !== "cancelled");
    const completed = projects.filter((p) => p.status === "completed").length;
    const overdue = active.filter((p) => isPastDue(p.due_date, today)).length;
    const dueSoon = active.filter((p) => !isPastDue(p.due_date, today) && isDueSoon(p.due_date, 3, today)).length;
    return { current: active.length, completed, overdue, dueSoon };
  }, [projects, today]);

  const financeStats = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income");
    const expense = transactions.filter((t) => t.type === "expense");
    const totalRevenue = income.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expense.reduce((s, t) => s + t.amount, 0);
    const monthRevenue = income.filter((t) => t.occurred_on >= monthStart).reduce((s, t) => s + t.amount, 0);
    const monthExpenses = expense.filter((t) => t.occurred_on >= monthStart).reduce((s, t) => s + t.amount, 0);
    const outstanding = projects.reduce((sum, p) => {
      if (p.cost === null) return sum;
      const remaining = p.cost - p.paid_amount;
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);
    return {
      totalRevenue,
      totalExpenses,
      monthRevenue,
      monthExpenses,
      netProfit: totalRevenue - totalExpenses,
      outstanding,
    };
  }, [transactions, projects, monthStart]);

  const chartData = useMemo(() => {
    const months = [5, 4, 3, 2, 1, 0];
    return months.map((monthsAgo) => {
      const start = startOfMonthISO(monthsAgo);
      const end = startOfMonthISO(monthsAgo - 1);
      const income = transactions
        .filter((t) => t.type === "income" && t.occurred_on >= start && t.occurred_on < end)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.type === "expense" && t.occurred_on >= start && t.occurred_on < end)
        .reduce((s, t) => s + t.amount, 0);
      return { month: monthLabel(monthsAgo), income, expense };
    });
  }, [transactions]);

  const alerts = useMemo(
    () => computeAlerts({ projects, tasks, allCommunications, today }),
    [projects, tasks, allCommunications, today]
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        What&apos;s going on with the business right now.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, mb: 3 }}>
        <StatGroup
          title="Clients"
          stats={[
            { label: "Total", value: String(clientStats.total) },
            { label: "Active", value: String(clientStats.active) },
            { label: "Completed", value: String(clientStats.completed) },
            { label: "New this month", value: String(clientStats.newThisMonth) },
          ]}
        />
        <StatGroup
          title="Projects"
          stats={[
            { label: "Current", value: String(projectStats.current) },
            { label: "Completed", value: String(projectStats.completed) },
            { label: "Overdue", value: String(projectStats.overdue), color: projectStats.overdue > 0 ? "error.main" : undefined },
            { label: "Due soon", value: String(projectStats.dueSoon), color: projectStats.dueSoon > 0 ? "warning.main" : undefined },
          ]}
        />
        <StatGroup
          title="Finance"
          stats={[
            { label: "Total revenue", value: formatMoney(financeStats.totalRevenue), color: "success.main" },
            { label: "This month", value: formatMoney(financeStats.monthRevenue) },
            { label: "Net profit", value: formatMoney(financeStats.netProfit) },
            { label: "Outstanding", value: formatMoney(financeStats.outstanding), color: financeStats.outstanding > 0 ? "warning.main" : undefined },
          ]}
        />
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" } }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderColor: "divider" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Financial overview — last 6 months
          </Typography>
          <BarChart
            height={220}
            series={[
              { data: chartData.map((d) => d.income), label: "Income", color: "#0fd8d7" },
              { data: chartData.map((d) => d.expense), label: "Expenses", color: "#9f7aea" },
            ]}
            xAxis={[{ data: chartData.map((d) => d.month), scaleType: "band" }]}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderColor: "divider" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Needs attention
          </Typography>
          {alerts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Nothing needs attention right now.
            </Typography>
          ) : (
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {alerts.slice(0, 6).map((a) => (
                <Link key={a.key} href={a.href} style={{ textDecoration: "none", color: "inherit" }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 0.75, borderRadius: 1.5, "&:hover": { bgcolor: "action.hover" } }}>
                    {a.icon}
                    <Typography variant="caption">{a.message}</Typography>
                  </Stack>
                </Link>
              ))}
              {alerts.length > 6 && (
                <Link href="/dashboard/follow-ups" style={{ textDecoration: "none" }}>
                  <Typography variant="caption" color="primary.main" sx={{ display: "block", mt: 0.5, px: 0.75 }}>
                    +{alerts.length - 6} more →
                  </Typography>
                </Link>
              )}
            </Stack>
          )}
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, borderColor: "divider", mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Recent activity
        </Typography>
        {activity.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nothing has happened yet.
          </Typography>
        ) : (
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {activity.map((entry) => {
              const href = activityHref(entry);
              const content = (
                <Stack direction="row" justifyContent="space-between" sx={{ p: 0.75, borderRadius: 1.5, "&:hover": href ? { bgcolor: "action.hover" } : undefined }}>
                  <Typography variant="body2">
                    {entry.action}
                    {entry.entity_label && entry.entity_label !== entry.entity_id ? ` — ${entry.entity_label}` : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(entry.created_at)}
                  </Typography>
                </Stack>
              );
              return href ? (
                <Link key={entry.id} href={href} style={{ textDecoration: "none", color: "inherit" }}>
                  {content}
                </Link>
              ) : (
                <Box key={entry.id}>{content}</Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
