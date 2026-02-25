import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Container, Stack, Typography, Chip } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listDisputes, openDispute } from "../../api/disputes";
import { useSnackbar } from "notistack";

export default function DisputesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const orderId = sp.get("order") ? Number(sp.get("order")) : null;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await listDisputes(1, 20);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const items = data?.data ?? [];

  const onOpenForOrder = async () => {
    if (!orderId) return;
    try {
      const d = await openDispute(orderId, {
        reason: "Masalah transaksi",
        description: "Mohon admin review",
      });
      enqueueSnackbar("Dispute dibuat/diambil", { variant: "success" });
      nav(`/disputes/${d.id}`);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal membuat dispute", { variant: "error" });
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={900}>
          Disputes
        </Typography>
        {orderId && (
          <Button variant="contained" onClick={onOpenForOrder}>
            Open dispute for Order #{orderId}
          </Button>
        )}
      </Stack>

      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : items.length === 0 ? (
          <Typography color="text.secondary">Belum ada dispute.</Typography>
        ) : (
          <Stack spacing={2}>
            {items.map((d: any) => (
              <Card key={d.id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={900}>Dispute #{d.id}</Typography>
                    <Chip label={(d.status ?? "open").toUpperCase()} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Order #{d.order_id} • {d.reason}
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={() => nav(`/disputes/${d.id}`)}>
                      Detail
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
}
