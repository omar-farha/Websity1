"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ArrowLeft, Lightbulb, Minus, Pencil, Repeat, Search, Trash2 } from "lucide-react";
import { monthLabel, startOfMonthISO, todayISO } from "@/app/lib/dates";
import { deleteTransaction } from "../actions";
import { TransactionFormDialog, type ClientOption, type ProjectOption } from "../FinanceView";
import { EXPENSE_GROUPS, type TransactionWithRelations } from "../types";
import { monthlyEquivalent, type Subscription } from "../subscriptions/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(value);
}

const GROUP_COLORS = ["#0fd8d7", "#f3b653", "#0f9fa5", "#e57373", "#9575cd", "#81c784", "#64b5f6", "#a1887f"];

export default function ExpensesView({
  expenses,
  clients,
  projects,
  subscriptions,
  loadError,
}: {
  expenses: TransactionWithRelations[];
  clients: ClientOption[];
  projects: ProjectOption[];
  subscriptions: Subscription[];
  loadError?: string;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [editing, setEditing] = useState<TransactionWithRelations | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const today = todayISO();
  const monthStart = startOfMonthISO(0, today);
  const lastMonthStart = startOfMonthISO(1, today);

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const thisMonth = expenses.filter((e) => e.occurred_on >= monthStart).reduce((s, e) => s + e.amount, 0);
    const recurring = expenses.filter((e) => e.is_recurring).reduce((s, e) => s + e.amount, 0);
    const advertising = expenses.filter((e) => e.category === "Marketing").reduce((s, e) => s + e.amount, 0);
    return { total, thisMonth, recurring, advertising };
  }, [expenses, monthStart]);

  const breakdown = useMemo(() => {
    const byGroup = new Map<string, number>();
    for (const e of expenses) {
      byGroup.set(e.category, (byGroup.get(e.category) ?? 0) + e.amount);
    }
    const entries = Array.from(byGroup.entries()).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, amount]) => s + amount, 0);
    return entries.map(([category, amount], i) => ({
      category,
      amount,
      pct: total > 0 ? (amount / total) * 100 : 0,
      color: GROUP_COLORS[i % GROUP_COLORS.length],
    }));
  }, [expenses]);

  const trend = useMemo(() => {
    const months = [5, 4, 3, 2, 1, 0];
    return months.map((monthsAgo) => {
      const start = startOfMonthISO(monthsAgo);
      const end = startOfMonthISO(monthsAgo - 1);
      const amount = expenses
        .filter((e) => e.occurred_on >= start && e.occurred_on < end)
        .reduce((s, e) => s + e.amount, 0);
      return { month: monthLabel(monthsAgo), amount };
    });
  }, [expenses]);

  const insights = useMemo(() => {
    const items: string[] = [];

    const thisMonthAds = expenses
      .filter((e) => e.category === "Marketing" && e.occurred_on >= monthStart)
      .reduce((s, e) => s + e.amount, 0);
    const lastMonthAds = expenses
      .filter((e) => e.category === "Marketing" && e.occurred_on >= lastMonthStart && e.occurred_on < monthStart)
      .reduce((s, e) => s + e.amount, 0);
    if (lastMonthAds > 0 && thisMonthAds > 0) {
      const change = Math.round(((thisMonthAds - lastMonthAds) / lastMonthAds) * 100);
      if (Math.abs(change) >= 5) {
        items.push(`Advertising ${change > 0 ? "increased" : "decreased"} ${Math.abs(change)}% this month.`);
      }
    }

    const subsMonthly = subscriptions.reduce((s, sub) => s + monthlyEquivalent(sub), 0);
    if (subsMonthly > 0) {
      items.push(`Subscriptions cost ${formatMoney(subsMonthly)}/month across ${subscriptions.length} active subscriptions.`);
    }

    const thisMonthPeople = expenses
      .filter((e) => e.category === "People" && e.occurred_on >= monthStart)
      .reduce((s, e) => s + e.amount, 0);
    if (thisMonthPeople > 0) {
      items.push(`You spent ${formatMoney(thisMonthPeople)} on freelancers & services this month.`);
    }

    const thisMonthTotal = expenses.filter((e) => e.occurred_on >= monthStart).reduce((s, e) => s + e.amount, 0);
    const thisMonthRecurring = expenses
      .filter((e) => e.is_recurring && e.occurred_on >= monthStart)
      .reduce((s, e) => s + e.amount, 0);
    if (thisMonthTotal > 0) {
      const pct = Math.round((thisMonthRecurring / thisMonthTotal) * 100);
      if (pct > 0) items.push(`Recurring expenses represent ${pct}% of this month's expenses.`);
    }

    return items;
  }, [expenses, subscriptions, monthStart, lastMonthStart]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((e) => {
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (recurringFilter === "recurring" && !e.is_recurring) return false;
      if (recurringFilter === "one_time" && e.is_recurring) return false;
      if (clientFilter && e.client_id !== clientFilter) return false;
      if (projectFilter && e.client_project_id !== projectFilter) return false;
      if (q) {
        const hit = [e.description, e.vendor, e.subcategory, e.category].some((f) => f?.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [expenses, query, categoryFilter, recurringFilter, clientFilter, projectFilter]);

  return (
    <Box>
      <Link href="/dashboard/finance" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", marginBottom: 16 }}>
        <ArrowLeft size={16} />
        <Typography variant="body2" color="text.secondary">Back to Finance</Typography>
      </Link>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Where the company&apos;s money goes.
          </Typography>
        </Box>
        <Button variant="outlined" color="error" startIcon={<Minus size={16} />} onClick={() => setAddOpen(true)}>
          Add expense
        </Button>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">Total Expenses</Typography>
          <Typography variant="h6" fontWeight={700} color="error.main">{formatMoney(stats.total)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">This Month</Typography>
          <Typography variant="h6" fontWeight={700}>{formatMoney(stats.thisMonth)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">Recurring</Typography>
          <Typography variant="h6" fontWeight={700}>{formatMoney(stats.recurring)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">Advertising</Typography>
          <Typography variant="h6" fontWeight={700}>{formatMoney(stats.advertising)}</Typography>
        </Paper>
      </Box>

      {insights.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2.5, borderColor: "divider", mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Lightbulb size={16} />
            <Typography variant="subtitle2" color="text.secondary">Insights</Typography>
          </Stack>
          <Stack spacing={0.75}>
            {insights.map((text, i) => (
              <Typography key={i} variant="body2">• {text}</Typography>
            ))}
          </Stack>
        </Paper>
      )}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            By category
          </Typography>
          {breakdown.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No expenses yet.</Typography>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              <PieChart
                series={[{ data: breakdown.map((b) => ({ id: b.category, value: b.amount, label: b.category, color: b.color })), innerRadius: 30 }]}
                width={160}
                height={160}
                slots={{ legend: () => null }}
              />
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                {breakdown.map((b) => (
                  <Box key={b.category}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption">{b.category}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatMoney(b.amount)}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={b.pct}
                      sx={{ height: 5, borderRadius: 1, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: b.color } }}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Last 6 months
          </Typography>
          <BarChart
            height={200}
            series={[{ data: trend.map((t) => t.amount), label: "Expenses", color: "#9f7aea" }]}
            xAxis={[{ data: trend.map((t) => t.month), scaleType: "band" }]}
          />
        </Paper>
      </Box>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
        <TextField
          placeholder="Search description, vendor…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          sx={{ minWidth: 200, flex: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
        />
        <TextField select label="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} size="small" sx={{ minWidth: 140 }}>
          <MenuItem value="">All categories</MenuItem>
          {EXPENSE_GROUPS.map((g) => (
            <MenuItem key={g.value} value={g.label}>{g.label}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Type" value={recurringFilter} onChange={(e) => setRecurringFilter(e.target.value)} size="small" sx={{ minWidth: 130 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="recurring">Recurring</MenuItem>
          <MenuItem value="one_time">One-time</MenuItem>
        </TextField>
        <TextField select label="Client" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} size="small" sx={{ minWidth: 140 }}>
          <MenuItem value="">All clients</MenuItem>
          {clients.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} size="small" sx={{ minWidth: 140 }}>
          <MenuItem value="">All projects</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {filtered.length === 0 ? (
        <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">No expenses match these filters.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "divider" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Client / Project</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.occurred_on}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{e.description ?? "—"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2">{e.category}{e.subcategory ? ` — ${e.subcategory}` : ""}</Typography>
                      {e.is_recurring && <Repeat size={12} opacity={0.6} />}
                    </Stack>
                  </TableCell>
                  <TableCell>{e.vendor ?? "—"}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{e.client_project?.name ?? e.client?.name ?? "—"}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="error.main" fontWeight={600}>−{formatMoney(e.amount)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setEditing(e)}>
                      <Pencil size={15} />
                    </IconButton>
                    <DeleteButton id={e.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editing && (
        <TransactionFormDialog type="expense" transaction={editing} clients={clients} projects={projects} onClose={() => setEditing(null)} />
      )}
      {addOpen && (
        <TransactionFormDialog type="expense" clients={clients} projects={projects} onClose={() => setAddOpen(false)} />
      )}
    </Box>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <IconButton
      size="small"
      color="error"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this expense?")) startTransition(() => deleteTransaction(id));
      }}
    >
      <Trash2 size={15} />
    </IconButton>
  );
}
