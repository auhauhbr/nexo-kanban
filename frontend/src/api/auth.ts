import { api } from "./client";
import type { AuthResponse, User } from "../types";

export const register = async (input: {
  name: string;
  email: string;
  password: string;
}) => {
  const { data } = await api.post<AuthResponse>("/auth/register", input);
  return data;
};

export const login = async (input: { email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
};
