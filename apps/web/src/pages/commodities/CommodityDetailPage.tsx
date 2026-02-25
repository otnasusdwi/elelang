import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CardMedia, Container, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getCommodity } from "../../api/commodities";

export default function CommodityDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const commodityId = Number(id);

  const [commodity, setCommodity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const baseHost = useMemo(
    () => (import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api").replace("/api", ""),
    []
  );

  useEffect(() => {
    if (!commodityId) return;

    let mounted = true;
    setLoading(true);
    getCommodity(commodityId)
      .then((data) => {
        if (mounted) setCommodity(data);
      })
      .catch(() => {
        if (mounted) setCommodity(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [commodityId]);

  if (loading) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!commodity) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">Komoditas tidak ditemukan.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => nav("/auctions")}>
            Kembali ke Auctions
          </Button>
        </Box>
      </Container>
    );
  }

  const media = commodity.media ?? [];
  const mainMedia = media[0]?.url;

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={900}>
          Detail Komoditas
        </Typography>
        <Button variant="outlined" onClick={() => nav("/auctions")}>
          Kembali ke Auctions
        </Button>
      </Stack>

      <Card>
        {mainMedia && (
          <CardMedia
            component="img"
            height="320"
            image={`${baseHost}${mainMedia}`}
            alt={commodity.name ?? "Commodity"}
            sx={{ objectFit: "cover" }}
          />
        )}
        <CardContent>
          <Typography variant="h5" fontWeight={900}>
            {commodity.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Lokasi: {commodity.location ?? "-"} • Grade: {commodity.size_grade ?? "-"} • Berat:{" "}
            {commodity.weight_kg ?? "-"} kg
          </Typography>

          <Typography sx={{ mt: 1.5 }}>{commodity.description ?? "-"}</Typography>

          {media.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
              {media.slice(1, 7).map((m: any) => (
                <Box
                  key={m.id ?? m.url}
                  component="img"
                  src={`${baseHost}${m.url}`}
                  alt={commodity.name ?? "Commodity"}
                  sx={{ width: 92, height: 72, objectFit: "cover", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
