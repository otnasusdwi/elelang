import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Tab,
  Tabs,
  Typography,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { listOrders, OrderStatus } from "../../api/orders";

const tabs: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "shipping", label: "Shipping" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function statusChip(status: string) {
  const map: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" }> = {
    pending: { label: "PENDING", color: "default" },
    paid: { label: "PAID", color: "primary" },
    shipping: { label: "SHIPPING", color: "warning" },
    delivered: { label: "DELIVERED", color: "success" },
    completed: { label: "COMPLETED", color: "success" },
    cancelled: { label: "CANCELLED", color: "default" },
  };
  const c = map[status] ?? { label: status.toUpperCase(), color: "default" };
  return <Chip size="small" label={c.label} color={c.color} />;
}

export default function OrdersPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listOrders(undefined, 1, 20)
      .then((res) => mounted && setData(res))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const items = useMemo(() => {
    const rows = data?.data ?? [];
    if (tab === "all") return rows;
    return rows.filter((o: any) => o.status === tab);
  }, [data, tab]);

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={900}>
        Orders
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Kelola serah-terima, bukti, escrow, dan dispute.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mt: 2, mb: 2 }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        {tabs.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} />
        ))}
      </Tabs>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
          <Typography fontWeight={700}>Belum ada order.</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((o: any) => (
            <Card key={o.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={900}>Order #{o.id}</Typography>
                  {statusChip(o.status)}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Komoditas: {o.commodity?.name ?? "-"} • Total: Rp{" "}
                  {new Intl.NumberFormat("id-ID").format(Number(o.final_price ?? 0))}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Dibuat: {dayjs(o.created_at).format("DD MMM YYYY HH:mm")}
                </Typography>

                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={() => nav(`/orders/${o.id}`)}>
                    Detail
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
