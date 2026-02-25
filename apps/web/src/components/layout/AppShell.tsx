import React, { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import HomeRounded from "@mui/icons-material/HomeRounded";
import GavelRounded from "@mui/icons-material/GavelRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import ReportProblemRounded from "@mui/icons-material/ReportProblemRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import WavesRounded from "@mui/icons-material/WavesRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

type NavItem = {
  to: string;
  label: string;
  icon: SvgIconComponent;
  aliases?: string[];
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Beranda", icon: HomeRounded },
  { to: "/auctions", label: "Lelang", icon: GavelRounded, aliases: ["/commodities"] },
  { to: "/orders", label: "Pesanan", icon: ReceiptLongRounded },
  { to: "/disputes", label: "Dispute", icon: ReportProblemRounded },
  {
    to: "/admin",
    label: "Admin",
    icon: AdminPanelSettingsRounded,
    aliases: ["/admin/disputes", "/admin/reports"],
    adminOnly: true,
  },
];

function matchRoute(pathname: string, item: NavItem) {
  const targets = [item.to, ...(item.aliases ?? [])];
  return targets.some((target) => {
    if (target === "/") return pathname === "/";
    return pathname === target || pathname.startsWith(`${target}/`);
  });
}

function userInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((x) => x[0]?.toUpperCase() ?? "").join("");
}

export default function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const nav = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const navItems = useMemo(
    () => NAV_ITEMS.filter((x) => !x.adminOnly || user?.role === "admin"),
    [user?.role]
  );

  const activeItem = useMemo(
    () => navItems.find((x) => matchRoute(location.pathname, x)),
    [location.pathname, navItems]
  );

  const activeValue = activeItem?.to ?? null;
  const isProfileRoute = location.pathname === "/me";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nav("/auctions");
  };

  const go = (to: string) => {
    if (location.pathname !== to) nav(to);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 300px at 10% -10%, rgba(12,120,212,0.16), transparent), radial-gradient(900px 240px at 90% -10%, rgba(16,173,134,0.10), transparent)",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha("#FFFFFF", 0.88),
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 72, gap: 1.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.1}
              sx={{ cursor: "pointer", minWidth: { md: 220 } }}
              onClick={() => go("/")}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.2,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(145deg, #0A7BD6, #0A4B9F)",
                  boxShadow: "0 8px 20px rgba(10,123,214,0.30)",
                }}
              >
                <WavesRounded sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography fontWeight={800} lineHeight={1.1}>
                  eLelang Ikan
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Live Marketplace Auction
                </Typography>
              </Box>
            </Stack>

            <Paper
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                flex: 1,
                maxWidth: 540,
                px: 1.6,
                py: 0.55,
                borderRadius: 99,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.18),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <SearchRounded sx={{ color: "text.secondary", fontSize: 20 }} />
              <InputBase
                placeholder="Cari lelang atau komoditas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ ml: 1, flex: 1 }}
              />
            </Paper>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: "auto" }}>
              <Chip
                size="small"
                label={(user?.role ?? "user").toUpperCase()}
                color="primary"
                variant="outlined"
                sx={{ display: { xs: "none", md: "inline-flex" }, fontWeight: 700 }}
              />
              <IconButton
                onClick={() => go("/me")}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: isProfileRoute ? "primary.main" : "divider",
                  bgcolor: isProfileRoute ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {userInitials(user?.name)}
                </Avatar>
              </IconButton>
              <Box sx={{ display: { xs: "none", lg: "block" }, cursor: "pointer" }} onClick={() => go("/me")}>
                <Typography variant="body2" fontWeight={700}>
                  {user?.name ?? "Pengguna"}
                </Typography>
              </Box>
            </Stack>
          </Toolbar>

          <Box sx={{ display: { xs: "none", md: "block" }, pb: 1.3 }}>
            <Stack direction="row" spacing={0.75}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = matchRoute(location.pathname, item);
                return (
                  <Button
                    key={item.to}
                    startIcon={<Icon fontSize="small" />}
                    variant={isActive ? "contained" : "text"}
                    color={isActive ? "primary" : "inherit"}
                    onClick={() => go(item.to)}
                    sx={{
                      px: 1.6,
                      py: 0.75,
                      borderRadius: 99,
                      fontWeight: isActive ? 700 : 600,
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          <Box sx={{ display: { xs: "block", md: "none" }, pb: 1.2 }}>
            <Paper
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.3,
                py: 0.45,
                borderRadius: 99,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.16),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <SearchRounded sx={{ color: "text.secondary", fontSize: 19 }} />
              <InputBase
                placeholder="Cari produk lelang..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ ml: 1, flex: 1, fontSize: 14 }}
              />
            </Paper>
          </Box>
        </Container>
      </AppBar>

      <Box component="main" sx={{ pb: { xs: 12, md: 4 }, pt: { xs: 1.2, md: 1.8 } }}>
        <Outlet />
      </Box>

      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            zIndex: (t) => t.zIndex.appBar + 1,
            left: 12,
            right: 12,
            bottom: 12,
            borderRadius: 3.2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.18),
          }}
        >
          <BottomNavigation
            showLabels
            value={activeValue}
            onChange={(_, value: string) => go(value)}
            sx={{
              height: 68,
              "& .MuiBottomNavigationAction-root": {
                minWidth: 0,
                color: "text.secondary",
                fontWeight: 600,
                py: 0.7,
              },
              "& .Mui-selected": {
                color: "primary.main",
                fontWeight: 800,
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: 11,
              },
            }}
          >
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return <BottomNavigationAction key={item.to} value={item.to} label={item.label} icon={<Icon />} />;
            })}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
