"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  FolderKanban,
  Globe,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { deleteClient, saveClient } from "../actions";
import { saveProject } from "../../projects/actions";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_COLOR,
  type ClientProject,
} from "../../projects/types";
import TaskMiniList from "../../tasks/TaskMiniList";
import { TaskFormDialog, type ProjectOption } from "../../tasks/TasksView";
import type { TaskWithRelations } from "../../tasks/types";
import NotesList from "../../notes/NotesList";
import type { Note } from "../../notes/types";
import CommunicationLog from "../../communications/CommunicationLog";
import type { Communication } from "../../communications/types";
import LinksList from "../../links/LinksList";
import type { LinkItem } from "../../links/types";
import PulseDot from "../PulseDot";
import { formatDate } from "@/app/lib/dates";
import {
  CLIENT_STATUSES,
  CLIENT_STATUS_COLOR,
  WEBSITE_TYPES,
  type Client,
  type ClientStatus,
} from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatMoney(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(value);
}

export default function ClientDetailView({
  client,
  projects,
  allProjects,
  tasks,
  notes,
  communications,
  links,
}: {
  client: Client;
  projects: ClientProject[];
  allProjects: ProjectOption[];
  tasks: TaskWithRelations[];
  notes: Note[];
  communications: Communication[];
  links: LinkItem[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const websiteTypeLabel = WEBSITE_TYPES.find((t) => t.value === client.website_type)?.label;

  const hasCostData = projects.some((p) => p.cost !== null);
  const totalCost = projects.reduce((sum, p) => sum + (p.cost ?? 0), 0);
  const totalPaid = projects.reduce((sum, p) => sum + p.paid_amount, 0);
  const totalRemaining = hasCostData ? totalCost - totalPaid : null;

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Link
        href="/dashboard/clients"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
      >
        <ArrowLeft size={16} />
        <Typography variant="body2" color="text.secondary">
          Back to clients
        </Typography>
      </Link>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mt: 3, mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700, fontSize: 20 }}>
            {initials(client.name) || "?"}
          </Avatar>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight={700}>
                {client.name}
              </Typography>
              {client.status === "active" && <PulseDot size={10} />}
            </Stack>
            {client.company && (
              <Typography variant="body2" color="text.secondary">
                {client.company}
              </Typography>
            )}
            <Chip
              label={CLIENT_STATUSES.find((s) => s.value === client.status)?.label ?? client.status}
              color={CLIENT_STATUS_COLOR[client.status]}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Stack>

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
              if (confirm(`Delete ${client.name}? This can't be undone.`)) {
                startDeleteTransition(() => deleteClient(client.id));
              }
            }}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Contact
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Mail size={16} />
            <Typography variant="body2">{client.email ?? "No email on file"}</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Phone size={16} />
            <Typography variant="body2">{client.phone ?? "No phone on file"}</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Globe size={16} />
            <Typography variant="body2">{websiteTypeLabel ?? "Website type not set"}</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Calendar size={16} />
            <Typography variant="body2">
              Started {formatDate(client.start_date)}
              {client.end_date && ` — ended ${formatDate(client.end_date)}`}
            </Typography>
          </Stack>
        </Stack>

        {client.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {client.notes}
            </Typography>
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" color="text.secondary">
            Projects
          </Typography>
          <Button size="small" startIcon={<Plus size={14} />} onClick={() => setAddProjectOpen(true)}>
            Add project
          </Button>
        </Box>

        {projects.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No projects yet.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mt: 1.5 }}>
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`} style={{ textDecoration: "none" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FolderKanban size={15} />
                    <Typography variant="body2" fontWeight={500}>
                      {project.name}
                    </Typography>
                  </Stack>
                  <Chip
                    label={PROJECT_STATUSES.find((s) => s.value === project.status)?.label ?? project.status}
                    color={PROJECT_STATUS_COLOR[project.status]}
                    size="small"
                  />
                </Stack>
              </Link>
            ))}
          </Stack>
        )}

        {hasCostData && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Across all projects
            </Typography>
            <Stack direction="row" spacing={4} sx={{ mt: 0.5 }} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">Cost</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{formatMoney(totalCost)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Paid</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="success.main">{formatMoney(totalPaid)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Remaining</Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color={totalRemaining && totalRemaining > 0 ? "warning.main" : "text.primary"}
                >
                  {formatMoney(totalRemaining)}
                </Typography>
              </Box>
            </Stack>
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
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

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <CommunicationLog clientId={client.id} communications={communications} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Notes
        </Typography>
        <NotesList notes={notes} clientId={client.id} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <LinksList links={links} clientId={client.id} />
      </Paper>

      {editOpen && <EditClientDialog client={client} onClose={() => setEditOpen(false)} />}
      {addProjectOpen && (
        <AddProjectForClientDialog clientId={client.id} onClose={() => setAddProjectOpen(false)} />
      )}
      {addTaskOpen && (
        <TaskFormDialog
          clients={[{ id: client.id, name: client.name }]}
          projects={allProjects.filter((p) => p.client_id === client.id)}
          defaultClientId={client.id}
          onClose={() => setAddTaskOpen(false)}
        />
      )}
    </Box>
  );
}

function EditClientDialog({ client, onClose }: { client: Client; onClose: () => void }) {
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveClient(undefined, formData);
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
        <DialogTitle>Edit client</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <input type="hidden" name="id" value={client.id} />
          <TextField name="name" label="Name" defaultValue={client.name} required autoFocus fullWidth size="small" />
          <TextField name="company" label="Company" defaultValue={client.company ?? ""} fullWidth size="small" />
          <TextField name="email" type="email" label="Email" defaultValue={client.email ?? ""} fullWidth size="small" />
          <TextField name="phone" label="Phone" defaultValue={client.phone ?? ""} fullWidth size="small" />
          <TextField
            name="status"
            label="Status"
            select
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus)}
            fullWidth
            size="small"
          >
            {CLIENT_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="start_date"
            label="Start date"
            type="date"
            defaultValue={client.start_date}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          {status === "completed" && (
            <TextField
              name="end_date"
              label="End date"
              type="date"
              defaultValue={client.end_date ?? new Date().toISOString().slice(0, 10)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
          <TextField name="website_type" label="Website type" select defaultValue={client.website_type ?? ""} fullWidth size="small">
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {WEBSITE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="notes"
            label="Notes"
            defaultValue={client.notes ?? ""}
            fullWidth
            size="small"
            multiline
            minRows={3}
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

function AddProjectForClientDialog({
  clientId,
  onClose,
}: {
  clientId: string;
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
        <DialogTitle>Add project</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <input type="hidden" name="client_id" value={clientId} />
          <TextField name="name" label="Project name" required autoFocus fullWidth size="small" />
          <TextField name="website_type" label="Website type" select defaultValue="" fullWidth size="small">
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {WEBSITE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField name="status" label="Status" select defaultValue="planning" fullWidth size="small">
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
              defaultValue={new Date().toISOString().slice(0, 10)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField name="due_date" label="Due date" type="date" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
          </Stack>
          <TextField name="cost" label="Cost" type="number" fullWidth size="small" />
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
