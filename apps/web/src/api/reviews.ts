import { http } from "./http";

export async function submitReview(orderId: number, payload: { rating: number; comment?: string }) {
  const { data } = await http.post(`/orders/${orderId}/review`, payload);
  return data;
}

export async function myReviews(page = 1, perPage = 20) {
  const { data } = await http.get("/my/reviews", { params: { page, per_page: perPage } });
  return data;
}

export async function userRatingSummary(userId: number) {
  const { data } = await http.get(`/users/${userId}/rating-summary`);
  return data;
}
