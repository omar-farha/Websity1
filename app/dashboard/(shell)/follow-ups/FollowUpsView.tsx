"use client";

import { useMemo } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatDate, isPastDue, todayISO } from "@/app/lib/dates";
import { COMMUNICATION_TYPES, type CommunicationWithClient } from "../communications/types";
import { computeAlerts } from "./alerts";
import type { AlertProject, AlertTask, LastContact } from "./types";

export default function FollowUpsView({
  communications,
  projects,
  tasks,
  allCommunications,
  loadError,
}: {
  communications: CommunicationWithClient[];
  projects: AlertProject[];
  tasks: AlertTask[];
  allCommunications: LastContact[];
  loadError?: string;
}) {
  const today = todayISO();

  const alerts = useMemo(
    () => computeAlerts({ projects, tasks, allCommunications, today }),
    [projects, tasks, allCommunications, today]
  );

  const buckets = useMemo(() => {
    const overdue = communications.filter((c) => isPastDue(c.next_follow_up_date, today));
    const dueToday = communications.filter((c) => c.next_follow_up_date === today);
    const upcoming = communications.filter(
      (c) => c.next_follow_up_date && c.next_follow_up_date > today
    );
    return { overdue, dueToday, upcoming };
  }, [communications, today]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Follow-ups
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Things that need your attention, and every planned check-in.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, borderColor: "divider", mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Needs attention
        </Typography>
        {alerts.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nothing needs attention right now.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mt: 1 }}>
            {alerts.map((a) => (
              <Link key={a.key} href={a.href} style={{ textDecoration: "none", color: "inherit" }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ p: 1, borderRadius: 1.5, "&:hover": { bgcolor: "action.hover" } }}
                >
                  {a.icon}
                  <Typography variant="body2">{a.message}</Typography>
                </Stack>
              </Link>
            ))}
          </Stack>
        )}
      </Paper>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
        <FollowUpColumn title="Overdue" color="error" items={buckets.overdue} />
        <FollowUpColumn title="Today" color="warning" items={buckets.dueToday} />
        <FollowUpColumn title="Upcoming" color="default" items={buckets.upcoming} />
      </Box>
    </Box>
  );
}

function FollowUpColumn({
  title,
  color,
  items,
}: {
  title: string;
  color: "error" | "warning" | "default";
  items: CommunicationWithClient[];
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Chip label={items.length} size="small" color={color} />
      </Stack>
      {items.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          Nothing here.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {items.map((c) => (
            <Link key={c.id} href={c.client ? `/dashboard/clients/${c.client.id}` : "#"} style={{ textDecoration: "none", color: "inherit" }}>
              <Box sx={{ p: 1, borderRadius: 1.5, border: "1px solid", borderColor: "divider", "&:hover": { borderColor: "primary.main" } }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {c.client?.name ?? "Unknown client"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {COMMUNICATION_TYPES.find((t) => t.value === c.type)?.label ?? c.type} · {formatDate(c.next_follow_up_date)}
                </Typography>
              </Box>
            </Link>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
