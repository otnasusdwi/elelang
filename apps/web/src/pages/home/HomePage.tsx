import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import BoltRounded from "@mui/icons-material/BoltRounded";
import GavelRounded from "@mui/icons-material/GavelRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import ReportProblemRounded from "@mui/icons-material/ReportProblemRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";

export default function HomePage() {
  const nav = useNavigate();
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.2, md: 3 } }}>
      <Card
        sx={{
          background: "linear-gradient(120deg, #0A6ED1 0%, #0B9D77 100%)",
          color: "white",
          border: "none",
        }}
      >
        <CardContent sx={{ p: { xs: 2.3, md: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5">Halo, {user?.name}</Typography>
              <Typography sx={{ opacity: 0.9, mt: 0.6 }}>
                Pantau lelang live, kelola pesanan, dan selesaikan transaksi lebih cepat.
              </Typography>
            </Box>
            <Chip
              icon={<BoltRounded sx={{ color: "#fff !important" }} />}
              label={(user?.role ?? "user").toUpperCase()}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.28)",
                fontWeight: 800,
              }}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 2.2 }}>
            <Button variant="contained" color="inherit" onClick={() => nav("/auctions")}>
              Buka Lelang Live
            </Button>
            <Button
              variant="outlined"
              onClick={() => nav("/orders")}
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.5)" }}
            >
              Lihat Pesanan
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          mt: 2.2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" },
          gap: 1.8,
        }}
      >
        <Card sx={{ cursor: "pointer" }} onClick={() => nav("/auctions")}>
          <CardContent>
            <GavelRounded color="primary" />
            <Typography fontWeight={800} sx={{ mt: 0.8 }}>
              Auctions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Masuk room dan ikuti bid realtime.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ cursor: "pointer" }} onClick={() => nav("/orders")}>
          <CardContent>
            <ReceiptLongRounded color="primary" />
            <Typography fontWeight={800} sx={{ mt: 0.8 }}>
              Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tracking serah-terima, escrow, dan status.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ cursor: "pointer" }} onClick={() => nav("/disputes")}>
          <CardContent>
            <ReportProblemRounded color="primary" />
            <Typography fontWeight={800} sx={{ mt: 0.8 }}>
              Disputes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Buka masalah transaksi dan kirim bukti.
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{ cursor: user?.role === "admin" ? "pointer" : "not-allowed", opacity: user?.role === "admin" ? 1 : 0.6 }}
          onClick={() => user?.role === "admin" && nav("/admin")}
        >
          <CardContent>
            <AdminPanelSettingsRounded color="primary" />
            <Typography fontWeight={800} sx={{ mt: 0.8 }}>
              Admin Panel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dashboard analytics, dispute review, dan reports.
            </Typography>
          </CardContent>
        </Card>
      </Box>

    </Container>
  );
}
