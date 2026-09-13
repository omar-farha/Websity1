"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
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
import { ArrowLeft, Ban, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { formatDate, isDueSoon, isPastDue, todayISO } from "@/app/lib/dates";
import { EXPENSE_GROUPS, PAYMENT_METHODS } from "../types";
import {
  deleteSubscription,
  saveSubscription,
  setSubscriptionStatus,
} from "./actions";
import { monthlyEquivalent, type Subscription, type SubscriptionWithRelations } from "./types";

type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; name: string; client_id: string };
type QuickFilter = "all" | "due_soon" | "upcoming" | "active" | "cancelled";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(value);
}

export default function SubscriptionsView({
  subscriptions,
  clients,
  projects,
  loadError,
}: {
  subscriptions: SubscriptionWithRelations[];
  clients: ClientOption[];
  projects: ProjectOption[];
  loadError?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionWithRelations | null>(null);
  const [filter, setFilter] = useState<QuickFilter>("all");
  const today = todayISO();

  const counts = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    return {
      all: subscriptions.length,
      dueSoon: active.filter((s) => isDueSoon(s.next_payment_date, 7, today) || isPastDue(s.next_payment_date, today)).length,
      upcoming: active.filter((s) => !isDueSoon(s.next_payment_date, 7, today) && isDueSoon(s.next_payment_date, 30, today)).length,
      active: active.length,
      cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
    };
  }, [subscriptions, today]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "due_soon":
        return subscriptions.filter((s) => s.status === "active" && (isDueSoon(s.next_payment_date, 7, today) || isPastDue(s.next_payment_date, today)));
      case "upcoming":
        return subscriptions.filter(
          (s) => s.status === "active" && !isDueSoon(s.next_payment_date, 7, today) && isDueSoon(s.next_payment_date, 30, today)
        );
      case "active":
        return subscriptions.filter((s) => s.status === "active");
      case "cancelled":
        return subscriptions.filter((s) => s.status === "cancelled");
      default:
        return subscriptions;
    }
  }, [subscriptions, filter, today]);

  const monthlyTotal = useMemo(
    () => subscriptions.filter((s) => s.status === "active").reduce((sum, s) => sum + monthlyEquivalent(s), 0),
    [subscriptions]
  );

  const filters: { value: QuickFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "due_soon", label: "Due Soon", count: counts.dueSoon },
    { value: "upcoming", label: "Upcoming", count: counts.upcoming },
    { value: "active", label: "Active", count: counts.active },
    { value: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <Box>
      <Link href="/dashboard/finance" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", marginBottom: 16 }}>
        <ArrowLeft size={16} />
        <Typography variant="body2" color="text.secondary">Back to Finance</Typography>
      </Link>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Subscriptions</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatMoney(monthlyTotal)}/month across {counts.active} active subscriptions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add subscription
        </Button>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
        {filters.map((f) => (
          <Chip
            key={f.value}
            label={`${f.label} (${f.count})`}
            onClick={() => setFilter(f.value)}
            color={filter === f.value ? "primary" : "default"}
            variant={filter === f.value ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {filtered.length === 0 ? (
        <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">No subscriptions here.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "divider" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell>Next payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <SubscriptionRow key={s.id} sub={s} today={today} onEdit={() => setEditing(s)} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {addOpen && (
        <SubscriptionFormDialog clients={clients} projects={projects} onClose={() => setAddOpen(false)} />
      )}
      {editing && (
        <SubscriptionFormDialog subscription={editing} clients={clients} projects={projects} onClose={() => setEditing(null)} />
      )}
    </Box>
  );
}

function SubscriptionRow({
  sub,
  today,
  onEdit,
}: {
  sub: SubscriptionWithRelations;
  today: string;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const overdue = sub.status === "active" && isPastDue(sub.next_payment_date, today);

  return (
    <TableRow hover sx={{ opacity: sub.status === "cancelled" ? 0.5 : 1 }}>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>{sub.name}</Typography>
        {(sub.client?.name || sub.client_project?.name) && (
          <Typography variant="caption" color="text.secondary">
            {sub.client_project?.name ?? sub.client?.name}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {sub.category}{sub.subcategory ? ` — ${sub.subcategory}` : ""}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">
          {formatMoney(sub.cost)} <Typography component="span" variant="caption" color="text.secondary">/{sub.interval === "monthly" ? "mo" : "yr"}</Typography>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color={overdue ? "error.main" : "text.secondary"}>
          {formatDate(sub.next_payment_date)}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip label={sub.status === "active" ? "Active" : "Cancelled"} size="small" color={sub.status === "active" ? "success" : "default"} />
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={onEdit}>
          <Pencil size={15} />
        </IconButton>
        <IconButton
          size="small"
          disabled={isPending}
          title={sub.status === "active" ? "Cancel subscription" : "Reactivate subscription"}
          onClick={() =>
            startTransition(() => setSubscriptionStatus(sub.id, sub.status === "active" ? "cancelled" : "active"))
          }
        >
          {sub.status === "active" ? <Ban size={15} /> : <RotateCcw size={15} />}
        </IconButton>
        <IconButton
          size="small"
          color="error"
          disabled={isPending}
          onClick={() => {
            if (confirm(`Delete "${sub.name}"?`)) startTransition(() => deleteSubscription(sub.id));
          }}
        >
          <Trash2 size={15} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function SubscriptionFormDialog({
  subscription,
  clients,
  projects,
  onClose,
}: {
  subscription?: Subscription;
  clients: ClientOption[];
  projects: ProjectOption[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState(subscription?.client_id ?? "");
  const [expenseGroup, setExpenseGroup] = useState(
    EXPENSE_GROUPS.find((g) => g.label === subscription?.category)?.value ?? "subscriptions"
  );
  const currentGroup = EXPENSE_GROUPS.find((g) => g.value === expenseGroup) ?? EXPENSE_GROUPS[0];
  const availableProjects = clientId ? projects.filter((p) => p.client_id === clientId) : projects;

  function handleSubmit(formData: FormData) {
    formData.set("category", currentGroup.label);
    startTransition(async () => {
      const result = await saveSubscription(undefined, formData);
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
        {subscription && <input type="hidden" name="id" value={subscription.id} />}
        <DialogTitle>{subscription ? "Edit subscription" : "Add subscription"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="name" label="Name (e.g. ChatGPT)" defaultValue={subscription?.name} required autoFocus fullWidth size="small" />
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
          <TextField name="subcategory" label="Subcategory" select defaultValue={subscription?.subcategory ?? ""} fullWidth size="small">
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {currentGroup.subcategories.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField name="vendor" label="Vendor / Service" defaultValue={subscription?.vendor ?? ""} fullWidth size="small" />
          <Stack direction="row" spacing={2}>
            <TextField name="cost" label="Cost" type="number" defaultValue={subscription?.cost} required fullWidth size="small" />
            <TextField name="interval" label="Billed" select defaultValue={subscription?.interval ?? "monthly"} required fullWidth size="small">
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
          </Stack>
          <TextField name="payment_method" label="Payment method" select defaultValue={subscription?.payment_method ?? ""} fullWidth size="small">
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField
              name="start_date"
              label="Start date"
              type="date"
              defaultValue={subscription?.start_date ?? todayISO()}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              name="next_payment_date"
              label="Next payment"
              type="date"
              defaultValue={subscription?.next_payment_date ?? todayISO()}
              required
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <TextField name="status" label="Status" select defaultValue={subscription?.status ?? "active"} fullWidth size="small">
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField
            name="client_id"
            label="Client (optional)"
            select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="">
              <em>General company expense</em>
            </MenuItem>
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField name="client_project_id" label="Project (optional)" select defaultValue={subscription?.client_project_id ?? ""} fullWidth size="small">
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {availableProjects.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </TextField>
          <TextField name="notes" label="Notes" defaultValue={subscription?.notes ?? ""} fullWidth size="small" multiline minRows={2} />
          {error && (
            <Typography variant="body2" color="error">{error}</Typography>
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
