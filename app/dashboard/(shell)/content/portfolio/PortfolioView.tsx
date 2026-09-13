"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  deletePortfolioProject,
  reorderPortfolio,
  savePortfolioProject,
  togglePortfolioVisible,
} from "./actions";
import type { PortfolioProject } from "./types";

export default function PortfolioView({
  projects,
  loadError,
}: {
  projects: PortfolioProject[];
  loadError?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = [...projects].sort((a, b) => a.sort_order - b.sort_order);
  const items = sorted.map((p) => ({ id: p.id, sort_order: p.sort_order }));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Portfolio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {projects.length} {projects.length === 1 ? "project" : "projects"} — shown on the public site
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add project
        </Button>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Stack spacing={2}>
        {sorted.map((p, index) => (
          <Card key={p.id} variant="outlined" sx={{ borderColor: "divider", opacity: p.is_visible ? 1 : 0.5 }}>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ position: "relative", width: 96, height: 64, flexShrink: 0, borderRadius: 1, overflow: "hidden", bgcolor: "black" }}>
                <Image src={p.image_url} alt={p.title} fill sizes="96px" style={{ objectFit: "cover" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600} noWrap>
                    {p.title}
                  </Typography>
                  {p.featured && <Chip icon={<Star size={12} />} label="Featured" size="small" color="warning" />}
                  {!p.is_visible && <Chip label="Hidden" size="small" variant="outlined" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {p.tagline}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton
                  size="small"
                  disabled={isPending || index === 0}
                  onClick={() => startTransition(() => reorderPortfolio(items, p.id, "up"))}
                >
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={isPending || index === sorted.length - 1}
                  onClick={() => startTransition(() => reorderPortfolio(items, p.id, "down"))}
                >
                  <ArrowDown size={15} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={isPending}
                  onClick={() => startTransition(() => togglePortfolioVisible(p.id, p.slug, !p.is_visible))}
                  title={p.is_visible ? "Hide from site" : "Show on site"}
                >
                  {p.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </IconButton>
                <IconButton size="small" onClick={() => setEditing(p)}>
                  <Pencil size={15} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm(`Delete "${p.title}"? This can't be undone.`)) {
                      startTransition(() => deletePortfolioProject(p.id, p.slug));
                    }
                  }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
            <Typography color="text.secondary">No portfolio projects yet.</Typography>
          </Box>
        )}
      </Stack>

      {addOpen && <PortfolioFormDialog onClose={() => setAddOpen(false)} />}
      {editing && <PortfolioFormDialog project={editing} onClose={() => setEditing(null)} />}
    </Box>
  );
}

function PortfolioFormDialog({
  project,
  onClose,
}: {
  project?: PortfolioProject;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await savePortfolioProject(undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form action={handleSubmit}>
        {project && <input type="hidden" name="id" value={project.id} />}
        {project && <input type="hidden" name="existing_image_url" value={project.image_url} />}
        <DialogTitle>{project ? "Edit project" : "Add project"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="title" label="Title" defaultValue={project?.title} required autoFocus fullWidth size="small" />
          <TextField
            name="slug"
            label="URL slug (leave blank to auto-generate)"
            defaultValue={project?.slug}
            fullWidth
            size="small"
          />
          <TextField name="tagline" label="Tagline (one line)" defaultValue={project?.tagline} fullWidth size="small" />
          <TextField
            name="description"
            label="Full description"
            defaultValue={project?.description}
            fullWidth
            size="small"
            multiline
            minRows={3}
          />
          <Stack direction="row" spacing={2}>
            <TextField name="role" label="Role" defaultValue={project?.role ?? "Design & Development"} fullWidth size="small" />
            <TextField name="year" label="Year" type="number" defaultValue={project?.year ?? new Date().getFullYear()} fullWidth size="small" />
          </Stack>
          <TextField name="tags" label="Tags (comma separated)" defaultValue={project?.tags.join(", ")} fullWidth size="small" />
          <TextField name="stack" label="Tech stack (comma separated)" defaultValue={project?.stack.join(", ")} fullWidth size="small" />
          <TextField name="live_url" label="Live site URL" defaultValue={project?.live_url ?? ""} fullWidth size="small" />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              {project ? "Replace image (optional)" : "Image"}
            </Typography>
            <input type="file" name="image" accept="image/*" />
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Testimonial
          </Typography>
          <TextField name="testimonial_name" label="Client name" defaultValue={project?.testimonial_name ?? ""} fullWidth size="small" />
          <TextField name="testimonial_role" label="Client role / company" defaultValue={project?.testimonial_role ?? ""} fullWidth size="small" />
          <TextField
            name="testimonial_rating"
            label="Rating (1-5)"
            type="number"
            slotProps={{ htmlInput: { min: 1, max: 5 } }}
            defaultValue={project?.testimonial_rating ?? 5}
            fullWidth
            size="small"
          />
          <TextField
            name="testimonial_quote"
            label="Quote"
            defaultValue={project?.testimonial_quote ?? ""}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />

          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={<Switch name="is_visible" defaultChecked={project?.is_visible ?? true} />}
              label="Visible on site"
            />
            <FormControlLabel
              control={<Switch name="featured" defaultChecked={project?.featured ?? false} />}
              label="Featured"
            />
          </Stack>

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
