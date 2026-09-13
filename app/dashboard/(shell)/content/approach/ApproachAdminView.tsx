"use client";

import { useState, useTransition } from "react";
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
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteApproachStep, reorderApproach, saveApproachStep, toggleApproachVisible } from "./actions";
import type { ApproachStep } from "./types";

export default function ApproachAdminView({
  steps,
  loadError,
}: {
  steps: ApproachStep[];
  loadError?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ApproachStep | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = [...steps].sort((a, b) => a.sort_order - b.sort_order);
  const items = sorted.map((s) => ({ id: s.id, sort_order: s.sort_order }));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Approach
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Shown on the homepage&apos;s process timeline
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add step
        </Button>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Stack spacing={1.5}>
        {sorted.map((s, index) => (
          <Card key={s.id} variant="outlined" sx={{ borderColor: "divider", opacity: s.is_visible ? 1 : 0.5 }}>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: s.icon_bg,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {s.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600} noWrap>
                    {s.title}
                  </Typography>
                  {!s.is_visible && <Chip label="Hidden" size="small" variant="outlined" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {s.points[0] ?? ""}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" disabled={isPending || index === 0} onClick={() => startTransition(() => reorderApproach(items, s.id, "up"))}>
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton size="small" disabled={isPending || index === sorted.length - 1} onClick={() => startTransition(() => reorderApproach(items, s.id, "down"))}>
                  <ArrowDown size={15} />
                </IconButton>
                <IconButton size="small" disabled={isPending} onClick={() => startTransition(() => toggleApproachVisible(s.id, !s.is_visible))}>
                  {s.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </IconButton>
                <IconButton size="small" onClick={() => setEditing(s)}>
                  <Pencil size={15} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm(`Delete "${s.title}"?`)) startTransition(() => deleteApproachStep(s.id));
                  }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {steps.length === 0 && (
          <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
            <Typography color="text.secondary">No approach steps yet.</Typography>
          </Box>
        )}
      </Stack>

      {addOpen && <ApproachFormDialog onClose={() => setAddOpen(false)} />}
      {editing && <ApproachFormDialog step={editing} onClose={() => setEditing(null)} />}
    </Box>
  );
}

function ApproachFormDialog({ step, onClose }: { step?: ApproachStep; onClose: () => void }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveApproachStep(undefined, formData);
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
        {step && <input type="hidden" name="id" value={step.id} />}
        <DialogTitle>{step ? "Edit step" : "Add step"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="title" label="Title" defaultValue={step?.title} required autoFocus fullWidth size="small" />
          <Stack direction="row" spacing={2}>
            <TextField name="icon" label="Icon (e.g. a number)" defaultValue={step?.icon} required fullWidth size="small" />
            <TextField name="icon_bg" label="Icon color (hex)" defaultValue={step?.icon_bg ?? "#0fd8d7"} fullWidth size="small" />
          </Stack>
          <TextField name="date_label" label="Date label" defaultValue={step?.date_label ?? "Stage"} fullWidth size="small" />
          <TextField
            name="points"
            label="Points (one per line)"
            defaultValue={step?.points.join("\n")}
            fullWidth
            size="small"
            multiline
            minRows={3}
          />
          <FormControlLabel
            control={<Switch name="is_visible" defaultChecked={step?.is_visible ?? true} />}
            label="Visible on site"
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
