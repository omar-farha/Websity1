"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
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
import { Building2, Mail, Phone, Plus, Search } from "lucide-react";
import { saveClient } from "./actions";
import PulseDot from "./PulseDot";
import {
  CLIENT_STATUSES,
  CLIENT_STATUS_COLOR,
  WEBSITE_TYPES,
  type Client,
} from "./types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ClientsView({
  clients,
  loadError,
}: {
  clients: Client[];
  loadError?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.email, c.phone, c.company].some((field) =>
        field?.toLowerCase().includes(q)
      )
    );
  }, [clients, query]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Clients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add client
        </Button>
      </Box>

      <TextField
        placeholder="Search clients by name, company, email, or phone…"
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

      {filteredClients.length === 0 ? (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            py: 8,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            {clients.length === 0 ? "No clients yet — add your first one." : "No clients match your search."}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
          }}
        >
          {filteredClients.map((client) => (
            <Card key={client.id} variant="outlined" sx={{ borderColor: "divider" }}>
              <CardActionArea component={Link} href={`/dashboard/clients/${client.id}`}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700 }}>
                      {initials(client.name) || "?"}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography fontWeight={600} noWrap>
                          {client.name}
                        </Typography>
                        {client.status === "active" && <PulseDot size={8} />}
                      </Stack>
                      {client.company && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Building2 size={13} /> {client.company}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Chip
                    label={CLIENT_STATUSES.find((s) => s.value === client.status)?.label ?? client.status}
                    color={CLIENT_STATUS_COLOR[client.status]}
                    size="small"
                    sx={{ mb: 1.5 }}
                  />

                  <Stack spacing={0.5}>
                    {client.email && (
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Mail size={13} /> {client.email}
                      </Typography>
                    )}
                    {client.phone && (
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Phone size={13} /> {client.phone}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      {addOpen && <AddClientDialog onClose={() => setAddOpen(false)} />}
    </Box>
  );
}

function AddClientDialog({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveClient(undefined, formData);
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
        <DialogTitle>Add client</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField name="name" label="Name" required autoFocus fullWidth size="small" />
          <TextField name="company" label="Company" fullWidth size="small" />
          <TextField name="email" type="email" label="Email" fullWidth size="small" />
          <TextField name="phone" label="Phone" fullWidth size="small" />
          <TextField name="status" label="Status" select defaultValue="lead" fullWidth size="small">
            {CLIENT_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="start_date"
            label="Start date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
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
