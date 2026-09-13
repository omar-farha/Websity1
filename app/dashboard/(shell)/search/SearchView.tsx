"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CheckSquare, FolderKanban, Search, Users } from "lucide-react";
import type { SearchClient, SearchProject, SearchTask } from "./types";

export default function SearchView({
  clients,
  projects,
  tasks,
  loadError,
}: {
  clients: SearchClient[];
  projects: SearchProject[];
  tasks: SearchTask[];
  loadError?: string;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matchedClients = useMemo(() => {
    if (!q) return [];
    return clients.filter((c) =>
      [c.name, c.company, c.email, c.phone].some((f) => f?.toLowerCase().includes(q))
    );
  }, [clients, q]);

  const matchedProjects = useMemo(() => {
    if (!q) return [];
    return projects.filter((p) =>
      [p.name, p.client?.name].some((f) => f?.toLowerCase().includes(q))
    );
  }, [projects, q]);

  const matchedTasks = useMemo(() => {
    if (!q) return [];
    return tasks.filter((t) =>
      [t.title, t.client?.name, t.client_project?.name].some((f) => f?.toLowerCase().includes(q))
    );
  }, [tasks, q]);

  const hasResults = matchedClients.length + matchedProjects.length + matchedTasks.length > 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Search
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Search across clients, projects, and tasks.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <TextField
        autoFocus
        placeholder="Type a name, company, email, or task title…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 3, maxWidth: 480 }}
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

      {!q ? (
        <Typography variant="body2" color="text.secondary">
          Start typing to search.
        </Typography>
      ) : !hasResults ? (
        <Typography variant="body2" color="text.secondary">
          No matches for &quot;{query}&quot;.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {matchedClients.length > 0 && (
            <ResultGroup title="Clients" icon={<Users size={16} />}>
              {matchedClients.map((c) => (
                <ResultRow key={c.id} href={`/dashboard/clients/${c.id}`} primary={c.name} secondary={c.company ?? c.email ?? undefined} />
              ))}
            </ResultGroup>
          )}
          {matchedProjects.length > 0 && (
            <ResultGroup title="Projects" icon={<FolderKanban size={16} />}>
              {matchedProjects.map((p) => (
                <ResultRow key={p.id} href={`/dashboard/projects/${p.id}`} primary={p.name} secondary={p.client?.name} />
              ))}
            </ResultGroup>
          )}
          {matchedTasks.length > 0 && (
            <ResultGroup title="Tasks" icon={<CheckSquare size={16} />}>
              {matchedTasks.map((t) => (
                <ResultRow
                  key={t.id}
                  href={
                    t.client_project_id
                      ? `/dashboard/projects/${t.client_project_id}`
                      : t.client_id
                        ? `/dashboard/clients/${t.client_id}`
                        : "/dashboard/tasks"
                  }
                  primary={t.title}
                  secondary={t.client_project?.name ?? t.client?.name}
                />
              ))}
            </ResultGroup>
          )}
        </Stack>
      )}
    </Box>
  );
}

function ResultGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="subtitle2">{title}</Typography>
      </Stack>
      <Stack spacing={0.5}>{children}</Stack>
    </Paper>
  );
}

function ResultRow({
  href,
  primary,
  secondary,
}: {
  href: string;
  primary: string;
  secondary?: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <Box sx={{ p: 1, borderRadius: 1.5, "&:hover": { bgcolor: "action.hover" } }}>
        <Typography variant="body2" fontWeight={500}>
          {primary}
        </Typography>
        {secondary && (
          <Typography variant="caption" color="text.secondary">
            {secondary}
          </Typography>
        )}
      </Box>
    </Link>
  );
}
