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
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  addHandoverProof,
  escrowHold,
  getEscrow,
  getOrder,
  updateLogistics,
  updateOrderStatus,
  OrderStatus,
} from "../../api/orders";
import { uploadMedia } from "../../api/media";
import { useAuth } from "../../auth/AuthProvider";
import { useSnackbar } from "notistack";
import { ReviewCard } from "../../components/reviews/ReviewCard";

const steps: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "shipping", label: "Shipping" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

function stepIndex(status: OrderStatus) {
  const idx = steps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function OrderDetailPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const nav = useNavigate();
  const { id } = useParams();
  const orderId = Number(id);

  const [order, setOrder] = useState<any>(null);
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [logi, setLogi] = useState({
    pickup_time: "",
    pickup_location: "",
    delivery_method: "pickup",
    notes: "",
  });

  const canBuyer = user?.role === "buyer";
  const canSeller = user?.role === "seller";

  async function load() {
    setLoading(true);
    try {
      const o = await getOrder(orderId);
      setOrder(o);

      // logistics could be embedded or separate; assume you load from order endpoint if included
      // If not included, still allow updateLogistics (it returns logistics object)
      if (o?.logistics) {
        setLogi({
          pickup_time: o.logistics.pickup_time
            ? dayjs(o.logistics.pickup_time).format("YYYY-MM-DDTHH:mm")
            : "",
          pickup_location: o.logistics.pickup_location ?? "",
          delivery_method: o.logistics.delivery_method ?? "pickup",
          notes: o.logistics.notes ?? "",
        });
      }

      const e = await getEscrow(orderId);
      setEscrow(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!orderId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const status: OrderStatus = order?.status ?? "pending";
  const activeStep = useMemo(() => stepIndex(status), [status]);

  const onUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      enqueueSnackbar(`Status updated: ${newStatus}`, { variant: "success" });
      await load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal update status", { variant: "error" });
    }
  };

  const onSaveLogistics = async () => {
    try {
      await updateLogistics(orderId, {
        pickup_time: logi.pickup_time ? dayjs(logi.pickup_time).format("YYYY-MM-DD HH:mm:ss") : undefined,
        pickup_location: logi.pickup_location || undefined,
        delivery_method: logi.delivery_method as any,
        notes: logi.notes || undefined,
      });
      enqueueSnackbar("Logistics tersimpan", { variant: "success" });
      await load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal simpan logistics", { variant: "error" });
    }
  };

  const onUploadProof = async (type: "pickup" | "delivery" | "received", file: File) => {
    try {
      const res = await uploadMedia(file);
      const url = res?.url ?? res?.path ?? res?.data?.url;
      if (!url) throw new Error("Upload response tidak berisi url");

      await addHandoverProof(orderId, { type, media_url: url });
      enqueueSnackbar("Proof tersimpan", { variant: "success" });
      await load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? e?.message ?? "Gagal upload proof", {
        variant: "error",
      });
    }
  };

  const onHold = async () => {
    try {
      await escrowHold(orderId, { reference: "web-sim", note: "Simulasi bayar dari web" });
      enqueueSnackbar("Escrow held (paid)", { variant: "success" });
      await load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Gagal hold", { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">Order tidak ditemukan</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Order #{order.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Komoditas: {order.commodity?.name ?? "-"} • Total: Rp{" "}
            {new Intl.NumberFormat("id-ID").format(Number(order.final_price ?? 0))}
          </Typography>
        </Box>
        <Chip label={status.toUpperCase()} />
      </Stack>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            Progress
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((s) => (
              <Step key={s.key}>
                <StepLabel>{s.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {canSeller && (
              <Button variant="outlined" onClick={() => onUpdateStatus("shipping")} disabled={status !== "paid"}>
                Set Shipping
              </Button>
            )}
            {canBuyer && (
              <Button
                variant="outlined"
                onClick={() => onUpdateStatus("delivered")}
                disabled={status !== "shipping"}
              >
                Konfirmasi Delivered
              </Button>
            )}
            {canBuyer && (
              <Button
                variant="contained"
                onClick={() => onUpdateStatus("completed")}
                disabled={status !== "delivered"}
              >
                Complete
              </Button>
            )}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Rule MVP: seller set shipping, buyer set delivered+completed.
          </Typography>
        </CardContent>
      </Card>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {/* Logistics */}
        <Card>
          <CardContent>
            <Typography fontWeight={900}>Logistics</Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <TextField
                label="Pickup time"
                type="datetime-local"
                value={logi.pickup_time}
                onChange={(e) => setLogi((p) => ({ ...p, pickup_time: e.target.value }))}
              />
              <TextField
                label="Pickup location"
                value={logi.pickup_location}
                onChange={(e) => setLogi((p) => ({ ...p, pickup_location: e.target.value }))}
              />
              <TextField
                label="Delivery method (pickup/courier/other)"
                value={logi.delivery_method}
                onChange={(e) => setLogi((p) => ({ ...p, delivery_method: e.target.value }))}
              />
              <TextField
                label="Notes"
                value={logi.notes}
                onChange={(e) => setLogi((p) => ({ ...p, notes: e.target.value }))}
              />

              <Button variant="contained" onClick={onSaveLogistics}>
                Simpan Logistics
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Proofs */}
        <Card>
          <CardContent>
            <Typography fontWeight={900}>Handover Proofs</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Upload bukti pickup/delivery/received.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              {(["pickup", "delivery", "received"] as const).map((t) => (
                <Box key={t}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    {t.toUpperCase()}
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUploadProof(t, f);
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Escrow */}
        <Card>
          <CardContent>
            <Typography fontWeight={900}>Escrow</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Held: Rp {new Intl.NumberFormat("id-ID").format(Number(escrow?.balance?.held ?? 0))} • Released: Rp{" "}
              {new Intl.NumberFormat("id-ID").format(Number(escrow?.balance?.released ?? 0))} • Refunded: Rp{" "}
              {new Intl.NumberFormat("id-ID").format(Number(escrow?.balance?.refunded ?? 0))}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {canBuyer ? (
              <Button variant="contained" onClick={onHold}>
                Simulasi Bayar (Hold)
              </Button>
            ) : (
              <Alert severity="info">Hold pembayaran dilakukan oleh buyer/admin.</Alert>
            )}
          </CardContent>
        </Card>

        {/* Dispute */}
        <Card>
          <CardContent>
            <Typography fontWeight={900}>Dispute</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Jika ada masalah, buka dispute dan kirim bukti.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Button variant="outlined" onClick={() => nav(`/disputes?order=${order.id}`)}>
              Buka halaman Dispute
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              (Dispute UI tersedia di halaman khusus)
            </Typography>
          </CardContent>
        </Card>

        <ReviewCard order={order} onSubmitted={load} />
      </Stack>
    </Container>
  );
}
