"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  ExternalLink,
  Figma,
  Github,
  Globe,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  deleteProject,
  recordPayment,
  saveProject,
  updateClientPayment,
  deleteClientPayment,
} from "../actions";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_COLOR,
  WEBSITE_TYPES,
  type ClientProjectWithClient,
} from "../types";
import TaskMiniList from "../../tasks/TaskMiniList";
import { TaskFormDialog, type ProjectOption } from "../../tasks/TasksView";
import type { TaskWithRelations } from "../../tasks/types";
import { PAYMENT_METHODS, type Transaction } from "../../finance/types";
import NotesList from "../../notes/NotesList";
import type { Note } from "../../notes/types";
import LinksList from "../../links/LinksList";
import type { LinkItem } from "../../links/types";
import { formatDate, todayISO } from "@/app/lib/dates";

type ClientOption = { id: string; name: string };

function formatMoney(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(value);
}

export default function ProjectDetailView({
  project,
  clients,
  projects,
  tasks,
  payments,
  notes,
  links,
}: {
  project: ClientProjectWithClient;
  clients: ClientOption[];
  projects: ProjectOption[];
  tasks: TaskWithRelations[];
  payments: Transaction[];
  notes: Note[];
  links: LinkItem[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Transaction | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const remaining = project.cost !== null ? project.cost - project.paid_amount : null;
  const websiteTypeLabel = WEBSITE_TYPES.find((t) => t.value === project.website_type)?.label;

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Link
        href="/dashboard/projects"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
      >
        <ArrowLeft size={16} />
        <Typography variant="body2" color="text.secondary">
          Back to projects
        </Typography>
      </Link>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mt: 3, mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {project.name}
          </Typography>
          {project.client && (
            <Link
              href={`/dashboard/clients/${project.client.id}`}
              style={{ textDecoration: "none" }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ "&:hover": { color: "primary.main" } }}>
                {project.client.name}
              </Typography>
            </Link>
          )}
          <Chip
            label={PROJECT_STATUSES.find((s) => s.value === project.status)?.label ?? project.status}
            color={PROJECT_STATUS_COLOR[project.status]}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Pencil size={15} />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={15} />}
            disabled={isDeleting}
            onClick={() => {
              if (confirm(`Delete "${project.name}"? This can't be undone.`)) {
                startDeleteTransition(() => deleteProject(project.id, project.client_id));
              }
            }}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Overview
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Globe size={16} />
            <Typography variant="body2">{websiteTypeLabel ?? "Website type not set"}</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Calendar size={16} />
            <Typography variant="body2">
              {project.start_date ? `Started ${formatDate(project.start_date)}` : "No start date"}
              {project.due_date && ` · Due ${formatDate(project.due_date)}`}
              {project.end_date && ` · Ended ${formatDate(project.end_date)}`}
            </Typography>
          </Stack>
        </Stack>

        {project.description && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {project.description}
            </Typography>
          </>
        )}

        {project.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {project.notes}
            </Typography>
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" color="text.secondary">
            Financial
          </Typography>
          <Button size="small" startIcon={<Wallet size={14} />} onClick={() => setRecordPaymentOpen(true)}>
            Record payment
          </Button>
        </Box>
        <Stack direction="row" spacing={4} sx={{ mt: 1 }} flexWrap="wrap">
          <Box>
            <Typography variant="caption" color="text.secondary">Cost</Typography>
            <Typography variant="h6" fontWeight={700}>{formatMoney(project.cost)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Paid</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">{formatMoney(project.paid_amount)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Remaining</Typography>
            <Typography variant="h6" fontWeight={700} color={remaining && remaining > 0 ? "warning.main" : "text.primary"}>
              {formatMoney(remaining)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary">Payment history</Typography>
        {payments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No payments recorded yet.
          </Typography>
        ) : (
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {payments.map((payment) => (
              <Stack key={payment.id} direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ minWidth: 90 }} color="text.secondary">
                  {formatDate(payment.occurred_on)}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main" sx={{ minWidth: 90 }}>
                  +{formatMoney(payment.amount)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }} noWrap>
                  {payment.payment_method ?? ""} {payment.description ? `· ${payment.description}` : ""}
                </Typography>
                <IconButtonGroup payment={payment} projectId={project.id} onEdit={() => setEditingPayment(payment)} />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Links
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
          {project.live_url ? (
            <Button size="small" variant="outlined" startIcon={<ExternalLink size={14} />} href={project.live_url} target="_blank" rel="noopener noreferrer">
              Live site
            </Button>
          ) : null}
          {project.github_url ? (
            <Button size="small" variant="outlined" startIcon={<Github size={14} />} href={project.github_url} target="_blank" rel="noopener noreferrer">
              GitHub
            </Button>
          ) : null}
          {project.figma_url ? (
            <Button size="small" variant="outlined" startIcon={<Figma size={14} />} href={project.figma_url} target="_blank" rel="noopener noreferrer">
              Figma
            </Button>
          ) : null}
          {!project.live_url && !project.github_url && !project.figma_url && (
            <Typography variant="body2" color="text.secondary">No links added yet.</Typography>
          )}
        </Stack>
      </Paper>

      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 3, borderColor: "divider" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckSquare size={16} />
              <Typography variant="subtitle2" color="text.secondary">
                Tasks
              </Typography>
            </Stack>
            <Button size="small" startIcon={<Plus size={14} />} onClick={() => setAddTaskOpen(true)}>
              Add task
            </Button>
          </Box>
          <TaskMiniList tasks={tasks} />
        </Paper>
        <Paper variant="outlined" sx={{ p: 3, borderColor: "divider" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Notes
          </Typography>
          <NotesList notes={notes} clientProjectId={project.id} />
        </Paper>
        <Paper variant="outlined" sx={{ p: 3, borderColor: "divider" }}>
          <LinksList links={links} clientProjectId={project.id} />
        </Paper>
      </Stack>

      {editOpen && (
        <EditProjectDialog project={project} clients={clients} onClose={() => setEditOpen(false)} />
      )}
      {addTaskOpen && (
        <TaskFormDialog
          clients={clients}
          projects={projects}
          defaultProjectId={project.id}
          defaultClientId={project.client_id}
          onClose={() => setAddTaskOpen(false)}
        />
      )}
      {recordPaymentOpen && (
        <RecordPaymentDialog projectId={project.id} onClose={() => setRecordPaymentOpen(false)} />
      )}
      {editingPayment && (
        <EditPaymentDialog
          payment={editingPayment}
          projectId={project.id}
          onClose={() => setEditingPayment(null)}
        />
      )}
    </Box>
  );
}

function IconButtonGroup({
  payment,
  projectId,
  onEdit,
}: {
  payment: Transaction;
  projectId: string;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Stack direction="row" spacing={0.5}>
      <IconButton size="small" onClick={onEdit}>
        <Pencil size={14} />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this payment? The project's paid amount will be adjusted too.")) {
            startTransition(() => deleteClientPayment(payment.id, projectId));
          }
        }}
      >
        <Trash2 size={14} />
      </IconButton>
    </Stack>
  );
}

function RecordPaymentDialog({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await recordPayment(undefined, formData);
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
        <input type="hidden" name="client_project_id" value={projectId} />
        <DialogTitle>Record payment</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="amount" label="Amount" type="number" required autoFocus fullWidth size="small" />
          <TextField
            name="occurred_on"
            label="Date"
            type="date"
            defaultValue={todayISO()}
            required
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField name="payment_method" label="Payment method" select defaultValue="" fullWidth size="small">
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
          <TextField name="description" label="Note" fullWidth size="small" />
          <Typography variant="caption" color="text.secondary">
            This will add to the project&apos;s paid amount and record it as income in Finance —
            automatically, so you never need to enter it twice.
          </Typography>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Saving…" : "Record payment"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function EditPaymentDialog({
  payment,
  projectId,
  onClose,
}: {
  payment: Transaction;
  projectId: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateClientPayment(undefined, formData);
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
        <input type="hidden" name="transaction_id" value={payment.id} />
        <input type="hidden" name="client_project_id" value={projectId} />
        <DialogTitle>Edit payment</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="amount" label="Amount" type="number" defaultValue={payment.amount} required autoFocus fullWidth size="small" />
          <TextField
            name="occurred_on"
            label="Date"
            type="date"
            defaultValue={payment.occurred_on}
            required
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField name="payment_method" label="Payment method" select defaultValue={payment.payment_method ?? ""} fullWidth size="small">
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
          <TextField name="description" label="Note" defaultValue={payment.description ?? ""} fullWidth size="small" />
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

function EditProjectDialog({
  project,
  clients,
  onClose,
}: {
  project: ClientProjectWithClient;
  clients: ClientOption[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveProject(undefined, formData);
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
        <DialogTitle>Edit project</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <input type="hidden" name="id" value={project.id} />
          <TextField name="name" label="Project name" defaultValue={project.name} required autoFocus fullWidth size="small" />
          <TextField name="client_id" label="Client" select required defaultValue={project.client_id} fullWidth size="small">
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField name="website_type" label="Website type" select defaultValue={project.website_type ?? ""} fullWidth size="small">
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {WEBSITE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField name="status" label="Status" select defaultValue={project.status} fullWidth size="small">
            {PROJECT_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField
              name="start_date"
              label="Start date"
              type="date"
              defaultValue={project.start_date ?? ""}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              name="due_date"
              label="Due date"
              type="date"
              defaultValue={project.due_date ?? ""}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <TextField
            name="end_date"
            label="End date"
            type="date"
            defaultValue={project.end_date ?? ""}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField name="cost" label="Cost" type="number" defaultValue={project.cost ?? ""} fullWidth size="small" />
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
            Paid amount is managed via &quot;Record payment&quot; on the project page, not here.
          </Typography>
          <TextField name="live_url" label="Live site URL" defaultValue={project.live_url ?? ""} fullWidth size="small" />
          <TextField name="github_url" label="GitHub URL" defaultValue={project.github_url ?? ""} fullWidth size="small" />
          <TextField name="figma_url" label="Figma URL" defaultValue={project.figma_url ?? ""} fullWidth size="small" />
          <TextField
            name="description"
            label="Description"
            defaultValue={project.description ?? ""}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />
          <TextField
            name="notes"
            label="Notes"
            defaultValue={project.notes ?? ""}
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
