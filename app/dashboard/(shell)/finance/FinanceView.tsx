"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { BarChart } from "@mui/x-charts/BarChart";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ArrowRight, Minus, Pencil, Plus, Receipt, Repeat, Search, Trash2, Wallet } from "lucide-react";
import { monthLabel, startOfMonthISO, startOfWeekISO, startOfYearISO, todayISO } from "@/app/lib/dates";
import { deleteTransaction, saveTransaction } from "./actions";
import {
  EXPENSE_GROUPS,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  PERIODS,
  type Period,
  type RecurringInterval,
  type Transaction,
  type TransactionType,
  type TransactionWithRelations,
} from "./types";

export type ClientOption = { id: string; name: string };
export type ProjectOption = { id: string; name: string; client_id: string };

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(value);
}

function periodRange(period: Period, customStart: string, customEnd: string): [string, string] {
  const today = todayISO();
  switch (period) {
    case "today":
      return [today, today];
    case "week":
      return [startOfWeekISO(today), today];
    case "month":
      return [startOfMonthISO(0, today), today];
    case "last_month":
      return [startOfMonthISO(1, today), startOfMonthISO(0, today)];
    case "year":
      return [startOfYearISO(today), today];
    case "custom":
      return [customStart || today, customEnd || today];
  }
}

