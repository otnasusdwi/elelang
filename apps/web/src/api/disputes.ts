import { http } from "./http";

export async function listDisputes(page = 1, perPage = 20) {
  const { data } = await http.get("/disputes", { params: { page, per_page: perPage } });
  return data;
}

export async function getDispute(id: number) {
  const { data } = await http.get(`/disputes/${id}`);
  return data;
}

export async function openDispute(orderId: number, payload: { reason: string; description?: string }) {
  const { data } = await http.post(`/orders/${orderId}/dispute`, payload);
  return data;
}

export async function addDisputeMessage(disputeId: number, payload: { message?: string; media_url?: string }) {
  const { data } = await http.post(`/disputes/${disputeId}/messages`, payload);
  return data;
}

// Admin
export async function adminListDisputes(status?: string, page = 1, perPage = 30) {
  const { data } = await http.get("/admin/disputes", { params: { status, page, per_page: perPage } });
  return data;
}

export async function adminGetDispute(disputeId: number) {
  const { data } = await http.get(`/admin/disputes/${disputeId}`);
  return data;
}

export async function adminResolveDispute(
  disputeId: number,
  payload: {
    status: "in_review" | "resolved" | "rejected";
    resolution?: "refund" | "release" | "replacement" | "none";
    resolution_note?: string;
  }
) {
  const { data } = await http.patch(`/admin/disputes/${disputeId}/resolve`, payload);
  return data;
}
