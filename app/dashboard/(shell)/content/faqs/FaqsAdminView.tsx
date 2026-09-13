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
import { deleteFaq, reorderFaq, saveFaq, toggleFaqVisible } from "./actions";
import type { Faq } from "./types";

export default function FaqsAdminView({
  faqs,
  loadError,
}: {
  faqs: Faq[];
  loadError?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = [...faqs].sort((a, b) => a.sort_order - b.sort_order);
  const items = sorted.map((f) => ({ id: f.id, sort_order: f.sort_order }));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            FAQs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Shown on the homepage&apos;s FAQ section
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add FAQ
        </Button>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Stack spacing={1.5}>
        {sorted.map((f, index) => (
          <Card key={f.id} variant="outlined" sx={{ borderColor: "divider", opacity: f.is_visible ? 1 : 0.5 }}>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600} noWrap>
                    {f.question}
                  </Typography>
                  {!f.is_visible && <Chip label="Hidden" size="small" variant="outlined" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {f.answer}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" disabled={isPending || index === 0} onClick={() => startTransition(() => reorderFaq(items, f.id, "up"))}>
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton size="small" disabled={isPending || index === sorted.length - 1} onClick={() => startTransition(() => reorderFaq(items, f.id, "down"))}>
                  <ArrowDown size={15} />
                </IconButton>
                <IconButton size="small" disabled={isPending} onClick={() => startTransition(() => toggleFaqVisible(f.id, !f.is_visible))}>
                  {f.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </IconButton>
                <IconButton size="small" onClick={() => setEditing(f)}>
                  <Pencil size={15} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm("Delete this FAQ?")) startTransition(() => deleteFaq(f.id));
                  }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {faqs.length === 0 && (
          <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
            <Typography color="text.secondary">No FAQs yet.</Typography>
          </Box>
        )}
      </Stack>

      {addOpen && <FaqFormDialog onClose={() => setAddOpen(false)} />}
      {editing && <FaqFormDialog faq={editing} onClose={() => setEditing(null)} />}
    </Box>
  );
}

function FaqFormDialog({ faq, onClose }: { faq?: Faq; onClose: () => void }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveFaq(undefined, formData);
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
        {faq && <input type="hidden" name="id" value={faq.id} />}
        <DialogTitle>{faq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="question" label="Question" defaultValue={faq?.question} required autoFocus fullWidth size="small" />
          <TextField
            name="answer"
            label="Answer"
            defaultValue={faq?.answer}
            required
            fullWidth
            size="small"
            multiline
            minRows={3}
          />
          <FormControlLabel
            control={<Switch name="is_visible" defaultChecked={faq?.is_visible ?? true} />}
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
