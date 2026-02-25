import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { getAuction, listBids, placeBid } from "../../api/auctions";
import { makeEcho } from "../../realtime/echo";
import { useSnackbar } from "notistack";
import { useAuth } from "../../auth/AuthProvider";

type AuctionUiStatus = "scheduled" | "live" | "ended" | "cancelled";

function formatMoney(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function getApiErrorMessage(error: any) {
  return (
    error?.response?.data?.errors?.auction?.[0] ??
    error?.response?.data?.errors?.amount?.[0] ??
    error?.response?.data?.message ??
    "Gagal bid"
  );
}

function hasBrowserNotificationSupport() {
  return typeof window !== "undefined" && "Notification" in window;
}

async function requestBrowserNotificationPermission() {
  if (!hasBrowserNotificationSupport()) return;
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // noop
    }
  }
}

function pushBrowserNotification(title: string, body: string) {
  if (!hasBrowserNotificationSupport()) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    // noop
  }
}

export default function AuctionRoomPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const { id } = useParams();
  const auctionId = Number(id);

  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [highest, setHighest] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [bidErrorText, setBidErrorText] = useState("");
  const [nowTick, setNowTick] = useState(dayjs());

  const echoRef = useRef<any>(null);
  const endedNotifiedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNowTick(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  const startAt = useMemo(() => (auction?.start_at ? dayjs(auction.start_at) : null), [auction]);
  const endAt = useMemo(() => (auction?.end_at ? dayjs(auction.end_at) : null), [auction]);

  const serverStatus = useMemo<AuctionUiStatus | null>(() => {
    const raw = String(auction?.status ?? "").toLowerCase();
    if (raw === "scheduled" || raw === "live" || raw === "ended" || raw === "cancelled") {
      return raw;
    }
    return null;
  }, [auction]);

  const inTimeWindow = useMemo(() => {
    if (!startAt || !endAt) return false;
    return !nowTick.isBefore(startAt) && nowTick.isBefore(endAt);
  }, [startAt, endAt, nowTick]);

  const statusLabel = useMemo<AuctionUiStatus | "-">(() => {
    if (!auction) return "-";

    if (serverStatus === "ended" || serverStatus === "cancelled") return serverStatus;

    if (!startAt || !endAt) return serverStatus ?? "ended";
    if (nowTick.isBefore(startAt)) return "scheduled";
    if (!nowTick.isBefore(endAt)) return "ended";
    return "live";
  }, [auction, serverStatus, startAt, endAt, nowTick]);

  const canBid = useMemo(() => {
    return statusLabel === "live" && inTimeWindow;
  }, [statusLabel, inTimeWindow]);

  const isBuyer = useMemo(() => user?.role === "buyer", [user?.role]);
  const canSubmitBid = useMemo(() => canBid && isBuyer, [canBid, isBuyer]);

  const statusChip = useMemo(() => {
    if (statusLabel === "live") return <Chip label="LIVE" color="error" size="small" />;
    if (statusLabel === "scheduled") return <Chip label="SCHEDULED" color="primary" size="small" />;
    if (statusLabel === "cancelled") return <Chip label="CANCELLED" color="warning" size="small" />;
    return <Chip label="ENDED" size="small" />;
  }, [statusLabel]);

  const statusHint = useMemo(() => {
    if (!auction) return "";
    if (statusLabel === "cancelled") return "Auction dibatalkan. Bid tidak tersedia.";
    if (statusLabel === "ended") return "Auction sudah berakhir atau ditutup oleh sistem.";
    if (statusLabel === "scheduled") {
      return `Auction belum dimulai${startAt ? ` (mulai ${startAt.format("DD MMM YYYY HH:mm")})` : ""}.`;
    }
    if (!inTimeWindow) return "Auction tidak aktif pada waktu ini.";
    return "";
  }, [auction, statusLabel, startAt, inTimeWindow]);

  const roleHint = useMemo(() => {
    if (!user) return "";
    if (isBuyer) return "";
    if (user.role === "admin") return "Mode review: akun admin hanya bisa memantau, tidak bisa ikut bid.";
    return "Hanya akun buyer yang dapat memasang bid.";
  }, [user, isBuyer]);

  const remainingText = useMemo(() => {
    if (!auction || !startAt || !endAt) return "-";
    if (statusLabel === "ended" || statusLabel === "cancelled") return "Selesai";

    const toStart = nowTick.isBefore(startAt);
    const target = toStart ? startAt : endAt;
    const diff = Math.max(target.diff(nowTick, "second"), 0);

    const hh = Math.floor(diff / 3600);
    const mm = Math.floor((diff % 3600) / 60);
    const ss = diff % 60;

    const core = hh > 0
      ? `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
      : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

    return `${toStart ? "Mulai" : "Sisa"} ${core}`;
  }, [auction, startAt, endAt, statusLabel, nowTick]);

  const baseHost = (import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api").replace("/api", "");
  const commodity = auction?.commodity;
  const media0 = commodity?.media?.[0]?.url;

  async function load() {
    setLoading(true);
    try {
      const a = await getAuction(auctionId);
      const b = await listBids(auctionId, 1, 50);

      const bidItems = b?.data ?? [];
      const max = bidItems.length ? Math.max(...bidItems.map((x: any) => Number(x.amount))) : 0;

      setAuction(a);
      setBids(bidItems);
      setHighest(max);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auctionId) return;
    endedNotifiedRef.current = false;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  useEffect(() => {
    // Keep server status aligned quickly after countdown reaches zero.
    if (statusLabel === "ended" && auction?.status === "live") {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusLabel, auction?.status]);

  // realtime subscribe
  useEffect(() => {
    if (!auctionId) return;

    const echo = makeEcho();
    echoRef.current = echo;

    const channel = echo.channel(`auction.${auctionId}`);

    channel.listen(".BidPlaced", (e: any) => {
      setBids((prev) => [e.bid, ...prev].slice(0, 200));
      setHighest((h) => Math.max(h, Number(e.bid?.amount ?? 0)));
    });

    channel.listen(".AuctionExtended", (e: any) => {
      setAuction((prev: any) =>
        prev ? { ...prev, end_at: e.end_at, extended_count: e.extended_count } : prev
      );
      enqueueSnackbar("Auction diperpanjang", { variant: "info" });
    });

    channel.listen(".AuctionStarted", () => {
      enqueueSnackbar("Auction dimulai", { variant: "success" });
      load();
    });

    channel.listen(".AuctionEnded", (e: any) => {
      enqueueSnackbar("Auction berakhir", { variant: "warning" });

      if (!endedNotifiedRef.current && user) {
        endedNotifiedRef.current = true;

        const winnerBuyerId = Number(e?.winner_buyer_id ?? 0);
        const winnerAmount = Number(e?.winning_amount ?? 0);
        const auctionName = commodity?.name ?? `Auction #${auctionId}`;

        if (winnerBuyerId > 0 && user.id === winnerBuyerId) {
          const msg = `Selamat, Anda menang dengan bid Rp ${formatMoney(winnerAmount)}.`;
          enqueueSnackbar(msg, { variant: "success" });
          pushBrowserNotification("Anda menang lelang", `${auctionName} • Rp ${formatMoney(winnerAmount)}`);
        } else if (winnerBuyerId > 0) {
          const msg = `Auction selesai. Anda belum menang. Bid tertinggi Rp ${formatMoney(winnerAmount)}.`;
          enqueueSnackbar(msg, { variant: "info" });
          pushBrowserNotification("Lelang selesai", `${auctionName} • Anda belum menang`);
        } else {
          const msg = "Auction selesai tanpa pemenang (tidak ada bid valid).";
          enqueueSnackbar(msg, { variant: "info" });
          pushBrowserNotification("Lelang selesai", `${auctionName} • tanpa pemenang`);
        }
      }

      load();
    });

    return () => {
      try {
        echo.leave(`auction.${auctionId}`);
        echo.disconnect();
      } catch {
        // noop
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  const onBid = async () => {
    if (!isBuyer) {
      const msg =
        user?.role === "admin"
          ? "Mode review: akun admin tidak diizinkan memasang bid."
          : "Hanya akun buyer yang dapat memasang bid.";
      setBidErrorText(msg);
      enqueueSnackbar(msg, { variant: "warning" });
      return;
    }

    if (!canBid) {
      const msg = statusHint || "Auction tidak aktif.";
      setBidErrorText(msg);
      enqueueSnackbar(msg, { variant: "warning" });
      return;
    }

    const num = Number(amount);
    if (!num || Number.isNaN(num)) {
      enqueueSnackbar("Masukkan nominal bid", { variant: "error" });
      return;
    }
    if (num <= highest) {
      enqueueSnackbar(`Bid harus > ${formatMoney(highest)}`, { variant: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      await requestBrowserNotificationPermission();
      await placeBid(auctionId, num);
      setAmount("");
      setBidErrorText("");
      enqueueSnackbar("Bid terkirim", { variant: "success" });
      // realtime event akan update list; fallback reload jika perlu
    } catch (e: any) {
      const msg = getApiErrorMessage(e);
      setBidErrorText(msg);
      enqueueSnackbar(msg, { variant: "error" });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!auction) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">Auction tidak ditemukan</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {/* Left: commodity */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardMedia
              component="img"
              height="260"
              image={
                media0
                  ? `${baseHost}${media0}`
                  : "https://via.placeholder.com/800x500?text=No+Image"
              }
              alt={commodity?.name ?? "Commodity"}
              sx={{ objectFit: "cover" }}
            />
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={900}>
                  {commodity?.name ?? `Auction #${auction.id}`}
                </Typography>
                {statusChip}
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Start: {dayjs(auction.start_at).format("DD MMM YYYY HH:mm")} • End: {dayjs(
                  auction.end_at
                ).format("DD MMM YYYY HH:mm")}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                Lokasi: {commodity?.location ?? "-"} • Grade: {commodity?.size_grade ?? "-"} • Berat: {commodity?.weight_kg ?? "-"} kg
              </Typography>

              {commodity?.description && <Typography sx={{ mt: 1 }}>{commodity.description}</Typography>}
            </CardContent>
          </Card>
        </Box>

        {/* Right: bidding panel */}
        <Box sx={{ width: { xs: "100%", md: 420 } }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography fontWeight={900}>Bidding</Typography>
                <Chip label={remainingText} color={statusLabel === "live" ? "error" : "default"} size="small" />
              </Stack>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Highest bid
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                  Rp {formatMoney(highest)}
                </Typography>
              </Box>

              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <TextField
                  label={isBuyer ? "Nominal bid (Rp)" : "Nominal bid (hanya buyer)"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                  disabled={!canSubmitBid || submitting}
                />
                <Stack direction="row" spacing={1}>
                  {[10000, 50000, 100000].map((inc) => (
                    <Button
                      key={inc}
                      variant="outlined"
                      onClick={() => setAmount(String(highest + inc))}
                      disabled={!canSubmitBid || submitting}
                      fullWidth
                    >
                      +{formatMoney(inc)}
                    </Button>
                  ))}
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onBid}
                  disabled={!canSubmitBid || submitting}
                >
                  {!isBuyer ? "Review Only" : submitting ? "Mengirim..." : "Bid"}
                </Button>

                {(roleHint || statusHint || bidErrorText) && (
                  <Alert severity={roleHint || canBid ? "warning" : "info"}>
                    {bidErrorText || roleHint || statusHint}
                  </Alert>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight={800} sx={{ mb: 1 }}>
                Bid Terbaru
              </Typography>
              <Stack spacing={1} sx={{ maxHeight: 360, overflow: "auto" }}>
                {bids.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Belum ada bid.
                  </Typography>
                ) : (
                  bids.map((b: any) => (
                    <Box key={b.id} sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={700}>Rp {formatMoney(Number(b.amount))}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(b.created_at).format("HH:mm:ss")}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Buyer ID: {b.buyer_id ?? "-"}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Container>
  );
}
