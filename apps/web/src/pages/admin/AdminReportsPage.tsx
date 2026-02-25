import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { adminOrdersCsvUrl } from "../../api/admin";
import { downloadWithAuth } from "../../utils/download";

export default function AdminReportsPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [from, setFrom] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [downloading, setDownloading] = useState(false);

  const csvUrl = useMemo(() => adminOrdersCsvUrl(from, to), [from, to]);

  const onDownload = async () => {
    setDownloading(true);
    try {
      await downloadWithAuth(csvUrl, `orders_${from}_to_${to}.csv`);
      enqueueSnackbar("CSV berhasil diunduh", { variant: "success" });
    } catch (e: any) {
      enqueueSnackbar(e?.message ?? "Gagal download CSV", { variant: "error" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={900}>
        Admin Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Export laporan order ke CSV.
      </Typography>

      <Card sx={{ mt: 2, border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="From"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" onClick={onDownload} disabled={downloading}>
              {downloading ? "Downloading..." : "Download CSV"}
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Endpoint: {csvUrl}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Karena auth pakai Bearer token, file diunduh via fetch blob agar header Authorization ikut.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
