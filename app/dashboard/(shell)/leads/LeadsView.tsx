"use client";

import { useMemo, useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Phone, Trash2, UserPlus } from "lucide-react";
import { PROJECT_CATEGORIES } from "@/app/lib/constants";
import { convertLeadToClient, deleteLead, updateLeadStatus } from "./actions";
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
  const [convertError, setConvertError] = useState<string | null>(null);

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
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}
      {convertError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setConvertError(null)}>
          {convertError}
        </Alert>
      )}

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
                        disabled={isPending}
                        onClick={() => {
                          if (confirm(`Convert "${lead.name}" into a client?`)) {
                            startTransition(async () => {
                              const result = await convertLeadToClient(lead);
                              setConvertError(result?.error ?? null);
                            });
                          }
                        }}
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
    </Box>
  );
}
