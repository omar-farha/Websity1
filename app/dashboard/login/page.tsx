"use client";

import { useActionState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        component="form"
        action={formAction}
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 360,
          p: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Dashboard login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the password to continue.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            name="password"
            type="password"
            label="Password"
            required
            autoComplete="current-password"
            fullWidth
            size="small"
          />

          {state?.error && (
            <Typography variant="body2" color="error">
              {state.error}
            </Typography>
          )}

          <Button type="submit" variant="contained" disabled={pending} fullWidth>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
