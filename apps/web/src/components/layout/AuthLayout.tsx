import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h5" fontWeight={800}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
          <Box sx={{ mt: 3 }}>{children}</Box>
        </Paper>
      </Container>
    </Box>
  );
}
