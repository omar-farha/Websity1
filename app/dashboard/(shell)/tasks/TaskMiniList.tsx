"use client";

import { useTransition } from "react";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Trash2 } from "lucide-react";
import { formatDate, isPastDue, todayISO } from "@/app/lib/dates";
import { deleteTask, setTaskStatus } from "./actions";
import { TASK_PRIORITIES, TASK_PRIORITY_COLOR, type TaskWithRelations } from "./types";

export default function TaskMiniList({ tasks }: { tasks: TaskWithRelations[] }) {
  const today = todayISO();

  if (tasks.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        No tasks yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      {tasks.map((task) => (
        <TaskMiniRow key={task.id} task={task} today={today} />
      ))}
    </Stack>
  );
}

function TaskMiniRow({ task, today }: { task: TaskWithRelations; today: string }) {
  const [isPending, startTransition] = useTransition();
  const overdue = task.status !== "done" && isPastDue(task.due_date, today);

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
      <Checkbox
        size="small"
        checked={task.status === "done"}
        disabled={isPending}
        onChange={(e) =>
          startTransition(() =>
            setTaskStatus(
              task.id,
              e.target.checked ? "done" : "to_do",
              task.client_id,
              task.client_project_id
            )
          )
        }
      />
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          textDecoration: task.status === "done" ? "line-through" : "none",
          opacity: task.status === "done" ? 0.6 : 1,
        }}
        noWrap
      >
        {task.title}
      </Typography>
      <Chip
        label={TASK_PRIORITIES.find((p) => p.value === task.priority)?.label ?? task.priority}
        color={TASK_PRIORITY_COLOR[task.priority]}
        size="small"
      />
      {task.due_date && (
        <Typography variant="caption" color={overdue ? "error.main" : "text.secondary"} sx={{ minWidth: 70 }}>
          {formatDate(task.due_date)}
        </Typography>
      )}
      <IconButton
        size="small"
        color="error"
        disabled={isPending}
        onClick={() => {
          if (confirm(`Delete "${task.title}"?`)) {
            startTransition(() => deleteTask(task.id, task.client_id, task.client_project_id));
          }
        }}
      >
        <Trash2 size={14} />
      </IconButton>
    </Stack>
  );
}
