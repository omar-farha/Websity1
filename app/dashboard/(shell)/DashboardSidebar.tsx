"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Wallet,
  BellRing,
  FileText,
  Search,
  Inbox,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react";
import { signOut } from "@/app/dashboard/actions";

export const DASHBOARD_DRAWER_WIDTH = 240;

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, ready: true },
  { label: "Search", href: "/dashboard/search", icon: Search, ready: true },
  { label: "Leads", href: "/dashboard/leads", icon: Inbox, ready: true },
  { label: "Clients", href: "/dashboard/clients", icon: Users, ready: true },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban, ready: true },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, ready: true },
  { label: "Finance", href: "/dashboard/finance", icon: Wallet, ready: true },
  { label: "Follow-ups", href: "/dashboard/follow-ups", icon: BellRing, ready: true },
  { label: "Content", href: "/dashboard/content", icon: FileText, ready: true },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <List sx={{ px: 1, flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (!item.ready) {
            return (
              <ListItemButton key={item.href} disabled sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText primary={item.label} />
                <Chip label="Soon" size="small" variant="outlined" />
              </ListItemButton>
            );
          }

          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={isActive}
              onClick={onNavigate}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon size={18} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 1 }}>
        <form action={signOut}>
          <ListItemButton type="submit" component="button" sx={{ borderRadius: 2, width: "100%" }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogOut size={18} />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItemButton>
        </form>
      </Box>
    </>
  );
}

export default function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar — replaces the permanent sidebar below the md breakpoint */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(12px)",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon size={22} />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "primary.main" }}>
            Websity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Desktop permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DASHBOARD_DRAWER_WIDTH,
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          [`& .MuiDrawer-paper`]: {
            width: DASHBOARD_DRAWER_WIDTH - 16,
            boxSizing: "border-box",
            margin: "16px 0 16px 16px",
            height: "calc(100% - 32px)",
            borderRadius: "18px",
            border: "1px solid rgba(255, 255, 255, 0.09)",
          },
        }}
      >
        <Toolbar>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "primary.main" }}>
            Websity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Dashboard
          </Typography>
        </Toolbar>
        <NavList />
      </Drawer>

      {/* Mobile temporary sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          [`& .MuiDrawer-paper`]: {
            width: DASHBOARD_DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "primary.main" }}>
            Websity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Dashboard
          </Typography>
        </Toolbar>
        <NavList onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </>
  );
}
