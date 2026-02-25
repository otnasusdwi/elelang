import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { adminGetDispute, adminListDisputes, adminResolveDispute } from "../../api/disputes";

type DisputeStatus = "open" | "in_review" | "resolved" | "rejected";
type Resolution = "refund" | "release" | "replacement" | "none";

const statusOptions: { value: DisputeStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

function statusChip(status: string) {
  const map: Record<string, { label: string; color: "warning" | "primary" | "success" | "default" }> = {
    open: { label: "OPEN", color: "warning" },
    in_review: { label: "IN REVIEW", color: "primary" },
    resolved: { label: "RESOLVED", color: "success" },
    rejected: { label: "REJECTED", color: "default" },
  };
  const c = map[status] ?? { label: status?.toUpperCase() ?? "UNKNOWN", color: "default" };
  return <Chip size="small" label={c.label} color={c.color} />;
}

function toMediaHref(url: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseHost = (import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api").replace("/api", "");
  return `${baseHost}${url}`;
}

export default function AdminDisputesPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [filter, setFilter] = useState<(typeof statusOptions)[number]["value"]>("open");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveStatus, setResolveStatus] = useState<"in_review" | "resolved" | "rejected">("in_review");
  const [resolveResolution, setResolveResolution] = useState<Resolution>("none");
  const [resolveNote, setResolveNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await adminListDisputes(filter === "all" ? undefined : filter, 1, 30);
      setData(res);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal load disputes", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const items = useMemo(() => data?.data ?? [], [data]);

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const d = await adminGetDispute(id);
      setDetail(d);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal load detail", { variant: "error" });
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openResolve = (d: any) => {
    setDetail(d);
    setResolveOpen(true);
    setResolveStatus("resolved");
    setResolveResolution("none");
    setResolveNote("");
  };

  const quickResolve = async (d: any, resolution: "refund" | "release") => {
    setSaving(true);
    try {
      await adminResolveDispute(d.id, {
        status: "resolved",
        resolution,
        resolution_note: resolution === "refund" ? "Refund disetujui (admin)" : "Release disetujui (admin)",
      });
      enqueueSnackbar(`Dispute resolved: ${resolution}`, { variant: "success" });
      setResolveOpen(false);
      setDetailOpen(false);
      await load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal resolve", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const submitResolve = async () => {
    if (!detail?.id) return;
    setSaving(true);
    try {
      await adminResolveDispute(detail.id, {
        status: resolveStatus,
        resolution: resolveStatus === "resolved" ? resolveResolution : undefined,
        resolution_note: resolveNote || undefined,
      });
      enqueueSnackbar("Dispute updated", { variant: "success" });
      setResolveOpen(false);
      await load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal update dispute", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Admin • Disputes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Review sengketa, ambil keputusan, lalu escrow refund/release otomatis.
          </Typography>
        </Box>

        <TextField
          select
          size="small"
          label="Filter status"
          value={filter}
          onChange={(e) => setFilter(e.target.value as DisputeStatus | "all")}
          sx={{ mt: { xs: 2, sm: 0 }, minWidth: 200 }}
        >
          {statusOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : items.length === 0 ? (
          <Box sx={{ p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
            <Typography fontWeight={700}>Tidak ada dispute.</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {items.map((d: any) => (
              <Card key={d.id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={900}>Dispute #{d.id}</Typography>
                    {statusChip(d.status)}
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Order #{d.order_id} • {d.reason}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Opened by: {d.opener?.name ?? d.opened_by} • {dayjs(d.created_at).format("DD MMM YYYY HH:mm")}
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                    <Button variant="outlined" onClick={() => openDetail(d.id)}>
                      Detail
                    </Button>

                    <Button variant="contained" onClick={() => openResolve(d)}>
                      Resolve
                    </Button>

                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => quickResolve(d, "refund")}
                      disabled={saving}
                    >
                      Refund
                    </Button>

                    <Button
                      color="success"
                      variant="outlined"
                      onClick={() => quickResolve(d, "release")}
                      disabled={saving}
                    >
                      Release
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Dispute Detail</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Typography>Loading...</Typography>
          ) : !detail ? (
            <Typography color="text.secondary">No data.</Typography>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={900}>Dispute #{detail.id}</Typography>
                {statusChip(detail.status)}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Order #{detail.order_id} • Reason: {detail.reason}
              </Typography>

              {detail.description && <Alert severity="info">{detail.description}</Alert>}

              <Divider />

              <Typography fontWeight={900}>Messages</Typography>
              <Stack spacing={1} sx={{ maxHeight: 320, overflow: "auto" }}>
                {(detail.messages ?? []).map((m: any) => (
                  <Box
                    key={m.id}
                    sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                  >
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
                ))}
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {detail && (
            <Button variant="contained" onClick={() => openResolve(detail)}>
              Resolve
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Resolve Dispute</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info">
              Resolusi <b>refund</b> akan memanggil escrow refund + order cancelled.
              <br />
              Resolusi <b>release</b> akan memanggil escrow release (admin override jika perlu).
            </Alert>

            <TextField
              select
              label="Status"
              value={resolveStatus}
              onChange={(e) =>
                setResolveStatus(e.target.value as "in_review" | "resolved" | "rejected")
              }
            >
              <MenuItem value="in_review">in_review</MenuItem>
              <MenuItem value="resolved">resolved</MenuItem>
              <MenuItem value="rejected">rejected</MenuItem>
            </TextField>

            <TextField
              select
              label="Resolution (only for resolved)"
              value={resolveResolution}
              onChange={(e) => setResolveResolution(e.target.value as Resolution)}
              disabled={resolveStatus !== "resolved"}
            >
              <MenuItem value="none">none</MenuItem>
              <MenuItem value="refund">refund</MenuItem>
              <MenuItem value="release">release</MenuItem>
              <MenuItem value="replacement">replacement</MenuItem>
            </TextField>

            <TextField
              label="Resolution note"
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submitResolve} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
