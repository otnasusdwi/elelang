import { http } from "./http";

export async function adminSummary() {
  const { data } = await http.get("/admin/analytics/summary");
  return data;
}

export async function adminTimeSeries(days = 30) {
  const { data } = await http.get("/admin/analytics/time-series", { params: { days } });
  return data;
}

export function adminOrdersCsvUrl(from?: string, to?: string) {
  const base = (import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api").replace("/api", "");
  const url = new URL(`${base}/api/admin/reports/orders.csv`);
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);
  return url.toString();
}
