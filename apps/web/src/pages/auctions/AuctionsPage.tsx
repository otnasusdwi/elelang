import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Container,
  Tab,
  Tabs,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Button,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { listAuctions, AuctionStatusFilter } from "../../api/auctions";

type TabKey = AuctionStatusFilter;

const tabLabels: Record<TabKey, string> = {
  live: "Live",
  scheduled: "Scheduled",
  ended: "Ended",
};

function statusChip(status: TabKey) {
  if (status === "live") return <Chip label="LIVE" color="error" size="small" />;
  if (status === "scheduled") return <Chip label="SCHEDULED" color="primary" size="small" />;
  return <Chip label="ENDED" color="default" size="small" />;
}

export default function AuctionsPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<TabKey>("live");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const title = useMemo(() => `Auctions (${tabLabels[tab]})`, [tab]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listAuctions(tab, 1, 20)
      .then((res) => mounted && setData(res))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [tab]);

  const items = data?.data ?? [];

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pilih lelang, lalu masuk ke room untuk melihat bid realtime.
          </Typography>
        </Box>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="live" label="Live" />
        <Tab value="scheduled" label="Scheduled" />
        <Tab value="ended" label="Ended" />
      </Tabs>

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((k) => (
            <Card key={k} sx={{ display: "flex", overflow: "hidden" }}>
              <Skeleton variant="rectangular" width={160} height={120} />
              <CardContent sx={{ flex: 1 }}>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
                <Skeleton width="80%" />
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <Box sx={{ p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
          <Typography fontWeight={700}>Belum ada auction di kategori ini.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Coba tab lainnya.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((a: any) => {
            const commodity = a.commodity;
            const media0 = commodity?.media?.[0]?.url;
            return (
              <Card key={a.id} sx={{ display: "flex", overflow: "hidden" }}>
                <CardMedia
                  component="img"
                  image={
                    media0
                      ? `${import.meta.env.VITE_API_BASE?.replace("/api", "")}${media0}`
                      : "https://via.placeholder.com/320x240?text=No+Image"
                  }
                  alt={commodity?.name ?? "Commodity"}
                  sx={{ width: 160, height: 120, objectFit: "cover" }}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={800}>{commodity?.name ?? `Auction #${a.id}`}</Typography>
                    {statusChip(tab)}
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Start: {dayjs(a.start_at).format("DD MMM YYYY HH:mm")}
                    {" • "}
                    End: {dayjs(a.end_at).format("DD MMM YYYY HH:mm")}
                  </Typography>

                  <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                    <Button variant="contained" onClick={() => nav(`/auctions/${a.id}`)}>
                      Masuk Room
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => nav(`/commodities/${commodity?.id}`)}
                      disabled={!commodity?.id}
                    >
                      Detail Komoditas
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
