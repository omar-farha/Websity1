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
import { Plus, Trash2 } from "lucide-react";
import { formatDate, todayISO } from "@/app/lib/dates";
import { deleteCommunication, logCommunication } from "./actions";
import { COMMUNICATION_TYPES, type Communication } from "./types";

export default function CommunicationLog({
  clientId,
  communications,
}: {
  clientId: string;
  communications: Communication[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle2" color="text.secondary">
          Communication log
        </Typography>
        <Button size="small" startIcon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
          Log contact
        </Button>
      </Box>

      {communications.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No contact logged yet.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {communications.map((c) => (
            <Stack key={c.id} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">
                  <strong>{COMMUNICATION_TYPES.find((t) => t.value === c.type)?.label ?? c.type}</strong>
                  {" — "}
                  {formatDate(c.contacted_at)}
                  {c.next_follow_up_date && ` · follow up ${formatDate(c.next_follow_up_date)}`}
                </Typography>
                {c.notes && (
                  <Typography variant="caption" color="text.secondary">
                    {c.notes}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                disabled={isPending}
                onClick={() => startTransition(() => deleteCommunication(c.id, clientId))}
              >
                <Trash2 size={13} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}

      {addOpen && <LogContactDialog clientId={clientId} onClose={() => setAddOpen(false)} />}
    </Box>
  );
}

function LogContactDialog({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await logCommunication(undefined, formData);
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
        <input type="hidden" name="client_id" value={clientId} />
        <DialogTitle>Log contact</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="type" label="Type" select required defaultValue="whatsapp" fullWidth size="small">
            {COMMUNICATION_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            name="contacted_at"
            label="Date"
            type="date"
            defaultValue={todayISO()}
            required
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="next_follow_up_date"
            label="Next follow-up (optional)"
            type="date"
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField name="notes" label="Notes" fullWidth size="small" multiline minRows={2} />
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
