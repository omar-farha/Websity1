"use client";

import { useState, useTransition } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { addLink, deleteLink } from "./actions";
import { LINK_CATEGORIES, type LinkItem } from "./types";

export default function LinksList({
  links,
  clientId,
  clientProjectId,
}: {
  links: LinkItem[];
  clientId?: string;
  clientProjectId?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const grouped = LINK_CATEGORIES.map((cat) => ({
    ...cat,
    links: links.filter((l) => l.category === cat.value),
  })).filter((g) => g.links.length > 0);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle2" color="text.secondary">
          Files &amp; Links
        </Typography>
        <Button size="small" startIcon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
          Add link
        </Button>
      </Box>

      {grouped.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No links added yet.
        </Typography>
      ) : (
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {grouped.map((group) => (
            <Box key={group.value}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                {group.label}
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                {group.links.map((link) => (
                  <Stack key={link.id} direction="row" justifyContent="space-between" alignItems="center">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "inherit", minWidth: 0 }}
                    >
                      <ExternalLink size={13} />
                      <Typography variant="body2" noWrap sx={{ "&:hover": { color: "primary.main" } }}>
                        {link.label}
                      </Typography>
                    </a>
                    <IconButton
                      size="small"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => deleteLink(link.id, link.client_id, link.client_project_id))
                      }
                    >
                      <Trash2 size={13} />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {addOpen && (
        <AddLinkDialog clientId={clientId} clientProjectId={clientProjectId} onClose={() => setAddOpen(false)} />
      )}
    </Box>
  );
}

function AddLinkDialog({
  clientId,
  clientProjectId,
  onClose,
}: {
  clientId?: string;
  clientProjectId?: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addLink(undefined, formData);
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
        {clientId && <input type="hidden" name="client_id" value={clientId} />}
        {clientProjectId && <input type="hidden" name="client_project_id" value={clientProjectId} />}
        <DialogTitle>Add link</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="category" label="Category" select required defaultValue="other" fullWidth size="small">
            {LINK_CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
            ))}
          </TextField>
          <TextField name="label" label="Label" required autoFocus fullWidth size="small" />
          <TextField name="url" label="URL" required fullWidth size="small" placeholder="https://…" />
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
