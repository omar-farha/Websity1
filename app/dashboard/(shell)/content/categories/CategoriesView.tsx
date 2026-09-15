"use client";

import { useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteCategory, reorderCategory, saveCategory } from "./actions";
import type { Category } from "./types";

export default function CategoriesView({
  categories,
  loadError,
}: {
  categories: Category[];
  loadError?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
  const items = sorted.map((c) => ({ id: c.id, sort_order: c.sort_order }));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The business types (Brands, Gym &amp; Sportswear, Clinics…) used to filter projects and tag leads
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add category
        </Button>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Stack spacing={1.5}>
        {sorted.map((c, index) => (
          <Card key={c.id} variant="outlined" sx={{ borderColor: "divider" }}>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center", py: "12px !important" }}>
              <Typography fontWeight={600} sx={{ flex: 1 }}>
                {c.name}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" disabled={isPending || index === 0} onClick={() => startTransition(() => reorderCategory(items, c.id, "up"))}>
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton size="small" disabled={isPending || index === sorted.length - 1} onClick={() => startTransition(() => reorderCategory(items, c.id, "down"))}>
                  <ArrowDown size={15} />
                </IconButton>
                <IconButton size="small" onClick={() => setEditing(c)}>
                  <Pencil size={15} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm(`Delete "${c.name}"? Projects or leads already using it will keep the name, but it won't be offered as a choice anymore.`)) {
                      startTransition(() => deleteCategory(c.id));
                    }
                  }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
            <Typography color="text.secondary">No categories yet.</Typography>
          </Box>
        )}
      </Stack>

      {addOpen && <CategoryFormDialog onClose={() => setAddOpen(false)} />}
      {editing && <CategoryFormDialog category={editing} onClose={() => setEditing(null)} />}
    </Box>
  );
}

function CategoryFormDialog({ category, onClose }: { category?: Category; onClose: () => void }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveCategory(undefined, formData);
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
        {category && <input type="hidden" name="id" value={category.id} />}
        {category && <input type="hidden" name="previous_name" value={category.name} />}
        <DialogTitle>{category ? "Rename category" : "Add category"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="name" label="Name" defaultValue={category?.name} required autoFocus fullWidth size="small" />
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
