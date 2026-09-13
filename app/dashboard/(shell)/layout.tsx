import Box from "@mui/material/Box";
import DashboardSidebar from "./DashboardSidebar";
import "./shellBackground.css";

export default function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100dvh" }}>
      <div className="dashboard-aurora">
        <span className="orb o1" />
        <span className="orb o2" />
        <span className="orb o3" />
      </div>
      <DashboardSidebar />
      <Box component="main" sx={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        {children}
      </Box>
    </Box>
  );
}
