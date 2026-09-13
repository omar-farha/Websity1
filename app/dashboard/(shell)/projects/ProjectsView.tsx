"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Plus, Search, User } from "lucide-react";
import { saveProject } from "./actions";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_COLOR,
  WEBSITE_TYPES,
  type ClientProjectWithClient,
} from "./types";

type ClientOption = { id: string; name: string };

function formatMoney(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(value);
}

export default function ProjectsView({
  projects,
  clients,
  loadError,
}: {
  projects: ClientProjectWithClient[];
  clients: ClientOption[];
  loadError?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.name, p.client?.name].some((field) => field?.toLowerCase().includes(q))
    );
  }, [projects, query]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => setAddOpen(true)}
          disabled={clients.length === 0}
        >
          Add project
        </Button>
      </Box>

      {clients.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add a client first — every project needs to belong to one.
        </Alert>
      )}

      <TextField
        placeholder="Search projects by name or client…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 3 }}
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

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      {filteredProjects.length === 0 ? (
        <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">
            {projects.length === 0 ? "No projects yet — add your first one." : "No projects match your search."}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          }}
        >
          {filteredProjects.map((project) => {
            const remaining = project.cost !== null ? project.cost - project.paid_amount : null;
            return (
              <Card key={project.id} variant="outlined" sx={{ borderColor: "divider" }}>
                <CardActionArea component={Link} href={`/dashboard/projects/${project.id}`}>
                  <CardContent>
                    <Typography fontWeight={600} noWrap>
                      {project.name}
                    </Typography>
                    {project.client && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
                      >
                        <User size={13} /> {project.client.name}
                      </Typography>
                    )}

                    <Chip
                      label={PROJECT_STATUSES.find((s) => s.value === project.status)?.label ?? project.status}
                      color={PROJECT_STATUS_COLOR[project.status]}
                      size="small"
                      sx={{ mt: 1.5, mb: 1.5 }}
                    />

                    {project.cost !== null && (
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption" color="text.secondary">
                          Cost {formatMoney(project.cost)}
                        </Typography>
                        <Typography variant="caption" color={remaining && remaining > 0 ? "warning.main" : "success.main"}>
                          {remaining && remaining > 0 ? `${formatMoney(remaining)} left` : "Paid in full"}
                        </Typography>
                      </Stack>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      )}

      {addOpen && <AddProjectDialog clients={clients} onClose={() => setAddOpen(false)} />}
    </Box>
  );
}

function AddProjectDialog({
  clients,
  onClose,
}: {
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
        <DialogTitle>Add project</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="name" label="Project name" required autoFocus fullWidth size="small" />
          <TextField name="client_id" label="Client" select required defaultValue="" fullWidth size="small">
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
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
            <TextField
              name="due_date"
              label="Due date"
              type="date"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
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
