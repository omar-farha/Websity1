"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ArrowLeft } from "lucide-react";
import { setBudget } from "./actions";
import type { BudgetRow } from "./types";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(value);
}

export default function BudgetsView({
  rows,
  loadError,
}: {
  rows: BudgetRow[];
  loadError?: string;
}) {
  const totalBudgeted = rows.reduce((sum, r) => sum + (r.monthlyLimit ?? 0), 0);
  const totalSpent = rows.reduce((sum, r) => sum + r.spent, 0);

  return (
    <Box>
      <Link href="/dashboard/finance" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", marginBottom: 16 }}>
        <ArrowLeft size={16} />
        <Typography variant="body2" color="text.secondary">Back to Finance</Typography>
      </Link>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Budgets</Typography>
        <Typography variant="body2" color="text.secondary">
          {formatMoney(totalSpent)} spent of {formatMoney(totalBudgeted)} budgeted this month
        </Typography>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "divider" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Monthly budget</TableCell>
              <TableCell align="right">Spent this month</TableCell>
              <TableCell align="right">Remaining</TableCell>
              <TableCell sx={{ width: 160 }}>Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <BudgetTableRow key={row.category} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function BudgetTableRow({ row }: { row: BudgetRow }) {
  const [value, setValue] = useState(row.monthlyLimit !== null ? String(row.monthlyLimit) : "");
  const [isPending, startTransition] = useTransition();

  const limit = row.monthlyLimit;
  const remaining = limit !== null ? limit - row.spent : null;
  const pct = limit && limit > 0 ? Math.min((row.spent / limit) * 100, 100) : 0;
  const over = limit !== null && row.spent > limit;

  function handleBlur() {
    const parsed = value.trim() === "" ? 0 : Number(value);
    if (parsed === (row.monthlyLimit ?? 0)) return;
    startTransition(() => {
      setBudget(row.category, parsed);
    });
  }

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>{row.category}</Typography>
      </TableCell>
      <TableCell align="right">
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          disabled={isPending}
          type="number"
          size="small"
          placeholder="Not set"
          sx={{ width: 120 }}
          slotProps={{ htmlInput: { min: 0, style: { textAlign: "right" } } }}
        />
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">{formatMoney(row.spent)}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" color={over ? "error.main" : "text.secondary"} fontWeight={over ? 700 : 400}>
          {remaining !== null ? formatMoney(remaining) : "—"}
        </Typography>
      </TableCell>
      <TableCell>
        {limit !== null && limit > 0 ? (
          <LinearProgress
            variant="determinate"
            value={pct}
            color={over ? "error" : pct > 80 ? "warning" : "primary"}
            sx={{ borderRadius: 1, height: 6 }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">No budget set</Typography>
        )}
      </TableCell>
    </TableRow>
  );
}
