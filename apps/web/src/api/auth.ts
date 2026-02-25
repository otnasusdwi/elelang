import { http } from "./http";
import type { LoginResponse, RegisterPayload, User } from "../types/auth";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/auth/login", { email, password });
  return data;
}

export async function register(payload: RegisterPayload): Promise<LoginResponse | { message: string }> {
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await http.get<{ user: User } | User>("/me");
  return (data as { user?: User }).user ?? (data as User);
}

export async function logout(): Promise<void> {
  await http.post("/auth/logout");
}
