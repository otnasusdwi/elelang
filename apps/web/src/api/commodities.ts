import { http } from "./http";

export async function getCommodity(id: number) {
  const { data } = await http.get(`/commodities/${id}`);
  return data;
}
