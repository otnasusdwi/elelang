export type UserRole = "admin" | "seller" | "buyer";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
  status?: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
