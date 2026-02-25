import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Container, Rating, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { myReviews } from "../../api/reviews";

export default function MyReviewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    myReviews(1, 20)
      .then((res) => {
        if (mounted) setData(res);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const items = data?.data ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={900}>
        My Reviews
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Review yang pernah kamu buat.
      </Typography>

      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : items.length === 0 ? (
          <Typography color="text.secondary">Belum ada review.</Typography>
        ) : (
          <Stack spacing={2}>
            {items.map((r: any) => (
              <Card key={r.id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={900}>Order #{r.order_id}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(r.created_at).format("DD MMM YYYY HH:mm")}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Rating value={Number(r.rating)} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {r.rating}/5
                    </Typography>
                  </Stack>

                  {r.comment && <Typography sx={{ mt: 1 }}>{r.comment}</Typography>}

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    To: {r.ratee?.name ?? `User ${r.ratee_id}`}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
}
