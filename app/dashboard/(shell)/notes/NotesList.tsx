"use client";

import { useTransition } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Trash2 } from "lucide-react";
import { addNote, deleteNote } from "./actions";
import type { Note } from "./types";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotesList({
  notes,
  clientId,
  clientProjectId,
  leadId,
}: {
  notes: Note[];
  clientId?: string;
  clientProjectId?: string;
  leadId?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addNote(undefined, formData);
    });
  }

  return (
    <Box>
      <form action={handleAdd}>
        {clientId && <input type="hidden" name="client_id" value={clientId} />}
        {clientProjectId && <input type="hidden" name="client_project_id" value={clientProjectId} />}
        {leadId && <input type="hidden" name="lead_id" value={leadId} />}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            name="body"
            placeholder="Add a note…"
            size="small"
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
          />
          <Button type="submit" variant="outlined" disabled={isPending} sx={{ flexShrink: 0 }}>
            Add
          </Button>
        </Stack>
      </form>

      {notes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          No notes yet.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {notes.map((note) => (
            <Stack
              key={note.id}
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1}
              sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {note.body}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(note.created_at)}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() =>
                  startTransition(() =>
                    deleteNote(note.id, note.client_id, note.client_project_id, note.lead_id)
                  )
                }
              >
                <Trash2 size={13} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}
