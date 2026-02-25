import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { adminSummary, adminTimeSeries } from "../../api/admin";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatMoney(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <Card sx={{ flex: 1, border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [summary, setSummary] = useState<any>(null);
  const [series, setSeries] = useState<any>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    adminSummary()
      .then(setSummary)
      .catch((e: any) => {
        enqueueSnackbar(e?.response?.data?.message ?? "Gagal load summary", { variant: "error" });
      });
  }, [enqueueSnackbar]);

  useEffect(() => {
    adminTimeSeries(days)
      .then(setSeries)
      .catch((e: any) => {
        enqueueSnackbar(e?.response?.data?.message ?? "Gagal load time-series", { variant: "error" });
      });
  }, [days, enqueueSnackbar]);

  const kpi = summary?.totals ?? {};
  const escrow = summary?.escrow ?? {};
  const reviews = summary?.reviews ?? {};
  const ordersByStatus = summary?.orders_by_status ?? {};

  const chartData = useMemo(() => {
    const rows = series?.series ?? [];
    return rows.map((r: any) => ({
      date: String(r.date).slice(5),
      orders: Number(r.orders ?? 0),
      gmv: Number(r.gmv ?? 0),
    }));
  }, [series]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Ringkasan performa lelang dan transaksi.
          </Typography>
        </Box>

        <TextField
          select
          size="small"
          label="Range"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          sx={{ mt: { xs: 2, sm: 0 }, minWidth: 160 }}
        >
          {[7, 14, 30, 60, 90].map((d) => (
            <MenuItem key={d} value={d}>
              {d} days
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
        <KpiCard title="Auctions" value={String(kpi.auctions ?? 0)} />
        <KpiCard title="Orders" value={String(kpi.orders ?? 0)} />
        <KpiCard title="Disputes" value={String(kpi.disputes ?? 0)} />
        <KpiCard
          title="Avg Rating"
          value={String(reviews.average_rating ?? 0)}
          subtitle={`${reviews.count ?? 0} reviews`}
        />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
        <KpiCard title="Escrow Held" value={`Rp ${formatMoney(Number(escrow.held ?? 0))}`} />
        <KpiCard title="Escrow Released" value={`Rp ${formatMoney(Number(escrow.released ?? 0))}`} />
        <KpiCard title="Escrow Refunded" value={`Rp ${formatMoney(Number(escrow.refunded ?? 0))}`} />
      </Stack>

      <Card sx={{ mt: 2, border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography fontWeight={900}>Orders by Status</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {Object.keys(ordersByStatus).length === 0 ? (
              <Typography color="text.secondary">No data</Typography>
            ) : (
              Object.entries(ordersByStatus).map(([status, cnt]: any) => (
                <Box
                  key={status}
                  sx={{
                    px: 1.2,
                    py: 0.6,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {status}
                  </Typography>
                  <Typography fontWeight={900}>{cnt}</Typography>
                </Box>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2, border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={900}>Orders and GMV</Typography>
            <Typography variant="caption" color="text.secondary">
              {series?.from ?? "-"} → {series?.to ?? "-"}
            </Typography>
          </Stack>

          <Box sx={{ height: 320, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#0A6ED1"
                  strokeWidth={2}
                  dot={false}
                  name="Orders"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="gmv"
                  stroke="#0A9A70"
                  strokeWidth={2}
                  dot={false}
                  name="GMV"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Typography variant="caption" color="text.secondary">
            orders = jumlah order per hari, gmv = total final_price per hari.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