export default function FinanceView({
  transactions,
  clients,
  projects,
  outstanding,
  monthlyCommitted,
  loadError,
}: {
  transactions: TransactionWithRelations[];
  clients: ClientOption[];
  projects: ProjectOption[];
  outstanding: number;
  monthlyCommitted: number;
  loadError?: string;
}) {
  const [period, setPeriod] = useState<Period>("month");
  const [customStart, setCustomStart] = useState(todayISO());
  const [customEnd, setCustomEnd] = useState(todayISO());
  const [query, setQuery] = useState("");
  const [addType, setAddType] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithRelations | null>(null);

  const [start, end] = useMemo(
    () => (period === "last_month" ? periodRange(period, customStart, customEnd) : periodRange(period, customStart, customEnd)),
    [period, customStart, customEnd]
  );
  const isLastMonth = period === "last_month";

  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (isLastMonth) return t.occurred_on >= start && t.occurred_on < end;
      return t.occurred_on >= start && t.occurred_on <= end;
    });
  }, [transactions, start, end, isLastMonth]);

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return periodTransactions;
    return periodTransactions.filter((t) =>
      [t.category, t.description, t.client?.name, t.client_project?.name].some((f) =>
        f?.toLowerCase().includes(q)
      )
    );
  }, [periodTransactions, query]);

  const totals = useMemo(() => {
    const income = periodTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = periodTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [periodTransactions]);

  const chartData = useMemo(() => {
    const months = [5, 4, 3, 2, 1, 0];
    return months.map((monthsAgo) => {
      const monthStart = startOfMonthISO(monthsAgo);
      const monthEnd = startOfMonthISO(monthsAgo - 1);
      const income = transactions
        .filter((t) => t.type === "income" && t.occurred_on >= monthStart && t.occurred_on < monthEnd)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.type === "expense" && t.occurred_on >= monthStart && t.occurred_on < monthEnd)
        .reduce((s, t) => s + t.amount, 0);
      return { month: monthLabel(monthsAgo), income, expense };
    });
  }, [transactions]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Finance
        </Typography>
        <Stack direction="row" spacing={1} sx={{ "& > button": { flex: { xs: 1, sm: "initial" } } }}>
          <Button variant="outlined" color="success" startIcon={<Plus size={16} />} onClick={() => setAddType("income")}>
            Add income
          </Button>
          <Button variant="outlined" color="error" startIcon={<Minus size={16} />} onClick={() => setAddType("expense")}>
            Add expense
          </Button>
        </Stack>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        <Button component={Link} href="/dashboard/finance/expenses" size="small" variant="outlined" startIcon={<Receipt size={14} />} endIcon={<ArrowRight size={14} />} sx={{ justifyContent: { xs: "space-between", sm: "center" } }}>
          Expense breakdown
        </Button>
        <Button component={Link} href="/dashboard/finance/subscriptions" size="small" variant="outlined" startIcon={<Repeat size={14} />} endIcon={<ArrowRight size={14} />} sx={{ justifyContent: { xs: "space-between", sm: "center" } }}>
          Subscriptions
        </Button>
        <Button component={Link} href="/dashboard/finance/budgets" size="small" variant="outlined" startIcon={<Wallet size={14} />} endIcon={<ArrowRight size={14} />} sx={{ justifyContent: { xs: "space-between", sm: "center" } }}>
          Budgets
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
        {PERIODS.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            onClick={() => setPeriod(p.value)}
            color={period === p.value ? "primary" : "default"}
            variant={period === p.value ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {period === "custom" && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="From"
            type="date"
            size="small"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
          mb: 3,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">Income</Typography>
          <Typography variant="h6" fontWeight={700} color="success.main">{formatMoney(totals.income)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">Expenses</Typography>
          <Typography variant="h6" fontWeight={700} color="error.main">{formatMoney(totals.expense)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">Net Profit</Typography>
          <Typography variant="h6" fontWeight={700}>{formatMoney(totals.net)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">Outstanding</Typography>
          <Typography variant="h6" fontWeight={700} color="warning.main">{formatMoney(outstanding)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" title="Active subscriptions + recurring salaries, per month">
            Recurring / month
          </Typography>
          <Typography variant="h6" fontWeight={700} color="secondary.main">{formatMoney(monthlyCommitted)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" title="This period's net profit minus monthly recurring commitments">
            Net after recurring
          </Typography>
          <Typography variant="h6" fontWeight={700} color={totals.net - monthlyCommitted < 0 ? "error.main" : "text.primary"}>
            {formatMoney(totals.net - monthlyCommitted)}
          </Typography>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderColor: "divider", mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Last 6 months
        </Typography>
        <BarChart
          height={240}
          series={[
            { data: chartData.map((d) => d.income), label: "Income", color: "#0fd8d7" },
            { data: chartData.map((d) => d.expense), label: "Expenses", color: "#9f7aea" },
          ]}
          xAxis={[{ data: chartData.map((d) => d.month), scaleType: "band" }]}
        />
      </Paper>

      <TextField
        placeholder="Search transactions…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          },
        }}
      />

      {filteredTransactions.length === 0 ? (
        <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">No transactions in this period.</Typography>
        </Box>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <Stack spacing={1.5} sx={{ display: { xs: "flex", sm: "none" } }}>
            {filteredTransactions.map((t) => (
              <TransactionCard key={t.id} t={t} onEdit={() => setEditingTransaction(t)} />
            ))}
          </Stack>

          {/* Desktop: table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "divider", display: { xs: "none", sm: "block" } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Client / Project</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.occurred_on}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2">
                          {t.category}
                          {t.subcategory ? ` — ${t.subcategory}` : ""}
                        </Typography>
                        {t.is_recurring && <Repeat size={12} opacity={0.6} />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t.client_project?.name ?? t.client?.name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{t.payment_method ?? "—"}</TableCell>
                    <TableCell align="right">
                      <Typography color={t.type === "income" ? "success.main" : "error.main"} fontWeight={600}>
                        {t.type === "income" ? "+" : "−"}
                        {formatMoney(t.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {t.client_project_id && t.category === "Client Payment" ? (
                        <Button
                          size="small"
                          href={`/dashboard/projects/${t.client_project_id}`}
                          title="Client payments are managed from the project page, to keep its paid amount in sync"
                        >
                          Manage on project
                        </Button>
                      ) : (
                        <>
                          <IconButton size="small" onClick={() => setEditingTransaction(t)}>
                            <Pencil size={15} />
                          </IconButton>
                          <DeleteTransactionButton id={t.id} />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {addType && (
        <TransactionFormDialog
          type={addType}
          clients={clients}
          projects={projects}
          onClose={() => setAddType(null)}
        />
      )}
      {editingTransaction && (
        <TransactionFormDialog
          type={editingTransaction.type}
          transaction={editingTransaction}
          clients={clients}
          projects={projects}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </Box>
  );
}

function TransactionCard({
  t,
  onEdit,
}: {
  t: TransactionWithRelations;
  onEdit: () => void;
}) {
  const managedOnProject = t.client_project_id && t.category === "Client Payment";

  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography fontWeight={600}>
              {t.category}
              {t.subcategory ? ` — ${t.subcategory}` : ""}
            </Typography>
            {t.is_recurring && <Repeat size={12} opacity={0.6} />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {t.client_project?.name ?? t.client?.name ?? "—"}
          </Typography>
        </Box>
        <Typography
          color={t.type === "income" ? "success.main" : "error.main"}
          fontWeight={700}
          sx={{ whiteSpace: "nowrap" }}
        >
          {t.type === "income" ? "+" : "−"}
          {formatMoney(t.amount)}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {t.occurred_on}
          {t.payment_method ? ` · ${t.payment_method}` : ""}
        </Typography>
        {managedOnProject ? (
          <Button
            size="small"
            href={`/dashboard/projects/${t.client_project_id}`}
            title="Client payments are managed from the project page, to keep its paid amount in sync"
          >
            Manage on project
          </Button>
        ) : (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={onEdit}>
              <Pencil size={15} />
            </IconButton>
            <DeleteTransactionButton id={t.id} />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function DeleteTransactionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <IconButton
      size="small"
      color="error"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this transaction?")) {
          startTransition(() => deleteTransaction(id));
        }
      }}
    >
      <Trash2 size={15} />
    </IconButton>
  );
}

export function TransactionFormDialog({
  type,
  transaction,
  clients,
  projects,
  onClose,
}: {
  type: TransactionType;
  transaction?: Transaction;
  clients: ClientOption[];
  projects: ProjectOption[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState(transaction?.client_id ?? "");
  const [expenseGroup, setExpenseGroup] = useState(
    EXPENSE_GROUPS.find((g) => g.label === transaction?.category)?.value ?? EXPENSE_GROUPS[0].value
  );
  const [isRecurring, setIsRecurring] = useState(transaction?.is_recurring ?? false);
  // "Client Payment" is deliberately excluded here — it's only ever created
  // via "Record payment" on a project's page, so it always keeps that
  // project's paid_amount in sync. Existing ones (from before, or edited
  // elsewhere) can still show their real category if being edited.
  const incomeCategories = INCOME_CATEGORIES.filter(
    (c) => c !== "Client Payment" || transaction?.category === "Client Payment"
  );
  const currentGroup = EXPENSE_GROUPS.find((g) => g.value === expenseGroup) ?? EXPENSE_GROUPS[0];
  const availableProjects = clientId ? projects.filter((p) => p.client_id === clientId) : projects;

  function handleSubmit(formData: FormData) {
    if (type === "expense") {
      formData.set("category", currentGroup.label);
    }
    startTransition(async () => {
      const result = await saveTransaction(undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form action={handleSubmit}>
        <input type="hidden" name="type" value={type} />
        {transaction && <input type="hidden" name="id" value={transaction.id} />}
        <DialogTitle>
          {transaction ? "Edit" : "Add"} {type === "income" ? "income" : "expense"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            name="amount"
            label="Amount"
            type="number"
            defaultValue={transaction?.amount}
            required
            autoFocus
            fullWidth
            size="small"
          />

          {type === "income" ? (
            <TextField name="category" label="Category" select required defaultValue={transaction?.category ?? ""} fullWidth size="small">
              {incomeCategories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          ) : (
            <>
              <TextField
                label="Category"
                select
                value={expenseGroup}
                onChange={(e) => setExpenseGroup(e.target.value as typeof expenseGroup)}
                fullWidth
                size="small"
              >
                {EXPENSE_GROUPS.map((g) => (
                  <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                ))}
              </TextField>
              <TextField name="subcategory" label="Subcategory" select defaultValue={transaction?.subcategory ?? ""} fullWidth size="small">
                <MenuItem value="">
                  <em>Not set</em>
                </MenuItem>
                {currentGroup.subcategories.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </>
          )}

          <TextField
            name="occurred_on"
            label="Date"
            type="date"
            defaultValue={transaction?.occurred_on ?? todayISO()}
            required
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {type === "expense" && (
            <TextField name="vendor" label="Vendor / Paid to" defaultValue={transaction?.vendor ?? ""} fullWidth size="small" />
          )}

          <TextField
            name="client_id"
            label="Client"
            select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="">
              <em>No client</em>
            </MenuItem>
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField name="client_project_id" label="Project" select defaultValue={transaction?.client_project_id ?? ""} fullWidth size="small">
            <MenuItem value="">
              <em>No project</em>
            </MenuItem>
            {availableProjects.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </TextField>
          <TextField name="payment_method" label="Payment method" select defaultValue={transaction?.payment_method ?? ""} fullWidth size="small">
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>

          {type === "expense" && (
            <>
              <FormControlLabel
                control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} name="is_recurring" />}
                label="This is a recurring expense"
              />
              {isRecurring && (
                <TextField
                  name="recurring_interval"
                  label="Repeats"
                  select
                  defaultValue={(transaction?.recurring_interval as RecurringInterval) ?? "monthly"}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>
              )}
            </>
          )}

          <TextField
            name="description"
            label="Description"
            defaultValue={transaction?.description ?? ""}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
