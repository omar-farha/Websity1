"use client";

import { useMemo, useState, useTransition } from "react";
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
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Phone, Plus, Trash2, UserPlus } from "lucide-react";
import { PROJECT_CATEGORIES } from "@/app/lib/constants";
import { WEBSITE_TYPES } from "../clients/types";
import { createLead, convertLeadToClient, deleteLead, updateLeadStatus } from "./actions";
import { LEAD_STATUSES, LEAD_STATUS_COLOR, type Lead, type LeadStatus } from "./types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LeadsView({
  leads,
  loadError,
}: {
  leads: Lead[];
  loadError?: string;
}) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [converting, setConverting] = useState<Lead | null>(null);

  const filtered = useMemo(
    () =>
      categoryFilter === "All"
        ? leads
        : leads.filter((lead) => lead.category === categoryFilter),
    [leads, categoryFilter]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Leads
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {leads.length} {leads.length === 1 ? "submission" : "submissions"} from the site&apos;s contact form
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            select
            size="small"
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="All">All categories</MenuItem>
            {PROJECT_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add lead
          </Button>
        </Stack>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      {filtered.length === 0 ? (
        <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">
            {leads.length === 0
              ? "No leads yet — submissions from the site's contact form will show up here."
              : "No leads in this category."}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filtered.map((lead) => (
            <Card key={lead.id} variant="outlined" sx={{ borderColor: "divider" }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography fontWeight={600}>{lead.name}</Typography>
                      <Chip label={lead.category} size="small" variant="outlined" />
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
                      <Phone size={13} />
                      <Typography
                        component="a"
                        href={`tel:${lead.phone}`}
                        variant="body2"
                        color="text.secondary"
                        sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        {lead.phone}
                      </Typography>
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      select
                      size="small"
                      value={lead.status}
                      disabled={isPending}
                      onChange={(e) =>
                        startTransition(() =>
                          updateLeadStatus(lead.id, e.target.value as LeadStatus)
                        )
                      }
                      sx={{ minWidth: 130 }}
                    >
                      {LEAD_STATUSES.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Chip
                      label={LEAD_STATUSES.find((s) => s.value === lead.status)?.label}
                      color={LEAD_STATUS_COLOR[lead.status]}
                      size="small"
                      sx={{ display: { xs: "none", md: "inline-flex" } }}
                    />
                    {lead.status !== "won" && lead.status !== "lost" && (
                      <IconButton
                        size="small"
                        color="success"
                        title="Convert to client"
                        onClick={() => setConverting(lead)}
                      >
                        <UserPlus size={15} />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      disabled={isPending}
                      onClick={() => {
                        if (confirm(`Delete the lead from "${lead.name}"? This can't be undone.`)) {
                          startTransition(() => deleteLead(lead.id));
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Expected budget
                    </Typography>
                    <Typography variant="body2">{lead.budget}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Clients per month
                    </Typography>
                    <Typography variant="body2">{lead.monthly_clients}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Expected timeline
                    </Typography>
                    <Typography variant="body2">{lead.timeline}</Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                  Submitted {formatDateTime(lead.created_at)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {addOpen && <LeadFormDialog onClose={() => setAddOpen(false)} />}
      {converting && <ConvertLeadDialog lead={converting} onClose={() => setConverting(null)} />}
    </Box>
  );
}

function LeadFormDialog({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createLead(undefined, formData);
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
        <DialogTitle>Add lead</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            For a lead that came in outside the site&apos;s contact form — a call, WhatsApp, or referral.
          </Typography>
          <TextField name="name" label="Name" required autoFocus fullWidth size="small" />
          <TextField name="phone" label="Phone" required fullWidth size="small" />
          <TextField name="category" label="Category" select required defaultValue="" fullWidth size="small">
            {PROJECT_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField name="budget" label="Expected budget" fullWidth size="small" />
          <TextField name="monthly_clients" label="Clients handled per month (approx.)" fullWidth size="small" />
          <TextField name="timeline" label="Expected timeline" fullWidth size="small" />
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

function ConvertLeadDialog({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await convertLeadToClient(undefined, formData);
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
        <input type="hidden" name="lead_id" value={lead.id} />
        <DialogTitle>Convert to client</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Creates a client from this lead. Optionally start their first project at the same time.
          </Typography>
          <TextField name="name" label="Client name" defaultValue={lead.name} required autoFocus fullWidth size="small" />
          <TextField name="phone" label="Phone" defaultValue={lead.phone} required fullWidth size="small" />

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            First project (optional)
          </Typography>
          <TextField name="project_name" label="Project name" fullWidth size="small" />
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
          <Stack direction="row" spacing={2}>
            <TextField name="cost" label="Cost" type="number" fullWidth size="small" />
            <TextField
              name="due_date"
              label="Due date"
              type="date"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
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
          <Button type="submit" variant="contained" color="success" disabled={isPending}>
            {isPending ? "Converting…" : "Convert"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
