import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function DashboardLoading() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
      <CircularProgress size={28} />
    </Box>
  );
}
