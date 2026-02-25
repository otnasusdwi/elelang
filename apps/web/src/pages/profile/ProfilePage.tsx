import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import PersonRounded from "@mui/icons-material/PersonRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import ReportProblemRounded from "@mui/icons-material/ReportProblemRounded";
import ReviewsRounded from "@mui/icons-material/ReviewsRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { userRatingSummary } from "../../api/reviews";

function userInitials(name?: string) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfilePage() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [ratingSummary, setRatingSummary] = useState<any>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;
    setRatingLoading(true);
    userRatingSummary(user.id)
      .then((res) => {
        if (mounted) setRatingSummary(res);
      })
      .catch(() => {
        if (mounted) setRatingSummary(null);
      })
      .finally(() => {
        if (mounted) setRatingLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const averageRating = useMemo(() => {
    const raw =
      ratingSummary?.average_rating ??
      ratingSummary?.avg_rating ??
      ratingSummary?.rating_average ??
      ratingSummary?.avg ??
      ratingSummary?.average ??
      0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  }, [ratingSummary]);

  const totalReviews = useMemo(() => {
    const raw =
      ratingSummary?.total_reviews ??
      ratingSummary?.reviews_count ??
      ratingSummary?.count ??
      ratingSummary?.total ??
      0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  }, [ratingSummary]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
      <Typography variant="h5">Profile</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
        Kelola akun Anda dan akses cepat ke aktivitas transaksi.
      </Typography>

      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ p: { xs: 2.1, md: 2.6 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main", fontWeight: 800 }}>
              {userInitials(user?.name)}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name ?? "-"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email ?? "-"}
              </Typography>
            </Box>
            <Chip
              size="small"
              color="primary"
              icon={<PersonRounded />}
              label={(user?.role ?? "user").toUpperCase()}
              sx={{ ml: "auto", fontWeight: 800 }}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button
              variant="outlined"
              startIcon={<ReceiptLongRounded />}
              onClick={() => nav("/orders")}
            >
              Lihat Orders
            </Button>
            <Button
              variant="outlined"
              startIcon={<ReportProblemRounded />}
              onClick={() => nav("/disputes")}
            >
              Lihat Disputes
            </Button>
            <Button
              variant="outlined"
              startIcon={<ReviewsRounded />}
              onClick={() => nav("/my-reviews")}
            >
              My Reviews
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography fontWeight={800}>Rating Summary</Typography>
          {ratingLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
              Memuat rating...
            </Typography>
          ) : totalReviews <= 0 ? (
            <Alert severity="info" sx={{ mt: 1.2 }}>
              Belum ada rating untuk akun ini.
            </Alert>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 1.2 }}>
              <Rating value={averageRating} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                {averageRating.toFixed(1)} / 5 dari {totalReviews} review
              </Typography>
            </Stack>
          )}

          <Divider sx={{ my: 2 }} />

          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutRounded />}
            onClick={logout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
