import React, { useMemo, useState } from "react";
import { Alert, Button, Card, CardContent, Rating, Stack, TextField, Typography } from "@mui/material";
import { submitReview } from "../../api/reviews";
import { useSnackbar } from "notistack";
import { useAuth } from "../../auth/AuthProvider";

export function ReviewCard({ order, onSubmitted }: { order: any; onSubmitted?: () => Promise<void> | void }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canReview = useMemo(() => {
    if (!user || !order) return false;
    if (order.status !== "completed") return false;

    const buyerId = Number(order.buyer_id ?? order.buyer?.id ?? 0);
    const sellerId = Number(order.seller_id ?? order.seller?.id ?? order.commodity?.seller_id ?? 0);

    const isBuyer = user.role === "buyer" && buyerId === Number(user.id);
    const isSeller = user.role === "seller" && sellerId === Number(user.id);
    return isBuyer || isSeller;
  }, [user, order]);

  const alreadyReviewed = useMemo(() => {
    if (submitted) return true;
    const reviews = order?.reviews ?? [];
    if (!Array.isArray(reviews) || !user) return false;
    return reviews.some((r: any) => Number(r.reviewer_id) === Number(user.id));
  }, [submitted, order, user]);

  const onSubmit = async () => {
    if (!rating) {
      enqueueSnackbar("Pilih rating", { variant: "warning" });
      return;
    }

    setSaving(true);
    try {
      await submitReview(order.id, { rating, comment: comment || undefined });
      setSubmitted(true);
      enqueueSnackbar("Review tersimpan", { variant: "success" });
      if (onSubmitted) {
        await onSubmitted();
      }
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal submit review", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography fontWeight={900}>Review</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Beri penilaian setelah transaksi selesai.
        </Typography>

        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {!canReview ? (
            <Alert severity="info">
              Review hanya tersedia untuk buyer/seller saat order sudah <b>completed</b>.
            </Alert>
          ) : alreadyReviewed ? (
            <Alert severity="success">Review sudah kamu kirim untuk order ini.</Alert>
          ) : (
            <>
              <Stack direction="row" spacing={2} alignItems="center">
                <Rating value={rating} onChange={(_, v) => setRating(v)} />
                <Typography variant="body2" color="text.secondary">
                  {rating ? `${rating}/5` : "-"}
                </Typography>
              </Stack>

              <TextField
                label="Komentar (opsional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                multiline
                minRows={3}
              />

              <Button variant="contained" onClick={onSubmit} disabled={saving}>
                {saving ? "Menyimpan..." : "Submit Review"}
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
