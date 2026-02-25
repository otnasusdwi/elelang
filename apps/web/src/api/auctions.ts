import { http } from "./http";

export type AuctionStatusFilter = "live" | "scheduled" | "ended";

export async function listAuctions(status?: AuctionStatusFilter, page = 1, perPage = 20) {
  const { data } = await http.get("/auctions", {
    params: { status, page, per_page: perPage },
  });
  return data;
}

export async function getAuction(id: number) {
  const { data } = await http.get(`/auctions/${id}`);
  return data;
}

export async function listBids(auctionId: number, page = 1, perPage = 50) {
  const { data } = await http.get(`/auctions/${auctionId}/bids`, {
    params: { page, per_page: perPage },
  });
  return data;
}

export async function placeBid(auctionId: number, amount: number) {
  const { data } = await http.post(`/auctions/${auctionId}/bids`, { amount });
  return data;
}
