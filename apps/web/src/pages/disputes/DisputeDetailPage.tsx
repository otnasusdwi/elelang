import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { addDisputeMessage, getDispute } from "../../api/disputes";
import { uploadMedia } from "../../api/media";
import { useSnackbar } from "notistack";

export default function DisputeDetailPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const disputeId = Number(id);

  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const baseHost = useMemo(
    () => (import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api").replace("/api", ""),
    []
  );

  const toMediaHref = (url: string) => {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${baseHost}${url}`;
  };

  async function load() {
    setLoading(true);
    try {
      const d = await getDispute(disputeId);
      setDispute(d);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (disputeId) load();
  }, [disputeId]);

  const onSend = async (media_url?: string) => {
    if (!msg && !media_url) {
      enqueueSnackbar("Isi pesan atau upload bukti", { variant: "warning" });
      return;
    }
    setSending(true);
    try {
      await addDisputeMessage(disputeId, { message: msg || undefined, media_url });
      setMsg("");
      await load();
      enqueueSnackbar("Terkirim", { variant: "success" });
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal kirim", { variant: "error" });
    } finally {
      setSending(false);
    }
  };

  const onUpload = async (file: File) => {
    try {
      const res = await uploadMedia(file);
      const url = res?.url ?? res?.path ?? res?.data?.url;
      if (!url) throw new Error("Upload response tidak berisi url");
      await onSend(url);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? e?.message ?? "Gagal upload", { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }
  if (!dispute) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">Dispute tidak ditemukan</Alert>
      </Container>
    );
  }

  const messages = dispute.messages ?? [];

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={900}>
        Dispute #{dispute.id}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Order #{dispute.order_id} • Status: {dispute.status}
      </Typography>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight={900}>Thread</Typography>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.2} sx={{ maxHeight: 420, overflow: "auto" }}>
            {messages.length === 0 ? (
              <Typography color="text.secondary">Belum ada pesan.</Typography>
            ) : (
              messages.map((m: any) => (
                <Box key={m.id} sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  <Typography fontWeight={700} variant="body2">
                    {m.sender?.name ?? `User ${m.sender_id}`}
                  </Typography>
                  {m.message && <Typography sx={{ mt: 0.5 }}>{m.message}</Typography>}
                  {m.media_url && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Bukti:{" "}
                      <a href={toMediaHref(m.media_url)} target="_blank" rel="noreferrer">
                        {m.media_url}
                      </a>
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.2}>
            <TextField
              label="Tulis pesan"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              multiline
              minRows={2}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="contained" onClick={() => onSend()} disabled={sending}>
                {sending ? "Mengirim..." : "Kirim"}
              </Button>

              <Button variant="outlined" component="label" disabled={sending}>
                Upload bukti
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                  }}
                />
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
