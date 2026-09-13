"use client";

import { useMemo, useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { formatDate, isDueSoon, isPastDue, todayISO } from "@/app/lib/dates";
import { deleteTask, saveTask, setTaskStatus } from "./actions";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_COLOR,
  TASK_STATUSES,
  TASK_STATUS_COLOR,
  type Task,
  type TaskWithRelations,
} from "./types";

export type ClientOption = { id: string; name: string };
export type ProjectOption = { id: string; name: string; client_id: string };

type QuickFilter = "all" | "overdue" | "today" | "soon" | "urgent" | "done";

export default function TasksView({
  tasks,
  clients,
  projects,
  loadError,
}: {
  tasks: TaskWithRelations[];
  clients: ClientOption[];
  projects: ProjectOption[];
  loadError?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [clientFilter, setClientFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const today = todayISO();

  const counts = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done");
    return {
      all: tasks.length,
      overdue: open.filter((t) => isPastDue(t.due_date, today)).length,
      today: open.filter((t) => t.due_date === today).length,
      soon: open.filter((t) => isDueSoon(t.due_date, 3, today) && t.due_date !== today).length,
      urgent: open.filter((t) => t.priority === "urgent").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks, today]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false;
      if (clientFilter && t.client_id !== clientFilter) return false;
      if (projectFilter && t.client_project_id !== projectFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;

      switch (quickFilter) {
        case "overdue":
          return t.status !== "done" && isPastDue(t.due_date, today);
        case "today":
          return t.status !== "done" && t.due_date === today;
        case "soon":
          return t.status !== "done" && isDueSoon(t.due_date, 3, today) && t.due_date !== today;
        case "urgent":
          return t.priority === "urgent";
        case "done":
          return t.status === "done";
        default:
          return true;
      }
    });
  }, [tasks, query, clientFilter, projectFilter, statusFilter, priorityFilter, quickFilter, today]);

  const quickFilters: { value: QuickFilter; label: string }[] = [
    { value: "all", label: `All (${counts.all})` },
    { value: "overdue", label: `Overdue (${counts.overdue})` },
    { value: "today", label: `Due Today (${counts.today})` },
    { value: "soon", label: `Due Soon (${counts.soon})` },
    { value: "urgent", label: `Urgent (${counts.urgent})` },
    { value: "done", label: `Done (${counts.done})` },
  ];

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
          Tasks
        </Typography>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add task
        </Button>
      </Box>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
        {quickFilters.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            onClick={() => setQuickFilter(f.value)}
            color={quickFilter === f.value ? "primary" : "default"}
            variant={quickFilter === f.value ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mb: 4 }}>
        <TextField
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          sx={{ minWidth: { xs: "100%", sm: 200 }, flex: 1 }}
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
        <TextField select label="Client" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All clients</MenuItem>
          {clients.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All projects</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" sx={{ minWidth: 130 }}>
          <MenuItem value="">All statuses</MenuItem>
          {TASK_STATUSES.map((s) => (
            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} size="small" sx={{ minWidth: 130 }}>
          <MenuItem value="">All priorities</MenuItem>
          {TASK_PRIORITIES.map((p) => (
            <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      {filteredTasks.length === 0 ? (
        <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">
            {tasks.length === 0 ? "No tasks yet — add your first one." : "No tasks match these filters."}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <Stack spacing={1.5} sx={{ display: { xs: "flex", sm: "none" } }}>
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} today={today} onEdit={() => setEditingTask(task)} />
            ))}
          </Stack>

          {/* Desktop: table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "divider", display: { xs: "none", sm: "block" } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Title</TableCell>
                  <TableCell>Client / Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TaskRow key={task.id} task={task} today={today} onEdit={() => setEditingTask(task)} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {addOpen && (
        <TaskFormDialog clients={clients} projects={projects} onClose={() => setAddOpen(false)} />
      )}
      {editingTask && (
        <TaskFormDialog
          task={editingTask}
          clients={clients}
          projects={projects}
          onClose={() => setEditingTask(null)}
        />
      )}
    </Box>
  );
}

function TaskRow({
  task,
  today,
  onEdit,
}: {
  task: TaskWithRelations;
  today: string;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const overdue = task.status !== "done" && isPastDue(task.due_date, today);

  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox
          checked={task.status === "done"}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() =>
              setTaskStatus(
                task.id,
                e.target.checked ? "done" : "to_do",
                task.client_id,
                task.client_project_id
              )
            )
          }
        />
      </TableCell>
      <TableCell sx={{ textDecoration: task.status === "done" ? "line-through" : "none", opacity: task.status === "done" ? 0.6 : 1 }}>
        {task.title}
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {task.client_project?.name ?? task.client?.name ?? "—"}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={TASK_STATUSES.find((s) => s.value === task.status)?.label ?? task.status}
          color={TASK_STATUS_COLOR[task.status]}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={TASK_PRIORITIES.find((p) => p.value === task.priority)?.label ?? task.priority}
          color={TASK_PRIORITY_COLOR[task.priority]}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2" color={overdue ? "error.main" : "text.secondary"}>
          {formatDate(task.due_date) ?? "—"}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={onEdit}>
          <Pencil size={15} />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          disabled={isPending}
          onClick={() => {
            if (confirm(`Delete "${task.title}"?`)) {
              startTransition(() => deleteTask(task.id, task.client_id, task.client_project_id));
            }
          }}
        >
          <Trash2 size={15} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function TaskCard({
  task,
  today,
  onEdit,
}: {
  task: TaskWithRelations;
  today: string;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const overdue = task.status !== "done" && isPastDue(task.due_date, today);
  const done = task.status === "done";

  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Checkbox
          checked={done}
          disabled={isPending}
          sx={{ mt: -0.5, ml: -1 }}
          onChange={(e) =>
            startTransition(() =>
              setTaskStatus(
                task.id,
                e.target.checked ? "done" : "to_do",
                task.client_id,
                task.client_project_id
              )
            )
          }
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight={600}
            sx={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}
          >
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {task.client_project?.name ?? task.client?.name ?? "—"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ mt: -0.5, mr: -1 }}>
          <IconButton size="small" onClick={onEdit}>
            <Pencil size={15} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            disabled={isPending}
            onClick={() => {
              if (confirm(`Delete "${task.title}"?`)) {
                startTransition(() => deleteTask(task.id, task.client_id, task.client_project_id));
              }
            }}
          >
            <Trash2 size={15} />
          </IconButton>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mt: 1.5, pl: 4 }}>
        <Chip
          label={TASK_STATUSES.find((s) => s.value === task.status)?.label ?? task.status}
          color={TASK_STATUS_COLOR[task.status]}
          size="small"
        />
        <Chip
          label={TASK_PRIORITIES.find((p) => p.value === task.priority)?.label ?? task.priority}
          color={TASK_PRIORITY_COLOR[task.priority]}
          size="small"
        />
        <Typography variant="body2" color={overdue ? "error.main" : "text.secondary"} sx={{ ml: "auto" }}>
          {formatDate(task.due_date) ?? "No due date"}
        </Typography>
      </Stack>
    </Paper>
  );
}

export function TaskFormDialog({
  task,
  clients,
  projects,
  defaultProjectId,
  defaultClientId,
  onClose,
}: {
  task?: Task;
  clients: ClientOption[];
  projects: ProjectOption[];
  defaultProjectId?: string;
  defaultClientId?: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [projectId, setProjectId] = useState(task?.client_project_id ?? defaultProjectId ?? "");
  const [clientId, setClientId] = useState(
    task?.client_id ??
      projects.find((p) => p.id === (task?.client_project_id ?? defaultProjectId))?.client_id ??
      defaultClientId ??
      ""
  );

  function handleProjectChange(value: string) {
    setProjectId(value);
    const project = projects.find((p) => p.id === value);
    if (project) setClientId(project.client_id);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveTask(undefined, formData);
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
        <DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {task && <input type="hidden" name="id" value={task.id} />}
          <TextField name="title" label="Title" defaultValue={task?.title} required autoFocus fullWidth size="small" />
          <TextField
            name="description"
            label="Description"
            defaultValue={task?.description ?? ""}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />
          <TextField
            name="client_project_id"
            label="Project"
            select
            value={projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="">
              <em>No project</em>
            </MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </TextField>
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
          <Stack direction="row" spacing={2}>
            <TextField name="status" label="Status" select defaultValue={task?.status ?? "to_do"} fullWidth size="small">
              {TASK_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
            <TextField name="priority" label="Priority" select defaultValue={task?.priority ?? "medium"} fullWidth size="small">
              {TASK_PRIORITIES.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            name="due_date"
            label="Due date"
            type="date"
            defaultValue={task?.due_date ?? ""}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
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
