import { http } from "./http";

export type OrderStatus = "pending" | "paid" | "shipping" | "delivered" | "completed" | "cancelled";

export async function listOrders(status?: OrderStatus, page = 1, perPage = 20) {
  const { data } = await http.get("/orders", { params: { status, page, per_page: perPage } });
  return data;
}

export async function getOrder(id: number) {
  const { data } = await http.get(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const { data } = await http.patch(`/orders/${id}/status`, { status });
  return data;
}

export async function updateLogistics(
  id: number,
  payload: {
    pickup_time?: string;
    pickup_location?: string;
    delivery_method?: "pickup" | "courier" | "other";
    notes?: string;
  }
) {
  const { data } = await http.patch(`/orders/${id}/logistics`, payload);
  return data;
}

export async function addHandoverProof(
  id: number,
  payload: {
    type: "pickup" | "delivery" | "received";
    media_url: string;
    timestamp?: string;
  }
) {
  const { data } = await http.post(`/orders/${id}/handover-proofs`, payload);
  return data;
}

export async function getEscrow(id: number) {
  const { data } = await http.get(`/orders/${id}/escrow`);
  return data;
}

export async function escrowHold(id: number, payload?: { reference?: string; note?: string }) {
  const { data } = await http.post(`/orders/${id}/escrow/hold`, payload ?? {});
  return data;
}
