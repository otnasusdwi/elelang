import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "../types/auth";

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    if (!user.role || !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
